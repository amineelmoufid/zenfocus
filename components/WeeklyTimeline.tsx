
import React, { useEffect, useState, useRef } from 'react';
import { FocusSession, FocusBlock } from '../types';
import { X, Check } from 'lucide-react';

interface WeeklyTimelineProps {
  sessions: FocusSession[];
  blocks: FocusBlock[];
  onAddBlock: (startTime: number, label: string) => void;
}

interface ModalState {
  isOpen: boolean;
  startTime: number;
  label: string;
  isExisting: boolean;
}

export const WeeklyTimeline: React.FC<WeeklyTimelineProps> = ({ sessions, blocks, onAddBlock }) => {
  const [now, setNow] = useState(new Date());
  const [modal, setModal] = useState<ModalState>({ isOpen: false, startTime: 0, label: '', isExisting: false });
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

    // Allow interaction if slot is not in the past
    if (slotEndTime.getTime() > Date.now()) {
      const existingBlock = blocks.find(b => b.startTime === slotStartTime.getTime());
      setModal({
        isOpen: true,
        startTime: slotStartTime.getTime(),
        label: existingBlock ? existingBlock.label : (localStorage.getItem('zenfocus_last_label') || "Deep Work"),
        isExisting: !!existingBlock
      });
    }
  };

  const handleSaveBlock = () => {
    if (modal.label.trim()) {
      onAddBlock(modal.startTime, modal.label.trim());
      setModal({ ...modal, isOpen: false });
    }
  };

  return (
    <div className="overflow-x-auto pb-4 relative">
      <div className="min-w-[850px] relative">
        {/* Hours Header */}
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

        {/* Timeline Grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative border border-neutral-800/50 bg-neutral-950/20 rounded-xl overflow-hidden">
          
          {/* NOW Indicator Line */}
          {todayIndex !== -1 && (
            <div 
              className="absolute z-30 pointer-events-none flex items-center"
              style={{
                top: `${(now.getHours() + now.getMinutes() / 60) * CELL_HEIGHT}px`,
                left: `calc(60px + (${todayIndex} * (100% - 60px) / 7))`,
                width: `calc((100% - 60px) / 7)`,
                height: '2px',
                background: '#ef4444',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)',
              }}
            >
               <div className="now-indicator-ring -ml-[6px]"></div>
            </div>
          )}

          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Hour Marker */}
              <div 
                className="text-[10px] text-neutral-600 flex items-center justify-end pr-4 border-b border-neutral-900/50 font-mono"
                style={{ height: `${CELL_HEIGHT}px` }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>

              {weekDates.map((date, dayIdx) => {
                const slotStart = new Date(date);
                slotStart.setHours(hour, 0, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setHours(hour + 1);

                const isPast = slotEnd.getTime() < Date.now();
                const isCurrent = Date.now() >= slotStart.getTime() && Date.now() < slotEnd.getTime();
                
                const hourSessions = sessions.filter(s => {
                  const sStart = new Date(s.startTime);
                  return sStart.toDateString() === date.toDateString() && sStart.getHours() === hour;
                });
                
                const hourBlocks = blocks.filter(b => {
                  const bStart = new Date(b.startTime);
                  return bStart.toDateString() === date.toDateString() && bStart.getHours() === hour;
                });

                const sessionIntensity = hourSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
                const opacity = Math.min(sessionIntensity / 60, 1);

                return (
                  <div 
                    key={`${dayIdx}-${hour}`} 
                    onClick={() => handleSlotClick(date, hour)}
                    style={{ height: `${CELL_HEIGHT}px` }}
                    className={`
                      relative group border-b border-r border-neutral-900/30 transition-all duration-300
                      ${isPast ? 'bg-neutral-900/10 opacity-40' : 'cursor-pointer hover:bg-neutral-800/40'}
                      ${isCurrent ? 'bg-indigo-500/[0.05] ring-2 ring-inset ring-indigo-500/20 z-10' : ''}
                    `}
                  >
                    {/* Actual Session */}
                    {sessionIntensity > 0 && (
                      <div 
                        className="absolute inset-0 bg-indigo-500 flex items-center justify-center border-l-4 border-indigo-400 z-10 shadow-lg"
                        style={{ opacity: opacity * 0.7 + 0.3 }}
                      >
                         <span className="text-[9px] font-bold text-white uppercase tracking-tighter truncate px-1 drop-shadow-md">
                            {hourSessions[0]?.label}
                         </span>
                      </div>
                    )}

                    {/* Planned Block */}
                    {hourBlocks.length > 0 && sessionIntensity === 0 && (
                      <div className="absolute inset-1 border-2 border-dashed border-indigo-500/40 rounded-lg bg-indigo-500/5 flex items-center justify-center pointer-events-none">
                        <span className="text-[8px] text-indigo-400 font-bold uppercase truncate px-2">
                          {hourBlocks[0].label}
                        </span>
                      </div>
                    )}

                    {/* Interaction Hint */}
                    {!isPast && sessionIntensity === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/40 flex items-center justify-center border-2 border-indigo-400 text-white text-sm font-bold shadow-2xl scale-90 group-hover:scale-110 transition-transform">
                           +
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CUSTOM PLANNING MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {modal.isExisting ? 'Update Block' : 'Plan Focus'}
              </h3>
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
                  placeholder="e.g. Deep Work, Study, Design..."
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="flex-1 px-6 py-3 rounded-xl border border-neutral-800 font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBlock}
                  className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  {modal.isExisting ? 'Update' : 'Plan Block'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
