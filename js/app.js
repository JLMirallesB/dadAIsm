// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const conversationContainer = document.getElementById('conversation-container');
    const messageTemplate = document.getElementById('message-template');
    const mainFooter = document.getElementById('main-footer');

    let currentIndex = -1; // -1 = header view, totalMessages = footer view
    let totalMessages = 0;
    let messages = [];

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

    loadConversation();
});
