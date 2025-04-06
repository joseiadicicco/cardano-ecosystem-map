// === script.js === FINAL con Panel de Configuración ===
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente cargado.");

    // --- 1. Definición de Variables Globales y de Estado ---
    let myGlobe; // Variable para la instancia del globo
    let isRotationManuallyPaused = false; // Estado para la rotación manual

    // --- 2. Definición de Funciones Auxiliares ---

    // Función para abrir el modal del formulario
    function openModal() {
        const formModal = document.getElementById('form-modal');
        if (formModal) {
            formModal.classList.add('modal-visible');
        } else {
            console.error("Intento de abrir modal, pero formModal no encontrado.");
        }
    }

    // Función para cerrar el modal del formulario
    function closeModal() {
        const formModal = document.getElementById('form-modal');
        if (formModal) {
            formModal.classList.remove('modal-visible');
        } else {
            console.error("Intento de cerrar modal, pero formModal no encontrado.");
        }
    }

    // Función para cerrar el panel de detalles
    function closeDetailsPanel() {
      const detailsPanel = document.getElementById('details-panel');
      if (detailsPanel) {
        detailsPanel.classList.remove('panel-visible');
      } else {
          console.error("Intento de cerrar panel detalles, pero detailsPanel no encontrado.");
      }
    }

    // --- NUEVO: Función para mostrar/ocultar el panel de configuración ---
    function toggleSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            // Usa la clase definida en style.css para mostrar/ocultar
            settingsPanel.classList.toggle('settings-popup-visible');
        } else {
            console.error("Intento de toggle panel config, pero settingsPanel no encontrado.");
        }
    }

    // Función para detener/reanudar la rotación del globo (actualiza estado manual)
    function toggleAutoRotation() {
        // Necesitamos acceso a 'myGlobe' y al botón 'toggleRotationBtn' (definidos abajo)
        if (myGlobe && myGlobe.controls && toggleRotationBtn) {
            const isCurrentlyRotating = myGlobe.controls().autoRotate;
            const newRotationState = !isCurrentlyRotating;
            myGlobe.controls().autoRotate = newRotationState; // Invierte el estado

            // Actualizar el estado de pausa manual
            isRotationManuallyPaused = !newRotationState; // Si el NUEVO estado es NO rotar, fue pausa manual

            console.log("Auto-rotación cambiada. Nuevo estado:", newRotationState, "Pausa Manual:", isRotationManuallyPaused);

            // Actualizar texto e icono del botón
            if (newRotationState) { // Si acabamos de ACTIVAR la rotación (el botón ahora debe decir STOP)
                toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation';
            } else { // Si acabamos de DESACTIVAR la rotación (el botón ahora debe decir START)
                toggleRotationBtn.innerHTML = '<i class="fas fa-play"></i> Start Rotation';
            }
        } else {
            console.error("No se puede cambiar la rotación: myGlobe, controls() o toggleRotationBtn no disponibles.");
        }
    }


    // --- 3. Obtención de Referencias a Elementos del DOM ---
    // (Se incluyen referencias a los elementos del nuevo panel)
    const globeContainer = document.getElementById('globeViz');
    const settingsIcon = document.getElementById('settings-icon');
    const formModal = document.getElementById('form-modal');
    const closeButton = formModal ? formModal.querySelector('.close-button') : null;
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;
    const detailsPanel = document.getElementById('details-panel');
    const closePanelButton = detailsPanel ? detailsPanel.querySelector('.close-panel-button') : null;
    const panelName = document.getElementById('panel-name');
    const panelType = document.getElementById('panel-type');
    const panelCity = document.getElementById('panel-city');
    const panelCountry = document.getElementById('panel-country');
    const panelDescription = document.getElementById('panel-description');
    const panelTwitterContainer = document.getElementById('panel-twitter-container');
    const panelTwitterLink = document.getElementById('panel-twitter-link');
    const panelWebsiteContainer = document.getElementById('panel-website-container');
    const panelWebsiteLink = document.getElementById('panel-website-link');
    // --- NUEVO: Referencias Panel Configuración ---
    const settingsPanel = document.getElementById('settings-panel');
    const openSubmitFormBtn = document.getElementById('open-submit-form-btn');
    const toggleRotationBtn = document.getElementById('toggle-rotation-btn');


    // --- 4. Configuración Inicial del Globo y Carga de Datos ---
    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");
        myGlobe = Globe();

        // Configuración básica y auto-rotación inicial (sin cambios)
        myGlobe(globeContainer)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');
        try {
            if (myGlobe.controls) {
                myGlobe.controls().autoRotate = true;
                myGlobe.controls().autoRotateSpeed = 0.25;
                console.log("Auto-rotación habilitada inicialmente.");
                // Asegurar que el botón refleje el estado inicial (Rotando -> botón dice "Stop")
                if(toggleRotationBtn) toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation';
            }
        } catch (e) { console.error("Error al habilitar auto-rotación inicial:", e); }
        console.log("Instancia de Globe.gl creada y configurada.");

        // Carga de Datos y Configuración de Puntos/Interacciones (sin cambios)
        fetch('data/cardano-actors.json')
            .then(res => { /* ... */ return res.json(); })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat').pointLng('lng').pointRadius(0.2)
                    .pointColor(d => { /* ... Lógica de color ... */
                        const colorMap = {'Founder':'#FFD700','Hub':'#FFA500','University':'#42A5F5','Project':'#AB47BC','Ambassador':'#FFFFFF','SPO':'#EF5350','default':'#BDBDBD'};
                        return colorMap[d.type] || colorMap['default'];
                    })
                    .pointLabel(d => `<b>${d.name}</b> (${d.type})<br>${d.city}, ${d.country}`)
                    .onPointHover(point => { /* ... Lógica hover refinada ... */
                        if (myGlobe && myGlobe.controls) { if (point !== null) { myGlobe.controls().autoRotate = false; } else { if (!isRotationManuallyPaused) { myGlobe.controls().autoRotate = true; } } }
                    })
                    .onPointClick(point => { /* ... Lógica click panel detalles ... */
                        if (point && detailsPanel) {
                            if(panelName) panelName.textContent = point.name || 'N/A';
                            if(panelType) panelType.textContent = point.type || 'N/A';
                            if(panelCity) panelCity.textContent = point.city || '';
                            if(panelCountry) panelCountry.textContent = point.country || '';
                            if(panelDescription) panelDescription.textContent = point.description || 'No description available.';
                            // Twitter/Website logic...
                             if (panelTwitterContainer && panelTwitterLink) { if (point.twitter && point.twitter.trim() !== "") { const twitterUrl = `https://twitter.com/${point.twitter}`; panelTwitterLink.href = twitterUrl; panelTwitterLink.textContent = `@${point.twitter}`; panelTwitterContainer.style.display = 'block'; } else { panelTwitterContainer.style.display = 'none'; } } if (panelWebsiteContainer && panelWebsiteLink) { if (point.website && point.website.trim() !== "") { panelWebsiteLink.href = point.website; try { const url = new URL(point.website); panelWebsiteLink.textContent = url.hostname + (url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')); } catch (_) { panelWebsiteLink.textContent = point.website; } panelWebsiteContainer.style.display = 'block'; } else { panelWebsiteContainer.style.display = 'none'; } }
                            detailsPanel.classList.add('panel-visible');
                        }
                    });
                console.log("Puntos y sus interacciones configurados en el globo.");
            })
            .catch(error => { console.error('Error fatal al cargar o procesar los datos de actores:', error); });
    } else {
        console.error("Error: No se encontró el elemento con id 'globeViz'. El globo no se puede inicializar.");
    } // Fin del if (globeContainer)


    // --- 5. Añadir Event Listeners para UI ---

    // --- Listener para el icono de Configuración (MODIFICADO) ---
    if (settingsIcon) {
        // Ahora llama a toggleSettingsPanel para mostrar/ocultar el popup de configuración
        settingsIcon.addEventListener('click', toggleSettingsPanel);
    } else {
        console.warn("Elemento settingsIcon no encontrado.");
    }

    // --- NUEVO: Listeners para botones DENTRO del panel de configuración ---
    if (openSubmitFormBtn) {
        openSubmitFormBtn.addEventListener('click', () => {
            openModal(); // Abre el modal del formulario
            toggleSettingsPanel(); // Cierra el panel de configuración al mismo tiempo
        });
    } else { console.warn("Botón openSubmitFormBtn no encontrado."); }

    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', toggleAutoRotation); // Llama a la función de toggle
    } else { console.warn("Botón toggleRotationBtn no encontrado."); }


    // Listeners para cerrar modales/paneles (sin cambios)
    if (closeButton) { closeButton.addEventListener('click', closeModal); } // Cierre modal form (X)
    if (closePanelButton) { closePanelButton.addEventListener('click', closeDetailsPanel); } // Cierre panel detalles (X)
    if (formModal) { formModal.addEventListener('click', (event) => { if (event.target === formModal) closeModal(); }); } // Cierre modal form (clic fuera)


    // Listener para el envío del formulario (sin cambios en su lógica interna)
    if (actorForm && submitButton) {
        actorForm.addEventListener('submit', async function(event) {
            // ... (toda la lógica async con try/catch/finally y fetch que ya funcionaba) ...
             event.preventDefault(); console.log("Formulario enviado..."); submitButton.disabled = true; submitButton.textContent = 'Sending...';
            try {
                const formData = { name: document.getElementById('form-name').value, type: document.getElementById('form-type').value, city: document.getElementById('form-city').value, country: document.getElementById('form-country').value, lat: document.getElementById('form-lat').value, lng: document.getElementById('form-lng').value, description: document.getElementById('form-description').value, twitter: document.getElementById('form-twitter').value.trim(), website: document.getElementById('form-website').value.trim() };
                console.log("Datos a enviar:", formData); const apiUrl = '/api/submit-proposal';
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                const result = await response.json();
                if (response.ok) { console.log("Respuesta exitosa del servidor:", result); alert(`Success: ${result.message || 'Proposal submitted successfully.'}`); actorForm.reset();
                } else { console.error("Error en la respuesta del servidor:", result); alert(`Error: ${result.message || 'Could not submit proposal.'}`); }
            } catch (error) { console.error("Error al enviar el formulario (fetch catch):", error); alert("Network error trying to submit proposal. Please try again.");
            } finally { submitButton.disabled = false; submitButton.textContent = 'Submit Proposal'; closeModal(); }
        });
    } else {
        if (!actorForm) console.error("Error: No se encontró el formulario con id 'actor-form'.");
        if (!submitButton) console.error("Error: No se encontró el botón de envío dentro del formulario.");
    }

}); // <<< FIN del addEventListener para DOMContentLoaded

console.log("script.js cargado."); // Fuera del listener

