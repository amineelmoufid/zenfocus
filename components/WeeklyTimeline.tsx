
import React, { useEffect, useState, useRef } from 'react';
import { FocusSession, FocusBlock } from '../types';
import { X, Check, Trash2 } from 'lucide-react';

interface WeeklyTimelineProps {
  sessions: FocusSession[];
  blocks: FocusBlock[];
  onAddBlock: (startTime: number, label: string, id?: string) => void;
  onDeleteBlock: (id: string) => void;
}

interface ModalState {
  isOpen: boolean;
  startTime: number;
  label: string;
  existingId?: string;
}

export const WeeklyTimeline: React.FC<WeeklyTimelineProps> = ({ sessions, blocks, onAddBlock, onDeleteBlock }) => {
  const [now, setNow] = useState(new Date());
  const [modal, setModal] = useState<ModalState>({ isOpen: false, startTime: 0, label: '', existingId: undefined });
  const inputRef = useRef<HTMLInputElement>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const CELL_HEIGHT = 48;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (modal.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modal.isOpen]);

  const getWeekDates = () => {
    const current = new Date(now);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(current.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const todayIndex = weekDates.findIndex(d => d.toDateString() === now.toDateString());

  const handleSlotClick = (date: Date, hour: number) => {
    const slotStartTime = new Date(date);
    slotStartTime.setHours(hour, 0, 0, 0);
    const slotEndTime = new Date(slotStartTime);
    slotEndTime.setHours(hour + 1, 0, 0, 0);

    if (slotEndTime.getTime() > Date.now()) {
      const existingBlock = blocks.find(b => b.startTime === slotStartTime.getTime());
      setModal({
        isOpen: true,
        startTime: slotStartTime.getTime(),
        label: existingBlock ? existingBlock.label : (localStorage.getItem('zenfocus_last_label') || "Deep Work"),
        existingId: existingBlock?.id
      });
    }
  };

  const handleSaveBlock = () => {
    if (modal.label.trim()) {
      onAddBlock(modal.startTime, modal.label.trim(), modal.existingId);
      setModal({ ...modal, isOpen: false });
    }
  };

  const handleDelete = () => {
    if (modal.existingId) {
      onDeleteBlock(modal.existingId);
      setModal({ ...modal, isOpen: false });
    }
  };

  return (
    <div className="overflow-x-auto pb-4 relative">
      <div className="min-w-[850px] relative">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] mb-4 sticky top-0 bg-neutral-900/95 backdrop-blur-md z-40">
          <div></div>
          {weekDates.map((date, idx) => {
            const isToday = idx === todayIndex;
            return (
              <div key={idx} className={`text-center py-2 px-1 rounded-lg transition-colors ${isToday ? 'bg-indigo-500/20 border border-indigo-500/30' : ''}`}>
                <div className={`text-sm font-bold ${isToday ? 'text-indigo-400' : 'text-neutral-400'}`}>{days[idx]}</div>
                <div className="text-[10px] text-neutral-600 font-mono">{date.getDate()} {date.toLocaleString('default', { month: 'short' })}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative border border-neutral-800/50 bg-neutral-950/20 rounded-xl overflow-hidden">
          <div className="flex flex-col border-r border-neutral-900/50 z-20 bg-neutral-900/10">
            {hours.map(hour => (
              <div key={hour} className="text-[10px] text-neutral-600 flex items-center justify-end pr-4 border-b border-neutral-900/50 font-mono" style={{ height: `${CELL_HEIGHT}px` }}>
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {weekDates.map((date, dayIdx) => (
            <div key={dayIdx} className="relative border-r border-neutral-900/30">
              {hours.map(hour => (
                <div 
                  key={hour}
                  onClick={() => handleSlotClick(date, hour)}
                  className="group relative border-b border-neutral-900/30 cursor-pointer hover:bg-neutral-800/40 transition-colors"
                  style={{ height: `${CELL_HEIGHT}px` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center border-2 border-indigo-500/50 text-white text-sm font-bold shadow-2xl">
                       +
                    </div>
                  </div>
                </div>
              ))}

              {sessions.filter(s => new Date(s.startTime).toDateString() === date.toDateString()).map(session => {
                const sDate = new Date(session.startTime);
                const startOffset = (sDate.getHours() + sDate.getMinutes() / 60) * CELL_HEIGHT;
                const height = (session.durationMinutes / 60) * CELL_HEIGHT;
                return (
                  <div key={session.id} className="absolute left-[8%] right-[8%] bg-gradient-to-br from-indigo-500 to-indigo-600 border border-indigo-400/50 z-10 shadow-xl rounded-md flex items-center justify-center transition-all hover:scale-[1.02] hover:z-20 p-1" style={{ top: `${startOffset}px`, height: `${height}px` }}>
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter truncate text-center drop-shadow-md">
                      {session.label}
                    </span>
                  </div>
                );
              })}

              {blocks.filter(b => new Date(b.startTime).toDateString() === date.toDateString()).map(block => {
                const bDate = new Date(block.startTime);
                const startOffset = (bDate.getHours() + bDate.getMinutes() / 60) * CELL_HEIGHT;
                const durationMinutes = (block.endTime - block.startTime) / (1000 * 60);
                const height = (durationMinutes / 60) * CELL_HEIGHT;
                if (sessions.some(s => s.startTime >= block.startTime && s.startTime < block.endTime)) return null;
                return (
                  <div key={block.id} className="absolute left-[12%] right-[12%] border-2 border-dashed border-indigo-500/30 rounded-lg bg-indigo-500/10 flex items-center justify-center pointer-events-none z-10 overflow-hidden" style={{ top: `${startOffset}px`, height: `${height}px` }}>
                    <span className="text-[9px] text-indigo-300 font-bold uppercase truncate px-2 text-center leading-tight">
                      {block.label}
                    </span>
                  </div>
                );
              })}

              {dayIdx === todayIndex && (
                <div className="absolute z-40 pointer-events-none flex items-center left-0 right-0" style={{ top: `${(now.getHours() + now.getMinutes() / 60) * CELL_HEIGHT}px`, height: '2px', background: '#ef4444', boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)' }}>
                  <div className="now-indicator-ring -ml-[6px]"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">{modal.existingId ? 'Edit Block' : 'Plan Focus'}</h3>
              <button onClick={() => setModal({ ...modal, isOpen: false })} className="text-neutral-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-2 block">Focus Label</label>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={modal.label} 
                  onChange={e => setModal({ ...modal, label: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleSaveBlock()}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <button onClick={() => setModal({ ...modal, isOpen: false })} className="flex-1 px-6 py-3 rounded-xl border border-neutral-800 font-semibold hover:bg-neutral-800 transition-colors">Cancel</button>
                  <button onClick={handleSaveBlock} className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2">
                    <Check size={20} />{modal.existingId ? 'Update' : 'Save'}
                  </button>
                </div>
                {modal.existingId && (
                  <button onClick={handleDelete} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    <Trash2 size={18} />Delete Block
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
