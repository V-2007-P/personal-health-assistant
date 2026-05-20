// ============================================
// SafeMind AI Backend Server
// ============================================
// This server connects the SafeMind AI frontend
// dashboard to the local Gemma 3 AI model
// running through Ollama.
//
// Tech Stack: Node.js + Express + Axios + CORS
// AI Engine:  Ollama (Gemma 3)
// Port:       5000
// ============================================

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

// ============================================
// Initialize Express App and AI Clients
// ============================================
const app = express();
const PORT = process.env.PORT || 5001;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Decide which model to use depending on local or cloud mode
const AI_MODEL = process.env.AI_MODEL || (GEMINI_API_KEY ? 'gemma-4-31b-it' : 'gemma3');

// Ollama API endpoint (runs locally)
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

// Initialize Google Gen AI client if API key is provided
let aiClient = null;
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = require('@google/genai');
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    console.error('❌ Failed to initialize Google Gen AI SDK:', err.message);
  }
}

// ============================================
// Middleware
// ============================================

// Enable CORS so frontend (port 5173) can talk to backend (port 5000)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ============================================
// Health Check Route
// ============================================
// GET /
// Quick check to see if the server is running
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SafeMind AI Backend is running',
    model: AI_MODEL,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Chat Endpoint
// ============================================
// POST /chat
//
// Request Body:
//   { "prompt": "user message" }
//
// Response:
//   { "reply": "AI response text" }
//
// This endpoint receives the user's message,
// sends it to the local Ollama Gemma 3 model,
// and returns the AI's response.
// ============================================
app.post('/chat', async (req, res) => {
  try {
    // Step 1: Extract the prompt from the request body
    const { prompt } = req.body;

    // Step 2: Validate that a prompt was provided
    if (!prompt || prompt.trim() === '') {
      console.log('❌ Error: Empty prompt received');
      return res.status(400).json({
        error: 'Prompt is required. Please send a message.'
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📩 New message received:');
    console.log(`   "${prompt}"`);

    let aiReply = '';

    if (aiClient) {
      console.log(`⏳ Sending to Google Gen AI (${AI_MODEL})...`);
      const response = await aiClient.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
      });
      aiReply = response.text;
    } else {
      console.log(`⏳ Sending to local Ollama (${AI_MODEL})...`);
      // Send the prompt to Ollama's local API
      const ollamaResponse = await axios.post(OLLAMA_API_URL, {
        model: AI_MODEL,
        prompt: prompt,
        stream: false
      }, {
        // Increased timeout to 5 minutes for slower local machines/first runs
        timeout: 300000 
      });
      aiReply = ollamaResponse.data.response;
    }

    console.log('✅ AI responded successfully');
    console.log(`   Response length: ${aiReply.length} characters`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Step 5: Send clean JSON response back to the frontend
    return res.json({
      reply: aiReply
    });

  } catch (error) {
    // ==========================================
    // Error Handling
    // ==========================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ Error occurred:');

    // Check for timeout (very common with local LLMs)
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('   Request timed out (local model taking too long).');
      return res.status(504).json({
        error: 'AI model took too long to respond. This is common on first run or slower hardware.',
        fix: 'Please try again in a moment.'
      });
    }

    // Check if Ollama is not running
    if (error.code === 'ECONNREFUSED') {
      console.log('   Ollama is not running!');
      console.log('   Start it with: ollama serve');
      return res.status(503).json({
        error: 'Ollama is not running. Please start Ollama first.',
        fix: 'Run "ollama serve" in a separate terminal.'
      });
    }

    // Check if the model is not found
    if (error.response && error.response.status === 404) {
      console.log(`   Model "${AI_MODEL}" not found!`);
      console.log(`   Pull it with: ollama pull ${AI_MODEL}`);
      return res.status(404).json({
        error: `Model "${AI_MODEL}" is not installed.`,
        fix: `Run "ollama pull ${AI_MODEL}" in your terminal.`
      });
    }

    // Generic error
    console.log(`   ${error.message}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
      details: error.message
    });
  }
});

// ============================================
// Start the Server
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🛡️  SafeMind AI Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  🚀 Server:  http://localhost:${PORT}`);
  console.log(`  🤖 Mode:    ${GEMINI_API_KEY ? 'Google Gen AI (Cloud)' : 'Ollama (Local)'}`);
  console.log(`  🤖 Model:   ${AI_MODEL}`);
  if (!GEMINI_API_KEY) {
    console.log(`  📡 Ollama:  ${OLLAMA_API_URL}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Waiting for messages...');
  console.log('');
});
