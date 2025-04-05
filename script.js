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
});

console.log("script.js cargado."); // Mensaje para confirmar que el script se enlaza