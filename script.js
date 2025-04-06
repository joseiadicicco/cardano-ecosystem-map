// === script.js === FINAL ===
document.addEventListener('DOMContentLoaded', (event) => {
    // --- Inicialización del Globo y Carga de Puntos ---
    const globeContainer = document.getElementById('globeViz');
    let myGlobe; // Definimos myGlobe aquí para que sea accesible en diferentes partes

    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");

        myGlobe = Globe(); // Asignamos la instancia a myGlobe

        myGlobe(globeContainer) // Asociamos al contenedor
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');

        // --- Habilitar Auto-Rotación Lenta ---
        // Lo hacemos después de inicializar el globo y sus controles básicos
        try { // Añadimos try-catch por si controls() no está listo inmediatamente
            myGlobe.controls().autoRotate = true;
            myGlobe.controls().autoRotateSpeed = 0.25; // Ajusta esta velocidad a tu gusto
            console.log("Auto-rotación habilitada.");
        } catch (e) {
            console.error("Error al habilitar auto-rotación:", e);
        }
        // --- FIN Auto-Rotación Lenta ---

        console.log("Instancia de Globe.gl creada y configurada.");

        // --- Cargar y Mostrar Datos de Actores Existentes ---
        fetch('data/cardano-actors.json')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error al cargar el archivo: ${res.statusText} (${res.status})`);
                }
                return res.json();
            })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);

                // Configuración de los puntos en el globo
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat')
                    .pointLng('lng')
                    .pointRadius(0.2)
                    .pointColor(() => '#4CAF50') // Verde Cardano (podríamos hacerlo dinámico por 'type' luego)
                    .pointLabel(d => `
                        <b>${d.name}</b> (${d.type})<br>
                        ${d.city}, ${d.country}
                    `) // Sin punto y coma aquí
                    .onPointHover(point => {
                        // Detener/Reanudar la auto-rotación basado en si 'point' es null o no
                        if (myGlobe && myGlobe.controls) { // Comprobación extra
                            myGlobe.controls().autoRotate = (point === null);
                        }
                    }) // Fin .onPointHover

                    // ----- Lógica para Click en Punto (Mostrar Panel Detalles) -----
                    .onPointClick(point => {
                        // 'point' contiene los datos del actor en el que se hizo clic
                        // Usa las variables del panel definidas más abajo (detailsPanel, panelName, etc.)
                        if (point && detailsPanel) { // Verificamos que tenemos datos y el panel existe
                            console.log("Punto clicado:", point);

                            // Rellenamos el panel con los datos del 'point'
                            if(panelName) panelName.textContent = point.name || 'N/A';
                            if(panelType) panelType.textContent = point.type || 'N/A';
                            if(panelCity) panelCity.textContent = point.city || '';
                            if(panelCountry) panelCountry.textContent = point.country || '';
                            if(panelDescription) panelDescription.textContent = point.description || 'No description available.';

                            // Lógica futura para enlaces si añadimos 'url' a los datos
                            // if (panelLink) {
                            //   if (point.url) { ... } else { ... }
                            // }

                            // Hacemos visible el panel añadiendo la clase CSS
                            detailsPanel.classList.add('panel-visible');
                        } else {
                           // Opcional: si se hace clic fuera de un punto, podríamos cerrar el panel
                           // if (typeof closeDetailsPanel === 'function') closeDetailsPanel();
                        }
                    });
                    // ----- FIN Lógica para Click en Punto -----

                console.log("Puntos añadidos al globo.");
            })
            .catch(error => {
                console.error('Error al cargar o procesar los datos de actores:', error);
            });
        // --- Fin Carga y Muestra Datos ---

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

    function closeModal() { // Usada por el formulario y el botón X del modal
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

    if (formModal) { // Cerrar modal si se hace clic fuera de su contenido
        formModal.addEventListener('click', function(event) {
            if (event.target === formModal) {
                closeModal();
            }
        });
    }
    // --- Fin Lógica Modal ---


    // --- Lógica para el Panel de Detalles (Setup y Cierre) ---
    const detailsPanel = document.getElementById('details-panel');
    const closePanelButton = detailsPanel ? detailsPanel.querySelector('.close-panel-button') : null;
    // Referencias a los elementos internos del panel (para rellenar en onPointClick)
    const panelName = document.getElementById('panel-name');
    const panelType = document.getElementById('panel-type');
    const panelCity = document.getElementById('panel-city');
    const panelCountry = document.getElementById('panel-country');
    const panelDescription = document.getElementById('panel-description');
    // const panelLink = document.getElementById('panel-link');

    // Función específica para CERRAR el panel de detalles
    function closeDetailsPanel() {
      if (detailsPanel) {
        detailsPanel.classList.remove('panel-visible');
      }
    }

    // Listener para el botón de cierre ('X') del panel de detalles
    if (closePanelButton) {
      closePanelButton.addEventListener('click', closeDetailsPanel);
    }
    // --- Fin Lógica Panel Detalles ---


    // --- Lógica para Capturar y ENVIAR Datos del Formulario ---
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;

    if (actorForm && submitButton) {
        actorForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log("Formulario enviado, previniendo recarga...");

            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Captura de datos formData (sin cambios)
                const actorName = document.getElementById('form-name').value;
                const actorType = document.getElementById('form-type').value;
                const actorCity = document.getElementById('form-city').value;
                const actorCountry = document.getElementById('form-country').value;
                const actorLat = document.getElementById('form-lat').value;
                const actorLng = document.getElementById('form-lng').value;
                const actorDescription = document.getElementById('form-description').value;
                const formData = { name: actorName, type: actorType, city: actorCity, country: actorCountry, lat: actorLat, lng: actorLng, description: actorDescription };
                console.log("Datos a enviar:", formData);

                const apiUrl = '/api/submit-proposal';
                console.log(`Enviando datos a ${apiUrl}...`);

                // Llamada fetch a la API (sin cambios)
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();

                // Manejo de respuesta (sin cambios)
                if (response.ok) {
                    console.log("Respuesta exitosa del servidor:", result);
                    alert(`Success: ${result.message || 'Proposal submitted successfully.'}`);
                    actorForm.reset();
                } else {
                    console.error("Error en la respuesta del servidor:", result);
                    alert(`Error: ${result.message || 'Could not submit proposal.'}`);
                }
            } catch (error) {
                console.error("Error al enviar el formulario (fetch catch):", error);
                alert("Network error trying to submit proposal. Please try again.");
            } finally {
                // Rehabilitar botón y cerrar modal del FORMULARIO
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Proposal';
                if (typeof closeModal === 'function') { // Llama a closeModal (para el form modal)
                     closeModal();
                }
            }
        });
    } else {
        if (!actorForm) console.error("Error: No se encontró el formulario con id 'actor-form'.");
        if (!submitButton) console.error("Error: No se encontró el botón de envío dentro del formulario.");
    }
    // --- Fin Lógica Captura y Envío Formulario ---

}); // <<< FIN del addEventListener para DOMContentLoaded

// Este console.log va FUERA del listener DOMContentLoaded
console.log("script.js cargado.");