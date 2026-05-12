// ==========================================
// SafeMind AI Backend Server
// ==========================================
// This server acts as a bridge between the 
// SafeMind AI frontend dashboard and the local 
// Gemma 3 AI model running via Ollama.
// ==========================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Initialize the Express application
const app = express();

// Define the port for our backend server
const PORT = 54321;

// Ollama API configuration
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// ==========================================
// Middleware Configuration
// ==========================================

// Enable Cross-Origin Resource Sharing (CORS)
// This allows our frontend (usually running on a different port like 5173) 
// to securely communicate with this backend server.
app.use(cors());

// Enable parsing of JSON request bodies
// This allows us to read req.body in our endpoints when the frontend sends JSON.
app.use(express.json());

// ==========================================
// API Endpoints
// ==========================================

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'SafeMind AI Backend is running successfully!' });
});

/**
 * POST /chat
 * 
 * This endpoint receives a prompt from the frontend, sends it to the 
 * local Ollama instance running the Gemma 3 model, and returns the response.
 * 
 * Expected Request Body:
 * {
 *   "prompt": "user message"
 * }
 * 
 * Expected Response Format:
 * {
 *   "reply": "AI response"
 * }
 */
app.post('/chat', async (req, res) => {
  try {
    // Extract the user prompt from the request body
    const { prompt } = req.body;

    // Validate that a prompt was provided
    if (!prompt) {
      console.log('⚠️ Error: Empty prompt received from frontend.');
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`\n📩 Received prompt: "${prompt}"`);
    console.log('⏳ Processing request with Ollama (gemma3)...');

    // Make a POST request to the local Ollama API
    // We add strict instructions to the prompt to force Gemma 3 to be concise.
    const concisePrompt = `You are a fast emergency and operations assistant. Provide a VERY brief and concise response. Maximum 3 sentences or short bullet points. Do not write long paragraphs.

User: ${prompt}`;

    const response = await axios.post(OLLAMA_URL, {
      model: 'gemma3',
      prompt: concisePrompt,
      stream: false // We want the full response at once, not streamed
    });

    // Extract the text response from Ollama's data
    const aiResponseText = response.data.response;

    console.log('✅ Successfully generated AI response.');

    // Return the response to the frontend in the specified format
    return res.json({
      reply: aiResponseText
    });

  } catch (error) {
    // Proper error handling
    console.error('\n❌ Error communicating with Ollama:');
    
    // Provide beginner-friendly error messages based on the type of failure
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused! Ensure Ollama is installed and running.');
      return res.status(503).json({ 
        error: 'Cannot connect to Ollama. Is it running?', 
        reply: "Error: Ollama service is unavailable. Please ensure it is running locally."
      });
    }

    // Log the actual error message for debugging purposes
    console.error(error.message);
    
    // Return a generic 500 Internal Server Error to the frontend
    res.status(500).json({ 
      error: 'An internal server error occurred.',
      reply: "Sorry, I encountered an error while processing your request."
    });
  }
});

// ==========================================
// Start the Server
// ==========================================
app.listen(PORT, () => {
  console.log('\n=============================================');
  console.log(`🚀 SafeMind AI Backend is running!`);
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🧠 Connected to Ollama at: ${OLLAMA_URL}`);
  console.log('=============================================\n');
});
