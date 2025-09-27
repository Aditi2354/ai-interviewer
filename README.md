# AI Interviewer (Face-to-Face) — SDE Intern

A complete, testable AI interviewer that conducts a 5–7 question interview, records answers (voice or text), and generates an evaluation (Technical Knowledge, Problem Solving, Communication).

## Tech
- Frontend: Next.js 14 + TypeScript + Tailwind + Framer Motion (premium UI)
- Backend: Node.js + Express + OpenAI API (questioning, analysis, scoring)
- Media: getUserMedia (camera/mic) + (optional) browser speech APIs
- Storage: In-memory for demo (optional Supabase hook included – disabled by default)

---

## Quick Start

### 1) Prereqs
- Node 18+
- An OpenAI API key

### 2) Backend
```bash
cd backend
cp .env.example .env   # put your OPENAI_API_KEY here
npm install
npm run dev            # http://localhost:4000
```

### 3) Frontend
```bash
cd ../frontend
npm install
npm run dev            # http://localhost:3000
```

> Keep both servers running in two terminals.

### 4) Demo Flow
- Open http://localhost:3000
- Click **Start Interview**
- Allow Camera/Mic
- Answer ~6 questions (voice or text)
- See **evaluation** with scores & feedback
- (Optional) Download transcript JSON

---

## Environment

**backend/.env**
```
OPENAI_API_KEY=sk-...
PORT=4000
ALLOWED_ORIGIN=http://localhost:3000
```

**frontend/.env.local** (optional if using Supabase in your own fork)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

---

## Deploy
- Frontend: Vercel or Render static
- Backend: Render/Railway/Fly.io (remember to set CORS ALLOWED_ORIGIN)
- Add your `OPENAI_API_KEY` to backend environment

---

## Notes
- Voice input uses `webkitSpeechRecognition` when available, else text input fallback.
- Voice output uses `speechSynthesis` (browser TTS).
- For “face-to-face”, the candidate video is shown; AI speaks via TTS + avatar bubble.
- Replace the OpenAI model name in `backend/services/openaiService.js` if desired.
