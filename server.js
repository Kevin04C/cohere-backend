const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configuración de Cohere
const COHERE_API_KEY = 'C1XZK7NT6NxW01cA87zgSy20ntXUGovei7es87ET'; // Pon tu clave de API de Cohere
const API_URL = 'https://api.cohere.ai/generate';

const app = express();
app.use(bodyParser.json());
app.use(cors())

// Función para hacer la solicitud a Cohere y obtener la recomendación
async function obtenerRecomendacion(emotion, hobbies, respuestas) {
  const prompt = `
    Genera una recomendación personalizada basada en la emoción, los hobbies y las respuestas del usuario, (Que la recomendacion no exeda las 295 letras)::
    Emoción: ${emotion}
    Hobbies: ${hobbies.join(', ')}
    Respuestas: ${respuestas.join(' | ')}

    Proporcióname una recomendación personalizada para este usuario.
  `;

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'command-xlarge-nightly',  // Usa el modelo correcto
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
        },
      }
    );

    console.log("Respuesta completa de Cohere:", response.data); // Verificar la respuesta

    if (response.data && response.data.text) {
      return response.data.text; // Acceder al campo correcto en la respuesta
    } else {
      console.error("No se encontró el campo 'text' en la respuesta de Cohere.");
      throw new Error('No se pudo obtener la recomendación.');
    }
  } catch (error) {
    console.error('Error al obtener la recomendación:', error);
    throw new Error('No se pudo obtener la recomendación.');
  }
}

app.get("/", (req, res) => {
  res.send({ message: "ok" })
})

// Endpoint que recibe los datos de la emoción, hobbies y respuestas
app.post('/generar-recomendacion', async (req, res) => {
  const { emotion, hobbies, respuestas } = req.body;

  try {
    const recomendacion = await obtenerRecomendacion(emotion, hobbies, respuestas);
    res.json({ recomendacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar la recomendación' });
  }
});

// Iniciar servidor
app.listen(5758, () => {
  console.log('Servidor corriendo en http://localhost:5758');
});
