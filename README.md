# ATSBoost — AI Resume Optimizer

> Beat the ATS. Land the interview.

A full-stack resume optimization tool that rewrites your resume using AI to maximize ATS (Applicant Tracking System) match scores.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Vanilla CSS |
| Backend | Python + FastAPI |
| LLM | Groq API (llama-3.3-70b-versatile) |
| PDF Parsing | pdfplumber + python-docx |
| PDF Export | ReportLab |

---

## Setup & Running

### 1. Get a Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Copy it

### 2. Configure the Backend

Open `backend/.env` and add your key:

```
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

---

## Features

- ✅ **Upload PDF or DOCX** resume
- ✅ **AI-powered rewrite** (Groq LLM) — never fabricates experience
- ✅ **ATS score** before & after (0–100 with grade)
- ✅ **Breakdown**: keyword match, section structure, formatting, length
- ✅ **Changes explained** — per-section change log with types
- ✅ **Keyword analysis** — what was added, what's still missing
- ✅ **PDF download** — ATS-safe clean PDF
- ✅ **Side-by-side comparison** view
- ✅ **Freemium gate** — 3 free uses, then ₹500/resume
- ✅ **ATS education** — how ATS works, platform quirks, dos & don'ts
- ✅ **9 ATS platforms** supported (Workday, Greenhouse, Taleo, iCIMS, Lever, etc.)

---

## Project Structure

```
resume-optimizer/
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/     # Landing, Optimize, Results
│       ├── components/# Navbar, FileUploader, ATSScoreCard, etc.
│       └── lib/       # api.js, usage.js
├── backend/           # FastAPI
│   ├── main.py
│   ├── routers/       # optimize.py, export.py
│   └── services/      # llm_service.py, file_parser.py, ats_scorer.py, pdf_exporter.py
└── README.md
```

---

## Adding Ollama Later

When you're ready to add local Ollama support, update `backend/services/llm_service.py`:

```python
# Replace the Groq client with:
import httpx

def optimize_resume(resume_text, job_description, target_ats, model="llama3"):
    response = httpx.post("http://localhost:11434/api/generate", json={
        "model": model,
        "prompt": f"{SYSTEM_PROMPT}\n\n{user_prompt}",
        "stream": False,
    })
    ...
```

---

## Freemium Model

- First **3 optimizations are free** (tracked in browser localStorage)
- After 3 uses, the **₹500/resume paywall UI** appears
- Payment integration (Stripe/Razorpay) can be added to the PaywallModal component
