# 🧮 AI Handwritten Math Solver

**Scan handwritten math equations and get instant step-by-step solutions!**

Built with React Native (Expo) + Flask + AI Vision APIs

---

## 📁 Project Structure

```
Ai math solver/
├── backend/          # Flask API server
│   ├── app.py        # Main server
│   ├── gemini_handler.py  # AI vision processing
│   └── math_solver.py     # SymPy equation solver
└── frontend/         # React Native app
    ├── App.js
    └── src/
        ├── screens/  # Home, Camera, Result screens
        └── services/ # API client
```

---

## 🚀 Part 1: Deploy the Backend (Render)

### Step 1: Get Your Free AI API Key

You need an API key for the AI to read handwritten equations.

**Option A: OpenRouter (Recommended - Better free tier)**
1. Go to https://openrouter.ai/
2. Sign in with Google/GitHub
3. Go to https://openrouter.ai/keys
4. Click "Create Key" and copy it

**Option B: Google Gemini**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

---

### Step 2: Deploy to Render

1. **Create a Render account** at https://render.com (free)

2. **Connect your GitHub repo**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub account
   - Select this repository

3. **Configure the service**
   - **Name:** `ai-math-solver-backend` (or anything you like)
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add these variables:
     ```
     OPENROUTER_API_KEY = your_openrouter_key_here
     GEMINI_API_KEY = your_gemini_key_here (optional)
     ```

5. **Deploy!**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Copy your URL (e.g., `https://your-app.onrender.com`)

6. **Test it works**
   - Visit `https://your-app.onrender.com/health`
   - You should see: `{"status": "healthy"}`

---

## 📱 Part 2: Build the Android APK

### Step 1: Install Prerequisites

1. **Install Node.js** from https://nodejs.org/

2. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

3. **Create Expo account** at https://expo.dev/signup

4. **Login to EAS**
   ```bash
   eas login
   ```

---

### Step 2: Update API URL

Open `frontend/src/services/api.js` and update the URL to your Render backend:

```javascript
const API_BASE_URL = 'https://YOUR-APP-NAME.onrender.com';
```

---

### Step 3: Build the APK

1. **Navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the APK**
   ```bash
   eas build -p android --profile preview
   ```

4. **Wait for the build** (takes 10-15 minutes)
   - You'll get a link to track progress
   - Once done, download the APK from Expo dashboard

---

## 🎉 You're Done!

Install the APK on your Android phone and start solving math equations!

---

## 🛠️ Local Development (Optional)

### Run Backend Locally
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Run Frontend Locally
```bash
cd frontend
npm install
npx expo start
```

---

## 📝 Features

- 📷 Scan handwritten equations with camera
- 🖼️ Pick images from gallery
- ⌨️ Type equations manually
- 📊 Step-by-step solutions
- 💡 Detailed explanations
- 🚀 Powered by AI vision (OpenRouter/Gemini)

---

## 👥 Credits

**crafted by Umesh & Vijay**

© 2026 U&V Labs. All rights reserved.

---

## ❓ Troubleshooting

**Backend returns 429 error?**
- Your API quota is exhausted. Wait a bit or get a new API key.

**App shows "Failed to process image"?**
- Check if backend URL is correct in `api.js`
- Check Render logs for errors
- Ensure API key is set in Render environment

**Build fails with icon error?**
- Run `node create-assets.js` in frontend folder
- Make sure icon files are valid PNGs

---

Happy Solving! 🎓
