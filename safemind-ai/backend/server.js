// ==========================================
// SafeMind AI Backend Server
// ==========================================
// This server acts as a bridge between the 
// SafeMind AI frontend dashboard and the local 
// Gemma 3 AI model running via Ollama.
// ==========================================

import express from 'express';
import cors from 'cors';
import axios from 'axios';

// Initialize the Express application
const app = express();

// Define the port for our backend server
// Reverting to 5001 as per user's original "working" state
const PORT = 5001;

// Ollama API configuration
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// Middleware Configuration
app.use(cors());
app.use(express.json());

// API Endpoints

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'SafeMind AI Backend is running successfully!' });
});

/**
 * POST /chat
 */
app.post('/chat', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`📩 Received prompt: "${prompt.substring(0, 50)}..."`);
    console.log('⏳ Processing with Ollama (gemma3)...');

    const response = await axios.post(OLLAMA_URL, {
      model: 'gemma3',
      prompt: prompt, // Reverting to original prompt without extra instructions
      stream: false
    }, {
      timeout: 180000 // 3-minute timeout
    });

    const aiResponseText = response.data.response;
    console.log('✅ AI Response generated.');

    return res.json({
      reply: aiResponseText
    });

  } catch (error) {
    console.error('❌ Error communicating with Ollama:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        reply: "Error: Ollama service is unavailable. Please ensure it is running locally."
      });
    }

    res.status(500).json({ 
      reply: "Sorry, I encountered an error while processing your request."
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SafeMind AI Backend running on http://localhost:${PORT}`);
});
