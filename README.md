# AI Handwritten Math Solver 📱

> Snap a pic of your math homework, get step-by-step solutions in seconds. Built for students who'd rather understand than suffer.

![Version](https://img.shields.io/badge/version-2.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Security](https://img.shields.io/badge/security-hardened-success)

---

## ⚡ What's This?

Ever stared at a math problem thinking "what even is this?" — Yeah, we've been there. That's why we built this.

**Just:**
1. 📸 Take a photo of any handwritten equation
2. 🧠 AI reads & solves it (even if your handwriting is trash)
3. ✨ Get the answer + step-by-step breakdown

No more googling random math problems. No more crying over calculus.

---

## 🔥 Features That Slap

| Feature | What It Does |
|---------|--------------|
| 🤖 **AI Vision** | Reads handwriting (even doctor-level scribbles) |
| 📊 **Graph Plotter** | Plot functions offline — no internet needed |
| 🎓 **Grade-Based Explanations** | Get answers explained for 8th, 10th, or 12th grade level |
| 📁 **Auto-Organize History** | Past problems sorted by topic automatically |
| ⚠️ **Trap Detector** | Warns you about common mistakes before you make them |
| 🖼️ **Blackboard Export** | Save solutions as aesthetic images for notes/socials |
| ⚡ **Offline Ready** | Works without internet after first load |
| 🔒 **Security Hardened** | Rate limiting + input validation (OWASP approved) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Expo Go app (for testing on phone)

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file with your API keys
echo "OPENROUTER_API_KEY=your_key_here" > .env
echo "GEMINI_API_KEY=your_gemini_key" >> .env

# Run it
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install

# Start dev server
npx expo start
```

Scan the QR code with Expo Go. That's it. You're in.

---

## 🔐 Security

This ain't your average student project. We actually thought about security:

- **Rate Limiting** — 10-15 requests/min per user (no API abuse)
- **Input Validation** — Schema-based, SQL/XSS patterns blocked
- **Secure API Keys** — Environment variables only, never exposed to client
- **OWASP Best Practices** — Followed the playbook

---

## 🏗️ Project Structure

```
├── backend/
│   ├── app.py              # Flask API (security hardened)
│   ├── math_solver.py      # SymPy-powered equation solver
│   ├── gemini_handler.py   # Multi-provider AI (Qwen, Gemma, Gemini)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── screens/        # HomeScreen, ResultScreen, GraphScreen, etc.
│   │   ├── components/     # GlassButton, ChalkAnimation, TrapAlertCard...
│   │   ├── services/       # API calls, history storage
│   │   └── styles/         # Theme config
│   └── App.js
```

---

## 🌐 Deploy

### Backend (Render)
1. Push to GitHub
2. Connect repo to [Render](https://render.com)
3. Set environment variables (API keys)
4. Deploy 🚀

### Frontend (Expo/EAS)
```bash
eas build -p android --profile preview
```

---

## 📱 APK Download

Check the [Releases](https://github.com/not-umesh/AI_HandWritten_Math_Solver_fullstack/releases) tab for the latest APK.

---

## 🤝 Contributing

Found a bug? Got an idea? PRs welcome.

```bash
git checkout -b feature/your-feature
# make your changes
git commit -m "added something cool"
git push origin feature/your-feature
```

---

## 📄 License

MIT — do whatever you want with it.

---

<p align="center">
  <code>{ built_with_caffeine: true }</code><br>
  <b>UV</b> — Umesh & Vijay • 2026
</p>
