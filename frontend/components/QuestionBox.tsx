'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  question: string;
  onAnswer: (text: string) => void;
  disabled?: boolean; // disable while submitting
};

export default function QuestionBox({ question, onAnswer, disabled }: Props) {
  // answer (typed + voice)
  const [text, setText] = useState('');
  // 60s lock before submit
  const [timer, setTimer] = useState(60);
  const [canSubmit, setCanSubmit] = useState(false);

  // speech-to-text (browser Web Speech API)
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [sttSupported, setSttSupported] = useState(false);

  // ------- per-question reset + speak the question -------
  useEffect(() => {
    if (!question) return;

    // reset input + timer
    setText('');
    setCanSubmit(false);
    setTimer(60);

    // speak the question (slight delay to avoid autoplay blocking)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utt = new SpeechSynthesisUtterance(question);
        utt.lang = 'en-US'; // change to "hi-IN" for Hindi
        utt.rate = 1;
        setTimeout(() => window.speechSynthesis.speak(utt), 400);
      } catch {
        /* ignore */
      }
    }

    // 60s countdown, then enable submit
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSubmit(true);
          // stop mic auto at 60s
          recognitionRef.current?.stop?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question]);

  // ------- detect STT support once -------
  useEffect(() => {
    const w: any = typeof window !== 'undefined' ? window : {};
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSttSupported(!!SR);
  }, []);

  // ------- start/stop continuous speech recognition -------
  const handleVoice = () => {
    const w: any = typeof window !== 'undefined' ? window : {};
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    // if already recording → stop
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';          // change to "hi-IN" for Hindi
    rec.continuous = true;       // keep listening
    rec.interimResults = true;   // show partial text

    let finalTranscript = '';

    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += chunk + ' ';
        else interim += chunk;
      }
      const merged = (finalTranscript + ' ' + interim).trim();
      setText(merged);
    };

    rec.start();
  };

  // stop recognition on unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop?.(); } catch {}
    };
  }, []);

  // ------- submit -------
  const submit = () => {
    if (!canSubmit) return;
    const val = text.trim();
    if (!val) return;
    onAnswer(val);
  };

  return (
    <div className="card">
      <div className="text-sm text-slate-500 mb-1">AI asks</div>
      <div className="text-xl font-semibold mb-4 leading-relaxed">{question}</div>

      {/* Timer / status */}
      <div className="mb-3 text-sm">
        {canSubmit ? (
          <span className="text-green-600">You can now submit your answer</span>
        ) : (
          <span className="text-red-600">Please wait {timer}s before submitting</span>
        )}
      </div>

      <div className="flex gap-3 items-start">
        <textarea
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 min-h-[110px]"
          placeholder="Type your answer or use voice…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
        />

        {sttSupported && (
          <button
            type="button"
            onClick={handleVoice}
            className="btn-secondary"
            disabled={disabled}
            title="Use your microphone to dictate your answer"
          >
            {listening ? 'Stop' : 'Speak'}
          </button>
        )}

        <button
          type="button"
          onClick={submit}
          className="btn"
          disabled={disabled || !text.trim() || !canSubmit}
          title={canSubmit ? 'Submit your answer' : 'Wait for the countdown'}
        >
          {canSubmit ? (disabled ? 'Submitting…' : 'Submit') : `Wait ${timer}s`}
        </button>
      </div>

      {listening && (
        <div className="text-xs text-slate-500 mt-2">
          Listening… speak naturally; interim words will appear above.
        </div>
      )}
    </div>
  );
}
