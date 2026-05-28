document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // SPOTLIGHT MOUSE-TRACKING EFFECT ON BENTO CARDS
    // ---------------------------------------------------------
    const bentoCards = document.querySelectorAll('.glass-card');
    
    bentoCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ---------------------------------------------------------
    // SMOOTH 3D PARALLAX CONTAINER TILT
    // ---------------------------------------------------------
    const bentoContainer = document.getElementById('bento-grid');
    let tiltFrameId = null;

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) {
            // Disable parallax on mobile for touch performance
            if (bentoContainer.style.transform) {
                bentoContainer.style.transform = 'none';
            }
            return;
        }

        if (tiltFrameId) {
            cancelAnimationFrame(tiltFrameId);
        }

        tiltFrameId = requestAnimationFrame(() => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const offsetX = (clientX / innerWidth) - 0.5;
            const offsetY = (clientY / innerHeight) - 0.5;
            // Extremely smooth, gentle shifting
            bentoContainer.style.transform = `translate(${offsetX * -14}px, ${offsetY * -14}px)`;
        });
    });

    // ---------------------------------------------------------
    // DYNAMIC CERTIFICATE LIGHTBOX ENGINE
    // ---------------------------------------------------------
    // Create the Lightbox markup dynamically
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="" alt="Certificate High-Res View">
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');

    const openLightbox = (src, alt) => {
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.classList.add('show');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('show');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // ---------------------------------------------------------
    // POPUP CONTENT SPECIFICATIONS (MODERN HTML & SVG ICONS)
    // ---------------------------------------------------------
    const aboutMeContainer = document.getElementById('aboutMe');
    const projectsContainer = document.getElementById('projects');
    const certificationsContainer = document.getElementById('certifications');
    const contactContainer = document.getElementById('contact');

    const popupContainers = [
        {
            trigger: aboutMeContainer,
            color: 'red', // Translates to var(--accent-blue) glow circle
            title: 'About Me',
            content: `
                <div class="modal-scroll-area">
                    <div class="modal-section-title">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>Hello! I'm Esshwar</span>
                    </div>
                    <p>You can call me <strong>Essh</strong> :)</p>
                    <p>I'm a 19-year-old developer based in India, specialized in <strong>Python</strong> and <strong>Agentic AI</strong> development. I possess a deep passion for discovering new Artificial Intelligence paradigms, building custom multi-agentic loops from scratch, and designing robust, high-impact software systems.</p>
                    <p>I focus on creating highly-interactive fullstack interfaces and smooth, automated pipelines that bridge complex scientific libraries with fluid user experiences.</p>
                    
                    <div class="modal-section-title mt-4">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        <span>Core Competencies</span>
                    </div>
                    <p>My technical expertise lies at the intersection of programming efficiency, modern deep learning models, and agentic workflows:</p>
                    <ul style="margin-left: 20px; margin-bottom: 16px; color: var(--text-secondary); line-height: 1.6; font-size: 14.5px;">
                        <li><strong>Languages:</strong> High expertise in Python, JavaScript/TypeScript (ES6+), C, and HTML/CSS.</li>
                        <li><strong>Agentic Systems & MCP:</strong> Building custom multi-agent loops from scratch, Model Context Protocol (MCP) packages, and database memory integration.</li>
                        <li><strong>AI & Vision:</strong> Object detection & tracking (YOLO models), face recognition, and Vision Transformers (ViT) for medical classification.</li>
                        <li><strong>Generative AI & NLP:</strong> RAG frameworks, Langchain, Large Language Models (LLMs), Stable Diffusion LoRA tuning, and Voice Synthesis (RVC).</li>
                        <li><strong>Fullstack & Hardware:</strong> Next.js, Node.js, PyTorch, Discord API, and Arduino/IoT hardware integration.</li>
                    </ul>
                </div>
            `
        },
        {
            trigger: projectsContainer,
            color: 'blue', // Translates to var(--accent-purple) glow circle
            title: 'Featured Projects',
            content: `
                <div class="modal-section-title">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    <span>What I've Been Building</span>
                </div>
                <p class="mb-6">I am highly appreciative of the open-source community, whose collaborative libraries make it possible to build cutting-edge solutions rapidly. Below are selected applications showcasing my core dev skillsets:</p>
                
                <div class="modal-scroll-area">
                    <div class="projects-modal-grid">
                        <!-- Project 1: Singularia -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">Singularia</span>
                                <a href="https://www.singularia.xyz/" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                                    <span>Website</span>
                                </a>
                            </div>
                            <p class="project-desc">An Agentic Discord bot for all tasks inside your Discord server. This project allowed me to learn everything about how an agentic system works. I skipped using frameworks and implemented the agent loop from scratch myself, featuring a main agent with tools and multiple subagents. Integrated with PayPal payments and generated recurring monthly subscribers.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Large Language Model</span>
                                <span class="tech-badge">Agentic AI</span>
                                <span class="tech-badge">Python</span>
                            </div>
                        </div>

                        <!-- Project 2: EzMemory -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">EzMemory</span>
                                <a href="https://github.com/EsshUwU/EzMemory" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">A Simple Python Package for adding Memories to AI Agents. Provides Model Context Protocol (MCP) Tools or HTTP endpoint tools to any AI Agent system like Openclaw, Cursor, Claude Code, etc. The tools allow agents to save important memories to a customized database, sharing memory dynamically across multiple running agents. This was my first project publishing a Python package to PyPI.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Python</span>
                                <span class="tech-badge">Retrieval Augmented Generation</span>
                                <span class="tech-badge">Model Context Protocol (MCP)</span>
                            </div>
                        </div>

                        <!-- Project 3: MEDiVUE -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">MEDiVUE</span>
                                <span class="tech-badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1)">Final Year Project</span>
                            </div>
                            <p class="project-desc">Medical Report AI generation with grounded ML data. My primary focus of this project was designing and training an advanced classification model using Vision Transformers (ViT), achieving an outstanding 99.64% accuracy on our test dataset. An LLM compiles the complete clinical diagnostic report grounded by MRI scans and visual classification data in real-time.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Large Language Model</span>
                                <span class="tech-badge">Machine Learning</span>
                                <span class="tech-badge">Artificial Intelligence</span>
                            </div>
                        </div>

                        <!-- Project 4: music-skill -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">music-skill</span>
                                <a href="https://github.com/EsshUwU/music-skill" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">AI agent skill for procedural music generation and MIDI remixing. A modular skill that allows AI Agents like Cursor, Claude Code, and other developer tools to create music or remix tracks dynamically using a provided input MIDI file.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Large Language Model</span>
                                <span class="tech-badge">Agentic AI</span>
                            </div>
                        </div>

                        <!-- Project 5: llm-controller -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">llm-controller</span>
                                <span class="tech-badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1)">NLP & IoT</span>
                            </div>
                            <p class="project-desc">Project combining IoT and NLP. Instead of controlling an IoT setup through a dashboard, users talk directly to it in natural language. It translates instructions to agent actions that manage IoT tasks; in this prototype example, controlling a light by asking it to turn on and off.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Python</span>
                                <span class="tech-badge">Large Language Model</span>
                            </div>
                        </div>

                        <!-- Project 6: yolo_tracking -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">yolo_tracking</span>
                                <a href="https://github.com/EsshUwU/yolo_tracking" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">Simple Object Tracking with YOLO implemented into Arduino. Hardware project that is powered by a YOLO tracking model, tracking hand movements and communicating coordinate data to an Arduino that moves a servo motor based on hand placement.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">You Only Look Once</span>
                                <span class="tech-badge">Arduino</span>
                            </div>
                        </div>

                        <!-- Project 7: Discord Chatbot with GenerativeAI -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">Discord Chatbot with GenerativeAI</span>
                                <a href="https://github.com/EsshUwU/GeminiDiscord" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">A professional Discord bot integration implementing Google's Generative AI models. It engages in dynamic contextual conversations, answers questions, and coordinates chat pipelines in real-time.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Python</span>
                                <span class="tech-badge">Generative AI</span>
                                <span class="tech-badge">Discord.py</span>
                            </div>
                        </div>

                        <!-- Project 8: SakuraNeN.ai Discord Assistant -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">SakuraNeN.ai Discord Assistant</span>
                                <a href="https://github.com/EsshUwU/SakuraNeN.ai" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">An interactive custom Discord utility leveraging OpenAI GPT-3/4 models to conduct natural, character-based conversational interfaces. Designed to retain context and resolve advanced chat directives.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Python</span>
                                <span class="tech-badge">OpenAI API</span>
                                <span class="tech-badge">GPT-3/4</span>
                            </div>
                        </div>

                        <!-- Project 9: AI Face Detection & Classification -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">AI Face Detection & Classification</span>
                                <a href="https://github.com/EsshUwU/codsoft/tree/master/face_detection" target="_blank" class="project-github-link">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>Codebase</span>
                                </a>
                            </div>
                            <p class="project-desc">A deep learning face classification web tool built with YOLOv8. Fine-tuned on customized datasets via Google Colab Tesla T4 GPU, it detects human faces in images/videos and maps gender attributes with premium statistical accuracy in a sleek Gradio dashboard.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">YOLOv8</span>
                                <span class="tech-badge">PyTorch</span>
                                <span class="tech-badge">Gradio UIs</span>
                                <span class="tech-badge">Colab T4</span>
                            </div>
                        </div>

                        <!-- Project 10: Custom Generative Voice & Diffusion Models -->
                        <div class="project-modal-card">
                            <div class="project-header-row">
                                <span class="project-modal-title">Custom Generative Voice & Diffusion Models</span>
                                <span class="tech-badge" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1)">Generative</span>
                            </div>
                            <p class="project-desc">Fitted custom Low-Rank Adaptations (LoRA) for AI pipelines, including custom Stable Diffusion checkpoints and voice clones utilizing Retrieval-based Voice Conversion (RVC) technologies.</p>
                            <div class="project-tech-row">
                                <span class="tech-badge">Stable Diffusion</span>
                                <span class="tech-badge">LoRA Fine-tuning</span>
                                <span class="tech-badge">RVC AI</span>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            trigger: certificationsContainer,
            color: 'violet', // Translates to var(--accent-amber) glow circle
            title: 'My Credentials',
            content: `
                <div class="modal-section-title">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
                    <span>Certifications & Milestones</span>
                </div>
                <p>I love standardizing my learning journeys by undergoing recognized industry and academic tests. <strong>Click on any certificate card to open high-resolution previews:</strong></p>
                
                <div class="modal-scroll-area">
                    <div class="certs-grid">
                        <!-- Certificate 1 -->
                        <div class="cert-card" data-img="nptel.jpg" data-title="Machine Learning Certification - IIT Kharagpur (NPTEL)">
                            <div class="cert-img-wrapper">
                                <img src="nptel.jpg" alt="IIT KGP NPTEL Certificate" loading="lazy">
                            </div>
                            <span class="cert-card-title">Introduction to Machine Learning (NPTEL, IIT KGP)</span>
                        </div>

                        <!-- Certificate 2 -->
                        <div class="cert-card" data-img="codsoft.jpg" data-title="AI Internship Completion - CodSoft">
                            <div class="cert-img-wrapper">
                                <img src="codsoft.jpg" alt="CodSoft Internship Certificate" loading="lazy">
                            </div>
                            <span class="cert-card-title">Artificial Intelligence Internship (CodSoft)</span>
                        </div>

                        <!-- Certificate 3 -->
                        <div class="cert-card" data-img="matlab.jpg" data-title="MATLAB Onramp - MathWorks">
                            <div class="cert-img-wrapper">
                                <img src="matlab.jpg" alt="MATLAB Onramp Certificate" loading="lazy">
                            </div>
                            <span class="cert-card-title">MATLAB Onramp Course Completion (MathWorks)</span>
                        </div>
                    </div>
                </div>
            `
        },
        {
            trigger: contactContainer,
            color: 'pink', // Translates to var(--accent-pink) glow circle
            title: "Let's Get in Touch!",
            content: `
                <div class="modal-scroll-area">
                    <div class="modal-section-title">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                        <span>Say Hello</span>
                    </div>
                    <p>I enjoy connecting with developers, tech enthusiasts, and recruiters worldwide! Whether you have an exciting internship/job opening, want to discuss Python & ML concepts, share anime recommendations, or just talk tech, feel free to reach out on any of these platforms:</p>
                    
                    <div class="contact-modal-grid">
                        <!-- LinkedIn -->
                        <a href="https://www.linkedin.com/in/esshwar-jay-b124b4260/" target="_blank" class="contact-card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                            <span class="contact-card-title">LinkedIn</span>
                        </a>

                        <!-- GitHub -->
                        <a href="https://github.com/EsshUwU" target="_blank" class="contact-card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                            <span class="contact-card-title">GitHub</span>
                        </a>

                        <!-- Telegram -->
                        <a href="https://t.me/esshuwu" target="_blank" class="contact-card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            <span class="contact-card-title">Telegram</span>
                        </a>
                    </div>
                </div>
            `
        }
    ];

    // ---------------------------------------------------------
    // CIRCULAR GLOW SPHERES OVERLAY ENGINE
    // ---------------------------------------------------------
    const backgroundCircles = popupContainers.map(({ color }) => {
        const circle = document.createElement('div');
        circle.classList.add('background-circle', `bg-${color}`);
        document.body.appendChild(circle);
        return circle;
    });

    // ---------------------------------------------------------
    // MODAL STATE COORDINATOR
    // ---------------------------------------------------------
    popupContainers.forEach(({ trigger, content, title }, index) => {
        if (!trigger) return; // Guard clause in case element ID changes

        // Construct standard modal overlay
        const popupContainer = document.createElement('div');
        popupContainer.classList.add('popup');
        
        const closeButton = document.createElement('span');
        closeButton.classList.add('popup-close');
        closeButton.innerHTML = '&times;';
        
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content-block';
        
        // Add beautiful Title header
        const modalHeader = document.createElement('h2');
        modalHeader.style.fontFamily = "'Space Grotesk', sans-serif";
        modalHeader.style.fontSize = '30px';
        modalHeader.style.fontWeight = '800';
        modalHeader.style.marginBottom = '20px';
        modalHeader.style.letterSpacing = '-0.5px';
        modalHeader.textContent = title;
        
        popupContent.innerHTML = content;
        
        // Append title and content directly to outer non-scrollable modal container
        popupContainer.appendChild(closeButton);
        popupContainer.appendChild(modalHeader);
        popupContainer.appendChild(popupContent);

        const circle = backgroundCircles[index];

        // Trigger Click Listener (Open Modal)
        trigger.addEventListener('click', () => {
            // If another popup is currently active or closing in the DOM, block opening this one!
            if (document.querySelector('.popup')) return;

            // Append and force render
            document.body.appendChild(popupContainer);
            
            // Activate background glowing circle
            circle.classList.add('expand');
            
            // Fading animation sequence
            popupContainer.classList.add('show');
            document.body.style.overflow = 'hidden'; // Lock background scrolling

            // Apply liquid glass styling to the popup card (similar style to others with 7px blur!)
            popupContainer.classList.add('liquid-glass-popup');
            applyLiquidGlassToElement(popupContainer, 'liquid-glass-popup-filter', 0.8, 7.0);

            // Setup internal events (like Lightbox click bindings inside Certifications modal)
            const certCards = popupContainer.querySelectorAll('.cert-card');
            certCards.forEach(certCard => {
                certCard.addEventListener('click', () => {
                    const imgSrc = certCard.getAttribute('data-img');
                    const imgTitle = certCard.getAttribute('data-title');
                    openLightbox(imgSrc, imgTitle);
                });
            });
        });

        // Close Click Listener
        const performClose = () => {
            popupContainer.classList.remove('show');
            circle.classList.remove('expand');
            document.body.style.overflow = ''; // Unlock background scrolling
            
            // Remove the temporary popup filter
            const popupFilter = document.getElementById('liquid-glass-popup-filter');
            if (popupFilter) {
                popupFilter.remove();
            }
            
            setTimeout(() => {
                popupContainer.remove();
            }, 400);
        };

        closeButton.addEventListener('click', performClose);

        // Click outside modal card to close
        window.addEventListener('mousedown', (event) => {
            const isInsideLightbox = event.target.closest('.lightbox-modal') || event.target.closest('.lightbox-content');
            if (popupContainer.parentNode && !popupContainer.contains(event.target) && !isInsideLightbox) {
                performClose();
            }
        });
    });

    // ---------------------------------------------------------
    // DYNAMIC LIQUID GLASS REFRACTION ENGINE (MODULAR & SHARP)
    // ---------------------------------------------------------
    const liquidGlassContainer = document.getElementById('liquid-glass-svg-container');

    // Modular dynamic glass compiler
    function applyLiquidGlassToElement(element, filterId, refractionStrength = 0.8, blurStrength = 1.2) {
        if (!liquidGlassContainer || !element) return;
        
        const rect = element.getBoundingClientRect();
        const width = element.offsetWidth || Math.ceil(rect.width);
        const height = element.offsetHeight || Math.ceil(rect.height);
        if (width === 0 || height === 0) return;
        
        // Dynamically extract border radius from computed styles to handle both cards and popups seamlessly
        const computedStyle = window.getComputedStyle(element);
        const R = parseFloat(computedStyle.borderRadius) || 20;
        const B = 24;   // Bezel width (pixels)
        
        // Downscale factor for rendering speed and smooth upscaling interpolation
        const scaleDown = 0.5;
        const canvasW = Math.ceil(width * scaleDown);
        const canvasH = Math.ceil(height * scaleDown);
        const sR = R * scaleDown;
        const sB = B * scaleDown;
        
        // Create hidden offscreen displacement canvas
        const dispCanvas = document.createElement('canvas');
        dispCanvas.width = canvasW;
        dispCanvas.height = canvasH;
        const dispCtx = dispCanvas.getContext('2d');
        
        const dispImgData = dispCtx.createImageData(canvasW, canvasH);
        const dData = dispImgData.data;
        
        // Center points
        const cx = canvasW / 2;
        const cy = canvasH / 2;
        
        // Half-dimensions of the inner rectangle (excluding border radius)
        const innerW = (canvasW / 2) - sR;
        const innerH = (canvasH / 2) - sR;
        
        for (let y = 0; y < canvasH; y++) {
            for (let x = 0; x < canvasW; x++) {
                const pixelIdx = (y * canvasW + x) * 4;
                
                // Initialize default neutral displacement
                dData[pixelIdx]     = 128; // Red: X = 0 displacement
                dData[pixelIdx + 1] = 128; // Green: Y = 0 displacement
                dData[pixelIdx + 2] = 128; // Blue: unused
                dData[pixelIdx + 3] = 255; // Alpha: solid
                
                // Calculate Signed Distance Field (SDF) of the rounded rectangle
                const posX = x - cx;
                const posY = y - cy;
                
                const dx = Math.abs(posX) - innerW;
                const dy = Math.abs(posY) - innerH;
                
                const outsideX = Math.max(dx, 0);
                const outsideY = Math.max(dy, 0);
                const distOutside = Math.sqrt(outsideX * outsideX + outsideY * outsideY);
                
                const insideX = Math.min(dx, 0);
                const insideY = Math.min(dy, 0);
                const distInside = Math.max(insideX, insideY);
                
                // Signed distance: positive outside, negative inside
                const signedDist = distOutside + distInside - sR;
                
                // If pixel is outside the element bounds, skip
                if (signedDist > 0) continue;
                
                // Distance from card border (always positive)
                const d = -signedDist;
                
                // Bezel Refraction calculation
                if (d < sB) {
                    const t = d / sB; // 0 at edge, 1 at flat center
                    
                    // Calculate Edge Normals (nx, ny) pointing outwards
                    let nx = 0;
                    let ny = 0;
                    if (dx > 0 && dy > 0) {
                        const len = Math.sqrt(dx * dx + dy * dy);
                        nx = (dx / len) * Math.sign(posX);
                        ny = (dy / len) * Math.sign(posY);
                    } else {
                        if (dx > dy) {
                            nx = Math.sign(posX);
                            ny = 0;
                        } else {
                            nx = 0;
                            ny = Math.sign(posY);
                        }
                    }
                    
                    // Seamless lens profile: 0 displacement at the border (t=0) and 0 at the flat center (t=1).
                    const refractionMagnitude = Math.sin(t * Math.PI);
                    
                    // Refracted ray points inward (opposite of outward normal)
                    const vx = -nx * refractionMagnitude * refractionStrength;
                    const vy = -ny * refractionMagnitude * refractionStrength;
                    
                    // Map displacement to 0-255 range:
                    dData[pixelIdx]     = Math.max(0, Math.min(255, Math.round(128 + vx * 127)));
                    dData[pixelIdx + 1] = Math.max(0, Math.min(255, Math.round(128 + vy * 127)));
                }
            }
        }
        
        dispCtx.putImageData(dispImgData, 0, 0);
        const displacementDataUrl = dispCanvas.toDataURL();
        
        // Remove existing filter node if present to recreate dynamically
        const existingFilter = document.getElementById(filterId);
        if (existingFilter) {
            existingFilter.remove();
        }
        
        // Build the SVG Filter node (no specular rim overlays for pure minimalist glass refraction!)
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('color-interpolation-filters', 'sRGB');
        filter.setAttribute('x', '-10%');
        filter.setAttribute('y', '-10%');
        filter.setAttribute('width', '120%');
        filter.setAttribute('height', '120%');
        
        const maxDisplacementScale = Math.round(B * 0.8);
        
        filter.innerHTML = `
            <feImage href="${displacementDataUrl}" x="0" y="0" width="${width}" height="${height}" result="displacement_map" />
            <feDisplacementMap in="SourceGraphic" in2="displacement_map" scale="${maxDisplacementScale}" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feColorMatrix in="displaced" type="saturate" values="1.2" />
        `;
        
        liquidGlassContainer.appendChild(filter);
        
        // Apply the custom backdrop filter combining SVG refraction with requested CSS blur
        element.style.backdropFilter = `url(#${filterId}) blur(${blurStrength}px)`;
        element.style.webkitBackdropFilter = `url(#${filterId}) blur(${blurStrength}px)`;
    }

    const generateLiquidGlassFilters = () => {
        if (!liquidGlassContainer) return;
        
        // Clear all dynamic filter elements
        liquidGlassContainer.innerHTML = '';
        
        // Target all glass cards and compile dynamic glass refraction with 0.8 strength & 1.2px blur
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card, idx) => {
            card.classList.add('liquid-glass-active');
            applyLiquidGlassToElement(card, `liquid-glass-filter-${idx}`, 0.8, 1.2);
        });
        
        // Target active popup modal card (if open) and compile dynamic glass refraction with 7.0px blur
        const activePopup = document.querySelector('.popup');
        if (activePopup) {
            activePopup.classList.add('liquid-glass-popup');
            applyLiquidGlassToElement(activePopup, 'liquid-glass-popup-filter', 0.8, 7.0);
        }
    };

    // Run dynamic generation
    generateLiquidGlassFilters();

    // Resize listener to rebuild filters on window resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            generateLiquidGlassFilters();
        }, 200);
    });
});