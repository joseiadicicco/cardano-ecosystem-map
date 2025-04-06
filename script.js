// === script.js === FINAL REORGANIZADO ===
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
          console.error("Intento de cerrar panel, pero detailsPanel no encontrado.");
      }
    }

    // --- 2. Obtención de Referencias a Elementos del DOM ---

    // Elementos del Globo
    const globeContainer = document.getElementById('globeViz');

    // Elementos del Modal del Formulario
    const settingsIcon = document.getElementById('settings-icon');
    const formModal = document.getElementById('form-modal');
    const closeButton = formModal ? formModal.querySelector('.close-button') : null;
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;

    // Elementos del Panel de Detalles
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

    // Variable para la instancia del globo
    let myGlobe;

    // --- 3. Configuración Inicial del Globo y Carga de Datos ---
    if (globeContainer) {
        console.log("Contenedor #globeViz encontrado. Inicializando el globo...");
        myGlobe = Globe(); // Crear instancia

        // Configuración básica del globo
        myGlobe(globeContainer)
            .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
            .backgroundColor('rgba(0,0,0,0)');

        // Habilitar Auto-Rotación
        try {
            if (myGlobe.controls) { // Asegurarse que controls exista
                myGlobe.controls().autoRotate = true;
                myGlobe.controls().autoRotateSpeed = 0.25;
                console.log("Auto-rotación habilitada.");
            } else {
                 console.warn("myGlobe.controls() no disponible al intentar habilitar auto-rotación.");
            }
        } catch (e) {
            console.error("Error al habilitar auto-rotación:", e);
        }
        console.log("Instancia de Globe.gl creada y configurada.");

        // Carga de Datos y Configuración de Puntos/Interacciones
        fetch('data/cardano-actors.json')
            .then(res => {
                if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText} al cargar cardano-actors.json`);
                return res.json();
            })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);

                // Configuración de puntos y sus interacciones encadenadas
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat')
                    .pointLng('lng')
                    .pointRadius(0.2)
                    .pointColor(() => '#4CAF50')
                    .pointLabel(d => `<b>${d.name}</b> (${d.type})<br>${d.city}, ${d.country}`)
                    .onPointHover(point => { // Detener rotación en hover
                        if (myGlobe && myGlobe.controls) {
                            myGlobe.controls().autoRotate = (point === null);
                        }
                    })
                    .onPointClick(point => { // Mostrar panel de detalles en click
                        if (point && detailsPanel) { // Usamos 'detailsPanel' definido arriba
                            console.log("Punto clicado:", point);
                            // Rellenar panel (usando variables definidas arriba)
                            if(panelName) panelName.textContent = point.name || 'N/A';
                            if(panelType) panelType.textContent = point.type || 'N/A';
                            if(panelCity) panelCity.textContent = point.city || '';
                            if(panelCountry) panelCountry.textContent = point.country || '';
                            if(panelDescription) panelDescription.textContent = point.description || 'No description available.';

                            // Lógica Twitter
                            if (panelTwitterContainer && panelTwitterLink) {
                              if (point.twitter && point.twitter.trim() !== "") {
                                const twitterUrl = `https://twitter.com/${point.twitter}`;
                                panelTwitterLink.href = twitterUrl;
                                panelTwitterLink.textContent = `@${point.twitter}`;
                                panelTwitterContainer.style.display = 'block';
                              } else {
                                panelTwitterContainer.style.display = 'none';
                              }
                            }
                            // Lógica Website
                            if (panelWebsiteContainer && panelWebsiteLink) {
                              if (point.website && point.website.trim() !== "") {
                                panelWebsiteLink.href = point.website;
                                try {
                                  const url = new URL(point.website);
                                  panelWebsiteLink.textContent = url.hostname + (url.pathname === '/' ? '' : url.pathname.replace(/\/$/, ''));
                                } catch (_) {
                                   panelWebsiteLink.textContent = point.website;
                                }
                                panelWebsiteContainer.style.display = 'block';
                              } else {
                                panelWebsiteContainer.style.display = 'none';
                              }
                            }
                            // Mostrar panel
                            detailsPanel.classList.add('panel-visible');
                        }
                    }); // Fin onPointClick

                console.log("Puntos y sus interacciones configurados en el globo.");
            })
            .catch(error => {
                console.error('Error fatal al cargar o procesar los datos de actores:', error);
            });

    } else {
        console.error("Error: No se encontró el elemento con id 'globeViz'. El globo no se puede inicializar.");
    } // Fin del if (globeContainer)


    // --- 4. Añadir Event Listeners para UI (Modales, Paneles, Formulario) ---

    // Listener para abrir modal del formulario
    if (settingsIcon) {
        settingsIcon.addEventListener('click', openModal);
    } else {
        console.warn("Elemento settingsIcon no encontrado. El modal no se podrá abrir.");
    }

    // Listener para cerrar modal del formulario (botón X)
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    } else {
         console.warn("Elemento closeButton (modal form) no encontrado.");
    }

    // Listener para cerrar modal del formulario (clic fuera)
    if (formModal) {
        formModal.addEventListener('click', function(event) {
            if (event.target === formModal) {
                closeModal();
            }
        });
    } else {
         console.warn("Elemento formModal no encontrado.");
    }

    // Listener para cerrar panel de detalles (botón X)
    if (closePanelButton) {
        closePanelButton.addEventListener('click', closeDetailsPanel);
    } else {
         console.warn("Elemento closePanelButton (details panel) no encontrado.");
    }

    // Listener para el envío del formulario
    if (actorForm && submitButton) {
        actorForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log("Formulario enviado...");
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                // Captura directa de datos dentro del handler
                const formData = {
                    name: document.getElementById('form-name').value,
                    type: document.getElementById('form-type').value,
                    city: document.getElementById('form-city').value,
                    country: document.getElementById('form-country').value,
                    lat: document.getElementById('form-lat').value,
                    lng: document.getElementById('form-lng').value,
                    description: document.getElementById('form-description').value,
                    twitter: document.getElementById('form-twitter').value.trim(),
                    website: document.getElementById('form-website').value.trim()
                };
                console.log("Datos a enviar:", formData);

                const apiUrl = '/api/submit-proposal';
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const result = await response.json();

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
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Proposal';
                closeModal(); // Cierra el modal del formulario al finalizar
            }
        });
    } else {
        if (!actorForm) console.error("Error: No se encontró el formulario con id 'actor-form'.");
        if (!submitButton) console.error("Error: No se encontró el botón de envío dentro del formulario.");
    }

}); // <<< FIN del addEventListener para DOMContentLoaded

console.log("script.js cargado."); // Fuera del listener