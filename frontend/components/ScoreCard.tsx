import React from 'react';

type Props = {
  evaluation: string; // JSON string from backend
};

export default function ScoreCard({ evaluation }: Props) {
  let parsed: any = null;
  try { parsed = JSON.parse(evaluation); } catch {}

  if (!parsed) {
    return (
      <div className="card">
        <div className="text-lg font-semibold mb-2">Evaluation</div>
        <pre className="text-sm whitespace-pre-wrap">{evaluation}</pre>
        <div className="text-xs text-slate-500 mt-2">Note: Could not parse JSON strictly. The raw text is shown.</div>
      </div>
    );
  }

  const { scores, summary, recommendation } = parsed;

  return (
    <div className="card">
      <div className="text-lg font-semibold mb-4">Evaluation</div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-500">Technical</div>
          <div className="text-2xl font-bold">{scores?.technical ?? '-'}/10</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-500">Problem Solving</div>
          <div className="text-2xl font-bold">{scores?.problem_solving ?? '-'}/10</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50">
          <div className="text-xs text-slate-500">Communication</div>
          <div className="text-2xl font-bold">{scores?.communication ?? '-'}/10</div>
        </div>
      </div>
      <div className="text-sm mb-3"><span className="font-semibold">Summary:</span> {summary}</div>
      <div className="text-sm"><span className="font-semibold">Recommendation:</span> {recommendation}</div>
    </div>
  );
}
