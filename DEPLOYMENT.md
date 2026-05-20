# SafeMind AI - Deployment Guide

This guide explains how to deploy the SafeMind AI application (frontend and backend) to production platforms like **Render**, **Vercel**, or **Railway**, and how to configure environment variables.

---

## 🏗️ Architecture Summary

SafeMind AI is built as a split fullstack application:
1. **Frontend (`/safemind-ai`)**: A Vite + React Single Page Application (SPA).
2. **Backend (`/server`)**: A Node.js + Express proxy server that handles API requests and communicates with the AI model.

---

## 📡 Environmental Variables

### Backend (`/server`)

Create a `.env` file locally or set these variables in your hosting provider's dashboard:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | The port the Express server will listen on. | `5001` (Render/Railway set this dynamically) |
| `GEMINI_API_KEY` | Optional. Google Gen AI API key to enable production cloud AI. | (e.g. `AIzaSy...`) |
| `AI_MODEL` | The name of the AI model to query. | Defaults to `gemma-4-31b-it` (if GEMINI_API_KEY is set) or `gemma3` (local mode) |
| `OLLAMA_API_URL` | Used in local mode. The endpoint URL of local Ollama API. | `http://localhost:11434/api/generate` |

### Frontend (`/safemind-ai`)

Create a `.env` file locally or set these variables in your static hosting dashboard (Vite prefixes require `VITE_`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | The URL of your deployed Express backend. | `http://localhost:5001` |

---

## 🚀 Step-by-Step Deployment Instructions

### Option 1: Deploying to Render (Recommended)

#### Step 1: Deploy the Backend (Express Service)
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Under **Advanced**, add the environment variables:
   - `OLLAMA_API_URL` (e.g. your hosted Ollama service URL or an alternative cloud endpoint)
   - `AI_MODEL` (e.g. `gemma3`)
5. Deploy the service and copy the provided URL (e.g., `https://safemind-backend.onrender.com`).

#### Step 2: Deploy the Frontend (Static Site)
1. Click **New > Static Site**.
2. Connect the same Git repository.
3. Configure the static site settings:
   - **Root Directory**: `safemind-ai`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Under **Advanced**, add the environment variable:
   - `VITE_API_URL`: `https://safemind-backend.onrender.com` (using your backend URL from Step 1)
5. Deploy the site.

---

### Option 2: Deploying to Vercel (Frontend) & Railway (Backend)

#### Step 1: Deploy Frontend to Vercel
1. Install Vercel CLI or import the project via [Vercel Dashboard](https://vercel.com).
2. Set the Root Directory to `safemind-ai`.
3. In Environment Variables, set `VITE_API_URL` to your production backend URL.
4. Deploy the site.

#### Step 2: Deploy Backend to Railway
1. Create a new project on [Railway](https://railway.app).
2. Connect your repository and select the `server` folder.
3. Set the variables `OLLAMA_API_URL` and `AI_MODEL` in the variables tab.
4. Railway will automatically detect the Node environment and start the server using your `npm start` script.

---

## 🤖 Production AI Considerations

The application supports a dual mode system:
- **Local Development**: Uses local **Ollama** running `gemma3` on port `11434`.
- **Production Deployment**: Natively integrates the **Google Gen AI SDK** (`@google/genai`).

To run the application in production:
1. **Google Gen AI (Cloud Mode - Recommended)**:
   - Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
   - Add the environment variable `GEMINI_API_KEY` to your cloud provider (e.g. Render/Railway).
   - Optional: Set `AI_MODEL` to your preferred model (defaults to `gemma-4-31b-it`).
   - The server will automatically detect the key, bypass local Ollama, and route all requests through the Google Gen AI API using Gemma 4.

2. **Self-Hosted Ollama**:
   - Host Ollama on a cloud instance with a GPU.
   - Do NOT set `GEMINI_API_KEY`.
   - Set the `OLLAMA_API_URL` to your remote Ollama endpoint.

