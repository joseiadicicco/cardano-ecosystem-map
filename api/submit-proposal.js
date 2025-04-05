// api/submit-proposal.js

// Usamos la sintaxis 'export default' común en entornos serverless modernos como Vercel
export default async function handler(request, response) {
    // 1. Verificar que la petición sea POST (el método que usará nuestro formulario)
    if (request.method !== 'POST') {
      // Si no es POST, respondemos con error 405 Method Not Allowed
      response.setHeader('Allow', ['POST']);
      return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
    }
  
    // 2. Leer el PAT de GitHub desde las Variables de Entorno (configuradas en Vercel)
    const githubPAT = process.env.GITHUB_PAT;
    if (!githubPAT) {
      // Si la variable no está configurada en Vercel, devolvemos un error interno
      console.error('Error: GITHUB_PAT environment variable not set.');
      return response.status(500).json({ message: 'Server configuration error.' });
    }
  
    // 3. Obtener los datos del formulario enviados desde el frontend
    // Vercel parsea automáticamente el cuerpo (body) si el Content-Type es application/json
    const formData = request.body;
  
    // 4. Validar mínimamente los datos recibidos (podríamos añadir más validaciones)
    if (!formData || !formData.name || !formData.type || !formData.lat || !formData.lng) {
       console.error('Error: Missing required data fields in request body.', formData);
       return response.status(400).json({ message: 'Bad Request: Missing required form data.' });
    }
  
    // 5. Preparar la llamada a la API de GitHub para disparar el 'repository_dispatch'
    const owner = 'joseiadicicco'; // Tu usuario de GitHub
    const repo = 'cardano-ecosystem-map'; // Tu repositorio
    const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
    const eventType = 'new-actor-proposal'; // ¡Debe coincidir con el 'type' en create-issue.yml!
  
    // El cuerpo (payload) que enviaremos a la API de GitHub
    const dispatchPayload = {
      event_type: eventType,
      client_payload: formData // Enviamos todos los datos del formulario dentro de client_payload
    };
  
    // 6. Realizar la llamada (fetch) a la API de GitHub desde el servidor de Vercel
    console.log(`Sending dispatch event '${eventType}' to ${githubApiUrl}`);
    try {
      const githubResponse = await fetch(githubApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubPAT}`, // ¡Usamos el PAT leído del entorno!
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Serverless-Function' // Buena práctica incluir User-Agent
        },
        body: JSON.stringify(dispatchPayload), // El cuerpo debe ser un string JSON
      });
  
      // 7. Comprobar la respuesta de la API de GitHub
      // La API de dispatches devuelve 204 No Content si tuvo éxito en *aceptar* el evento
      if (githubResponse.status === 204) {
        console.log('Successfully triggered repository_dispatch event.');
        // Respondemos al frontend indicando éxito (202 Accepted está bien aquí)
        return response.status(202).json({ message: 'Proposal submitted successfully and is being processed.' });
      } else {
        // Si GitHub dio un error, lo registramos y respondemos al frontend
        const errorBody = await githubResponse.text();
        console.error(`Error triggering GitHub dispatch: ${githubResponse.status} ${githubResponse.statusText}`, errorBody);
        return response.status(githubResponse.status).json({ message: `Error triggering GitHub workflow: ${githubResponse.statusText}` });
      }
    } catch (error) {
      // Si hubo un error en la comunicación con GitHub
      console.error('Error making fetch request to GitHub API:', error);
      return response.status(500).json({ message: 'Internal Server Error while contacting GitHub.' });
    }
  }