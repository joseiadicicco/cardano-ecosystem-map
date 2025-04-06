// === script.js === FINAL CONSOLIDADO ===
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente cargado.");

    // --- 1. Definición de Variables Globales y de Estado ---
    let myGlobe; // Variable para la instancia del globo
    let isRotationManuallyPaused = false; // Estado para la rotación manual
    let currentGlobeMode = 'day'; // Estado inicial de la vista del globo ('day', 'night', 'blue')

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

    // Función para mostrar/ocultar el panel de configuración
    function toggleSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('settings-popup-visible');
        } else {
            console.error("Intento de toggle panel config, pero settingsPanel no encontrado.");
        }
    }

    // Función para detener/reanudar la rotación del globo (actualiza estado manual)
    function toggleAutoRotation() {
        // Aseguramos que toggleRotationBtn se busque aquí por si acaso
        const toggleRotationBtn = document.getElementById('toggle-rotation-btn');
        if (myGlobe && myGlobe.controls && toggleRotationBtn) {
            const isCurrentlyRotating = myGlobe.controls().autoRotate;
            const newRotationState = !isCurrentlyRotating;
            myGlobe.controls().autoRotate = newRotationState;
            isRotationManuallyPaused = !newRotationState;
            console.log("Auto-rotación cambiada. Nuevo estado:", newRotationState, "Pausa Manual:", isRotationManuallyPaused);
            toggleRotationBtn.innerHTML = newRotationState ? '<i class="fas fa-pause"></i> Stop Rotation' : '<i class="fas fa-play"></i> Start Rotation';
        } else { console.error("No se puede cambiar la rotación."); }
    }

    // Función para actualizar la textura del globo
    function updateGlobeTexture(mode) {
        if (!myGlobe || typeof myGlobe.globeImageUrl !== 'function') {
            console.error("myGlobe no está listo o no soporta globeImageUrl.");
            return;
        }
        const textureUrls = {
            day: '//unpkg.com/three-globe/example/img/earth-day.jpg',
            night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
            blue: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        };
        if (textureUrls[mode]) {
            myGlobe.globeImageUrl(textureUrls[mode]);
            currentGlobeMode = mode; // Actualizar estado global
            console.log(`Textura del globo cambiada a: ${mode}`);
        } else {
            console.warn(`Modo de textura desconocido: ${mode}`);
        }
    }


    // --- 3. Obtención de Referencias a Elementos del DOM ---
    const globeContainer = document.getElementById('globeViz');
    const globeArea = document.getElementById('globe-area');
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const openSubmitFormBtn = document.getElementById('open-submit-form-btn');
    const toggleRotationBtn = document.getElementById('toggle-rotation-btn');
    const formModal = document.getElementById('form-modal');
    const closeFormModalButton = formModal ? formModal.querySelector('.close-button') : null;
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;
    // Elementos DENTRO del Sidebar
    const panelName = document.getElementById('panel-name');
    const panelType = document.getElementById('panel-type');
    const panelCity = document.getElementById('panel-city');
    const panelCountry = document.getElementById('panel-country');
    const panelDescription = document.getElementById('panel-description');
    const panelTwitterContainer = document.getElementById('panel-twitter-container');
    const panelTwitterLink = document.getElementById('panel-twitter-link');
    const panelWebsiteContainer = document.getElementById('panel-website-container');
    const panelWebsiteLink = document.getElementById('panel-website-link');
    // Radio buttons de vista
    const viewDayRadio = document.getElementById('view-day');
    const viewNightRadio = document.getElementById('view-night');
    const viewBlueRadio = document.getElementById('view-blue');
    const globeModeRadios = [viewDayRadio, viewNightRadio, viewBlueRadio];


    // --- 4. Configuración Inicial del Globo y Carga de Datos ---
    if (globeContainer && globeArea) {
        console.log("Contenedor #globeViz encontrado...");
        myGlobe = Globe();

        // Configuración globo - Usar textura inicial según currentGlobeMode
        const initialTextureUrl = {
            day: '//unpkg.com/three-globe/example/img/earth-day.jpg',
            night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
            blue: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        }[currentGlobeMode]; // Obtiene la URL para 'day' inicialmente

        myGlobe(globeContainer)
            .globeImageUrl(initialTextureUrl) // Textura inicial
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .backgroundColor('rgba(0,0,0,0)')
            .atmosphereColor('#00e0ff')
            .atmosphereAltitude(0.15)
            .showGraticules(false); // <-- Asegurarnos que las gratículas estén desactivadas por defecto

        // Habilitar Auto-Rotación Inicial
        try {
            if (myGlobe.controls) {
                myGlobe.controls().autoRotate = true;
                myGlobe.controls().autoRotateSpeed = 0.25;
                console.log("Auto-rotación habilitada inicialmente.");
                if(toggleRotationBtn) toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation';
            }
        } catch (e) { console.error("Error al habilitar auto-rotación inicial:", e); }
        console.log("Instancia de Globe.gl creada...");

        // Trigger para re-centrar/redimensionar el globo
        setTimeout(() => {
            if (globeArea && myGlobe && typeof myGlobe.width === 'function' && typeof myGlobe.height === 'function') {
                const width = globeArea.offsetWidth;
                const height = globeArea.offsetHeight;
                if (width > 0 && height > 0) {
                    myGlobe.width(width);
                    myGlobe.height(height);
                    console.log(`Globe dimensions set explicitly after delay: ${width}x${height}`);
                } else { console.warn("Globe area dimensions are zero after delay, skipping resize."); }
            } else { console.error("Cannot resize globe after delay: globeArea or myGlobe or methods not found."); }
        }, 500); // Retraso aumentado

        // Carga de Datos y Configuración de Puntos/Interacciones
        fetch('data/cardano-actors.json')
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat').pointLng('lng').pointRadius(0.2)
                    .pointColor(d => { // Lógica de color por tipo
                        const colorMap = {'Founder':'#FFD700','Hub':'#FFA500','University':'#42A5F5','Project':'#AB47BC','Ambassador':'#FFFFFF','SPO':'#EF5350','default':'#BDBDBD'};
                        return colorMap[d.type] || colorMap['default'];
                     })
                    .pointLabel(d => `<b>${d.name}</b> (${d.type})<br>${d.city}, ${d.country}`)
                    .onPointHover(point => { // Lógica hover refinada
                        if (myGlobe && myGlobe.controls) { if (point !== null) { myGlobe.controls().autoRotate = false; } else { if (!isRotationManuallyPaused) { myGlobe.controls().autoRotate = true; } } }
                     })
                    .onPointClick(point => { // Lógica click para actualizar sidebar
                        if (point) {
                            console.log("Punto clicado:", point);
                            if(panelName) panelName.textContent = point.name || 'N/A';
                            if(panelType) panelType.textContent = point.type || 'N/A';
                            if(panelCity) panelCity.textContent = point.city || '';
                            if(panelCountry) panelCountry.textContent = point.country || '';
                            if(panelDescription) panelDescription.textContent = point.description || 'No description available.';
                            // Twitter/Website logic...
                            if (panelTwitterContainer && panelTwitterLink) { if (point.twitter && point.twitter.trim() !== "") { const twitterUrl = `https://twitter.com/${point.twitter}`; panelTwitterLink.href = twitterUrl; panelTwitterLink.textContent = `@${point.twitter}`; panelTwitterContainer.style.display = 'block'; } else { panelTwitterContainer.style.display = 'none'; } } if (panelWebsiteContainer && panelWebsiteLink) { if (point.website && point.website.trim() !== "") { panelWebsiteLink.href = point.website; try { const url = new URL(point.website); panelWebsiteLink.textContent = url.hostname + (url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '')); } catch (_) { panelWebsiteLink.textContent = point.website; } panelWebsiteContainer.style.display = 'block'; } else { panelWebsiteContainer.style.display = 'none'; } }
                        }
                    });
                console.log("Puntos y sus interacciones configurados...");
                // updateArcs(); // Llamada inicial para arcos (futuro)
            })
            .catch(error => { console.error('Error fatal al cargar o procesar datos:', error); });
    } else { console.error("Error: #globeViz o #globeArea no encontrado."); }


    // --- 5. Añadir Event Listeners para UI ---
    // Listener icono Configuración -> toggleSettingsPanel
    if (settingsIcon) { settingsIcon.addEventListener('click', toggleSettingsPanel); }
    else { console.warn("Elemento settingsIcon no encontrado."); }

    // Listeners botones Panel Configuración
    if (openSubmitFormBtn) { openSubmitFormBtn.addEventListener('click', () => { openModal(); toggleSettingsPanel(); }); }
    else { console.warn("Botón openSubmitFormBtn no encontrado."); }
    if (toggleRotationBtn) { toggleRotationBtn.addEventListener('click', toggleAutoRotation); }
    else { console.warn("Botón toggleRotationBtn no encontrado."); }

    // Listeners para los radio buttons de vista
    globeModeRadios.forEach(radio => {
        if (radio) {
            radio.addEventListener('change', (event) => {
                const newMode = event.target.value;
                if (event.target.checked && newMode !== currentGlobeMode) {
                    updateGlobeTexture(newMode); // Llama a la función para cambiar la textura
                }
            });
        } else { console.warn("Uno de los radio buttons de vista no fue encontrado."); }
    });

    // Listeners para cerrar modales
    if (closeFormModalButton) { closeFormModalButton.addEventListener('click', closeModal); }
    else { console.warn("Elemento closeButton (modal form) no encontrado."); }
    if (formModal) { formModal.addEventListener('click', (event) => { if (event.target === formModal) closeModal(); }); }
    else { console.warn("Elemento formModal no encontrado."); }

    // Listener para el envío del formulario
    if (actorForm && submitButton) {
        actorForm.addEventListener('submit', async function(event) {
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

}); // <<< FIN DOMContentLoaded

console.log("script.js cargado."); // Fuera del listener

