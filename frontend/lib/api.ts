// frontend/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function startInterview() {
  const r = await fetch(`${API_BASE}/api/interview/start`, { method: "POST" });
  return r.json();
}

export async function submitAnswer(sessionId: string, answer: string) {
  const r = await fetch(`${API_BASE}/api/interview/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answer }),
  });
  return r.json();
}

export async function getSession(sessionId: string) {
  const r = await fetch(`${API_BASE}/api/interview/session/${sessionId}`);
  return r.json();
}
