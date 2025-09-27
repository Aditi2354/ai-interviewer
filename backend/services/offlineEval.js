export const FALLBACK_QUESTIONS = [
  "Tell me about a challenging bug you fixed. Root cause and your approach?",
  "Given an array of integers and a target, how would you find two numbers that sum to the target? Talk time/space.",
  "How does JavaScript's event loop work at a high level?",
  "Design a simple rate limiter for an API. What data structures would you use and why?",
  "Describe a time you collaborated under a tight deadline. What did you do well? What would you improve?",
  "What happens when you type a URL in the browser and press Enter? Outline the main steps."
];

// Very simple heuristic scorer (demo-friendly)
export function evaluateHeuristic(qa) {
  const text = qa.map(x => `${x.q}\n${x.a ?? ''}`).join('\n');
  const lower = text.toLowerCase();

  const techKeywords = [
    'time complexity','space complexity','big-o','o(',
    'hash','map','set','stack','queue','heap','binary','tree','graph',
    'two pointers','sliding window','recursion','iterative','dynamic programming'
  ];
  const psKeywords = [
    'edge case','trade-off','bottleneck','optimize','scalable','design',
    'cache','rate limit','throughput','latency','concurrency','deadlock'
  ];
  const commSignals = [
    '.', ',', ';', ':', 'therefore','however','first','second','finally','in summary'
  ];

  const hits = (arr) => arr.reduce((acc, k) => acc + (lower.includes(k) ? 1 : 0), 0);

  const totalAnswersLen = qa.reduce((acc, x) => acc + (x.a?.length || 0), 0);
  const sentences = (text.match(/[.!?]/g) || []).length;

  let technical = Math.min(10, 3 + hits(techKeywords) + Math.floor(totalAnswersLen/600));
  let problem_solving = Math.min(10, 3 + hits(psKeywords) + Math.floor(sentences/8));
  let communication = Math.min(10, 3 + Math.floor(totalAnswersLen/400) + Math.floor(sentences/6) + hits(commSignals));

  technical = Math.max(1, technical);
  problem_solving = Math.max(1, problem_solving);
  communication = Math.max(1, communication);

  const summary = "Heuristic evaluation (no external AI). Scores reflect technical detail, problem-solving cues, and clarity/structure. For production, enable API scoring.";
  const avg = (technical + problem_solving + communication) / 3;
  const recommendation = avg >= 7 ? "Hire" : avg >= 5 ? "Maybe" : "No-hire";

  return {
    scores: { technical, problem_solving, communication },
    summary,
    recommendation
  };
}