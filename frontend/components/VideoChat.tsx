'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
  onReady?: (ok: boolean) => void;
};

type CamErr =
  | 'permission' | 'not-found' | 'in-use' | 'constraints' | 'unsupported' | 'unknown';

export default function VideoChat({ className, onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoId, setVideoId] = useState<string>('');
  const [audioId, setAudioId] = useState<string>('');

  const [ready, setReady] = useState(false);
  const [errType, setErrType] = useState<CamErr | null>(null);
  const [errMsg, setErrMsg] = useState('');

  function stopStream() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }

  async function listDevices() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list);
      const cam = list.find(d => d.kind === 'videoinput');
      const mic = list.find(d => d.kind === 'audioinput');
      if (cam && !videoId) setVideoId(cam.deviceId);
      if (mic && !audioId) setAudioId(mic.deviceId);
    } catch (e) {
      // labels appear only after permission—ignore
    }
  }

  // Progressive start with graceful fallbacks
  async function start() {
    stopStream();
    setReady(false);
    setErrType(null); setErrMsg('');
    onReady?.(false);

    if (!('mediaDevices' in navigator) || !navigator.mediaDevices.getUserMedia) {
      setErrType('unsupported');
      setErrMsg('getUserMedia not supported. Use Chrome/Edge on http://localhost or HTTPS.');
      return;
    }

    const tries: MediaStreamConstraints[] = [
      {
        video: videoId
          ? { deviceId: { exact: videoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: audioId ? { deviceId: { exact: audioId }, echoCancellation: true } : { echoCancellation: true },
      },
      { video: { facingMode: 'user' }, audio: { echoCancellation: true } },
      { video: true, audio: true },
    ];

    let lastErr: any = null;

    for (const constraints of tries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // autoplay can reject without user gesture; element has autoPlay + muted
          // so ignore promise rejection
          // eslint-disable-next-line no-await-in-loop
          await videoRef.current.play().catch(() => {});
        }

        setReady(true);
        onReady?.(true);
        await listDevices(); // labels show after grant
        return;
      } catch (e: any) {
        lastErr = e;
        // continue to next fallback
      }
    }

    // If all tries failed — map final error
    const name = lastErr?.name || '';
    const msg  = lastErr?.message || '';
    console.error('Camera start failed:', name, msg);

    if (name === 'NotAllowedError' || name === 'SecurityError') {
      setErrType('permission'); setErrMsg('Camera/Mic permission denied. Allow in browser Site settings, then Retry.');
    } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      setErrType('not-found'); setErrMsg('No camera/microphone detected.');
    } else if (name === 'NotReadableError' || name === 'TrackStartError') {
      setErrType('in-use'); setErrMsg('Camera is in use by another app (Zoom/Meet/Teams). Close it and Retry.');
    } else if (name === 'OverconstrainedError') {
      setErrType('constraints'); setErrMsg('Current device/resolution not supported. Pick another device and Retry.');
    } else {
      setErrType('unknown'); setErrMsg(msg || 'Unknown error starting camera.');
    }
  }

  useEffect(() => {
    listDevices().then(start);
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // switching devices should restart
  useEffect(() => { if (videoId || audioId) start(); /* restart on device change */ }, [videoId, audioId]);

  const cams = devices.filter(d => d.kind === 'videoinput');
  const mics = devices.filter(d => d.kind === 'audioinput');

  return (
    <div className={className}>
      <div className="card">
        <div className="text-sm text-slate-500 mb-2">Camera & Microphone</div>

        <video
  ref={videoRef}
  autoPlay
  muted
  playsInline
  className="w-64 h-48 rounded-lg bg-black object-cover"
/>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <select className="rounded-xl border border-slate-200 px-3 py-2"
                  value={videoId} onChange={(e)=>setVideoId(e.target.value)}>
            {cams.length === 0 && <option>No cameras</option>}
            {cams.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Camera'}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-3 py-2"
                  value={audioId} onChange={(e)=>setAudioId(e.target.value)}>
            {mics.length === 0 && <option>No microphones</option>}
            {mics.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
          </select>
        </div>

        <div className="mt-2 text-sm">
          {ready ? <span className="text-green-600">✅ Camera & mic ready</span>
                 : errMsg ? <span className="text-red-600">❌ {errMsg}</span>
                          : <span className="text-yellow-600">Requesting permissions…</span>}
        </div>

        <div className="mt-3 flex gap-2">
          <button className="btn-secondary" onClick={start}>Retry</button>
        </div>
      </div>
    </div>
  );
}
