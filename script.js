// === script.js === FINAL con Switch Textura Globo ===
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente cargado.");

    // --- 1. Definición de Variables Globales y de Estado ---
    let myGlobe; // Variable para la instancia del globo
    let isRotationManuallyPaused = false; // Estado para la rotación manual
    let currentGlobeMode = 'day'; // Estado inicial de la vista del globo ('day', 'night', 'blue')

    // --- 2. Definición de Funciones Auxiliares ---

    function openModal() { /* ... sin cambios ... */
        const formModal = document.getElementById('form-modal');
        if (formModal) formModal.classList.add('modal-visible');
        else console.error("formModal no encontrado.");
    }
    function closeModal() { /* ... sin cambios ... */
        const formModal = document.getElementById('form-modal');
        if (formModal) formModal.classList.remove('modal-visible');
        else console.error("formModal no encontrado.");
    }
    function toggleSettingsPanel() { /* ... sin cambios ... */
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel) settingsPanel.classList.toggle('settings-popup-visible');
        else console.error("settingsPanel no encontrado.");
    }
    function toggleAutoRotation() { /* ... sin cambios ... */
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

    // --- NUEVO: Función para actualizar la textura del globo ---
    function updateGlobeTexture(mode) {
        // Verifica si el globo está inicializado y tiene el método necesario
        if (!myGlobe || typeof myGlobe.globeImageUrl !== 'function') {
            console.error("myGlobe no está listo o no soporta globeImageUrl.");
            return;
        }
        // Mapeo de modos a URLs de texturas
        const textureUrls = {
            day: '//unpkg.com/three-globe/example/img/earth-day.jpg',
            night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
            blue: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        };
        // Si el modo es válido, cambia la textura y actualiza el estado
        if (textureUrls[mode]) {
            myGlobe.globeImageUrl(textureUrls[mode]);
            currentGlobeMode = mode; // Actualizar estado global
            console.log(`Textura del globo cambiada a: ${mode}`);
        } else {
            console.warn(`Modo de textura desconocido: ${mode}`);
        }
    }

    // --- 3. Obtención de Referencias a Elementos del DOM ---
    // (Se añaden referencias a los radio buttons)
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
    const panelName = document.getElementById('panel-name');
    const panelType = document.getElementById('panel-type');
    const panelCity = document.getElementById('panel-city');
    const panelCountry = document.getElementById('panel-country');
    const panelDescription = document.getElementById('panel-description');
    const panelTwitterContainer = document.getElementById('panel-twitter-container');
    const panelTwitterLink = document.getElementById('panel-twitter-link');
    const panelWebsiteContainer = document.getElementById('panel-website-container');
    const panelWebsiteLink = document.getElementById('panel-website-link');
    // --- NUEVO: Referencias a los radio buttons ---
    const viewDayRadio = document.getElementById('view-day');
    const viewNightRadio = document.getElementById('view-night');
    const viewBlueRadio = document.getElementById('view-blue');
    // Agruparlos para añadir listeners fácilmente
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
            .globeImageUrl(initialTextureUrl) // <-- Usa textura inicial correcta
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .backgroundColor('rgba(0,0,0,0)')
            .atmosphereColor('#00e0ff')
            .atmosphereAltitude(0.15);

        // Habilitar Auto-Rotación Inicial (sin cambios)
        try { if (myGlobe.controls) { myGlobe.controls().autoRotate = true; myGlobe.controls().autoRotateSpeed = 0.25; console.log("Auto-rotación habilitada."); if(toggleRotationBtn) toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation'; } } catch (e) { console.error("Error al habilitar auto-rotación:", e); }
        console.log("Instancia de Globe.gl creada...");

        // Trigger para re-centrar/redimensionar (sin cambios)
        setTimeout(() => { /* ... resize logic ... */ }, 150);

        // Carga de Datos y Configuración de Puntos/Interacciones
        fetch('data/cardano-actors.json')
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData);
                myGlobe
                    .pointsData(actorsData)
                    .pointLat('lat').pointLng('lng').pointRadius(0.2)
                    .pointColor(d => { /* ... color logic ... */ })
                    .pointLabel(d => `...`)
                    .onPointHover(point => { /* ... hover logic ... */ })
                    .onPointClick(point => { /* ... click logic ... */ });
                console.log("Puntos y sus interacciones configurados...");
                // updateArcs(); // Llamada inicial para arcos (futuro)
            })
            .catch(error => { console.error('Error fatal al cargar datos:', error); });
    } else { console.error("Error: #globeViz no encontrado."); }


    // --- 5. Añadir Event Listeners para UI ---
    // Listeners para icono config, botones panel config (openSubmit, toggleRotation), cierres modales/paneles (sin cambios)
    if (settingsIcon) { settingsIcon.addEventListener('click', toggleSettingsPanel); } else { console.warn("settingsIcon no encontrado."); }
    if (openSubmitFormBtn) { openSubmitFormBtn.addEventListener('click', () => { openModal(); toggleSettingsPanel(); }); } else { console.warn("openSubmitFormBtn no encontrado."); }
    if (toggleRotationBtn) { toggleRotationBtn.addEventListener('click', toggleAutoRotation); } else { console.warn("toggleRotationBtn no encontrado."); }
    if (closeFormModalButton) { closeFormModalButton.addEventListener('click', closeModal); } else { console.warn("closeButton (modal form) no encontrado."); }
    if (formModal) { formModal.addEventListener('click', (event) => { if (event.target === formModal) closeModal(); }); } else { console.warn("formModal no encontrado."); }

    // --- NUEVO: Listeners para los radio buttons de vista ---
    globeModeRadios.forEach(radio => {
        // Asegurarse que el elemento existe antes de añadir listener
        if (radio) {
            radio.addEventListener('change', (event) => {
                // event.target es el radio button que cambió
                const newMode = event.target.value;
                // Verificamos que esté marcado y sea diferente al modo actual
                if (event.target.checked && newMode !== currentGlobeMode) {
                    updateGlobeTexture(newMode); // Llamamos a la función para cambiar la textura
                }
            });
        } else {
            console.warn("Uno de los radio buttons de vista ('view-day', 'view-night', 'view-blue') no fue encontrado.");
        }
    });
    // ---------------------------------------------------

    // Listener para el envío del formulario (sin cambios)
    if (actorForm && submitButton) { actorForm.addEventListener('submit', async function(event) { /* ... submit logic ... */ }); }
    else { /* ... error logs ... */ }

}); // <<< FIN DOMContentLoaded

console.log("script.js cargado."); // Fuera del listener

