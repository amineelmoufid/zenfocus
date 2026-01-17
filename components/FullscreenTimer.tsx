
import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface FullscreenTimerProps {
  label: string;
  timeLeft: number;
  totalTime: number;
  onStop: () => void;
}

export const FullscreenTimer: React.FC<FullscreenTimerProps> = ({ label, timeLeft, totalTime, onStop }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeLeft / totalTime) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900 rounded-full blur-[120px] transition-transform duration-[3000ms] ${pulse ? 'scale-110' : 'scale-90'}`}
        />
      </div>

      <div className="relative z-10 text-center w-full max-w-xl px-6">
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-xs uppercase tracking-[0.2em] font-bold">Deep Focus Mode</span>
            </div>
            <span className="text-lg font-medium text-white/80">{label}</span>
          </div>
          <button 
            onClick={onStop}
            className="p-2 bg-neutral-900/50 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </header>

        {/* Minimalist SVG Progress Circle */}
        <div className="relative mb-8 flex justify-center">
          <svg className="w-64 h-64 -rotate-90 md:w-80 md:h-80">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-neutral-900"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="white"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              style={{ 
                strokeDashoffset: offset,
                transition: 'stroke-dashoffset 1s linear'
              }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl md:text-8xl font-light tracking-tighter mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-neutral-500 text-sm mt-2 font-medium tracking-widest uppercase">
              Remaining
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-neutral-400 italic font-light animate-in fade-in slide-in-from-bottom duration-1000">
            "Your focus determines your reality."
          </p>
          <div className="flex justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-white opacity-40 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 rounded-full bg-white opacity-40 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 rounded-full bg-white opacity-40 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Persistent Call-to-action */}
      <div className="absolute bottom-12 z-20">
        <button 
          onClick={onStop}
          className="px-10 py-3 border border-neutral-800 rounded-full text-neutral-500 hover:text-white hover:border-white transition-all text-sm uppercase tracking-widest font-bold"
        >
          End Session
        </button>
      </div>
    </div>
  );
};
