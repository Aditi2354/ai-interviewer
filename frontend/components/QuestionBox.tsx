'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  question: string;
  onAnswer: (text: string) => void;
  disabled?: boolean;
};

export default function QuestionBox({ question, onAnswer, disabled }: Props) {
  const [text, setText] = useState('');
  const [timer, setTimer] = useState(60);
  const [canSubmit, setCanSubmit] = useState(false);

  // STT
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [sttSupported, setSttSupported] = useState(false);

  // ✅ TTS gate
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const voicesReadyRef = useRef(false);

  function ensureVoicesLoaded() {
    const w: any = typeof window !== 'undefined' ? window : {};
    if (!('speechSynthesis' in w)) return;
    const load = () => {
      const voices = w.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        voicesReadyRef.current = true;
        w.speechSynthesis.onvoiceschanged = null;
      }
    };
    load();
    w.speechSynthesis.onvoiceschanged = load;
  }

  function speak(textToSpeak: string) {
    const w: any = typeof window !== 'undefined' ? window : {};
    if (!ttsEnabled || !('speechSynthesis' in w)) return;
    try {
      // Some browsers need resume after user gesture
      w.speechSynthesis.resume?.();
      if (!voicesReadyRef.current) ensureVoicesLoaded();

      const utt = new SpeechSynthesisUtterance(textToSpeak);
      utt.lang = 'en-US';   // change to "hi-IN" for Hindi
      utt.rate = 1;
      w.speechSynthesis.cancel(); // stop any previous
      w.speechSynthesis.speak(utt);
    } catch {}
  }

  const enableVoice = () => {
    const w: any = typeof window !== 'undefined' ? window : {};
    if (!('speechSynthesis' in w)) {
      alert('Text-to-speech not supported in this browser.');
      return;
    }
    try {
      ensureVoicesLoaded();
      // “warm up” to satisfy autoplay policy
      const blip = new SpeechSynthesisUtterance(' ');
      w.speechSynthesis.speak(blip);
      w.speechSynthesis.cancel();
    } catch {}
    setTtsEnabled(true);
  };

  // ===== per-question reset + (optional) TTS =====
  useEffect(() => {
    if (!question) return;

    setText('');
    setCanSubmit(false);
    setTimer(60);

    // speak after slight delay (if user enabled)
    const t = setTimeout(() => speak(question), 400);

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanSubmit(true);
          recognitionRef.current?.stop?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { clearTimeout(t); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, ttsEnabled]);

  // STT support detect
  useEffect(() => {
    const w: any = typeof window !== 'undefined' ? window : {};
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    setSttSupported(!!SR);
  }, []);

  // STT start/stop
  const handleVoice = () => {
    const w: any = typeof window !== 'undefined' ? window : {};
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

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
      setText((finalTranscript + ' ' + interim).trim());
    };

    rec.start();
  };

  useEffect(() => () => { try { recognitionRef.current?.stop?.(); } catch {} }, []);

  const submit = () => {
    if (!canSubmit) return;
    const val = text.trim();
    if (!val) return;
    onAnswer(val);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-500">AI asks</div>
        {!ttsEnabled && (
          <button
            type="button"
            onClick={enableVoice}
            className="px-3 py-1 text-xs rounded-lg bg-slate-900 text-white hover:opacity-90"
            title="Enable AI voice (required once)"
          >
            Enable voice
          </button>
        )}
      </div>

      <div className="text-xl font-semibold mb-4 leading-relaxed">{question}</div>

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

      {!ttsEnabled && (
        <div className="text-xs text-amber-600 mt-2">
          Tip: Click “Enable voice” once to allow the browser to speak questions.
        </div>
      )}

      {listening && (
        <div className="text-xs text-slate-500 mt-2">
          Listening… interim words will appear above.
        </div>
      )}
    </div>
  );
}
