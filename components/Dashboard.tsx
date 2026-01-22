
import React, { useState, useEffect } from 'react';
import { WeeklyTimeline } from './WeeklyTimeline';
import { FocusSession, FocusBlock } from '../types';
import { Play, Flame, Clock, Target, Bell } from 'lucide-react';

interface DashboardProps {
  sessions: FocusSession[];
  blocks: FocusBlock[];
  onStartFocus: (label: string, minutes: number) => void;
  onAddBlock: (startTime: number, label: string, id?: string) => void;
  onDeleteBlock: (id: string) => void;
  activePlannedBlock: FocusBlock | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ sessions, blocks, onStartFocus, onAddBlock, onDeleteBlock, activePlannedBlock }) => {
  const [label, setLabel] = useState(() => {
    return localStorage.getItem('zenfocus_last_label') || 'Deep Work';
  });
  const [minutes, setMinutes] = useState(60);

  useEffect(() => {
    localStorage.setItem('zenfocus_last_label', label);
  }, [label]);

  useEffect(() => {
    if (activePlannedBlock) {
      setLabel(activePlannedBlock.label);
    }
  }, [activePlannedBlock]);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const sessionCount = sessions.length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {activePlannedBlock && (
        <div className="mb-8 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Planned Focus Active</p>
              <h3 className="text-lg font-bold">Time to start: <span className="text-white">{activePlannedBlock.label}</span></h3>
            </div>
          </div>
          <button 
            onClick={() => onStartFocus(activePlannedBlock.label, 60)}
            className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-400 transition-all shadow-lg flex items-center gap-2"
          >
            <Play size={16} fill="white" />
            Start Now
          </button>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">ZenFocus</h1>
          <p className="text-neutral-400">Your weekly productivity overview.</p>
        </div>
        
        <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 flex flex-wrap items-center gap-4 w-full md:w-auto shadow-2xl">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Session Label</label>
            <input 
              type="text" 
              value={label} 
              onChange={e => setLabel(e.target.value)}
              placeholder="What are you focusing on?"
              className="bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-48"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">Duration (min)</label>
            <select 
              value={minutes} 
              onChange={e => setMinutes(Number(e.target.value))}
              className="bg-black border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value={15}>15m</option>
              <option value={25}>25m</option>
              <option value={45}>45m</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
          <button 
            onClick={() => onStartFocus(label, minutes)}
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 h-[42px] mt-auto"
          >
            <Play size={18} fill="white" />
            Start
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<Clock className="text-indigo-400" />} label="Total Focus" value={`${totalHours}h`} subValue={`${totalMinutes} mins`} />
        <StatCard icon={<Target className="text-emerald-400" />} label="Sessions" value={sessionCount.toString()} subValue="Completed" />
        <StatCard icon={<Flame className="text-orange-400" />} label="Daily Streak" value="4" subValue="Keep it up!" />
      </div>

      <section className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold">Weekly Timeline</h2>
            <p className="text-xs text-neutral-500 mt-1 italic">Click any slot in the current or future hours to block time</p>
          </div>
          <div className="flex gap-4 text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></div><span>Session</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-dashed border-indigo-400/50 rounded-sm"></div><span>Blocked</span></div>
          </div>
        </div>
        <WeeklyTimeline 
          sessions={sessions} 
          blocks={blocks} 
          onAddBlock={onAddBlock} 
          onDeleteBlock={onDeleteBlock}
        />
      </section>

      <footer className="mt-16 text-center text-neutral-600 text-sm">
        <p>Syncing with Firebase Realtime Database. Your data is persistent.</p>
      </footer>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue: string }> = ({ icon, label, value, subValue }) => (
  <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-colors">
    <div className="flex items-center gap-3 mb-4 text-neutral-400">
      {icon}
      <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold mono">{value}</span>
      <span className="text-neutral-500 text-sm">{subValue}</span>
    </div>
  </div>
);
