document.addEventListener('DOMContentLoaded', (event) => {
    // --- Inicialización del Globo y Carga de Puntos ---
    const globeContainer = document.getElementById('globeViz');

    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");

        const myGlobe = Globe(); // Creamos la instancia

        myGlobe(globeContainer) // Asociamos al contenedor
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');
    
    // --- NUEVO: Habilitar Auto-Rotación Lenta ---
    myGlobe.controls().autoRotate = true;         // Activa la auto-rotación
    myGlobe.controls().autoRotateSpeed = 0.25; // Ajusta la velocidad (prueba valores más bajos como 0.1 o más altos como 0.5)
    console.log("Auto-rotación habilitada.");
    // --- FIN Auto-Rotación Lenta ---

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
                    `)
                    .onPointHover(point => {
                        // Detenemos/Reanudamos la auto-rotación basado en si 'point' es null o no
                        myGlobe.controls().autoRotate = (point === null);

                        // Opcional: Log para depurar
                        // if (point) { console.log("Hover sobre:", point.name); } else { console.log("Hover fuera"); }
                    });

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
    const closeButton = formModal ? formModal.querySelector('.close-button') : null;

    function openModal() {
        if (formModal) {
            formModal.classList.add('modal-visible');
        }
    }

    // Esta función closeModal necesita estar definida ANTES de ser usada/referenciada
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
            event.preventDefault();
            console.log("Formulario enviado, previniendo recarga...");

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...'; // Cambiado a inglés

            try {
                const actorName = document.getElementById('form-name').value;
                const actorType = document.getElementById('form-type').value;
                const actorCity = document.getElementById('form-city').value;
                const actorCountry = document.getElementById('form-country').value;
                const actorLat = document.getElementById('form-lat').value;
                const actorLng = document.getElementById('form-lng').value;
                const actorDescription = document.getElementById('form-description').value;

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

                const apiUrl = '/api/submit-proposal';

                console.log(`Enviando datos a ${apiUrl}...`);
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (response.ok) {
                    console.log("Respuesta exitosa del servidor:", result);
                    // ----- ALERTA DE ÉXITO EN INGLÉS -----
                    alert(`Success: ${result.message || 'Proposal submitted successfully.'}`);
                    // ------------------------------------
                    actorForm.reset();
                    // closeModal(); // Decide si cerrar solo en éxito o en finally
                } else {
                    console.error("Error en la respuesta del servidor:", result);
                    // ----- ALERTA DE ERROR EN INGLÉS -----
                    alert(`Error: ${result.message || 'Could not submit proposal.'}`);
                    // -----------------------------------
                }

            } catch (error) {
                console.error("Error al enviar el formulario (fetch catch):", error);
                // ----- ALERTA DE ERROR DE RED EN INGLÉS -----
                alert("Network error trying to submit proposal. Please try again.");
                // -------------------------------------------
            } finally {
                // Rehabilitar botón y restaurar texto en inglés
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Proposal'; // Aseguramos que vuelva a inglés
                // Cerrar modal (se cierra siempre, éxito o error)
                if (typeof closeModal === 'function') {
                     closeModal();
                }
            }
        });
    } else {
        if (!actorForm) console.error("Error: No se encontró el formulario con id 'actor-form'.");
        if (!submitButton) console.error("Error: No se encontró el botón de envío dentro del formulario.");
    }
    // --- Fin Lógica Captura y Envío Formulario ---

}); // <<< Cierre del addEventListener para DOMContentLoaded

// Este console.log va FUERA del listener DOMContentLoaded
console.log("script.js cargado.");