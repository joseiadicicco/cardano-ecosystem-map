document.addEventListener('DOMContentLoaded', (event) => {
    // --- Inicialización del Globo y Carga de Puntos ---
    const globeContainer = document.getElementById('globeViz');

    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");

        const myGlobe = Globe(); // Creamos la instancia

        myGlobe(globeContainer) // Asociamos al contenedor
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');

        console.log("Instancia de Globe.gl creada y configurada.");

        // Cargar y mostrar datos de actores existentes
        fetch('data/cardano-actors.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error al cargar el archivo: ${res.statusText} (${res.status})`);
                }
                return res.json();
            })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat')
                    .pointLng('lng')
                    .pointRadius(0.2)
                    .pointColor(() => '#4CAF50')
                    .pointLabel(d => `
                        <b>${d.name}</b> (${d.type})<br>
                        ${d.city}, ${d.country}
                    `);
                console.log("Puntos añadidos al globo.");
            })
            .catch(error => {
                console.error('Error al cargar o procesar los datos de actores:', error);
            });

    } else {
        console.error("Error: No se encontró el elemento con id 'globeViz'.");
    } // Fin del if (globeContainer)

    // --- Lógica para el Modal del Formulario (Abrir/Cerrar) ---
    const settingsIcon = document.getElementById('settings-icon');
    const formModal = document.getElementById('form-modal');
    const closeButton = formModal ? formModal.querySelector('.close-button') : null; // Más seguro buscar dentro del modal

    function openModal() {
        if (formModal) {
            formModal.classList.add('modal-visible');
        }
    }

    // Esta función closeModal necesita estar definida ANTES de ser usada en el listener del submit
    function closeModal() {
        if (formModal) {
            formModal.classList.remove('modal-visible');
        }
    }

    if (settingsIcon) {
        settingsIcon.addEventListener('click', openModal);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    if (formModal) {
        formModal.addEventListener('click', function(event) {
            if (event.target === formModal) {
                closeModal();
            }
        });
    }
    // --- Fin Lógica Modal ---

    // --- Lógica para Capturar y ENVIAR Datos del Formulario ---
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;

    if (actorForm && submitButton) {
        // Marcamos la función del listener como 'async' para poder usar 'await' dentro
        actorForm.addEventListener('submit', async function(event) {
            // 1. Prevenir el comportamiento por defecto del formulario
            event.preventDefault();
            console.log("Formulario enviado, previniendo recarga...");

            // Deshabilitar botón para evitar envíos múltiples y dar feedback visual
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...'; // Cambiar texto (opcional)

            try { // Usamos try...catch para manejar errores en el proceso async
                // 2. Capturar los valores de cada campo
                const actorName = document.getElementById('form-name').value;
                const actorType = document.getElementById('form-type').value;
                const actorCity = document.getElementById('form-city').value;
                const actorCountry = document.getElementById('form-country').value;
                const actorLat = document.getElementById('form-lat').value;
                const actorLng = document.getElementById('form-lng').value;
                const actorDescription = document.getElementById('form-description').value;

                // 3. Crear el objeto con los datos (payload)
                const formData = {
                    name: actorName,
                    type: actorType,
                    city: actorCity,
                    country: actorCountry,
                    lat: actorLat,
                    lng: actorLng,
                    description: actorDescription
                };
                console.log("Datos a enviar:", formData);

                // 4. Definir la URL de nuestra API serverless (ruta relativa)
                const apiUrl = '/api/submit-proposal';

                // 5. Enviar los datos usando fetch a nuestra función serverless
                console.log(`Enviando datos a ${apiUrl}...`);
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                // 6. Procesar la respuesta que nos devuelve la función serverless
                const result = await response.json();

                if (response.ok) { // Si el status code fue exitoso (2xx)
                    console.log("Respuesta exitosa del servidor:", result);
                    alert(`Éxito: ${result.message || 'Propuesta enviada correctamente.'}`);
                    actorForm.reset(); // Limpiar formulario
                    // closeModal(); // Llamamos a la función definida antes para cerrar el modal
                } else {
                    console.error("Error en la respuesta del servidor:", result);
                    alert(`Error: ${result.message || 'No se pudo enviar la propuesta.'}`);
                }

            } catch (error) {
                // 7. Manejar errores si la llamada fetch falla (ej. problema de red)
                console.error("Error al enviar el formulario (fetch catch):", error);
                alert("Error de red al intentar enviar la propuesta. Por favor, intenta de nuevo.");
            } finally {
                // 8. Este bloque se ejecuta siempre (éxito o error)
                // Rehabilitar el botón de envío
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar Propuesta'; // Restaurar texto original
                // También cerramos el modal aquí para que se cierre incluso si hubo error
                // (o puedes decidir cerrarlo solo en caso de éxito, moviendo closeModal() dentro del if(response.ok))
                if (typeof closeModal === 'function') {
                     closeModal();
                }
            }
        });
    } else {
        // Mensajes de error si no se encuentran los elementos necesarios
        if (!actorForm) console.error("Error: No se encontró el formulario con id 'actor-form'.");
        if (!submitButton) console.error("Error: No se encontró el botón de envío dentro del formulario.");
    }
    // --- Fin Lógica Captura y Envío Formulario ---

}); // <<< Cierre del addEventListener para DOMContentLoaded

// Este console.log va FUERA del listener DOMContentLoaded, se ejecuta cuando el script se carga inicialmente
console.log("script.js cargado.");