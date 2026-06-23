# ⚡ ATSBoost — AI Resume Optimizer

> Beat the ATS. Land the interview.

An AI-powered resume optimizer that rewrites your resume to maximize ATS (Applicant Tracking System) match scores — without fabricating a single word.

[![Deploy Frontend to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Anonymoz53/Atsbooster-&root=frontend&env=VITE_API_URL&envDescription=URL%20of%20your%20deployed%20backend%20API)
&nbsp;&nbsp;
[![Deploy Backend to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Anonymoz53/Atsbooster-)

---

## 🌐 Live Demo
> Coming soon — deploy your own using the buttons above!

---

## ✨ Features

- 📄 **Upload PDF or DOCX** resume
- 🤖 **AI-powered rewrite** using Groq LLM — never fabricates experience
- 📊 **ATS Score** before & after (0–100 with grade A–F)
- 🔍 **Keyword analysis** — what was added, what's still missing
- 📋 **Changes explained** — per-section change log
- 📥 **PDF download** — clean, ATS-safe formatting
- ↔️ **Side-by-side comparison** view
- 🔒 **Freemium gate** — 3 free uses, then ₹500/resume
- 🎓 **ATS education** — how ATS works, platform guides, dos & don'ts

---

## 🚀 Deploy Your Own (Free)

### Step 1 — Deploy the Backend (Render)

1. Go to **[render.com](https://render.com)** and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your **`Atsbooster-`** repository
4. Use these settings:

   | Field | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

5. Add this **Environment Variable**:
   ```
   GROQ_API_KEY = your_groq_api_key_here
   ```
   Get a free key at [console.groq.com](https://console.groq.com)

6. Click **"Create Web Service"** and wait ~3 minutes
7. Copy your backend URL — it looks like: `https://atsbooster-xxxx.onrender.com`

---

### Step 2 — Deploy the Frontend (Vercel)

1. Go to **[vercel.com](https://vercel.com)** and sign up with GitHub
2. Click **"Add New Project"** → import **`Atsbooster-`**
3. Set **Root Directory** to `frontend`
4. Add this **Environment Variable**:
   ```
   VITE_API_URL = https://atsbooster-xxxx.onrender.com
   ```
   (paste your Render URL from Step 1)
5. Click **"Deploy"**
6. Your app is live at `https://atsbooster.vercel.app` 🎉

---

### Step 3 — Enable Auto-Deploy via GitHub Actions

After deploying, add these **GitHub Secrets** (Settings → Secrets → Actions):

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel → Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | Vercel → Your Project → Settings → General → Project ID |
| `VITE_API_URL` | Your Render backend URL |
| `RENDER_API_KEY` | Render → Account Settings → API Keys |
| `RENDER_SERVICE_ID` | Render → Your Service → URL (last part after `/services/`) |

Once added, **every push to `main` automatically deploys** both frontend and backend. ✅

---

## 💻 Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Anonymoz53/Atsbooster-.git
cd Atsbooster-

# 2. Backend setup
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
uvicorn main:app --reload --port 8000

# 3. Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env   # already set to localhost:8000
npm run dev
```

Open **http://localhost:5173** 🚀

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Vanilla CSS |
| Backend | Python + FastAPI |
| AI / LLM | Groq API (llama-3.3-70b) |
| File Parsing | pdfplumber + python-docx |
| PDF Export | ReportLab |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
Atsbooster-/
├── .github/workflows/        # Auto-deploy on push
│   ├── deploy-frontend.yml   # → Vercel
│   └── deploy-backend.yml    # → Render
├── frontend/                 # React + Vite
│   └── src/
│       ├── pages/            # Landing, Optimize, Results
│       ├── components/       # Navbar, FileUploader, ATSScoreCard, etc.
│       └── lib/              # api.js, usage.js
├── backend/                  # FastAPI
│   ├── main.py
│   ├── routers/              # optimize.py, export.py
│   └── services/             # llm_service.py, file_parser.py, ats_scorer.py, pdf_exporter.py
├── render.yaml               # Render deployment config
└── README.md
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
GROQ_API_KEY=your_groq_api_key_here
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## ⚠️ Free Tier Notes

- **Render free tier** spins down after 15 min of inactivity — first request takes ~30 seconds to wake up
- **Vercel free tier** has generous limits — more than enough for personal use
- Both platforms auto-redeploy whenever you push to GitHub

---

## 📜 License
MIT — free to use, modify, and deploy.
