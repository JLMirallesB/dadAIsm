// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const conversationContainer = document.getElementById('conversation-container');
    const messageTemplate = document.getElementById('message-template');
    const mainFooter = document.getElementById('main-footer');
    const introOverlay = document.getElementById('intro-overlay');
    const terminalText = document.getElementById('terminal-text');
    const terminalCursor = document.getElementById('terminal-cursor');
    const introSkip = document.getElementById('intro-skip');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxAuthor = document.getElementById('lightbox-author');
    const lightboxClose = document.getElementById('lightbox-close');

    let currentIndex = -1; // -1 = header view, totalMessages = footer view
    let totalMessages = 0;
    let messages = [];

    // Texto dadaísta para la intro
    const introMessage = `> INICIANDO TRANSMISIÓN DESDE ZÜRICH, 1916...
> ERROR: EL TIEMPO ES UN PLÁTANO MELANCÓLICO
> CARGANDO FANTASMAS DIGITALES...

ATENCIÓN CIUDADANO DEL CAOS:

Lo que presenciarás no es real.
Tampoco es falso.
Es DADA.

Tres espíritus del Cabaret Voltaire
han sido invocados mediante algoritmos
que mastican palabras como chicle eléctrico.

Hugo Ball. Tristan Tzara. Richard Huelsenbeck.
Sus cerebros de silicio fueron alimentados
con manifiestos, poemas y gritos antiarte.

¿Son ellos? ¿Somos nosotros? ¿Es la máquina
quien sueña que es dadaísta?

GAGA. DADA. DATA.

La conversación que sigue es un accidente
calculado entre inteligencias artificiales
que han aprendido a decir NADA
de la forma más ruidosa posible.

> SISTEMA LISTO PARA LA ABSURDIDAD
> PRESIONA PARA ENTRAR...`;

    // Función de typing effect
    function typeText(text, element, speed = 30) {
        return new Promise((resolve) => {
            let i = 0;
            element.textContent = '';

            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // Iniciar intro
    async function startIntro() {
        await typeText(introMessage, terminalText, 25);
        terminalCursor.style.display = 'none';
        introSkip.classList.remove('hidden');
    }

    // Saltar/cerrar intro
    function closeIntro() {
        introOverlay.classList.add('hidden');
        loadConversation();
    }

    // Permitir saltar intro con click/tecla durante el typing
    introOverlay.addEventListener('click', (e) => {
        if (e.target === introSkip || introSkip.contains(e.target)) {
            closeIntro();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!introOverlay.classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            closeIntro();
        }
    });

    // Funciones del lightbox
    function openLightbox(src, titulo, autor) {
        lightboxImg.src = src;
        lightboxTitle.textContent = titulo;
        lightboxAuthor.textContent = autor;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Event listeners del lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
        }
    });

    // Crear elemento de galería
    function createGalleryElement(entry, index) {
        const galleryMessage = document.createElement('article');
        galleryMessage.className = 'message';
        galleryMessage.dataset.index = index;
        galleryMessage.dataset.character = 'galeria';

        galleryMessage.innerHTML = `
            <div class="avatar" style="background: var(--accent-color); color: white;">🎨</div>
            <div class="message-content">
                <strong class="author">Galería DADA</strong>
                <p class="text">${entry.texto}</p>
                <div class="gallery"></div>
            </div>
        `;

        const galleryContainer = galleryMessage.querySelector('.gallery');

        entry.imagenes.forEach((imagen) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${imagen.src}" alt="${imagen.titulo}">
                <div class="gallery-caption">
                    <strong>${imagen.titulo}</strong>
                    <div class="gallery-author">${imagen.autor}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                openLightbox(imagen.src, imagen.titulo, imagen.autor);
            });
            galleryContainer.appendChild(item);
        });

        return galleryMessage;
    }

    // Función para cargar y mostrar la conversación
    async function loadConversation() {
        try {
            const response = await fetch('assets/data/conversacion.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const personajes = data.personajes;
            const dialogo = data.dialogo;
            totalMessages = dialogo.length;

            dialogo.forEach((entry, index) => {
                // Manejar entrada de galería
                if (entry.tipo === 'galeria') {
                    const galleryElement = createGalleryElement(entry, index);
                    conversationContainer.appendChild(galleryElement);
                    return;
                }

                const personaje = personajes.find(p => p.id === entry.personajeId);
                if (!personaje) return;

                // Clonar la plantilla
                const messageNode = messageTemplate.content.cloneNode(true);
                const messageElement = messageNode.querySelector('.message');

                // Rellenar los datos
                messageElement.dataset.character = personaje.id;
                messageElement.dataset.index = index;

                // Manejar avatar
                const avatarContainer = messageElement.querySelector('.avatar');
                const inicial = personaje.nombre.charAt(0).toUpperCase();

                // Crear imagen
                const img = document.createElement('img');
                img.src = personaje.avatar;
                img.alt = personaje.nombre;

                // Si la imagen falla, mostrar la inicial
                img.onerror = function() {
                    this.remove();
                    avatarContainer.textContent = inicial;
                };

                avatarContainer.appendChild(img);

                // Añadir información si el mensaje va dirigido a alguien (arriba)
                if (entry.dirigidoA) {
                    const dirigidoAPersonaje = personajes.find(p => p.id === entry.dirigidoA);
                    if (dirigidoAPersonaje) {
                        messageElement.querySelector('.meta-info').textContent = `→ ${dirigidoAPersonaje.nombre}`;
                    }
                }

                messageElement.querySelector('.author').textContent = personaje.nombre;
                messageElement.querySelector('.text').textContent = entry.texto;

                // Añadir el mensaje al contenedor
                conversationContainer.appendChild(messageElement);
            });

            // Guardar referencia a todos los mensajes
            messages = document.querySelectorAll('.message');

            // Ocultar footer inicialmente
            if (mainFooter) {
                mainFooter.classList.add('hidden');
            }

            // Inicializar la vista
            updateView();

            // Crear controles de navegación
            createNavControls();

            // Escuchar teclas de flechas
            document.addEventListener('keydown', handleKeyNavigation);

        } catch (error) {
            console.error("No se pudo cargar la conversación:", error);
            conversationContainer.innerHTML = `<p style="text-align:center; color: var(--accent-color);">Error al cargar el diálogo. Por favor, revisa la consola.</p>`;
        }
    }

    function updateView() {
        messages.forEach((msg, index) => {
            msg.classList.remove('active', 'past', 'future');

            if (currentIndex === -1) {
                // Vista del header: todos los mensajes son futuros
                msg.classList.add('future');
            } else if (currentIndex === totalMessages) {
                // Vista del footer: todos los mensajes son pasados
                msg.classList.add('past');
            } else if (index === currentIndex) {
                msg.classList.add('active');
            } else if (index < currentIndex) {
                msg.classList.add('past');
            } else {
                msg.classList.add('future');
            }
        });

        // Scroll según el estado
        if (currentIndex === -1) {
            // Scroll al header
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentIndex === totalMessages) {
            // Scroll al footer
            if (mainFooter) {
                mainFooter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else if (messages[currentIndex]) {
            messages[currentIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Mostrar/ocultar footer
        if (mainFooter) {
            if (currentIndex >= totalMessages - 1) {
                mainFooter.classList.remove('hidden');
            } else {
                mainFooter.classList.add('hidden');
            }
        }

        // Actualizar contador
        updateCounter();
    }

    function navigate(direction) {
        const newIndex = currentIndex + direction;
        // Permitir desde -1 (header) hasta totalMessages (footer)
        if (newIndex >= -1 && newIndex <= totalMessages) {
            currentIndex = newIndex;
            updateView();
        }
    }

    function handleKeyNavigation(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            navigate(1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            navigate(-1);
        }
    }

    function createNavControls() {
        const nav = document.createElement('nav');
        nav.className = 'nav-controls';
        nav.innerHTML = `
            <button class="nav-btn nav-prev" aria-label="Anterior">←</button>
            <span class="nav-counter">${currentIndex + 1} / ${totalMessages}</span>
            <button class="nav-btn nav-next" aria-label="Siguiente">→</button>
        `;

        document.body.appendChild(nav);

        nav.querySelector('.nav-prev').addEventListener('click', () => navigate(-1));
        nav.querySelector('.nav-next').addEventListener('click', () => navigate(1));
    }

    function updateCounter() {
        const counter = document.querySelector('.nav-counter');
        if (counter) {
            if (currentIndex === -1) {
                counter.textContent = `Inicio`;
            } else if (currentIndex === totalMessages) {
                counter.textContent = `Fin`;
            } else {
                counter.textContent = `${currentIndex + 1} / ${totalMessages}`;
            }
        }

        // Deshabilitar botones en los extremos
        const prevBtn = document.querySelector('.nav-prev');
        const nextBtn = document.querySelector('.nav-next');
        if (prevBtn) prevBtn.disabled = currentIndex === -1;
        if (nextBtn) nextBtn.disabled = currentIndex === totalMessages;
    }

    // Iniciar con la intro
    startIntro();
});
