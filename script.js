document.addEventListener('DOMContentLoaded', (event) => {
    const globeContainer = document.getElementById('globeViz');

    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");

        const myGlobe = Globe(); // Creamos la instancia

        myGlobe(globeContainer) // Asociamos al contenedor
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');

        console.log("Instancia de Globe.gl creada y configurada.");

        // --- Sección para Cargar y Mostrar Datos ---
        fetch('data/cardano-actors.json') // Carga nuestro archivo JSON (asegúrate que la ruta es correcta)
            .then(res => {
                if (!res.ok) { // Manejo básico de errores de carga
                    throw new Error(`Error al cargar el archivo: ${res.statusText} (${res.status})`);
                }
                return res.json(); // Convierte la respuesta a JSON
            })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);

                // Ahora le decimos al globo cómo usar estos datos
                myGlobe
                    .pointsData(actorsData) // Pasamos la lista de actores
                    .pointLat('lat')        // Le decimos qué propiedad tiene la latitud
                    .pointLng('lng')        // Le decimos qué propiedad tiene la longitud
                    .pointRadius(0.2)       // Tamaño de los puntos (puedes ajustar)
                    .pointColor(() => '#4CAF50') // Color fijo verde para los puntos (luego lo mejoraremos)
                    .pointLabel(d => `       // Define qué mostrar al pasar el mouse (hover)
                        <b>${d.name}</b> (${d.type})<br>
                        ${d.city}, ${d.country}
                    `);

                console.log("Puntos añadidos al globo.");
            })
            .catch(error => {
                // Muestra el error en la consola del navegador (F12)
                console.error('Error al cargar o procesar los datos de actores:', error);
                // Opcional: Mostrar un mensaje de error en la propia página
                // globeContainer.innerHTML = `<p style="color: red; padding: 1em;">Error al cargar los datos del ecosistema. Revisa la consola (F12) o el archivo de datos.</p>`;
            });
        // --- Fin de la sección de Datos ---

    } else {
        console.error("Error: No se encontró el elemento con id 'globeViz'.");
    }
    // --- Lógica para el Modal del Formulario ---

// Obtener referencias a los elementos
const settingsIcon = document.getElementById('settings-icon');
const formModal = document.getElementById('form-modal');
const closeButton = document.querySelector('.close-button'); // Usamos querySelector para la clase

// Función para abrir el modal
function openModal() {
    if (formModal) {
        formModal.classList.add('modal-visible');
    }
}

// Función para cerrar el modal
function closeModal() {
    if (formModal) {
        formModal.classList.remove('modal-visible');
    }
}

// Añadir evento al icono para abrir el modal
if (settingsIcon) {
    settingsIcon.addEventListener('click', openModal);
}

// Añadir evento al botón de cierre para cerrar el modal
if (closeButton) {
    closeButton.addEventListener('click', closeModal);
}

// (Opcional) Cerrar el modal si se hace clic fuera del contenido
if (formModal) {
    formModal.addEventListener('click', function(event) {
        // Si el clic fue directamente sobre el fondo del modal (y no en su contenido)
        if (event.target === formModal) {
            closeModal();
        }
    });
}
// --- Lógica para Capturar Datos del Formulario ---

const actorForm = document.getElementById('actor-form');

// Asegúrate de que esta función esté definida o sea accesible aquí
// Si definiste closeModal() antes, está bien.
// function closeModal() { ... }

if (actorForm) {
    actorForm.addEventListener('submit', function(event) {
        // 1. Prevenir el comportamiento por defecto del formulario (que es recargar la página)
        event.preventDefault();
        console.log("Formulario enviado, previniendo recarga...");

        // 2. Capturar los valores de cada campo usando sus IDs
        const actorName = document.getElementById('form-name').value;
        const actorType = document.getElementById('form-type').value;
        const actorCity = document.getElementById('form-city').value;
        const actorCountry = document.getElementById('form-country').value;
        const actorLat = document.getElementById('form-lat').value;
        const actorLng = document.getElementById('form-lng').value;
        const actorDescription = document.getElementById('form-description').value;

        // 3. Crear un objeto JavaScript con todos los datos recogidos
        const formData = {
            name: actorName,
            type: actorType,
            city: actorCity,
            country: actorCountry,
            lat: actorLat, // Lo mantenemos como texto por ahora
            lng: actorLng, // Lo mantenemos como texto por ahora
            description: actorDescription
            // Añadir aquí otros campos si los hubiera (url, twitter, etc.)
        };

        // 4. Mostrar el objeto con los datos en la consola (¡para verificar!)
        console.log("Datos de la propuesta capturados:", formData);

        // 5. (Opcional, pero buena UX) Limpiar los campos del formulario
        actorForm.reset();
        console.log("Formulario limpiado.");

        // 6. (Opcional, pero buena UX) Cerrar el modal
        // Asegúrate que la función closeModal esté definida y accesible en este scope
        if (typeof closeModal === 'function') {
             closeModal();
             console.log("Modal cerrado.");
        } else {
             console.warn("La función closeModal no está definida o accesible aquí.");
             // Podríamos ocultarlo directamente si es necesario:
             // const formModal = document.getElementById('form-modal');
             // if (formModal) formModal.classList.remove('modal-visible');
        }


        // ** Importante: Este es un placeholder **
        // Más adelante, aquí irá el código para ENVIAR 'formData'
        // a nuestro intermediario (GitHub Action/Serverless) para crear el Issue.
        // Mostramos una alerta temporal para el usuario:
        alert("¡Propuesta recibida para revisión! (Esto es una simulación por ahora)");

    });
} else {
    console.error("Error: No se encontró el formulario con id 'actor-form'.");
}

// --- Fin Lógica Captura Formulario ---
// --- Fin Lógica Modal ---
});

console.log("script.js cargado."); // Mensaje para confirmar que el script se enlaza