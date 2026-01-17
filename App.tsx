
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { FullscreenTimer } from './components/FullscreenTimer';
import { FocusSession, FocusBlock, ViewState } from './types';
import { db } from './firebase';
import { ref, onValue, set, push } from 'firebase/database';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [blocks, setBlocks] = useState<FocusBlock[]>([]);
  
  const [timeLeft, setTimeLeft] = useState(3600);
  const [totalTime, setTotalTime] = useState(3600);
  const [sessionLabel, setSessionLabel] = useState('Deep Work');
  const [isActive, setIsActive] = useState(false);
  const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(null);

  const [activePlannedBlock, setActivePlannedBlock] = useState<FocusBlock | null>(null);

  // Sync with Firebase
  useEffect(() => {
    const sessionsRef = ref(db, 'sessions');
    const blocksRef = ref(db, 'blocks');

    const unsubscribeSessions = onValue(sessionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSessions(Object.values(data));
      } else {
        setSessions([]);
      }
    });

    const unsubscribeBlocks = onValue(blocksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBlocks(Object.values(data));
      } else {
        setBlocks([]);
      }
    });

    return () => {
      unsubscribeSessions();
      unsubscribeBlocks();
    };
  }, []);

  // Check for planned blocks starting
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const currentBlock = blocks.find(b => now >= b.startTime && now < b.endTime);
      
      if (currentBlock && (!activePlannedBlock || activePlannedBlock.id !== currentBlock.id)) {
        setActivePlannedBlock(currentBlock);
        // Only alert if we're not currently in focus mode
        if (view === 'dashboard' && !isActive) {
           // We could use Browser Notifications here, but an in-app banner is safer/cleaner
        }
      } else if (!currentBlock && activePlannedBlock) {
        setActivePlannedBlock(null);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [blocks, activePlannedBlock, view, isActive]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      completeSession();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const startFocus = (label: string, minutes: number) => {
    const seconds = minutes * 60;
    setSessionLabel(label);
    setTimeLeft(seconds);
    setTotalTime(seconds);
    setCurrentSessionStart(Date.now());
    setIsActive(true);
    setView('timer');
  };

  const stopFocus = () => {
    if (isActive && currentSessionStart) {
      const durationSeconds = Math.floor((Date.now() - currentSessionStart) / 1000);
      const durationMinutes = Math.floor(durationSeconds / 60);
      
      if (durationMinutes >= 1) {
        const sessionRef = push(ref(db, 'sessions'));
        const newSession: FocusSession = {
          id: sessionRef.key || Math.random().toString(36).substr(2, 9),
          startTime: currentSessionStart,
          endTime: Date.now(),
          durationMinutes: durationMinutes,
          label: sessionLabel
        };
        set(sessionRef, newSession);
      }
    }
    
    setIsActive(false);
    setView('dashboard');
    setCurrentSessionStart(null);
  };

  const completeSession = () => {
    if (currentSessionStart) {
      const sessionRef = push(ref(db, 'sessions'));
      const newSession: FocusSession = {
        id: sessionRef.key || Math.random().toString(36).substr(2, 9),
        startTime: currentSessionStart,
        endTime: Date.now(),
        durationMinutes: Math.floor(totalTime / 60),
        label: sessionLabel
      };
      set(sessionRef, newSession);
    }
    setIsActive(false);
    setView('dashboard');
    setCurrentSessionStart(null);
    alert("Focus session completed! Great work.");
  };

  const handleAddBlock = (startTime: number, label: string) => {
    const blockRef = push(ref(db, 'blocks'));
    const newBlock: FocusBlock = {
      id: blockRef.key || Math.random().toString(36).substr(2, 9),
      startTime,
      endTime: startTime + (60 * 60 * 1000), // Default 1 hour block
      label
    };
    set(blockRef, newBlock);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      {view === 'dashboard' ? (
        <Dashboard 
          sessions={sessions} 
          blocks={blocks}
          onStartFocus={startFocus} 
          onAddBlock={handleAddBlock}
          activePlannedBlock={activePlannedBlock}
        />
      ) : (
        <FullscreenTimer 
          label={sessionLabel}
          timeLeft={timeLeft} 
          totalTime={totalTime}
          onStop={stopFocus} 
        />
      )}
    </div>
  );
};

export default App;
