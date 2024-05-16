const aboutMeContainer = document.getElementById('aboutMe');
const projectsContainer = document.getElementById('projects');
const certificationsContainer = document.getElementById('certifications');
const contactContainer = document.getElementById('contact');

const popupContainers = [
    { container: aboutMeContainer, content: `
        <p><strong>Hi there! 👋</strong></p>
        <p><strong>I'm Esshwar</strong></p>
        <p>You can call me Essh :)</p>
        <p>I'm a 19-year-old developer from India. Specialize in Python. I love to discover AI, machine learning tools and working with them to create an impactful products.</p>
        <p>&nbsp;</p>
        <p><strong>Skills</strong></p>
        <p>My current skills involve using programming languages such as Python, C, HTML, JavaScript (beginner), etc.</p>
        <p>I have experience working with datasets to create ML models for classification, chatbots, and image generation.</p>
    `, color: 'red' },
    { container: projectsContainer, content: `
        <p><strong>Time to talk work!</strong></p>
        <p>Below are some of the projects that I loved working on. Also, I'm extremely grateful to the entire Open Source community for all the amazing stuff that it provides us and makes it possible for everyone to create amazing things.</p>
        <p>&nbsp;</p>
        <p><strong>Discord Chatbot with GenerativeAI</strong></p>
        <p>This Discord bot utilizes GenerativeAI to create a chatbot experience within Discord channels. The bot responds to mentions and engages in conversation based on the configured GenerativeAI model.</p>
        <p>Project link: <a href="https://github.com/EsshUwU/GeminiDiscord" target="_blank">https://github.com/EsshUwU/GeminiDiscord</a></p>
        <p>&nbsp;</p>
        <p><strong>SakuraNeN.ai Discord Bot using OpenAI's GPT-3</strong></p>
        <p>SakuraNeN.ai is a Discord bot that utilizes OpenAI's GPT-3 model to converse with users on Discord. The bot is designed to respond to user messages and carry on conversations with them, providing helpful responses and engaging in natural language conversations.</p>
        <p>Project link: <a href="https://github.com/EsshUwU/SakuraNeN.ai" target="_blank">https://github.com/EsshUwU/SakuraNeN.ai</a></p>
        <p>&nbsp;</p>
        <p><strong>Face Detection AI</strong></p>
        <p>Implemented a Gradio interface for both image and video inference using a pre-trained YOLO model (YOLOv8) for face detection, allowing users to upload images or videos and adjust the confidence threshold for detection. It classifies the detected face as Male or Female with great accuracy, the training data has been aquired from Roboflow and Fine-tuned on Google Colab with Tesla T4 GPU.</p>
        <p>Project link: <a href="https://github.com/EsshUwU/codsoft/tree/master/face_detection" target="_blank">https://github.com/EsshUwU/codsoft/tree/master/face_detection</a></p>
        <p>&nbsp;</p>
        <p><strong>Machine Learning Models</strong></p>
        <p>Trained LoRA models for generative AI applications such as Stable Diffusion and RVC Voice etc.</p>
    `, color: 'blue' },
    { container: certificationsContainer, content: `
        <p><strong>Certifications That I went through!</strong></p>
        <p>&nbsp;</p>
        <p><strong>Introduction to Machine Learning NPTEL course by IIT KGP (removed face) </strong></p>
        <img src="nptel.jpg" alt="NPTEL Certificate" style="max-width: 100%; height: auto;">
        <p>&nbsp;</p>
        <p><strong>CodSoft Artificial Intelligence Internship</strong></p>
        <img src="codsoft.jpg" alt="CodSoft Certificate" style="max-width: 100%; height: auto;">
        <p>&nbsp;</p>
        <p><strong>MATLAB Onramp course completion Certificate</strong></p>
        <img src="matlab.jpg" alt="CodSoft Certificate" style="max-width: 100%; height: auto;">
    `, color: 'violet' },
    { container: contactContainer, content: `
        <p><strong>Let's get in touch!</strong></p>
        <p>I love meeting new people from around the world! Hit me up to talk about project ideas, Programming, Python, AI, Or just say "Hi" and we'll find something we enjoy talking about. You can find me through any of the platform listed below.</p>
        <p>&nbsp;</p>
        <p><a href="https://www.linkedin.com/in/esshwar-jay-b124b4260/" target="_blank">LinkedIn</a></p>
        <p><a href="https://github.com/EsshUwU" target="_blank">GitHub</a></p>
        <p><a href="https://t.me/esshuwu" target="_blank">Telegram</a></p>
    `, color: 'pink' }
];

const backgroundCircles = popupContainers.map(({ color }) => {
    const circle = document.createElement('div');
    circle.classList.add('background-circle', `bg-${color}`);
    document.body.appendChild(circle);
    return circle;
});

popupContainers.forEach(({ container, content, color }, index) => {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup');
    const closeButton = document.createElement('span');
    closeButton.classList.add('popup-close');
    closeButton.innerHTML = '&times;';
    const popupContent = document.createElement('div');
    popupContent.innerHTML = content;
    popupContainer.appendChild(closeButton);
    popupContainer.appendChild(popupContent);

    const circle = backgroundCircles[index];

    container.addEventListener('click', () => {
        popupContainer.classList.add('show');
        document.body.appendChild(popupContainer);

        popupContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
        popupContainer.style.opacity = '0';
        requestAnimationFrame(() => {
            popupContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            popupContainer.style.opacity = '1';
        });

        circle.classList.add('expand');
    });

    container.addEventListener('mouseover', () => {
        circle.style.transform = 'scale(1.3)';
    });

    container.addEventListener('mouseout', () => {
        circle.style.transform = 'scale(1)';
    });

    closeButton.addEventListener('click', () => {
        popupContainer.classList.remove('show');
        popupContainer.style.transform = 'translate(-50%, -50%) scale(1)';
        popupContainer.style.opacity = '1';
        requestAnimationFrame(() => {
            popupContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
            popupContainer.style.opacity = '0';
        });
        circle.classList.remove('expand');
        setTimeout(() => {
            popupContainer.remove();
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === popupContainer) {
            popupContainer.classList.remove('show');
            popupContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            popupContainer.style.opacity = '1';
            requestAnimationFrame(() => {
                popupContainer.style.transform = 'translate(-50%, -50%) scale(0.5)';
                popupContainer.style.opacity = '0';
            });
            circle.classList.remove('expand');setTimeout(() => {
                popupContainer.remove();
            }, 300);
        }
    });
});