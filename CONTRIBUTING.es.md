[Read this document in English](CONTRIBUTING.md)

---

# Cómo Contribuir al Mapa del Ecosistema Cardano

¡Gracias por tu interés en contribuir a este mapa! A continuación, se detallan los pasos para proponer la adición o modificación de actores del ecosistema.

## Proceso de Contribución (Vía Pull Requests)

Utilizamos Pull Requests (PRs) de GitHub para gestionar las contribuciones. El flujo básico es:

1.  **Fork:** Haz un "Fork" de este repositorio a tu propia cuenta de GitHub.
2.  **Branch:** Crea una nueva "Branch" (rama) en tu fork con un nombre descriptivo (ej. `add-project-xyz` o `update-ambassador-abc`).
3.  **Edita:** Modifica el archivo `data/cardano-actors.json` en tu rama:
    * **Añadir:** Agrega un nuevo objeto JSON al final de la lista (antes del `]` final), asegurándote de mantener la sintaxis JSON correcta (comas entre objetos, etc.).
    * **Modificar:** Encuentra el objeto existente que deseas cambiar y actualiza sus valores.
4.  **Commit:** Guarda tus cambios con un mensaje claro (ej. "feat: Add Project XYZ to map").
5.  **Pull Request (PR):** Abre un Pull Request desde tu rama hacia la rama `main` de este repositorio original. En la descripción del PR, explica brevemente qué añadiste o modificaste y proporciona enlaces o referencias si es posible para verificar la información.

## Formato de Datos (`data/cardano-actors.json`)

Cada actor en el archivo `data/cardano-actors.json` es un objeto JSON con los siguientes campos:

* `lat` (Número): Latitud geográfica. (Obligatorio)
* `lng` (Número): Longitud geográfica. (Obligatorio)
    * *Puedes obtener coordenadas aproximadas usando Google Maps (haz clic derecho en un punto -> "¿Qué hay aquí?").*
* `name` (Texto): Nombre del actor (persona, proyecto, hub, etc.). (Obligatorio)
* `type` (Texto): Categoría del actor. Valores válidos actuales: `Founder`, `Hub`, `University`, `Project`, `Ambassador`. (Esta lista puede crecer). (Obligatorio)
* `city` (Texto): Ciudad principal de ubicación. (Obligatorio)
* `country` (Texto): País de ubicación. (Obligatorio)
* `description` (Texto): Descripción breve (1-2 frases)... (Obligatorio)
* `twitter` (Texto): El nombre de usuario de Twitter del actor (**sin** la '@' inicial). (Opcional)
* `website` (Texto): La URL del sitio web principal del actor (incluyendo `https://` o `http://`). (Opcional)
* `relationship_codes` (Array de números/textos): Lista de códigos que representan grupos o conexiones a los que pertenece este actor (para visualización futura). (Opcional)
* `imageUrl` (Texto): URL de la imagen del actor. Se recomienda usar formato WebP para mejor rendimiento. La imagen debe ser de buena calidad y proporción 16:9. Tamaño recomendado: 800x450px. (Opcional)
    * Para imágenes de personas: Foto de perfil profesional
    * Para hubs/proyectos: Logo o imagen representativa
    * Para universidades: Logo o campus principal

**Importante:** 
- Asegúrate de que el archivo `cardano-actors.json` completo siga siendo un JSON válido después de tus cambios.
- Las imágenes deben estar alojadas en un servicio confiable y estable (por ejemplo, GitHub, CDNs públicos).
- El formato WebP es preferido por su mejor compresión y calidad. Herramientas como [Squoosh](https://squoosh.app/) pueden ayudarte a convertir y optimizar imágenes.

## Revisión

Un mantenedor del repositorio revisará tu Pull Request. Puede que te pidan cambios o aclaraciones. Una vez aprobado, tu contribución será fusionada y aparecerá en el mapa poco después.

¡Gracias de nuevo por ayudar a mantener este recurso actualizado!