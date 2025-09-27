import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.warn('⚠️ No OPENAI_API_KEY set. Please configure backend/.env');
}

const MODEL = 'gpt-4o-mini'; // fast + capable; change if needed

export async function chatCompletion(messages, systemPrompt = '') {
  const body = {
    model: MODEL,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages
    ],
    temperature: 0.4
  };

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message?.content || '';
  return msg.trim();
}

export const SYSTEM_PRIME = `You are an AI interviewer for an SDE Intern role.
You must: 
- ask exactly 5 to 7 questions (mix technical, problem solving, behavioral),
- ask one question at a time,
- keep questions concise (max 1-2 sentences),
- do not reveal answers, 
- after last answer, produce a compact JSON with scores (technical, problem_solving, communication from 1-10) and a brief performance summary.
`;
