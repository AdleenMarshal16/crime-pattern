import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../api/client';

export default function LoginPage({ onLogin }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState('idle'); // idle, capturing, verifying, error, success
  const [message, setMessage] = useState('Position your face in the frame and click "Start Authentication"');
  const [blinkCount, setBlinkCount] = useState(0);
  const [frames, setFrames] = useState([]);
  const [error, setError] = useState('');

  // Start webcam
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Unable to access webcam. Please ensure camera permissions are granted.');
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Capture frame as base64
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Start authentication capture
  const startCapture = useCallback(() => {
    setStatus('capturing');
    setMessage('Please blink TWICE slowly while looking at the camera...');
    setBlinkCount(0);
    setError('');
    const capturedFrames = [];

    // Capture frames for 5 seconds
    intervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        capturedFrames.push(frame);
      }
    }, 150); // ~6-7 fps

    // After 5 seconds, stop and verify
    setTimeout(async () => {
      clearInterval(intervalRef.current);
      setFrames(capturedFrames);
      setStatus('verifying');
      setMessage('Verifying identity...');

      try {
        const response = await api.post('/auth/login', {
          frames: capturedFrames,
        });

        setStatus('success');
        setMessage('Authentication successful!');

        setTimeout(() => {
          onLogin(response.data.admin, response.data.access_token);
        }, 800);
      } catch (err) {
        setStatus('error');
        const detail = err.response?.data?.detail || 'Authentication failed. Please try again.';
        setMessage(detail);
        setError(detail);
      }
    }, 5000);
  }, [captureFrame, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Secure Login</h1>
          <p className="text-sm text-slate-400 mt-1">Crime Pattern Detection System</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 space-y-5">
          {/* Webcam */}
          <div className="webcam-container mx-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Overlay */}
            <div className="webcam-overlay">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full relative ${
                  status === 'success' ? 'bg-green-400' :
                  status === 'error' ? 'bg-red-400' :
                  status === 'capturing' || status === 'verifying' ? 'bg-amber-400' :
                  'bg-slate-400'
                } ${status === 'capturing' ? 'pulse-dot' : ''}`}></div>
                <span className="text-xs font-medium text-white/80">
                  {status === 'idle' && 'Camera ready'}
                  {status === 'capturing' && 'Capturing blinks...'}
                  {status === 'verifying' && 'Verifying...'}
                  {status === 'success' && 'Verified ✓'}
                  {status === 'error' && 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {/* Status message */}
          <div className={`text-center p-3 rounded-lg ${
            status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
            status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
            'bg-slate-800/50'
          }`}>
            <p className={`text-sm ${
              status === 'error' ? 'text-red-400' :
              status === 'success' ? 'text-green-400' :
              'text-slate-300'
            }`}>
              {message}
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={startCapture}
            disabled={status === 'capturing' || status === 'verifying' || status === 'success'}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              status === 'success'
                ? 'bg-green-600 text-white cursor-default'
                : status === 'capturing' || status === 'verifying'
                ? 'bg-slate-700 text-slate-400 cursor-wait'
                : 'btn-primary'
            }`}
          >
            {status === 'idle' && 'Start Authentication'}
            {status === 'capturing' && '⏳ Capturing... Blink twice'}
            {status === 'verifying' && '🔍 Verifying identity...'}
            {status === 'success' && '✓ Authenticated'}
            {status === 'error' && 'Retry Authentication'}
          </button>

          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-300">Blink-ID Authentication:</strong> No passwords required.
              Look at the camera and blink twice. Your face is matched against registered admin profiles.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          Kerala Crime Pattern Detection & District Management System v1.0
        </p>
      </div>
    </div>
  );
}
