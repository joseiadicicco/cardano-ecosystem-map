// === script.js === FINAL con Panel de Configuración ===
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente cargado.");

    // --- 1. Definición de Funciones Auxiliares ---

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
            settingsPanel.classList.toggle('settings-popup-visible'); // .toggle añade la clase si no está, o la quita si sí está
        } else {
            console.error("Intento de toggle panel config, pero settingsPanel no encontrado.");
        }
    }

    // --- NUEVO: Función para detener/reanudar la rotación del globo ---
    function toggleAutoRotation() {
        // Necesitamos acceso a 'myGlobe' y al botón 'toggleRotationBtn' (definidos abajo)
        if (myGlobe && myGlobe.controls && toggleRotationBtn) {
            const isRotating = myGlobe.controls().autoRotate;
            myGlobe.controls().autoRotate = !isRotating; // Invierte el estado
            console.log("Auto-rotación cambiada. Nuevo estado:", !isRotating);

            // Actualizar texto e icono del botón
            if (!isRotating) { // Si acabamos de ACTIVAR la rotación
                // Usamos innerHTML para poder incluir la etiqueta <i> del icono Font Awesome
                toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation';
            } else { // Si acabamos de DESACTIVAR la rotación
                toggleRotationBtn.innerHTML = '<i class="fas fa-play"></i> Start Rotation';
            }
        } else {
            console.error("No se puede cambiar la rotación: myGlobe, controls() o toggleRotationBtn no disponibles.");
        }
    }


    // --- 2. Obtención de Referencias a Elementos del DOM ---

    const globeContainer = document.getElementById('globeViz');
    // Ícono principal de config
    const settingsIcon = document.getElementById('settings-icon');
    // Modal Formulario
    const formModal = document.getElementById('form-modal');
    const closeButton = formModal ? formModal.querySelector('.close-button') : null;
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;
    // Panel Detalles
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
    // --- NUEVO: Panel Configuración y sus botones ---
    const settingsPanel = document.getElementById('settings-panel');
    const openSubmitFormBtn = document.getElementById('open-submit-form-btn');
    const toggleRotationBtn = document.getElementById('toggle-rotation-btn');


    // Variable para la instancia del globo
    let myGlobe;

    // --- 3. Configuración Inicial del Globo y Carga de Datos ---
    if (globeContainer) {
        // ... (Inicialización del globo, auto-rotación, fetch de datos, configuración de puntos .pointsData()...onPointClick() igual que antes) ...
        // (Asegúrate de que esta parte esté como en la respuesta #91, la pego de nuevo por si acaso)
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");
        myGlobe = Globe();

        myGlobe(globeContainer)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');

        try {
            if (myGlobe.controls) {
                myGlobe.controls().autoRotate = true;
                myGlobe.controls().autoRotateSpeed = 0.25;
                console.log("Auto-rotación habilitada.");
            }
        } catch (e) { console.error("Error al habilitar auto-rotación:", e); }
        console.log("Instancia de Globe.gl creada y configurada.");

        fetch('data/cardano-actors.json')
            .then(res => {
                if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText} al cargar cardano-actors.json`);
                return res.json();
            })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat').pointLng('lng').pointRadius(0.2).pointColor(() => '#4CAF50')
                    .pointLabel(d => `<b>${d.name}</b> (${d.type})<br>${d.city}, ${d.country}`)
                    .onPointHover(point => {
                        if (myGlobe && myGlobe.controls) { myGlobe.controls().autoRotate = (point === null); }
                    })
                    .onPointClick(point => { // Lógica para mostrar panel detalles (sin cambios)
                        if (point && detailsPanel) {
                            console.log("Punto clicado:", point);
                            if(panelName) panelName.textContent = point.name || 'N/A';
                            if(panelType) panelType.textContent = point.type || 'N/A';
                            if(panelCity) panelCity.textContent = point.city || '';
                            if(panelCountry) panelCountry.textContent = point.country || '';
                            if(panelDescription) panelDescription.textContent = point.description || 'No description available.';
                            // Lógica Twitter
                            if (panelTwitterContainer && panelTwitterLink) {
                              if (point.twitter && point.twitter.trim() !== "") {
                                const twitterUrl = `https://twitter.com/${point.twitter}`;
                                panelTwitterLink.href = twitterUrl; panelTwitterLink.textContent = `@${point.twitter}`;
                                panelTwitterContainer.style.display = 'block';
                              } else { panelTwitterContainer.style.display = 'none'; }
                            }
                            // Lógica Website
                            if (panelWebsiteContainer && panelWebsiteLink) {
                              if (point.website && point.website.trim() !== "") {
                                panelWebsiteLink.href = point.website;
                                try { const url = new URL(point.website); panelWebsiteLink.textContent = url.hostname + (url.pathname === '/' ? '' : url.pathname.replace(/\/$/, ''));
                                } catch (_) { panelWebsiteLink.textContent = point.website; }
                                panelWebsiteContainer.style.display = 'block';
                              } else { panelWebsiteContainer.style.display = 'none'; }
                            }
                            detailsPanel.classList.add('panel-visible');
                        }
                    });
                console.log("Puntos y sus interacciones configurados en el globo.");
            })
            .catch(error => { console.error('Error fatal al cargar o procesar los datos de actores:', error); });
    } else {
        console.error("Error: No se encontró el elemento con id 'globeViz'. El globo no se puede inicializar.");
    } // Fin del if (globeContainer)


    // --- 4. Añadir Event Listeners para UI ---

    // --- Listener para el icono de Configuración (MODIFICADO) ---
    if (settingsIcon) {
        // Ahora llama a toggleSettingsPanel en lugar de openModal
        settingsIcon.addEventListener('click', toggleSettingsPanel);
    } else {
        console.warn("Elemento settingsIcon no encontrado.");
    }

    // Listeners para cerrar modales/paneles (sin cambios)
    if (closeButton) { closeButton.addEventListener('click', closeModal); } // Cierre modal form
    if (closePanelButton) { closePanelButton.addEventListener('click', closeDetailsPanel); } // Cierre panel detalles
    if (formModal) { formModal.addEventListener('click', (event) => { if (event.target === formModal) closeModal(); }); } // Cierre modal form (clic fuera)
    // Podríamos añadir cierre del panel de config al hacer clic fuera también

    // --- NUEVO: Listeners para botones DENTRO del panel de configuración ---
    if (openSubmitFormBtn) {
        openSubmitFormBtn.addEventListener('click', () => {
            openModal(); // Abre el modal del formulario
            toggleSettingsPanel(); // Cierra el panel de configuración
        });
    } else {
        console.warn("Botón openSubmitFormBtn no encontrado.");
    }

    if (toggleRotationBtn) {
        // Llama a la función que definimos antes para cambiar la rotación
        toggleRotationBtn.addEventListener('click', toggleAutoRotation);
    } else {
        console.warn("Botón toggleRotationBtn no encontrado.");
    }

    // Listener para el envío del formulario (sin cambios en su lógica interna)
    if (actorForm && submitButton) {
        actorForm.addEventListener('submit', async function(event) {
            // ... (toda la lógica async con try/catch/finally y fetch que ya funcionaba) ...
            event.preventDefault();
            console.log("Formulario enviado...");
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            try {
                const formData = {
                    name: document.getElementById('form-name').value, type: document.getElementById('form-type').value,
                    city: document.getElementById('form-city').value, country: document.getElementById('form-country').value,
                    lat: document.getElementById('form-lat').value, lng: document.getElementById('form-lng').value,
                    description: document.getElementById('form-description').value,
                    twitter: document.getElementById('form-twitter').value.trim(), website: document.getElementById('form-website').value.trim()
                };
                console.log("Datos a enviar:", formData);
                const apiUrl = '/api/submit-proposal';
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
                const result = await response.json();
                if (response.ok) {
                    console.log("Respuesta exitosa del servidor:", result); alert(`Success: ${result.message || 'Proposal submitted successfully.'}`); actorForm.reset();
                } else {
                    console.error("Error en la respuesta del servidor:", result); alert(`Error: ${result.message || 'Could not submit proposal.'}`);
                }
            } catch (error) {
                console.error("Error al enviar el formulario (fetch catch):", error); alert("Network error trying to submit proposal. Please try again.");
            } finally {
                submitButton.disabled = false; submitButton.textContent = 'Submit Proposal'; closeModal();
            }
        });
    } else {
        // ... (mensajes de error si falta form o botón) ...
    }

}); // <<< FIN del addEventListener para DOMContentLoaded

console.log("script.js cargado.");