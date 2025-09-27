import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="font-bold text-xl">AI Interviewer</div>
        <a href="https://github.com" target="_blank" className="text-sm text-slate-600 hover:underline">Docs</a>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Face‑to‑Face <span className="text-slate-500">AI Interviewer</span> for SDE Interns
        </motion.h1>
        <motion.p
          className="mt-4 text-lg text-slate-600 max-w-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Premium, human‑like flow. 5‑7 smart questions. Auto evaluation for Technical, Problem Solving, Communication.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-10 flex gap-4">
          <Link href="/interview" className="btn">Start Interview</Link>
          <a href="https://vercel.com" target="_blank" className="btn-secondary">Deploy Guide</a>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          <div className="card">
            <div className="text-lg font-semibold mb-2">What you get</div>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Camera/Mic experience (no plugin)</li>
              <li>Questions adapt to your answers</li>
              <li>Final JSON evaluation + summary</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-lg font-semibold mb-2">Scoring</div>
            <p className="text-slate-600">Transparent rubric: Technical, Problem Solving, Communication (1–10). Export transcript.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
