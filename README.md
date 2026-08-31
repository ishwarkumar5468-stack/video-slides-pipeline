# Video Slides Pipeline

A full-stack kinetic video slides application with AI prompt deconstruction, procedural 60 FPS scene animations (Rain & Window, Cyberpunk Car, Deep Space Astronaut, Matrix Hacker, Sunset), stock video background streaming, speech synthesis, and client-side 1080p/4K video export.

---

## 🚀 How to Export to GitHub from Google AI Studio

1. In Google AI Studio Build, click on the **Settings (Gear icon / Menu)** in the upper right.
2. Select **Export to GitHub** (or **Download ZIP** if you want to push manually).
3. Connect your GitHub account and choose the repository name to export the entire project.

---

## 📦 Deploying Your GitHub Repository

Because this application uses an **Express.js backend server (`server.js`)** to handle AI APIs, video sourcing, and static files, it should be deployed to a Node.js web service provider:

### Option 1: Deploy to Render (Recommended - Free / Easy)
1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your exported GitHub repository.
3. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables (optional, if you have keys):
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `PEXELS_API_KEY`: (Optional) Free Pexels Stock Video API Key
5. Click **Deploy Web Service**.

### Option 2: Deploy to Railway
1. Go to [railway.app](https://railway.app) and click **New Project** → **Deploy from GitHub Repo**.
2. Select your repository. Railway automatically detects `package.json` and starts `node server.js`.
3. Under **Variables**, add `PORT=3000` (or Railway's `$PORT`) and `GEMINI_API_KEY`.

### Option 3: Run Locally with Node.js
1. Clone your repo:
   ```bash
   git clone https://github.com/your-username/video-slides-pipeline.git
   cd video-slides-pipeline
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

> **Note regarding GitHub Pages**: GitHub Pages only hosts static HTML/CSS files and cannot run the Node.js Express server (`server.js`). For hosting live online, use **Render**, **Railway**, **Fly.io**, or **Cloud Run**.

