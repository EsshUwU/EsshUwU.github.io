/* ==========================================================================
   LIQUID GLASS — QuartzCore WebGL2 port for the Esshwar portfolio
   --------------------------------------------------------------------------
   The glass panels are drawn by a full-screen WebGL2 shader at the exact
   positions of the bento cards, so every card refracts the real page
   backdrop with the same optical pipeline as the QuartzCore demo:
   superellipse SDF, bevel refraction, chromatic dispersion, blur fill,
   key/fill rim specular, drop shadow and smooth "liquid merge".

   The temporary tuner writes its config to the console and can copy it as
   JSON. Once the final values are picked, set SHOW_TUNER to false and keep
   CONFIG below as the baked-in settings.
   ========================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------------
     BAKED CONFIG
     ------------------------------------------------------------------------ */
  const CONFIG = {
    preset: "clear",
    scene: "nocturne",
    layout: "morph",
    refract: 44,
    height: 34,
    aberr: 14,
    blur: 0.5,
    rim: 0.78,
    merge: 42,
    radius: 44
  };

  // The tuner stays available; open it from the Tech Stack icon.
  const SHOW_TUNER = true;

  // Default backdrop image. Reset and first load both use this.
  const DEFAULT_IMAGE = "img2.png";

  const MAX_CARDS = 8;
  const MAX_SHAPES = 3;

  const PRESETS = {
    regular: {
      refract: 38, height: 30, aberr: 10, blur: 2.0, rim: 0.75, merge: 38, radius: 44,
      faceOpacity: 0.28, faceMaxLumaComp: 0.20,
      faceCm: [[1.05, 0.0, 0.0, 0.12], [0.0, 1.05, 0.0, 0.12], [0.0, 0.0, 1.07, 0.14]],
      bleedCm: [[1.10, 0.0, 0.0, 0.08], [0.0, 1.10, 0.0, 0.08], [0.0, 0.0, 1.14, 0.10]],
      blurFillEnabled: 1, blurFillLighten: 0.18, blurFillDarken: 0.06, blurFillNormal: 0.10,
      edgeBleedOpacity: 0.26, shadowOpacity: 0.28, ringShadowOpacity: 0.20
    },
    clear: {
      refract: 44, height: 34, aberr: 14, blur: 0.5, rim: 1.40, merge: 42, radius: 44,
      faceOpacity: 0.08, faceMaxLumaComp: 0.08,
      faceCm: [[1.03, 0.0, 0.0, 0.03], [0.0, 1.03, 0.0, 0.03], [0.0, 0.0, 1.04, 0.04]],
      bleedCm: [[1.14, 0.0, 0.0, 0.05], [0.0, 1.14, 0.0, 0.05], [0.0, 0.0, 1.18, 0.07]],
      blurFillEnabled: 0, blurFillLighten: 0.0, blurFillDarken: 0.0, blurFillNormal: 0.0,
      edgeBleedOpacity: 0.30, shadowOpacity: 0.24, ringShadowOpacity: 0.16
    },
    dark: {
      refract: 34, height: 30, aberr: 9, blur: 4.5, rim: 0.72, merge: 36, radius: 44,
      faceOpacity: 0.56, faceMaxLumaComp: 0.32,
      faceCm: [[0.76, 0.0, 0.0, 0.03], [0.0, 0.76, 0.0, 0.035], [0.0, 0.0, 0.82, 0.05]],
      bleedCm: [[0.90, 0.0, 0.0, 0.04], [0.0, 0.90, 0.0, 0.05], [0.0, 0.0, 0.96, 0.07]],
      blurFillEnabled: 1, blurFillLighten: 0.08, blurFillDarken: 0.28, blurFillNormal: 0.16,
      edgeBleedOpacity: 0.26, shadowOpacity: 0.42, ringShadowOpacity: 0.30
    },
    prism: {
      refract: 58, height: 42, aberr: 26, blur: 0.5, rim: 1.15, merge: 48, radius: 48,
      faceOpacity: 0.14, faceMaxLumaComp: 0.12,
      faceCm: [[1.10, 0.0, 0.0, 0.05], [0.0, 1.08, 0.0, 0.05], [0.0, 0.0, 1.14, 0.07]],
      bleedCm: [[1.20, 0.0, 0.0, 0.06], [0.0, 1.16, 0.0, 0.06], [0.0, 0.0, 1.24, 0.08]],
      blurFillEnabled: 0, blurFillLighten: 0.0, blurFillDarken: 0.0, blurFillNormal: 0.0,
      edgeBleedOpacity: 0.36, shadowOpacity: 0.30, ringShadowOpacity: 0.22
    }
  };

  // The three layout buttons are glass geometry presets, so they always do
  // something visible on the real cards.
  const LAYOUTS = {
    morph: { radius: 44, merge: 42, height: 34 },
    pill: { radius: 90, merge: 0, height: 34 },
    dock: { radius: 18, merge: 0, height: 22 }
  };

  const SLIDERS = [
    { key: "refract", label: "Refraction", min: 0, max: 80, step: 1, suffix: " px" },
    { key: "height", label: "Bevel Height", min: 6, max: 90, step: 1, suffix: " px" },
    { key: "aberr", label: "Chromatic Aberration", min: 0, max: 36, step: 0.5, suffix: " px" },
    { key: "blur", label: "Backdrop Blur", min: 0, max: 16, step: 0.25, suffix: "" },
    { key: "rim", label: "Rim Specular", min: 0, max: 1.6, step: 0.02, suffix: "", decimals: 2 },
    { key: "merge", label: "Liquid Merge", min: 0, max: 90, step: 1, suffix: " px" },
    { key: "radius", label: "Corner Radius", min: 8, max: 90, step: 1, suffix: " px" }
  ];

  const state = {
    preset: CONFIG.preset,
    scene: CONFIG.scene,
    layout: CONFIG.layout,
    refract: CONFIG.refract,
    height: CONFIG.height,
    aberr: CONFIG.aberr,
    blur: CONFIG.blur,
    rim: CONFIG.rim,
    merge: CONFIG.merge,
    radius: CONFIG.radius
  };

  let customImage = null;
  let customImageUrl = null;
  let defaultImage = null;
  let backdropDirty = true;
  let tunerEl = null;

  /* ------------------------------------------------------------------------
     WEBGL SETUP
     ------------------------------------------------------------------------ */
  const canvas = document.createElement("canvas");
  canvas.id = "lg-webgl";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance"
  });

  if (!gl) {
    canvas.remove();
    console.warn("[Liquid Glass] WebGL2 unavailable — keeping the CSS/SVG glass fallback.");
    return;
  }

  const vsSource = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

  const blurFsSource = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uSrc;
uniform vec2 uDir;
uniform float uSrcLod;
void main() {
  vec4 acc = textureLod(uSrc, vUv, uSrcLod) * 0.2270270270;
  acc += textureLod(uSrc, clamp(vUv + uDir * 1.3846153846, vec2(0.0005), vec2(0.9995)), uSrcLod) * 0.3162162162;
  acc += textureLod(uSrc, clamp(vUv - uDir * 1.3846153846, vec2(0.0005), vec2(0.9995)), uSrcLod) * 0.3162162162;
  acc += textureLod(uSrc, clamp(vUv + uDir * 3.2307692308, vec2(0.0005), vec2(0.9995)), uSrcLod) * 0.0702702703;
  acc += textureLod(uSrc, clamp(vUv - uDir * 3.2307692308, vec2(0.0005), vec2(0.9995)), uSrcLod) * 0.0702702703;
  fragColor = acc;
}
`;

  const fsSource = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uBackdrop;
uniform vec2 uResolution;
uniform float uDpr;

#define MAX_CARDS ${MAX_CARDS}
uniform vec4 uCardRects[MAX_CARDS];
uniform int uCardCount;

#define MAX_SHAPES ${MAX_SHAPES}
uniform vec4 uShapeRects[MAX_SHAPES];
uniform vec4 uShapeMeta[MAX_SHAPES];
uniform int uShapeCount;
uniform float uCornerRadius;
uniform float uMergeK;

uniform float uInnerRefractionAmount;
uniform float uInnerRefractionHeight;
uniform float uOuterRefractionAmount;
uniform float uOuterRefractionHeight;
uniform float uRefractionThreshold0;
uniform float uRefractionThreshold1;
uniform float uRefractionOpacity;

uniform float uBlurRadius;
uniform float uEdgeBleedAmount;
uniform float uEdgeBleedHeight;
uniform float uEdgeBleedBlur;
uniform float uEdgeBleedOpacity;
uniform vec2 uBleedDarken;

uniform float uAberrationAmount;
uniform float uAberrationHeight;
uniform float uAberrationOffset;
uniform vec2 uAberrationDir;

uniform float uFaceOpacity;
uniform float uFaceMaxLumaComp;
uniform vec4 uFaceCm0;
uniform vec4 uFaceCm1;
uniform vec4 uFaceCm2;
uniform vec4 uBleedCm0;
uniform vec4 uBleedCm1;
uniform vec4 uBleedCm2;

uniform float uBlurFillEnabled;
uniform float uBlurFillRadius;
uniform float uBlurFillLighten;
uniform float uBlurFillDarken;
uniform float uBlurFillNormal;

uniform vec2 uKeyFillDir;
uniform float uKeyFillHeight;
uniform float uKeyFillSpread;
uniform float uKeyFillAmount;
uniform float uKeyFillEffectOffset;
uniform float uKeyFillColorBias;
uniform float uWantsHighlightBiasCorrection;

uniform vec2 uShadowOffset;
uniform float uShadowRadius;
uniform float uShadowOpacity;
uniform float uRingShadowStrokeWidth;
uniform float uRingShadowRadius;
uniform float uRingShadowOpacity;
uniform vec2 uRingShadowOffset;

float sat(float x) { return clamp(x, 0.0, 1.0); }
vec2 sat(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 sat(vec3 x) { return clamp(x, 0.0, 1.0); }

float glassProfile(float negD, float invH, float amount) {
  float t = sat(negD * invH);
  float s = sat(sqrt(max(0.0, t * (2.0 - t))));
  return amount * (1.0 - s);
}

float appleGaussCdf(float z) {
  float x = sat(z * 0.25 + 0.5) * 4.0 - 2.0;
  float x2 = x * x;
  float p = 0.002954483;
  p = p * x2 - 0.034454346;
  p = p * x2 + 0.168212891;
  p = p * x2 - 0.560546875;
  return sat(p * x + 0.5);
}

float appleSupercircleCorner(vec2 q, vec2 halfSize, float radius) {
  float r = min(radius, min(halfSize.x, halfSize.y));
  float eff = r * 1.528665;
  vec2 delta = q - halfSize + vec2(eff);
  vec2 p = max(vec2(0.0), delta / max(eff, 1e-4));
  float lenP = length(p);
  float mx = max(p.x, p.y);
  float mn = min(p.x, p.y);
  float ratio = mx > 0.0 ? sat(mn / mx) : 0.0;
  float poly = 3.156009912 - ratio * 0.926054001;
  poly = poly * ratio - 3.641220093;
  poly = poly * ratio + 1.268030047;
  poly = poly * ratio + 0.268530995;
  float denom = 1.0 - ratio * ratio * sat(lenP) * poly;
  float dSuper = lenP + 1.0 - 1.0 / max(denom, 1e-4);
  vec2 circ = max(vec2(0.0), p * 1.528665 - vec2(0.528665));
  float dCirc = length(circ) * 0.654165566 + 0.345834434;
  float k = sat((1.528665 - min(halfSize.x, halfSize.y) / max(r, 1e-4)) * 1.891557217);
  float blend = mix(dSuper, dCirc, k);
  float inside = min(max(q.x - halfSize.x + mix(eff, r, k), q.y - halfSize.y + mix(eff, r, k)), 0.0);
  return inside + eff * (blend - 1.0);
}

float smin(float a, float b, float k) {
  if (k <= 0.001) return min(a, b);
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0;
  vec2 e1 = p2 - p1;
  vec2 e2 = p0 - p2;
  vec2 v0 = p - p0;
  vec2 v1 = p - p1;
  vec2 v2 = p - p2;
  vec2 pq0 = v0 - e0 * sat(dot(v0, e0) / max(dot(e0, e0), 1e-6));
  vec2 pq1 = v1 - e1 * sat(dot(v1, e1) / max(dot(e1, e1), 1e-6));
  vec2 pq2 = v2 - e2 * sat(dot(v2, e2) / max(dot(e2, e2), 1e-6));
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                   vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                   vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}

// kind: 0 = circle, 1 = squircle/square, 2 = rounded triangle.
float evalShapeSdf(vec2 p, vec4 rect, vec4 meta) {
  vec2 local = p - rect.xy;
  float ca = cos(-meta.y);
  float sa = sin(-meta.y);
  local = vec2(ca * local.x - sa * local.y, sa * local.x + ca * local.y);

  if (meta.x < 0.5) {
    return length(local) - min(rect.z, rect.w);
  }
  if (meta.x < 1.5) {
    return appleSupercircleCorner(abs(local), rect.zw, meta.z);
  }
  float shrink = min(meta.z, min(rect.z, rect.w) * 0.9);
  vec2 v0 = vec2(0.0, rect.w - shrink);
  vec2 v1 = vec2(-(rect.z - shrink), -(rect.w - shrink));
  vec2 v2 = vec2(rect.z - shrink, -(rect.w - shrink));
  return sdTriangle(local, v0, v1, v2) - shrink;
}

float evalCardSdf(vec2 p) {
  float d = 1e6;
  for (int i = 0; i < MAX_CARDS; i++) {
    if (i >= uCardCount) break;
    vec4 r = uCardRects[i];
    float di = appleSupercircleCorner(abs(p - r.xy), r.zw, min(uCornerRadius, min(r.z, r.w)));
    d = smin(d, di, uMergeK);
  }
  for (int i = 0; i < MAX_SHAPES; i++) {
    if (i >= uShapeCount) break;
    vec4 m = uShapeMeta[i];
    if (m.w < 0.5) continue;
    d = smin(d, evalShapeSdf(p, uShapeRects[i], m), uMergeK);
  }
  return d;
}

vec2 evalCardGrad(vec2 p) {
  float eps = 0.75;
  vec2 g = vec2(
    evalCardSdf(p + vec2(eps, 0.0)) - evalCardSdf(p - vec2(eps, 0.0)),
    evalCardSdf(p + vec2(0.0, eps)) - evalCardSdf(p - vec2(0.0, eps))
  );
  float l = length(g);
  return l > 1e-5 ? g / l : vec2(0.0, 1.0);
}

float radiusToLod(float r) {
  if (r <= 0.05) return 0.0;
  float adj = r < 2.0 ? r * 0.5 + 1.0 : r;
  return max(0.0, log2(max(adj, 1.0)));
}

vec4 sampleSmoothMip(vec2 uv, float blurRadius, vec2 quarterTexel) {
  float lod = radiusToLod(blurRadius);
  if (lod < 0.05) {
    return textureLod(uBackdrop, uv, 0.0);
  }
  vec2 o = lod * quarterTexel * min(lod, 1.0);
  vec4 s = textureLod(uBackdrop, uv + o, lod);
  s += textureLod(uBackdrop, uv + vec2(o.x, -o.y), lod);
  s += textureLod(uBackdrop, uv + vec2(-o.x, o.y), lod);
  s += textureLod(uBackdrop, uv - o, lod);
  return s * 0.25;
}

vec3 applyColorMatrix(vec3 c, vec4 m0, vec4 m1, vec4 m2) {
  return vec3(
    dot(c, m0.rgb) + m0.a,
    dot(c, m1.rgb) + m1.a,
    dot(c, m2.rgb) + m2.a
  );
}

vec3 applyFaceLumaComp(vec3 c, float comp) {
  if (comp <= 0.0) return c;
  float luma = dot(vec3(0.2126, 0.7152, 0.0722), c);
  float scale = sat(1.0 - luma * comp);
  vec3 scaled = c * scale;
  float satBoost = 1.0 + (1.0 - scale) * 0.3;
  return mix(vec3(scale * luma), scaled, satBoost);
}

vec4 aberrateBackdrop(vec2 uv, vec2 offsetUv, float blurRadius, vec2 quarterTexel) {
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 3; i++) {
    float w = 1.0 - float(i) / 3.0;
    vec4 s = sampleSmoothMip(clamp(uv + offsetUv * w, vec2(0.0005), vec2(0.9995)), blurRadius, quarterTexel);
    acc.r += s.r * w;
    acc.g += s.g * (1.0 - w);
    acc.a += s.a;
  }
  for (int i = 0; i < 4; i++) {
    float w = float(i) / 3.0;
    vec4 s = sampleSmoothMip(clamp(uv - offsetUv * w, vec2(0.0005), vec2(0.9995)), blurRadius, quarterTexel);
    acc.g += s.g * (1.0 - w);
    acc.b += s.b * w;
    acc.a += s.a;
  }
  return vec4(acc.r * 0.5, acc.g * (1.0 / 3.0), acc.b * 0.5, acc.a * (1.0 / 7.0));
}

float computeKeyFillHighlight(float d, float fw, vec2 grad, float height, float spread, float amount, float effectOffset) {
  if (height <= 0.0) return 0.0;
  float dEff = d + effectOffset;
  float negD = -dEff;
  if (dEff >= 0.5 * fw || negD >= height + 0.5 * fw) return 0.0;
  float t = sat(negD / height);
  float falloff = mix(t < 1.0 ? 1.0 : 0.0, 1.0 - t, 0.75);
  float innerEdge = sat((dEff + height) / fw + 0.5);
  float outerEdge = sat(negD / fw + 0.5);
  float mask = falloff * innerEdge * outerEdge;
  float dirDot = dot(uKeyFillDir, grad);
  float invSpread = 1.0 / max(1.0 - spread, 1e-6);
  vec2 twoSide = sat((vec2(dirDot, -dirDot) - vec2(spread)) * invSpread) * mask;
  vec2 compressed = twoSide / max(vec2(1.0) + amount * (vec2(1.0) - twoSide), vec2(1e-6));
  return compressed.x + compressed.y;
}

void main() {
  vec2 px = vUv * uResolution;
  vec2 pxToUv = 1.0 / uResolution;
  vec2 quarterTexel = 0.25 * pxToUv;

  float d = evalCardSdf(px);
  vec2 grad = evalCardGrad(px);
  float fw = max(fwidth(d), 1e-4);
  float coverage = sat(0.5 - d / fw);
  vec2 dispVec = grad * pxToUv;

  float highlight = computeKeyFillHighlight(
    d, fw, grad, uKeyFillHeight, uKeyFillSpread, uKeyFillAmount, uKeyFillEffectOffset
  );

  float ringShadow = 0.0;
  if (uRingShadowOpacity > 0.0 && coverage > 0.0) {
    float dRing = evalCardSdf(px + uRingShadowOffset);
    float invR = 1.0 / max(uRingShadowRadius, 1e-6);
    float z0 = dRing * invR * 0.7071;
    float z1 = (dRing + uRingShadowStrokeWidth) * invR * 0.7071;
    float band = sat(appleGaussCdf(z0) - appleGaussCdf(z1));
    ringShadow = uRingShadowOpacity * band * coverage;
  }

  vec3 backdropSharp = textureLod(uBackdrop, vUv, 0.0).rgb;
  vec3 outsideColor = backdropSharp;
  if (coverage < 1.0 && uShadowOpacity > 0.0) {
    float dSh = evalCardSdf(px + uShadowOffset);
    float shadowAlpha = uShadowOpacity * appleGaussCdf(dSh / max(uShadowRadius, 1e-4));
    outsideColor = mix(backdropSharp, backdropSharp * vec3(0.08, 0.09, 0.12), shadowAlpha * (1.0 - coverage));
  }

  vec3 glassColor = backdropSharp;
  if (coverage > 0.0) {
    float negD = -d;
    float invInnerH = 1.0 / max(uInnerRefractionHeight, 1e-4);
    float innerDisp = glassProfile(negD, invInnerH, uInnerRefractionAmount);
    float dRefract = d + innerDisp;

    float blurScale = mix(1.0, 0.25, sat((dRefract + uInnerRefractionHeight) / max(uInnerRefractionHeight, 1.0)));
    float localBlur = uBlurRadius * blurScale;
    vec2 refrUv = clamp(vUv + innerDisp * dispVec, vec2(0.0005), vec2(0.9995));

    vec3 refracted;
    if (uAberrationAmount > 0.001) {
      vec2 rotGrad = vec2(
        uAberrationDir.x * grad.x - uAberrationDir.y * grad.y,
        uAberrationDir.y * grad.x + uAberrationDir.x * grad.y
      );
      float invAberrH = 1.0 / max(uAberrationHeight, 1e-4);
      float aberrMag = glassProfile(negD - uAberrationOffset, invAberrH, uAberrationAmount);
      if (aberrMag > 0.05) {
        vec2 aberrUv = aberrMag * rotGrad * pxToUv;
        refracted = aberrateBackdrop(refrUv, aberrUv, localBlur, quarterTexel).rgb;
      } else {
        refracted = sampleSmoothMip(refrUv, localBlur, quarterTexel).rgb;
      }
    } else {
      refracted = sampleSmoothMip(refrUv, localBlur, quarterTexel).rgb;
    }

    if (uBlurFillEnabled > 0.5 && uBlurFillRadius > 0.2) {
      float fillLod = radiusToLod(uBlurFillRadius);
      vec3 blurred = textureLod(uBackdrop, refrUv, fillLod).rgb;
      vec3 darkened = min(refracted, blurred);
      vec3 lightened = max(refracted, blurred);
      vec3 blended = darkened * uBlurFillDarken + lightened * uBlurFillLighten + refracted * (1.0 - uBlurFillDarken - uBlurFillLighten);
      refracted = mix(blended, blurred, uBlurFillNormal);
    }

    if (uRefractionOpacity > 0.0) {
      float rimBand = sat((d - uRefractionThreshold0) / max(uRefractionThreshold1 - uRefractionThreshold0, 1e-4));
      if (rimBand > 0.001) {
        float invOuterH = 1.0 / max(uOuterRefractionHeight, 1e-4);
        float outerDisp = glassProfile(negD, invOuterH, uOuterRefractionAmount);
        vec2 outerUv = clamp(vUv - outerDisp * dispVec, vec2(0.0005), vec2(0.9995));
        float outerLod = radiusToLod(max(localBlur * 1.4, 3.5 * uDpr));
        vec3 outerCol = textureLod(uBackdrop, outerUv, outerLod).rgb;
        refracted = mix(refracted, outerCol, rimBand * rimBand * uRefractionOpacity);
      }
    }

    if (uFaceOpacity > 0.0) {
      vec3 cAdj = applyFaceLumaComp(refracted, uFaceMaxLumaComp);
      vec3 cMat = applyColorMatrix(cAdj, uFaceCm0, uFaceCm1, uFaceCm2);
      refracted = mix(refracted, cMat, uFaceOpacity);
    }

    if (uEdgeBleedOpacity > 0.0) {
      float edgeBand = sat((d + uEdgeBleedHeight) / max(uEdgeBleedHeight, 1e-4));
      if (edgeBand > 0.001) {
        float invBleedH = 1.0 / max(uEdgeBleedHeight, 1e-4);
        float bleedDisp = glassProfile(negD, invBleedH, uEdgeBleedAmount);
        vec2 bleedUv = clamp(vUv + bleedDisp * dispVec, vec2(0.0005), vec2(0.9995));
        vec3 bleedSample = textureLod(uBackdrop, bleedUv, radiusToLod(uEdgeBleedBlur)).rgb;
        vec3 bleedColor = applyColorMatrix(bleedSample, uBleedCm0, uBleedCm1, uBleedCm2);
        float luma = sat(dot(refracted, vec3(0.2125, 0.7154, 0.0721)));
        float dTerm = luma * uBleedDarken.x + uBleedDarken.y;
        float w = dTerm * dTerm * edgeBand;
        w = w * w * uEdgeBleedOpacity;
        refracted = mix(refracted, bleedColor, w);
      }
    }

    glassColor = refracted;
  }

  vec3 col = mix(outsideColor, glassColor, coverage);
  col *= (1.0 - ringShadow);

  // Extra full-perimeter fresnel rim. The key/fill highlight is directional;
  // this thin ring makes the glass edge read from every viewing angle.
  if (coverage > 0.0) {
    float negD = -d;
    float rimT = sat(1.0 - negD / (5.0 * uDpr));
    float fresnel = pow(rimT, 4.0);
    col += vec3(fresnel * (0.04 + 0.10 * sat(uKeyFillColorBias)));
  }

  if (highlight > 1e-6) {
    if (uFaceOpacity > 0.0) {
      vec3 rimSrc = applyFaceLumaComp(col, uFaceMaxLumaComp);
      vec3 rimMat = applyColorMatrix(rimSrc, uFaceCm0, uFaceCm1, uFaceCm2);
      if (uWantsHighlightBiasCorrection > 0.5) {
        rimMat = uKeyFillColorBias < 0.0 ? min(rimMat, col) : max(rimMat, col);
      }
      col = mix(col, rimMat, sat(uFaceOpacity * highlight));
    }
    vec3 sCurve = vec3(3.0) - 2.0 * sat(col);
    col = col * (vec3(1.0) + uKeyFillColorBias * highlight * sCurve);
    col += vec3(0.18 * max(uKeyFillColorBias, 0.0) * highlight);
  }

  fragColor = vec4(sat(col), 1.0);
}
`;

  function compile(type, src) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
  }

  function linkProgram(vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }
    return program;
  }

  let blurProg;
  let prog;
  try {
    blurProg = linkProgram(vsSource, blurFsSource);
    prog = linkProgram(vsSource, fsSource);
  } catch (err) {
    console.warn("[Liquid Glass] Shader compilation failed — keeping the CSS/SVG glass fallback.", err);
    canvas.remove();
    return;
  }

  const blurU = {
    uSrc: gl.getUniformLocation(blurProg, "uSrc"),
    uDir: gl.getUniformLocation(blurProg, "uDir"),
    uSrcLod: gl.getUniformLocation(blurProg, "uSrcLod")
  };

  const uniformNames = [
    "uBackdrop", "uResolution", "uDpr",
    "uCardRects", "uCardCount", "uCornerRadius", "uMergeK",
    "uShapeRects", "uShapeMeta", "uShapeCount",
    "uInnerRefractionAmount", "uInnerRefractionHeight",
    "uOuterRefractionAmount", "uOuterRefractionHeight",
    "uRefractionThreshold0", "uRefractionThreshold1", "uRefractionOpacity",
    "uBlurRadius", "uEdgeBleedAmount", "uEdgeBleedHeight", "uEdgeBleedBlur", "uEdgeBleedOpacity", "uBleedDarken",
    "uAberrationAmount", "uAberrationHeight", "uAberrationOffset", "uAberrationDir",
    "uFaceOpacity", "uFaceMaxLumaComp",
    "uFaceCm0", "uFaceCm1", "uFaceCm2",
    "uBleedCm0", "uBleedCm1", "uBleedCm2",
    "uBlurFillEnabled", "uBlurFillRadius", "uBlurFillLighten", "uBlurFillDarken", "uBlurFillNormal",
    "uKeyFillDir", "uKeyFillHeight", "uKeyFillSpread", "uKeyFillAmount", "uKeyFillEffectOffset", "uKeyFillColorBias", "uWantsHighlightBiasCorrection",
    "uShadowOffset", "uShadowRadius", "uShadowOpacity",
    "uRingShadowStrokeWidth", "uRingShadowRadius", "uRingShadowOpacity", "uRingShadowOffset"
  ];
  const U = {};
  for (const name of uniformNames) U[name] = gl.getUniformLocation(prog, name);

  gl.bindVertexArray(gl.createVertexArray());

  const backdropTex = gl.createTexture();
  const tempBlurTex = gl.createTexture();
  const blurFbo = gl.createFramebuffer();

  /* ------------------------------------------------------------------------
     BACKDROP SCENES
     ------------------------------------------------------------------------ */
  const SCENES = {
    editorial: {
      base: ["#0b0b12", "#15121f", "#080b14"],
      blobs: [
        [0.14, 0.20, 0.58, "rgba(244, 114, 182, 0.20)"],
        [0.82, 0.24, 0.50, "rgba(251, 191, 36, 0.13)"],
        [0.70, 0.82, 0.56, "rgba(45, 212, 191, 0.13)"],
        [0.30, 0.76, 0.48, "rgba(167, 139, 250, 0.17)"],
        [0.52, 0.45, 0.34, "rgba(255, 255, 255, 0.035)"]
      ],
      accents: [
        [0.27, 0.31, 0.24, "rgba(251, 113, 133, 0.20)"],
        [0.55, 0.28, 0.22, "rgba(251, 191, 36, 0.16)"],
        [0.79, 0.36, 0.24, "rgba(45, 212, 191, 0.15)"],
        [0.23, 0.72, 0.23, "rgba(167, 139, 250, 0.20)"],
        [0.48, 0.75, 0.22, "rgba(244, 114, 182, 0.16)"],
        [0.76, 0.72, 0.24, "rgba(96, 165, 250, 0.15)"]
      ],
      bands: [
        [-0.34, -0.04, 0.20, "rgba(244, 114, 182, 0.10)"],
        [0.24, 0.10, 0.24, "rgba(45, 212, 191, 0.08)"]
      ],
      seed: 11,
      flecks: ["#f9a8d4", "#fcd34d", "#5eead4", "#c4b5fd"]
    },
    tahoe: {
      base: ["#04111f", "#071c34", "#040b18"],
      blobs: [
        [0.16, 0.24, 0.56, "rgba(56, 189, 248, 0.24)"],
        [0.80, 0.22, 0.52, "rgba(244, 114, 182, 0.17)"],
        [0.72, 0.80, 0.56, "rgba(59, 130, 246, 0.22)"],
        [0.28, 0.78, 0.48, "rgba(45, 212, 191, 0.16)"],
        [0.52, 0.52, 0.34, "rgba(255, 255, 255, 0.035)"]
      ],
      accents: [
        [0.27, 0.31, 0.24, "rgba(34, 211, 238, 0.22)"],
        [0.55, 0.28, 0.22, "rgba(244, 114, 182, 0.16)"],
        [0.79, 0.36, 0.24, "rgba(96, 165, 250, 0.20)"],
        [0.23, 0.72, 0.23, "rgba(45, 212, 191, 0.19)"],
        [0.48, 0.75, 0.22, "rgba(59, 130, 246, 0.20)"],
        [0.76, 0.72, 0.24, "rgba(251, 191, 36, 0.14)"]
      ],
      bands: [
        [-0.30, -0.05, 0.22, "rgba(56, 189, 248, 0.11)"],
        [0.26, 0.12, 0.24, "rgba(244, 114, 182, 0.09)"]
      ],
      seed: 23,
      flecks: ["#7dd3fc", "#f9a8d4", "#5eead4", "#fcd34d"]
    },
    nocturne: {
      base: ["#070510", "#110b22", "#050810"],
      blobs: [
        [0.16, 0.22, 0.60, "rgba(139, 92, 246, 0.30)"],
        [0.82, 0.26, 0.54, "rgba(217, 70, 239, 0.20)"],
        [0.72, 0.82, 0.58, "rgba(59, 130, 246, 0.20)"],
        [0.28, 0.82, 0.48, "rgba(236, 72, 153, 0.16)"],
        [0.50, 0.48, 0.38, "rgba(255, 255, 255, 0.04)"]
      ],
      accents: [
        [0.27, 0.31, 0.25, "rgba(167, 139, 250, 0.26)"],
        [0.55, 0.28, 0.22, "rgba(217, 70, 239, 0.18)"],
        [0.79, 0.36, 0.24, "rgba(96, 165, 250, 0.20)"],
        [0.23, 0.72, 0.23, "rgba(236, 72, 153, 0.19)"],
        [0.48, 0.75, 0.22, "rgba(139, 92, 246, 0.23)"],
        [0.76, 0.72, 0.24, "rgba(59, 130, 246, 0.19)"]
      ],
      bands: [
        [-0.32, -0.05, 0.22, "rgba(167, 139, 250, 0.13)"],
        [0.25, 0.12, 0.24, "rgba(217, 70, 239, 0.10)"]
      ],
      seed: 37,
      flecks: ["#c084fc", "#f0abfc", "#93c5fd", "#f9a8d4"]
    }
  };

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function drawImageCover(ctx, img, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (w - dw) * 0.5, (h - dh) * 0.5, dw, dh);
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex[0] !== "#") return hex;
    let value = hex.slice(1);
    if (value.length === 3) value = value.split("").map((c) => c + c).join("");
    const num = parseInt(value, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawBackdrop(w, h) {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d");
    const dpr = w / Math.max(1, window.innerWidth);

    if (customImage) {
      ctx.fillStyle = "#060713";
      ctx.fillRect(0, 0, w, h);
      drawImageCover(ctx, customImage, w, h);
      const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(3,4,10,0.55)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);
      return off;
    }

    const scene = SCENES[state.scene] || SCENES.nocturne;
    const base = ctx.createLinearGradient(0, 0, w, h);
    base.addColorStop(0, scene.base[0]);
    base.addColorStop(0.5, scene.base[1]);
    base.addColorStop(1, scene.base[2]);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const [bx, by, br, color] of scene.blobs) {
      const radius = br * Math.max(w, h);
      const rg = ctx.createRadialGradient(bx * w, by * h, 0, bx * w, by * h, radius);
      rg.addColorStop(0, color);
      rg.addColorStop(0.55, color.replace(/[\d.]+\)$/, "0.055)"));
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }

    // Localised colour pools behind the bento cards. These are what the
    // card bevels actually bend, so each panel gets its own tint.
    const accents = scene.accents || [];
    for (const [bx, by, br, color] of accents) {
      const radius = br * Math.max(w, h);
      const rg = ctx.createRadialGradient(bx * w, by * h, 0, bx * w, by * h, radius);
      rg.addColorStop(0, color);
      rg.addColorStop(0.5, color.replace(/[\d.]+\)$/, "0.06)"));
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }

    // Broad aurora bands with soft edges. The bevels visibly bend the
    // gradient boundaries, which is what sells the glass.
    const bands = scene.bands || [];
    for (const [angle, offset, widthRatio, color] of bands) {
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(angle);
      const half = h * widthRatio;
      const center = offset * h;
      const bandGrad = ctx.createLinearGradient(0, center - half, 0, center + half);
      bandGrad.addColorStop(0, "rgba(0,0,0,0)");
      bandGrad.addColorStop(0.42, color);
      bandGrad.addColorStop(0.58, color);
      bandGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bandGrad;
      ctx.fillRect(-w * 1.5, center - half, w * 3, half * 2);
      ctx.restore();
    }
    ctx.restore();

    // Fine grid — the demo's strongest refraction cue.
    const gridStep = Math.max(38, Math.round(Math.min(w, h) * 0.052));
    ctx.save();
    ctx.lineWidth = Math.max(1, dpr * 0.65);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    for (let x = (w % gridStep) * 0.5; x < w; x += gridStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = (h % gridStep) * 0.5; y < h; y += gridStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // Fine concentric rings — they make the refraction readable.
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
    ctx.lineWidth = Math.max(1, dpr * 0.75);
    const ringX = w * 0.72;
    const ringY = h * 0.78;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(ringX, ringY, Math.max(w, h) * (0.18 + i * 0.13), 0, Math.PI * 2);
      ctx.stroke();
    }
    const centerRingX = w * 0.48;
    const centerRingY = h * 0.46;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(centerRingX, centerRingY, Math.max(w, h) * (0.16 + i * 0.16), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Diagonal aurora ribbons.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = Math.max(1.5, dpr * 1.1);
    for (let i = 0; i < 4; i++) {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(0.45, i % 2 ? "rgba(192,132,252,0.11)" : "rgba(96,165,250,0.09)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      for (let x = -w * 0.1; x <= w * 1.1; x += w * 0.04) {
        const y = h * (0.18 + i * 0.18) + Math.sin(x * 0.0035 + i * 1.7) * h * 0.06;
        if (x <= -w * 0.1 + 0.1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Stars / dust.
    const rand = mulberry32(scene.seed);
    ctx.save();
    for (let i = 0; i < 440; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = (0.35 + rand() * 1.7) * dpr;
      const a = 0.16 + rand() * 0.62;
      ctx.fillStyle = rand() > 0.72 ? `rgba(216,180,254,${a})` : `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // A handful of larger sparkles for chromatic fringing.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 18; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const size = (3.5 + rand() * 9) * dpr;
      const a = 0.28 + rand() * 0.38;
      const tint = i % 3 === 0 ? "255, 220, 250" : i % 3 === 1 ? "210, 225, 255" : "255, 255, 255";
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 2.6);
      g.addColorStop(0, `rgba(${tint},${a})`);
      g.addColorStop(0.25, `rgba(${tint},${a * 0.5})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(${tint},${a * 0.55})`;
      ctx.lineWidth = Math.max(1, dpr * 0.7);
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
    ctx.restore();

    // A handful of colour flecks for chromatic fringing.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 38; i++) {
      const x = rand() * w;
      const y = rand() * h;
      const r = (1.5 + rand() * 4.5) * dpr;
      const color = scene.flecks[i % scene.flecks.length];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      g.addColorStop(0, color);
      g.addColorStop(0.35, hexToRgba(color, 0.28));
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.globalAlpha = 0.35 + rand() * 0.4;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Vignette.
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.18, w * 0.5, h * 0.45, Math.max(w, h) * 0.78);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(2,3,9,0.62)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    return off;
  }

  /* ------------------------------------------------------------------------
     TEXTURE + MIP PYRAMID
     ------------------------------------------------------------------------ */
  function buildGaussianMipPyramid(w, h) {
    const maxLevels = Math.min(7, Math.floor(Math.log2(Math.max(w, h))) + 1);
    gl.bindTexture(gl.TEXTURE_2D, backdropTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_2D);

    gl.bindTexture(gl.TEXTURE_2D, tempBlurTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.useProgram(blurProg);
    gl.bindFramebuffer(gl.FRAMEBUFFER, blurFbo);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(blurU.uSrc, 0);

    let pw = w;
    let ph = h;
    for (let level = 1; level < maxLevels; level++) {
      const mw = Math.max(1, pw >> 1);
      const mh = Math.max(1, ph >> 1);

      gl.bindTexture(gl.TEXTURE_2D, tempBlurTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mw, mh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempBlurTex, 0);
      gl.viewport(0, 0, mw, mh);
      gl.bindTexture(gl.TEXTURE_2D, backdropTex);
      gl.uniform1f(blurU.uSrcLod, level - 1);
      gl.uniform2f(blurU.uDir, 1.0 / pw, 0.0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, backdropTex, level);
      gl.bindTexture(gl.TEXTURE_2D, tempBlurTex);
      gl.uniform1f(blurU.uSrcLod, 0.0);
      gl.uniform2f(blurU.uDir, 0.0, 1.0 / mh);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      pw = mw;
      ph = mh;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog);
  }

  function uploadBackdrop() {
    const w = canvas.width;
    const h = canvas.height;
    const src = drawBackdrop(w, h);
    gl.bindTexture(gl.TEXTURE_2D, backdropTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    buildGaussianMipPyramid(w, h);
    backdropDirty = false;
  }

  /* ------------------------------------------------------------------------
     RESIZE
     ------------------------------------------------------------------------ */
  function getDpr() {
    return Math.min(window.devicePixelRatio || 1, 2);
  }

  function resize() {
    const dpr = getDpr();
    const w = Math.max(1, Math.round(window.innerWidth * dpr));
    const h = Math.max(1, Math.round(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      uploadBackdrop();
    }
    syncShapeSizes();
  }

  /* ------------------------------------------------------------------------
     CARD GEOMETRY
     ------------------------------------------------------------------------ */
  const cards = Array.from(document.querySelectorAll(".glass-card"));
  const cardRects = new Float32Array(MAX_CARDS * 4);
  const cardBoxes = [];

  function updateCardRects() {
    const dpr = getDpr();
    const vh = window.innerHeight;
    let count = 0;
    cardBoxes.length = 0;
    for (const card of cards) {
      if (count >= MAX_CARDS) break;
      const r = card.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const idx = count * 4;
      cardRects[idx] = (r.left + r.width * 0.5) * dpr;
      cardRects[idx + 1] = (vh - (r.top + r.height * 0.5)) * dpr;
      cardRects[idx + 2] = r.width * 0.5 * dpr;
      cardRects[idx + 3] = r.height * 0.5 * dpr;
      cardBoxes.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      count++;
    }
    return count;
  }

  /* ------------------------------------------------------------------------
     FLOATING GLASS SHAPES
     ------------------------------------------------------------------------ */
  const shapeRects = new Float32Array(MAX_SHAPES * 4);
  const shapeMeta = new Float32Array(MAX_SHAPES * 4);
  const shapes = [];

  function shapeSizeFor(kind) {
    const base = Math.max(260, Math.min(window.innerWidth, window.innerHeight));
    if (kind === 0) {
      const r = Math.max(32, Math.min(64, base * 0.075));
      return { hw: r, hh: r, corner: 0, bound: r };
    }
    if (kind === 1) {
      const h = Math.max(28, Math.min(54, base * 0.065));
      return { hw: h, hh: h, corner: h * 0.28, bound: h * 1.4142 };
    }
    const hw = Math.max(30, Math.min(58, base * 0.07));
    const hh = hw * 0.86;
    return { hw, hh, corner: Math.min(hw, hh) * 0.16, bound: Math.hypot(hw, hh) };
  }

  function clampShapeInside(s) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (s.kind === 0) {
      s.ex = s.hw;
      s.ey = s.hh;
    } else {
      const ca = Math.abs(Math.cos(s.angle));
      const sa = Math.abs(Math.sin(s.angle));
      s.ex = ca * s.hw + sa * s.hh;
      s.ey = sa * s.hw + ca * s.hh;
    }
    s.x = Math.min(vw - s.ex, Math.max(s.ex, s.x));
    s.y = Math.min(vh - s.ey, Math.max(s.ey, s.y));
  }

  function updateShapeProxy(s) {
    s.el.style.transform =
      `translate(-50%, -50%) translate(${s.x}px, ${s.y}px) rotate(${s.angle}rad)`;
  }

  function bindShapeDrag(s) {
    const el = s.el;

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      s.dragging = true;
      s.pointerId = e.pointerId;
      s.grabX = e.clientX - s.x;
      s.grabY = e.clientY - s.y;
      s.history = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
      el.classList.add("is-dragging");
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
        /* pointer may already be gone on very quick taps */
      }
    });

    el.addEventListener("pointermove", (e) => {
      if (!s.dragging || e.pointerId !== s.pointerId) return;
      s.x = e.clientX - s.grabX;
      s.y = e.clientY - s.grabY;
      clampShapeInside(s);
      updateShapeProxy(s);
      s.history.push({ t: performance.now(), x: e.clientX, y: e.clientY });
      while (s.history.length > 8) s.history.shift();
    });

    const endDrag = (e) => {
      if (!s.dragging) return;
      if (e.pointerId !== undefined && e.pointerId !== s.pointerId) return;
      s.dragging = false;
      el.classList.remove("is-dragging");

      if (s.history && s.history.length > 1) {
        const first = s.history[0];
        const last = s.history[s.history.length - 1];
        const dt = Math.max(0.016, (last.t - first.t) / 1000);
        let vx = (last.x - first.x) / dt;
        let vy = (last.y - first.y) / dt;
        const speed = Math.hypot(vx, vy);
        if (speed > 900) {
          vx *= 900 / speed;
          vy *= 900 / speed;
        }
        if (speed > 40) {
          s.vx = vx;
          s.vy = vy;
        } else {
          const base = 72;
          const cur = Math.hypot(s.vx, s.vy);
          if (cur > 1) {
            s.vx = (s.vx / cur) * base;
            s.vy = (s.vy / cur) * base;
          } else {
            s.vx = base * 0.8;
            s.vy = base * 0.6;
          }
        }
      }
      s.history = null;
    };

    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", endDrag);
  }

  function createShapes() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const names = ["circle", "square", "triangle"];
    const starts = [
      { fx: 0.18, fy: 0.74, vx: 82, vy: -58, spin: 0.10, angle: 0 },
      { fx: 0.80, fy: 0.30, vx: -70, vy: 66, spin: -0.14, angle: 0.22 },
      { fx: 0.50, fy: 0.56, vx: 58, vy: 74, spin: 0.08, angle: -0.14 }
    ];

    for (let i = 0; i < MAX_SHAPES; i++) {
      const size = shapeSizeFor(i);
      const proxy = document.createElement("div");
      proxy.className = `lg-shape lg-shape-${names[i]}`;
      proxy.setAttribute("aria-hidden", "true");
      proxy.style.width = `${size.hw * 2}px`;
      proxy.style.height = `${size.hh * 2}px`;
      document.body.appendChild(proxy);

      const s = {
        kind: i,
        x: starts[i].fx * vw,
        y: starts[i].fy * vh,
        vx: starts[i].vx,
        vy: starts[i].vy,
        angle: starts[i].angle,
        spin: starts[i].spin,
        hw: size.hw,
        hh: size.hh,
        corner: size.corner,
        el: proxy,
        dragging: false,
        pointerId: -1,
        grabX: 0,
        grabY: 0,
        history: null,
        ex: size.hw,
        ey: size.hh
      };

      shapes.push(s);
      bindShapeDrag(s);
      clampShapeInside(s);
      updateShapeProxy(s);
    }
  }

  function syncShapeSizes() {
    if (!shapes.length) return;
    for (const s of shapes) {
      const size = shapeSizeFor(s.kind);
      s.hw = size.hw;
      s.hh = size.hh;
      s.corner = size.corner;
      s.el.style.width = `${size.hw * 2}px`;
      s.el.style.height = `${size.hh * 2}px`;
      clampShapeInside(s);
      updateShapeProxy(s);
    }
  }

  function updateShapes(dt) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (const s of shapes) {
      if (!s.dragging) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.kind !== 0) s.angle += s.spin * dt;
        clampShapeInside(s);

        if (s.x <= s.ex + 0.01) s.vx = Math.abs(s.vx);
        else if (s.x >= vw - s.ex - 0.01) s.vx = -Math.abs(s.vx);
        if (s.y <= s.ey + 0.01) s.vy = Math.abs(s.vy);
        else if (s.y >= vh - s.ey - 0.01) s.vy = -Math.abs(s.vy);

        // A shape whose centre is buried in a card is visually absorbed by
        // that card. Let clicks fall through to the card content instead of
        // grabbing an invisible shape.
        let overCard = false;
        for (const b of cardBoxes) {
          if (s.x >= b.left && s.x <= b.right && s.y >= b.top && s.y <= b.bottom) {
            overCard = true;
            break;
          }
        }
        const pe = overCard ? "none" : "";
        if (s.el.style.pointerEvents !== pe) s.el.style.pointerEvents = pe;
      }
      updateShapeProxy(s);
    }
  }

  function updateShapeUniforms(dpr) {
    const vh = window.innerHeight;
    for (let i = 0; i < MAX_SHAPES; i++) {
      const s = shapes[i];
      const idx = i * 4;
      if (!s) {
        shapeMeta[idx + 3] = 0;
        continue;
      }
      shapeRects[idx] = s.x * dpr;
      shapeRects[idx + 1] = (vh - s.y) * dpr;
      shapeRects[idx + 2] = s.hw * dpr;
      shapeRects[idx + 3] = s.hh * dpr;
      shapeMeta[idx] = s.kind;
      shapeMeta[idx + 1] = s.angle;
      shapeMeta[idx + 2] = s.corner * dpr;
      shapeMeta[idx + 3] = 1;
    }
    gl.uniform4fv(U.uShapeRects, shapeRects);
    gl.uniform4fv(U.uShapeMeta, shapeMeta);
    gl.uniform1i(U.uShapeCount, shapes.length);
  }

  /* ------------------------------------------------------------------------
     RENDER LOOP
     ------------------------------------------------------------------------ */
  function applyFacePreset() {
    const preset = PRESETS[state.preset] || PRESETS.clear;
    gl.useProgram(prog);

    const p = preset;
    gl.uniform1f(U.uInnerRefractionAmount, state.refract * getDpr());
    gl.uniform1f(U.uInnerRefractionHeight, Math.max(1, state.height) * getDpr());
    gl.uniform1f(U.uOuterRefractionAmount, state.refract * 0.35 * getDpr());
    gl.uniform1f(U.uOuterRefractionHeight, Math.max(6, state.height * 0.28) * getDpr());
    gl.uniform1f(U.uRefractionThreshold0, -Math.min(10, state.height * 0.25) * getDpr());
    gl.uniform1f(U.uRefractionThreshold1, 0.0);
    gl.uniform1f(U.uRefractionOpacity, 0.22);

    gl.uniform1f(U.uBlurRadius, state.blur * getDpr());
    gl.uniform1f(U.uEdgeBleedAmount, state.refract * 1.1 * getDpr());
    gl.uniform1f(U.uEdgeBleedHeight, Math.min(20, state.height * 0.55) * getDpr());
    gl.uniform1f(U.uEdgeBleedBlur, (state.blur + 5) * getDpr());
    gl.uniform1f(U.uEdgeBleedOpacity, p.edgeBleedOpacity);
    gl.uniform2f(U.uBleedDarken, 0.45, 0.55);

    gl.uniform1f(U.uAberrationAmount, state.aberr * getDpr());
    gl.uniform1f(U.uAberrationHeight, state.height * 0.85 * getDpr());
    gl.uniform1f(U.uAberrationOffset, 0.0);
    gl.uniform2f(U.uAberrationDir, 0.9659, 0.2588);

    gl.uniform1f(U.uFaceOpacity, p.faceOpacity);
    gl.uniform1f(U.uFaceMaxLumaComp, p.faceMaxLumaComp);
    gl.uniform4fv(U.uFaceCm0, p.faceCm[0]);
    gl.uniform4fv(U.uFaceCm1, p.faceCm[1]);
    gl.uniform4fv(U.uFaceCm2, p.faceCm[2]);
    gl.uniform4fv(U.uBleedCm0, p.bleedCm[0]);
    gl.uniform4fv(U.uBleedCm1, p.bleedCm[1]);
    gl.uniform4fv(U.uBleedCm2, p.bleedCm[2]);

    const blurFillOn = p.blurFillEnabled && state.blur > 0.25 ? 1.0 : 0.0;
    gl.uniform1f(U.uBlurFillEnabled, blurFillOn);
    gl.uniform1f(U.uBlurFillRadius, state.blur * 2.2 * getDpr());
    gl.uniform1f(U.uBlurFillLighten, p.blurFillLighten);
    gl.uniform1f(U.uBlurFillDarken, p.blurFillDarken);
    gl.uniform1f(U.uBlurFillNormal, p.blurFillNormal);

    gl.uniform1f(U.uKeyFillHeight, Math.max(2, 2.8 * getDpr()));
    gl.uniform1f(U.uKeyFillSpread, 0.18);
    gl.uniform1f(U.uKeyFillAmount, 1.4);
    gl.uniform1f(U.uKeyFillEffectOffset, 0.5 * getDpr());
    gl.uniform1f(U.uKeyFillColorBias, state.rim);
    gl.uniform1f(U.uWantsHighlightBiasCorrection, 1.0);

    gl.uniform2f(U.uShadowOffset, 0.0, 12.0 * getDpr());
    gl.uniform1f(U.uShadowRadius, 28.0 * getDpr());
    gl.uniform1f(U.uShadowOpacity, p.shadowOpacity);
    gl.uniform1f(U.uRingShadowStrokeWidth, 3.5 * getDpr());
    gl.uniform1f(U.uRingShadowRadius, 12.0 * getDpr());
    gl.uniform1f(U.uRingShadowOpacity, p.ringShadowOpacity);
    gl.uniform2f(U.uRingShadowOffset, 0.0, 3.0 * getDpr());
  }

  let lastTime = performance.now();
  let started = false;

  function render(now) {
    const dt = Math.min(0.05, (now - lastTime) * 0.001);
    lastTime = now;

    if (backdropDirty) uploadBackdrop();

    const dpr = getDpr();
    const cardCount = updateCardRects();
    updateShapes(dt);

    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, backdropTex);
    gl.uniform1i(U.uBackdrop, 0);
    gl.uniform2f(U.uResolution, canvas.width, canvas.height);
    gl.uniform1f(U.uDpr, dpr);
    gl.uniform4fv(U.uCardRects, cardRects);
    gl.uniform1i(U.uCardCount, cardCount);
    gl.uniform1f(U.uCornerRadius, state.radius * dpr);
    gl.uniform1f(U.uMergeK, state.merge * dpr);
    updateShapeUniforms(dpr);

    applyFacePreset();

    const angle = -0.68 + Math.sin(now * 0.00035) * 0.14;
    gl.uniform2f(U.uKeyFillDir, Math.cos(angle), Math.sin(angle));

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!started) {
      started = true;
      document.body.classList.add("liquid-glass-webgl");
      cleanupFallbackGlass();
      if (SHOW_TUNER) buildTuner();
    }

    requestAnimationFrame(render);
  }

  /* ------------------------------------------------------------------------
     CLEANUP OLD CSS/SVG CARD GLASS
     ------------------------------------------------------------------------ */
  function cleanupFallbackGlass() {
    for (const card of cards) {
      card.classList.remove("liquid-glass-active");
      card.style.backdropFilter = "";
      card.style.webkitBackdropFilter = "";
      card.style.setProperty("--lg-card-radius", `${state.radius}px`);
    }
    document.documentElement.style.setProperty("--lg-radius", `${state.radius}px`);
  }

  /* ------------------------------------------------------------------------
     TUNER UI
     ------------------------------------------------------------------------ */
  function buildTuner() {
    if (tunerEl) return;

    const hud = document.createElement("aside");
    hud.className = "lg-hud is-hidden";
    hud.id = "lg-hud";
    hud.innerHTML = `
      <div class="lg-hud-head" id="lg-hud-drag">
        <div class="lg-hud-titles">
          <div class="lg-hud-title">Liquid Glass</div>
          <div class="lg-hud-sub">QuartzCore glass_background_all_lpf</div>
        </div>
        <button class="lg-hud-hide" id="lg-hud-toggle" type="button">Hide</button>
      </div>
      <div class="lg-hud-body">
        <div class="lg-seg" data-group="preset" aria-label="Glass preset">
          <button type="button" data-value="regular">Regular</button>
          <button type="button" data-value="clear">Clear</button>
          <button type="button" data-value="dark">Dark</button>
          <button type="button" data-value="prism">Prism</button>
        </div>
        <div class="lg-seg lg-seg-three" data-group="scene" aria-label="Backdrop scene">
          <button type="button" data-value="editorial">Editorial</button>
          <button type="button" data-value="tahoe">Tahoe</button>
          <button type="button" data-value="nocturne">Nocturne</button>
        </div>
        <div class="lg-seg lg-seg-three" data-group="layout" aria-label="Glass layout">
          <button type="button" data-value="morph">Morph</button>
          <button type="button" data-value="pill">Pill</button>
          <button type="button" data-value="dock">Dock</button>
        </div>
        <div class="lg-sliders"></div>
        <div class="lg-hud-footer">
          <label class="lg-file-label">
            Load Image
            <input id="lg-file" type="file" accept="image/*" hidden>
          </label>
          <button type="button" id="lg-reset">Reset</button>
        </div>
        <div class="lg-toast" id="lg-toast" role="status" aria-live="polite"></div>
      </div>
    `;
    document.body.appendChild(hud);
    tunerEl = hud;

    const slidersWrap = hud.querySelector(".lg-sliders");
    for (const slider of SLIDERS) {
      const row = document.createElement("div");
      row.className = "lg-row";
      row.innerHTML = `
        <div class="lg-row-label">
          <span>${slider.label}</span>
          <span data-value-for="${slider.key}"></span>
        </div>
        <input type="range" min="${slider.min}" max="${slider.max}" step="${slider.step}" data-key="${slider.key}">
      `;
      slidersWrap.appendChild(row);
    }

    syncTuner();
    bindTunerEvents(hud);
    makeDraggable(hud, hud.querySelector("#lg-hud-drag"));
  }

  function formatValue(slider, value) {
    if (slider.decimals) return Number(value).toFixed(slider.decimals) + slider.suffix;
    if (slider.step < 1) return String(Number(value)) + slider.suffix;
    return String(Math.round(value)) + slider.suffix;
  }

  function syncTuner() {
    if (!tunerEl) return;
    for (const slider of SLIDERS) {
      const input = tunerEl.querySelector(`input[data-key="${slider.key}"]`);
      const value = tunerEl.querySelector(`[data-value-for="${slider.key}"]`);
      if (input) input.value = state[slider.key];
      if (value) value.textContent = formatValue(slider, state[slider.key]);
    }
    tunerEl.querySelectorAll(".lg-seg").forEach((seg) => {
      const group = seg.dataset.group;
      const active = state[group];
      seg.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.value === active);
      });
    });
    document.documentElement.style.setProperty("--lg-radius", `${state.radius}px`);
    for (const card of cards) {
      card.style.setProperty("--lg-card-radius", `${state.radius}px`);
    }
  }

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    state.preset = name;
    state.refract = preset.refract;
    state.height = preset.height;
    state.aberr = preset.aberr;
    state.blur = preset.blur;
    state.rim = preset.rim;
    state.merge = preset.merge;
    state.radius = preset.radius;
    syncTuner();
  }

  function applyLayout(name) {
    const layout = LAYOUTS[name];
    if (!layout) return;
    state.layout = name;
    state.radius = layout.radius;
    state.merge = layout.merge;
    state.height = layout.height;
    syncTuner();
  }

  function setScene(name) {
    if (!SCENES[name]) return;
    state.scene = name;
    if (customImage) {
      if (customImageUrl) URL.revokeObjectURL(customImageUrl);
      customImage = null;
      customImageUrl = null;
    }
    backdropDirty = true;
    syncTuner();
  }

  function getConfig() {
    return {
      preset: state.preset,
      scene: state.scene,
      layout: state.layout,
      refraction: state.refract,
      bevelHeight: state.height,
      chromaticAberration: state.aberr,
      backdropBlur: state.blur,
      rimSpecular: Number(state.rim.toFixed(2)),
      liquidMerge: state.merge,
      cornerRadius: state.radius,
      customImage: !!customImage
    };
  }

  function showToast(message) {
    const toast = tunerEl && tunerEl.querySelector("#lg-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function loadDefaultImage() {
    if (defaultImage) {
      customImage = defaultImage;
      customImageUrl = null;
      backdropDirty = true;
      return;
    }
    const img = new Image();
    img.onload = () => {
      defaultImage = img;
      // Don't overwrite a custom image the user picked while this loaded.
      if (!customImage) {
        customImage = img;
        customImageUrl = null;
        backdropDirty = true;
      }
    };
    img.onerror = () => {
      console.warn(`[Liquid Glass] Could not load default backdrop ${DEFAULT_IMAGE}`);
    };
    img.src = DEFAULT_IMAGE;
  }

  function loadImageFile(file) {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (customImageUrl) URL.revokeObjectURL(customImageUrl);
      customImage = img;
      customImageUrl = url;
      backdropDirty = true;
      syncTuner();
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  function resetAll() {
    state.preset = CONFIG.preset;
    state.scene = CONFIG.scene;
    state.layout = CONFIG.layout;
    state.refract = CONFIG.refract;
    state.height = CONFIG.height;
    state.aberr = CONFIG.aberr;
    state.blur = CONFIG.blur;
    state.rim = CONFIG.rim;
    state.merge = CONFIG.merge;
    state.radius = CONFIG.radius;
    if (customImageUrl) URL.revokeObjectURL(customImageUrl);
    customImageUrl = null;
    customImage = defaultImage;
    if (!customImage) loadDefaultImage();
    backdropDirty = true;
    syncTuner();
    showToast("Settings reset");
  }

  function bindTunerEvents(hud) {
    hud.addEventListener("input", (e) => {
      const input = e.target.closest("input[type='range']");
      if (!input) return;
      const key = input.dataset.key;
      const slider = SLIDERS.find((s) => s.key === key);
      if (!slider) return;
      state[key] = parseFloat(input.value);
      const valueEl = hud.querySelector(`[data-value-for="${key}"]`);
      if (valueEl) valueEl.textContent = formatValue(slider, state[key]);
      if (key === "radius") {
        document.documentElement.style.setProperty("--lg-radius", `${state.radius}px`);
        for (const card of cards) card.style.setProperty("--lg-card-radius", `${state.radius}px`);
      }
    });

    hud.addEventListener("click", (e) => {
      const presetBtn = e.target.closest(".lg-seg[data-group='preset'] button");
      if (presetBtn) {
        applyPreset(presetBtn.dataset.value);
        return;
      }
      const sceneBtn = e.target.closest(".lg-seg[data-group='scene'] button");
      if (sceneBtn) {
        setScene(sceneBtn.dataset.value);
        return;
      }
      const layoutBtn = e.target.closest(".lg-seg[data-group='layout'] button");
      if (layoutBtn) {
        applyLayout(layoutBtn.dataset.value);
        return;
      }
      if (e.target.closest("#lg-reset")) {
        resetAll();
        return;
      }
      if (e.target.closest("#lg-hud-toggle")) {
        hud.classList.add("is-hidden");
        return;
      }
    });

    hud.querySelector("#lg-file").addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) loadImageFile(e.target.files[0]);
    });

    hud.querySelector("#lg-hud-drag").addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      // handled by makeDraggable
    });
  }

  function makeDraggable(hud, handle) {
    let dragging = false;
    let start = null;

    handle.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      const rect = hud.getBoundingClientRect();
      dragging = true;
      start = { x: e.clientX, y: e.clientY, left: rect.left, top: rect.top };
      hud.style.left = `${rect.left}px`;
      hud.style.top = `${rect.top}px`;
      hud.style.right = "auto";
      handle.setPointerCapture(e.pointerId);
      hud.classList.add("is-dragging");
    });

    handle.addEventListener("pointermove", (e) => {
      if (!dragging || !start) return;
      const nx = Math.min(window.innerWidth - 90, Math.max(8, start.left + (e.clientX - start.x)));
      const ny = Math.min(window.innerHeight - 60, Math.max(8, start.top + (e.clientY - start.y)));
      hud.style.left = `${nx}px`;
      hud.style.top = `${ny}px`;
    });

    const end = () => {
      dragging = false;
      start = null;
      hud.classList.remove("is-dragging");
    };
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  function openTuner() {
    if (!SHOW_TUNER) return;
    if (!tunerEl) buildTuner();
    if (tunerEl) tunerEl.classList.remove("is-hidden");
  }

  function bindTunerTrigger() {
    const trigger = document.querySelector(".card-skills .icon-wrapper");
    if (!trigger) return;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("title", "Liquid Glass settings");
    trigger.style.cursor = "pointer";
    const open = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openTuner();
    };
    trigger.addEventListener("click", open);
    trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open(e);
    });
  }

  /* ------------------------------------------------------------------------
     BOOT
     ------------------------------------------------------------------------ */
  window.addEventListener("resize", () => {
    resize();
  });

  window.addEventListener("orientationchange", () => {
    setTimeout(resize, 120);
  });

  createShapes();
  loadDefaultImage();
  bindTunerTrigger();
  resize();
  requestAnimationFrame(render);

  // Expose a tiny debug API (handy for the final bake / verification).
  window.LiquidGlass = {
    getConfig,
    state,
    shapes,
    setConfig(next) {
      Object.assign(state, next);
      backdropDirty = true;
      syncTuner();
    },
    removeTuner() {
      if (tunerEl) {
        tunerEl.remove();
        tunerEl = null;
      }
    }
  };
})();
