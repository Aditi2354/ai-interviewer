import express from 'express';
import { chatCompletion, SYSTEM_PRIME } from '../services/openaiService.js';
import { FALLBACK_QUESTIONS, evaluateHeuristic } from '../services/offlineEval.js';

const router = express.Router();
const sessions = new Map();

const TOTAL = 6; // total questions, including the intro-style first one
const USE_OFFLINE = (process.env.USE_OFFLINE || '').toLowerCase() === 'true';

function newSession() {
  return { id: Math.random().toString(36).slice(2), qa: [], done: false };
}

router.post('/start', async (_req, res) => {
  const s = newSession();
  sessions.set(s.id, s);

  // First question (intro style)
  const firstQ = "Hi, I'm your AI interviewer for the SDE Intern role. Let's begin. First question: Briefly introduce yourself and your most impactful project.";
  // We store a cleaner Q for transcript (without greeting) so evaluation looks nicer:
  s.qa.push({ q: "Introduce yourself and your most impactful project.", a: null });

  return res.json({ sessionId: s.id, question: firstQ });
});

router.post('/answer', async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (s.done) return res.json({ message: 'Interview already completed.' });

    // Save current answer
    const last = s.qa[s.qa.length - 1];
    if (last && last.a == null) last.a = String(answer ?? '').trim();

    // If answered TOTAL questions -> evaluate
    const answeredCount = s.qa.filter(x => x.a != null).length;
    if (answeredCount >= TOTAL) {
      // Build transcript
      const transcript = s.qa.map((x, i) => `Q${i + 1}: ${x.q}\nA${i + 1}: ${x.a ?? ''}`).join('\n\n');

      // Try online evaluation, else heuristic
      if (!USE_OFFLINE) {
        try {
          const evalPrompt = `Given the following SDE intern interview transcript, produce a strict JSON object:
{
  "scores": { "technical": <1-10>, "problem_solving": <1-10>, "communication": <1-10> },
  "summary": "<2-4 sentences performance summary>",
  "recommendation": "<Hire/Maybe/No-hire>"
}
Transcript:
${transcript}`;
          const evaluation = await chatCompletion([{ role: 'user', content: evalPrompt }], SYSTEM_PRIME);
          s.done = true;
          return res.json({ done: true, evaluation });
        } catch (e) {
          console.error('evaluation error:', e);
        }
      }
      // Heuristic fallback
      const evalObj = evaluateHeuristic(s.qa);
      s.done = true;
      return res.json({ done: true, evaluation: JSON.stringify(evalObj) });
    }

    // Otherwise, ask next question
    const nextIndex = s.qa.length + 1; // human-friendly 1..N for display
    let question = '';

    // Try online generation only if not offline
    if (!USE_OFFLINE) {
      try {
        const context = s.qa.map((x, i) => ({
          role: 'user',
          content: `Q${i + 1}: ${x.q}\nA${i + 1}: ${x.a ?? ''}`
        }));
        const nextQPrompt = `Ask the next interview question (Question ${nextIndex} of ${TOTAL}) for an SDE intern. Keep it to 1 sentence, and do NOT include the answer. Only return the question text.`;
        question = await chatCompletion([...context, { role: 'user', content: nextQPrompt }], SYSTEM_PRIME);
        question = String(question || '')
          .replace(/^["'`]+|["'`]+$/g, '')
          .replace(/^Q\d+\s*[:.\-]\s*/i, '')
          .trim();
      } catch (e) {
        console.error('next question error:', e);
        question = '';
      }
    }

    // Fallback question (no API / API failed / empty)
    if (!question) {
      // pick deterministic from bank
      const idx = Math.min(s.qa.length, FALLBACK_QUESTIONS.length - 1); // s.qa already contains previous
      question = FALLBACK_QUESTIONS[idx] || FALLBACK_QUESTIONS[FALLBACK_QUESTIONS.length - 1];
    }

    s.qa.push({ q: question, a: null });
    return res.json({ question });
  } catch (e) {
    console.error('answer route error:', e);
    return res.status(500).json({ error: e.message });
  }
});

router.get('/session/:id', (req, res) => {
  const s = sessions.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  res.json({ qa: s.qa, done: s.done });
});

export default router;
