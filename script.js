// === script.js === ADAPTADO para Cardano Ecosystem Map ===

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM completamente cargado.");

    // --- 1. Definición de Variables Globales y de Estado ---
    let myGlobe; // Variable para la instancia del globo
    let isRotationManuallyPaused = false; // Estado para la rotación manual
    let currentGlobeMode = 'blue'; // Estado inicial de la vista del globo cambiado a 'blue'
    // Inicializar activeFilters con todos los tipos posibles
    let activeFilters = new Set(['Founder', 'Hub', 'University', 'Project', 'Ambassador', 'SPO']);
    let currentConnections = [];
    let connectionSettings = {
        type: 'none', // Asegurar que el estado inicial sea 'none'
        color: '#00e5ff',
        width: 0.5
    };

    // Obtener referencia al panel de opciones de conexión
    const connectionOptions = document.querySelector('.connection-options');
    // Ocultar el panel de opciones de conexión inicialmente
    if (connectionOptions) {
        connectionOptions.style.display = 'none';
    }

    // Asegurarse de que los checkboxes coincidan con el estado inicial
    document.querySelectorAll('input[name="actorFilter"]').forEach(checkbox => {
        checkbox.checked = activeFilters.has(checkbox.value);
    });

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
            settingsPanel.classList.toggle('settings-panel-visible');
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
            blue: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            // Textura Grid (si la añadimos después)
            grid: 'https://raw.githubusercontent.com/chrisrzhou/react-globe/main/textures/globe_dark.jpg' // Ejemplo
        };
        if (textureUrls[mode]) {
            myGlobe.globeImageUrl(textureUrls[mode]);
            currentGlobeMode = mode; // Actualizar estado global
            console.log(`Textura del globo cambiada a: ${mode}`);
        } else {
            console.warn(`Modo de textura desconocido: ${mode}`);
        }
    }

    // Función para ajustar el tamaño del globo al contenedor
    function resizeGlobe() {
        if (!myGlobe || !globeArea || typeof myGlobe.width !== 'function' || typeof myGlobe.height !== 'function') {
            // console.warn("Intento de resize, pero myGlobe o globeArea no están listos.");
            return;
        }
        const width = globeArea.offsetWidth;
        const height = globeArea.offsetHeight;
        if (width > 0 && height > 0) {
            myGlobe.width(width);
            myGlobe.height(height);
            // console.log(`Globe dimensions updated: ${width}x${height}`);
        } else {
            // console.warn("Globe area dimensions are zero during resize attempt.");
        }
    }

    // Función para actualizar los puntos visibles según los filtros
    function updateVisiblePoints(actorsData) {
        if (!myGlobe) return;
        
        // Filtrar los datos según los filtros activos
        const filteredData = actorsData.filter(actor => activeFilters.has(actor.type));
        console.log('Datos filtrados:', filteredData.length, 'de', actorsData.length, 'actores');
        
        // Actualizar los puntos en el globo
        myGlobe.pointsData(filteredData);
        
        // Si hay conexiones activas, actualizarlas usando los datos filtrados
        if (connectionSettings.type !== 'none') {
            console.log('Actualizando conexiones con datos filtrados');
            // Asegurarnos de que updateConnections use los datos filtrados
            updateConnections(filteredData);
        } else {
            // Si no hay conexiones activas, limpiar los arcos existentes
            myGlobe.arcsData([]);
            currentConnections = [];
        }
    }

    // Función para determinar el continente según el país
    function getContinent(country) {
        const continentMap = {
            // Latinoamérica
            'Argentina': 'Latin America',
            'Brazil': 'Latin America',
            'Chile': 'Latin America',
            'Costa Rica': 'Latin America',
            'Panama': 'Latin America',
            'Paraguay': 'Latin America',
            'Peru': 'Latin America',
            'Venezuela': 'Latin America',
            // Europa
            'Austria': 'Europe',
            'Belgium': 'Europe',
            'Czech Republic': 'Europe',
            'France': 'Europe',
            'Germany': 'Europe',
            'Greece': 'Europe',
            'Netherlands': 'Europe',
            'Norway': 'Europe',
            'Poland': 'Europe',
            'Romania': 'Europe',
            'Scotland': 'Europe',
            'Slovakia': 'Europe',
            'Switzerland': 'Europe',
            'United Kingdom': 'Europe',
            // Asia
            'China': 'Asia',
            'Indonesia': 'Asia',
            'Japan': 'Asia',
            'Kazakhstan': 'Asia',
            'Korea, South': 'Asia',
            'Lebanon': 'Asia',
            'Taiwan': 'Asia',
            'Thailand': 'Asia',
            'Vietnam': 'Asia',
            // África
            'Congo, Democratic Republic of the': 'Africa',
            'Ghana': 'Africa',
            'Kenya': 'Africa',
            'Tanzania': 'Africa',
            // Norteamérica
            'Canada': 'North America',
            'USA': 'North America',
            'United States': 'North America',
            // Oceanía
            'Australia': 'Oceania'
        };
        return continentMap[country] || 'Other';
    }

    // Función para crear conexiones entre puntos
    function updateConnections(points) {
        if (!myGlobe) return;

        const arcsData = [];
        
        if (connectionSettings.type === 'type') {
            // Agrupar puntos por tipo
            const typeGroups = {};
            points.forEach(point => {
                if (!typeGroups[point.type]) {
                    typeGroups[point.type] = [];
                }
                typeGroups[point.type].push(point);
            });

            // Crear arcos entre puntos del mismo tipo
            Object.values(typeGroups).forEach(group => {
                if (group.length > 1) {
                    for (let i = 0; i < group.length; i++) {
                        for (let j = i + 1; j < group.length; j++) {
                            arcsData.push({
                                startLat: group[i].lat,
                                startLng: group[i].lng,
                                endLat: group[j].lat,
                                endLng: group[j].lng,
                                color: connectionSettings.color
                            });
                        }
                    }
                }
            });
        } else if (connectionSettings.type === 'region') {
            // Agrupar puntos por continente
            const continentGroups = {};
            points.forEach(point => {
                const continent = getContinent(point.country);
                if (!continentGroups[continent]) {
                    continentGroups[continent] = [];
                }
                continentGroups[continent].push(point);
            });

            // Crear arcos entre puntos del mismo continente
            Object.entries(continentGroups).forEach(([continent, group]) => {
                if (group.length > 1) {
                    console.log(`Creando conexiones para ${continent} con ${group.length} puntos`);
                    for (let i = 0; i < group.length; i++) {
                        for (let j = i + 1; j < group.length; j++) {
                            arcsData.push({
                                startLat: group[i].lat,
                                startLng: group[i].lng,
                                endLat: group[j].lat,
                                endLng: group[j].lng,
                                color: connectionSettings.color
                            });
                        }
                    }
                }
            });
        }

        // Actualizar arcos en el globo
        currentConnections = arcsData;
        myGlobe
            .arcsData(arcsData)
            .arcColor('color')
            .arcStroke(connectionSettings.width)
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(2000);
    }

    // Función para generar ID único basado en el nombre y tipo del actor
    function generateActorId(name, type) {
        // Normalizar el nombre: convertir a minúsculas, reemplazar espacios y caracteres especiales
        const normalizedName = name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
            .replace(/^-+|-+$/g, ''); // Remover guiones del inicio y final

        // Normalizar el tipo
        const normalizedType = type.toLowerCase();

        // Generar ID combinando tipo y nombre
        return `${normalizedType}-${normalizedName}`;
    }

    // Función para validar que un ID es único en el conjunto de datos
    function ensureUniqueId(baseId, existingIds) {
        let finalId = baseId;
        let counter = 1;
        
        while (existingIds.has(finalId)) {
            finalId = `${baseId}-${counter}`;
            counter++;
        }
        
        return finalId;
    }

    // --- 3. Obtención de Referencias a Elementos del DOM ---
    const globeContainer = document.getElementById('globeViz');
    const globeArea = document.getElementById('globe-area'); // Contenedor del área del globo
    // Icono y Panel Configuración
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel'); // Target the panel
    const closeSettingsBtn = settingsPanel.querySelector('.close-settings-button'); // Get the new close button
    const openSubmitFormBtn = document.getElementById('open-submit-form-btn');
    const toggleRotationBtn = document.getElementById('toggle-rotation-btn'); // Referencia necesaria para estado inicial
    // Modal Formulario
    const formModal = document.getElementById('form-modal');
    const closeModalBtn = formModal.querySelector('.close-button');
    const actorForm = document.getElementById('actor-form');
    const submitButton = actorForm ? actorForm.querySelector('button[type="submit"]') : null;
    // Elementos DENTRO del Sidebar para mostrar detalles
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
    const globeModeRadios = [viewDayRadio, viewNightRadio, viewBlueRadio]; // Incluir grid

    // Sincronizar el estado inicial de los radio buttons con currentGlobeMode
    const initializeGlobeModeRadios = () => {
        const radioToCheck = document.querySelector(`input[type="radio"][value="${currentGlobeMode}"]`);
        if (radioToCheck) {
            radioToCheck.checked = true;
            console.log(`Radio button '${currentGlobeMode}' checked initially`);
        }
    };

    // Llamar a la función de inicialización después de obtener las referencias
    initializeGlobeModeRadios();

    // --- 4. Configuración Inicial del Globo y Carga de Datos ---
    if (globeContainer && globeArea) {
        console.log("Contenedor #globeViz encontrado...");
        
        const initialTextureUrl = {
            day: '//unpkg.com/three-globe/example/img/earth-day.jpg',
            night: '//unpkg.com/three-globe/example/img/earth-night.jpg',
            blue: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
        }[currentGlobeMode];

        // Crear instancia del globo usando el objeto global Globe
        myGlobe = Globe()(globeContainer)
            .width(globeContainer.clientWidth)
            .height(globeContainer.clientHeight)
            .globeImageUrl(initialTextureUrl)
            .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
            .backgroundColor('rgba(0,0,0,0)')
            .atmosphereColor('rgb(0, 229, 255)')
            .atmosphereAltitude(0.25)
            .showGraticules(true)
            .pointsData([])
            .pointAltitude(0.1)
            .pointRadius(0.25)
            .pointResolution(32)
            .pointsMerge(false)
            .pointLabel(d => `
                <div class="point-label">
                    <b>${d.name}</b> (${d.type})<br>
                    ${d.city}, ${d.country}
                </div>
            `);

        // Configurar luces usando la nueva API
        const renderer = myGlobe.renderer();
        if (renderer) {
            // Eliminar la propiedad deprecada
            delete renderer.useLegacyLights;
            
            // Configurar las luces usando la nueva API
            const scene = myGlobe.scene();
            if (scene) {
                scene.traverse((object) => {
                    if (object.isLight) {
                        // Ajustar la intensidad según la nueva API
                        object.intensity *= Math.PI;
                    }
                });
            }
        }

        // Configurar controles del globo
        try {
            if (myGlobe.controls) {
                myGlobe.controls().enableZoom = true;
                myGlobe.controls().autoRotate = true;
                myGlobe.controls().autoRotateSpeed = 0.5;
                console.log("Auto-rotación habilitada inicialmente.");
                if(toggleRotationBtn) {
                    toggleRotationBtn.innerHTML = '<i class="fas fa-pause"></i> Stop Rotation';
                }
            }
        } catch (e) { 
            console.error("Error al configurar los controles del globo:", e); 
        }

        // Configurar el panel de conexiones
        if (connectionOptions) {
            connectionOptions.style.display = 'block';
        }

        // <<< LLAMAR A resizeGlobe INICIALMENTE >>>
        resizeGlobe();

        // <<< AÑADIR ResizeObserver >>>
        const resizeObserver = new ResizeObserver(entries => {
            // Usamos requestAnimationFrame para evitar errores de "ResizeObserver loop limit exceeded"
            // y asegurar que el DOM se haya actualizado antes de medir.
            window.requestAnimationFrame(() => {
                if (!Array.isArray(entries) || !entries.length) {
                    return;
                }
                // En teoría, solo observamos un elemento, pero por si acaso:
                // entries.forEach(entry => { resizeGlobe(); });
                resizeGlobe();
            });
        });

        // Observar el contenedor del globo
        resizeObserver.observe(globeArea);
        console.log("ResizeObserver añadido a #globe-area.");

        // Carga de Datos y Configuración de Puntos/Interacciones
        fetch('data/cardano-actors.json')
            .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
            .then(actorsData => {
                console.log("Datos de actores cargados:", actorsData.length);
                
                // Aplicar filtros iniciales
                const filteredData = actorsData.filter(actor => activeFilters.has(actor.type));
                console.log("Datos filtrados inicialmente:", filteredData.length, "de", actorsData.length);
                
                myGlobe
                    .pointsData(filteredData)
                    .pointLat('lat')
                    .pointLng('lng')
                    .pointColor(d => {
                        const colorMap = {
                            'Founder': '#FFD700',
                            'Hub': '#00e5ff',
                            'University': '#42A5F5',
                            'Project': '#AB47BC',
                            'Ambassador': '#FFFFFF',
                            'SPO': '#EF5350',
                            'default': '#BDBDBD'
                        };
                        return colorMap[d.type] || colorMap['default'];
                    })
                    .onPointHover(point => {
                        // Detener rotación al hacer hover
                        if (myGlobe && myGlobe.controls) {
                            myGlobe.controls().autoRotate = !point && !isRotationManuallyPaused;
                        }
                        // El tooltip se maneja automáticamente por pointLabel
                    })
                    .onPointClick(point => {
                        if (point) {
                            console.log("Punto clicado:", point);
                            updateSidebarContent(point);
                        }
                    });

                // Configurar el botón de gratículas con el estado inicial correcto
                const toggleGraticulesBtn = document.getElementById('toggle-graticules-btn');
                if (toggleGraticulesBtn) {
                    let graticulesVisible = true; // Estado inicial true ya que las gratículas están visibles por defecto
                    toggleGraticulesBtn.innerHTML = '<i class="fas fa-border-none"></i> Hide Graticules'; // Estado inicial del botón
                    
                    toggleGraticulesBtn.addEventListener('click', () => {
                        graticulesVisible = !graticulesVisible;
                        if (myGlobe) {
                            myGlobe.showGraticules(graticulesVisible);
                            toggleGraticulesBtn.innerHTML = graticulesVisible
                                ? '<i class="fas fa-border-none"></i> Hide Graticules'
                                : '<i class="fas fa-border-all"></i> Show Graticules';
                            console.log("Graticules visibility changed to:", graticulesVisible);
                        }
                    });
                } else {
                    console.warn("toggleGraticulesBtn no encontrado.");
                }

                console.log("Puntos y gratículas configurados...");
            })
            .catch(error => { console.error('Error fatal al cargar o procesar datos:', error); });
    } else { console.error("Error: #globeViz o #globeArea no encontrado."); }

    // Función para actualizar el contenido del sidebar
    function updateSidebarContent(point) {
        // Referencias a elementos de imagen
        const imageContainer = document.getElementById('actor-image-container');
        const actorImage = document.getElementById('actor-image');
        const noImagePlaceholder = imageContainer.querySelector('.no-image-placeholder');
        const typePlaceholder = document.getElementById('actor-type-placeholder');

        // Limpiar estado previo
        actorImage.classList.add('loading');
        
        if (point.imageUrl) {
            // Si hay imagen, configurar la imagen y ocultar placeholder
            actorImage.src = point.imageUrl;
            actorImage.style.display = 'block';
            noImagePlaceholder.style.display = 'none';
            
            // Cuando la imagen carga, quitar clase loading
            actorImage.onload = () => {
                actorImage.classList.remove('loading');
            };
            
            // Si hay error al cargar la imagen, mostrar placeholder
            actorImage.onerror = () => {
                actorImage.style.display = 'none';
                noImagePlaceholder.style.display = 'flex';
                typePlaceholder.textContent = point.type;
            };
        } else {
            // Si no hay imagen, mostrar placeholder
            actorImage.style.display = 'none';
            noImagePlaceholder.style.display = 'flex';
            typePlaceholder.textContent = point.type;
        }

        // Actualizar resto del contenido
        if (panelName) panelName.textContent = point.name || 'N/A';
        if (panelType) panelType.textContent = point.type || 'N/A';
        if (panelCity) panelCity.textContent = point.city || '';
        if (panelCountry) panelCountry.textContent = point.country || '';
        if (panelDescription) panelDescription.textContent = point.description || 'No description available.';

        // Actualizar Twitter si existe
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

        // Actualizar Website si existe
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
    }

    // --- 5. Añadir Event Listeners para UI ---

    // Listener icono Configuración y su botón de cierre
    if (settingsIcon && settingsPanel && closeSettingsBtn) {
        console.log("Configurando event listeners para el panel de configuración...");
        
        settingsIcon.addEventListener('click', (event) => {
            console.log("Click en settings icon detectado");
            event.preventDefault(); // Prevenir comportamiento por defecto
            event.stopPropagation(); // Prevenir cierre inmediato
            settingsPanel.classList.toggle('settings-panel-visible');
            console.log("Toggle clase settings-panel-visible:", settingsPanel.classList.contains('settings-panel-visible'));
        });

        closeSettingsBtn.addEventListener('click', (event) => {
            console.log("Click en botón cerrar detectado");
            event.preventDefault();
            event.stopPropagation();
            settingsPanel.classList.remove('settings-panel-visible');
        });

        // Listener para cerrar el panel haciendo clic fuera
        document.addEventListener('click', (event) => {
            if (settingsPanel.classList.contains('settings-panel-visible') &&
                !settingsPanel.contains(event.target) &&
                event.target !== settingsIcon) {
                settingsPanel.classList.remove('settings-panel-visible');
                console.log("Panel cerrado por click fuera");
            }
        });

    } else {
        console.error("Error: Elementos no encontrados:", {
            settingsIcon: !!settingsIcon,
            settingsPanel: !!settingsPanel,
            closeSettingsBtn: !!closeSettingsBtn
        });
    }

    // Listeners botones DENTRO del Panel Configuración
    if (openSubmitFormBtn) {
        openSubmitFormBtn.addEventListener('click', () => {
            openModal();
            // Opcional: cerrar panel de config al abrir modal
            if (settingsPanel) settingsPanel.classList.remove('settings-panel-visible');
        });
    } else { console.warn("openSubmitFormBtn no encontrado."); }

    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', toggleAutoRotation);
    } else { console.warn("toggleRotationBtn no encontrado."); }

    // Listener para el botón de Graticules (si existe)
    const toggleGraticulesBtn = document.getElementById('toggle-graticules-btn');
    if (toggleGraticulesBtn) {
        let graticulesVisible = true; // Estado inicial true ya que las gratículas están visibles por defecto
        toggleGraticulesBtn.innerHTML = '<i class="fas fa-border-none"></i> Hide Graticules'; // Estado inicial del botón
        
        toggleGraticulesBtn.addEventListener('click', () => {
            graticulesVisible = !graticulesVisible;
            if (myGlobe) {
                myGlobe.showGraticules(graticulesVisible);
                toggleGraticulesBtn.innerHTML = graticulesVisible
                    ? '<i class="fas fa-border-none"></i> Hide Graticules'
                    : '<i class="fas fa-border-all"></i> Show Graticules';
                console.log("Graticules visibility changed to:", graticulesVisible);
            }
        });
    } else {
        console.warn("toggleGraticulesBtn no encontrado.");
    }

    // Listener botón X Modal Formulario
    if (closeModalBtn) { closeModalBtn.addEventListener('click', closeModal); }
    else { console.warn("closeButton (modal form) no encontrado."); }

    // Listener clic fuera Modal Formulario
    if (formModal) { formModal.addEventListener('click', (event) => { if (event.target === formModal) closeModal(); }); }
    else { console.warn("formModal no encontrado."); }

    // Listeners para los radio buttons de vista (incluye 'grid')
    globeModeRadios.forEach(radio => {
        if (radio) {
            radio.addEventListener('change', (event) => {
                const newMode = event.target.value;
                if (event.target.checked && newMode !== currentGlobeMode) {
                    updateGlobeTexture(newMode); // Llama a la función actualizada
                }
            });
        } else { console.warn("Uno de los radio buttons de vista no fue encontrado."); }
    });

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

    // --- Event Listeners para controles de filtrado y conexiones ---
    // Event Listeners para los checkboxes de filtro
    document.querySelectorAll('input[name="actorFilter"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const actorType = this.value;
            console.log(`Filtro ${actorType} cambiado a ${this.checked}`);
            
            if (this.checked) {
                activeFilters.add(actorType);
            } else {
                activeFilters.delete(actorType);
            }
            
            console.log('Filtros activos:', Array.from(activeFilters));
            
            fetch('data/cardano-actors.json')
                .then(res => res.json())
                .then(data => {
                    updateVisiblePoints(data);
                    console.log(`Datos filtrados actualizados. Mostrando ${activeFilters.size} tipos de actores.`);
                })
                .catch(error => console.error('Error al cargar datos para filtrado:', error));
        });
    });

    // Listener para el selector de tipo de conexión
    const connectionTypeSelect = document.getElementById('connection-type');
    
    if (connectionTypeSelect && connectionOptions) {
        // Asegurar que el valor inicial sea 'none'
        connectionTypeSelect.value = 'none';
        connectionSettings.type = 'none';
        // Ocultar las opciones inicialmente
        connectionOptions.style.display = 'none';
        
        connectionTypeSelect.addEventListener('change', function() {
            connectionSettings.type = this.value;
            connectionOptions.style.display = this.value === 'none' ? 'none' : 'block';
            
            if (this.value === 'none') {
                myGlobe.arcsData([]);
                currentConnections = [];
            } else {
                fetch('data/cardano-actors.json')
                    .then(res => res.json())
                    .then(data => {
                        updateVisiblePoints(data);
                        console.log('Conexiones actualizadas:', this.value);
                    });
            }
        });
    }

    // Listeners para las opciones de conexión
    const connectionColor = document.getElementById('connection-color');
    const connectionWidth = document.getElementById('connection-width');

    if (connectionColor) {
        // Establecer color inicial
        connectionColor.value = connectionSettings.color;
        
        connectionColor.addEventListener('input', function() {
            connectionSettings.color = this.value;
            console.log('Nuevo color de conexión:', this.value);
            
            // Actualizar el color de todas las conexiones existentes
            currentConnections.forEach(arc => arc.color = this.value);
            myGlobe.arcsData(currentConnections);
        });
    }

    if (connectionWidth) {
        // Establecer ancho inicial
        connectionWidth.value = connectionSettings.width;
        
        connectionWidth.addEventListener('input', function() {
            connectionSettings.width = parseFloat(this.value);
            console.log('Nuevo ancho de conexión:', this.value);
            myGlobe.arcStroke(connectionSettings.width);
        });
    }

    // Actualizar la versión en el panel About con el hash del commit
    fetch('https://api.github.com/repos/joseiadicicco/cardano-ecosystem-map/commits/main')
        .then(response => response.json())
        .then(data => {
            const versionInfo = document.querySelector('.version-info small');
            if (versionInfo) {
                const shortHash = data.sha.substring(0, 7);
                const commitDate = new Date(data.commit.author.date).toLocaleString();
                versionInfo.textContent = `Version: 1.0.0 (${shortHash}) - ${commitDate}`;
            }
        })
        .catch(console.error);

}); // <<< FIN DOMContentLoaded

