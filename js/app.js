// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const conversationContainer = document.getElementById('conversation-container');
    const messageTemplate = document.getElementById('message-template');

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

            dialogo.forEach(entry => {
                const personaje = personajes.find(p => p.id === entry.personajeId);
                if (!personaje) return;

                // Clonar la plantilla
                const messageNode = messageTemplate.content.cloneNode(true);
                const messageElement = messageNode.querySelector('.message');

                // Rellenar los datos
                messageElement.dataset.character = personaje.id;
                messageElement.querySelector('.avatar').textContent = personaje.avatar;
                messageElement.querySelector('.author').textContent = personaje.nombre;
                messageElement.querySelector('.text').textContent = entry.texto;

                // Añadir información si el mensaje va dirigido a alguien
                if (entry.dirigidoA) {
                    const dirigidoAPersonaje = personajes.find(p => p.id === entry.dirigidoA);
                    if (dirigidoAPersonaje) {
                        messageElement.querySelector('.meta-info').textContent = `(En respuesta a @${dirigidoAPersonaje.nombre})`;
                    }
                }
                
                // Añadir el mensaje al contenedor
                conversationContainer.appendChild(messageElement);
            });

        } catch (error) {
            console.error("No se pudo cargar la conversación:", error);
            conversationContainer.innerHTML = `<p style="text-align:center; color: var(--accent-color);">Error al cargar el diálogo. Por favor, revisa la consola.</p>`;
        }
    }

    loadConversation();
});
