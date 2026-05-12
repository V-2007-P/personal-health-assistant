# SafeMind AI Backend Integration

This is the backend server for the SafeMind AI dashboard. It connects the frontend to a local Gemma 3 AI model running via Ollama.

## Tech Stack
* Node.js
* Express.js
* Axios
* CORS

## Installation Instructions

1. Make sure you have Node.js installed on your system.
2. Open your terminal and navigate to this `backend` directory:
   ```bash
   cd /Users/vijayprasad/Documents/gamma/safemind-ai/backend
   ```
3. Install all the necessary dependencies by running:
   ```bash
   npm install
   ```
4. Make sure you have Ollama installed and the `gemma3` model downloaded:
   ```bash
   ollama pull gemma3
   ```
5. Ensure Ollama is running (it usually runs in the background).

## NPM Commands

### Start the Server
To start the server normally:
```bash
npm start
```

### Development Mode
To start the server in development mode (it will automatically restart when you make changes to `server.js`):
```bash
npm run dev
```

## API Details
The server runs on: `http://localhost:5000`

### `POST /chat`
Connects to the local Ollama API (`http://localhost:11434/api/generate`).

**Request Body:**
```json
{
  "prompt": "your message here"
}
```

**Response Body:**
```json
{
  "reply": "AI response text"
}
```
