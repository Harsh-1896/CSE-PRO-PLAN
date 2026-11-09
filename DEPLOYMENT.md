# 🚀 SMART-PRO Deployment Guide

Your project is configured as a **unified full-stack application**. The Express backend serves both the REST API (`/api`) and the compiled React production frontend (`/`), which makes deployment straightforward on any platform.

---

## 🌟 Option 1: Deploy to Render.com (Recommended & 100% Free)

**Render** is the easiest free cloud host for full-stack Node.js applications.

### Step 1: Push your code to GitHub
If you haven't initialized git yet, run in your terminal:
```bash
git init
git add .
git commit -m "Initial commit for SMART-PRO deployment"
```
Create a new repository on [GitHub](https://github.com/new) and push your code:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Create a Web Service on Render
1. Go to [Render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository.
4. Set the following configuration settings:
   - **Name**: `smart-pro-cse` (or any name you prefer)
   - **Region**: Closest to you (e.g., *Singapore / Frankfurt / Ohio*)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `node backend/server.js`
   - **Instance Type**: **Free**
5. Click **Create Web Service**.

Render will automatically install dependencies, build the Vite frontend, start the server, and give you a free permanent live URL like:
`https://smart-pro-cse.onrender.com`

---

## ⚡ Option 2: Deploy to Railway.app

1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. Railway will automatically run `npm run build` and `npm start`.
5. Under **Settings** → **Networking**, click **Generate Domain** to get your public HTTPS URL.

---

## 🌐 Option 3: Instant Public Demo (No Account Required)

If you need to show the website to professors, evaluators, or classmates **immediately** on their phones or laptops without pushing to GitHub:

1. Keep your project running locally.
2. Open a new terminal in your project folder and run:
   ```bash
   npx ngrok http 5000
   ```
3. Copy the public link provided by ngrok (e.g., `https://xxxx-xx-xx.ngrok-free.app`). Anyone in the world can open that link and test the live website!

---

## ⚙️ Environment Variables (Optional)

If running in production, you can customize these in Render/Railway dashboard:
- `PORT`: (Auto-assigned by cloud provider, defaults to 5000 locally)
- `NODE_ENV`: `production`

