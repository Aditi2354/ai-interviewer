import React, { useEffect, useState } from 'react';
import ScoreCard from '../components/ScoreCard';

export default function ResultPage() {
  const [evaluation, setEvaluation] = useState('');

  useEffect(() => {
    // get from localStorage or query params in a real app
    const last = window.localStorage.getItem('lastEvaluation');
    if (last) setEvaluation(last);
  }, []);

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Results</h1>
      {evaluation ? (
        <ScoreCard evaluation={evaluation} />
      ) : (
        <div className="card">No evaluation found. Complete an interview first.</div>
      )}
    </div>
  );
}
