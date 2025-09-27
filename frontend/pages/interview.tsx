// frontend/pages/interview.tsx
'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { startInterview, submitAnswer, getSession } from "../lib/api";
import QuestionBox from "../components/QuestionBox";
import ScoreCard from "../components/ScoreCard";

const VideoChat = dynamic(() => import("../components/VideoChat"), { ssr: false });

type QA = { q: string; a: string };

export default function InterviewPage() {
  // 🔒 All hooks at top-level (no conditional returns before them)
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [avReady, setAvReady] = useState<boolean>(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    // start interview only after mount to avoid hydration mismatch
    if (!mounted) return;
    (async () => {
      const s = await startInterview();
      setSessionId(s.sessionId);
      setQuestion(s.question);
      setTranscript([{ q: s.question, a: "" }]);
    })();
  }, [mounted]);

  const onAnswer = async (text: string) => {
    if (!sessionId || loading) return;
    if (!text.trim()) { alert("Please answer before submitting."); return; }

    setLoading(true);
    try {
      const resp = await submitAnswer(sessionId, text);

      // save answer for current Q
      setTranscript(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], a: text };
        return copy;
      });

      if (resp?.done) {
        setDone(true);
        setEvaluation(resp.evaluation);
        return;
      }

      if (resp?.question && resp.question.trim()) {
        setQuestion(resp.question);
        setTranscript(prev => [...prev, { q: resp.question, a: "" }]);
        return;
      }

      // fallback: pull from session
      const sess = await getSession(sessionId);
      const pending = (sess?.qa || []).find((x: any) => !x.a);
      if (pending?.q) {
        setQuestion(pending.q);
        setTranscript(prev => {
          const last = prev[prev.length - 1];
          return last && last.q === pending.q ? prev : [...prev, { q: pending.q, a: "" }];
        });
      } else {
        alert("No next question received. Please try again.");
      }
    } catch (e) {
      console.error("submit error:", e);
      alert("Network/API error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      {/* Camera + Mic (client-only); render only after mounted to avoid SSR mismatch */}
      {mounted && <VideoChat className="mb-4" onReady={(ok) => setAvReady(ok)} />}

      {/* If not mounted yet, render a light skeleton to keep markup stable */}
      {!mounted && (
        <div className="card mb-4">
          <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      )}

      {!done ? (
        <>
          <QuestionBox
            question={question}
            onAnswer={onAnswer}
            disabled={loading /* || !avReady */}
          />

          {/* transcript */}
          <div className="card mt-4">
            <div className="text-slate-500 text-sm mb-2">Transcript</div>
            <div className="space-y-3">
              {transcript.map((x, i) => (
                <div key={i}>
                  <div className="font-semibold">Q{i + 1}. {x.q}</div>
                  {x.a ? <div className="text-slate-700">A{i + 1}. {x.a}</div> : null}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4">
          <ScoreCard evaluation={evaluation} />
        </div>
      )}
    </div>
  );
}
