import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null;
  totalSessions: number;
}

interface TimerContextType {
  mode: TimerMode;
  setMode: (mode: TimerMode) => void;
  timeLeft: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  incrementTime: () => void;
  decrementTime: () => void;
  setCustomDuration: (mode: TimerMode, minutes: number) => void;
  getModeDuration: (mode: TimerMode) => number;
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  streak: StreakData;
  updateStreak: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_DURATIONS = {
  pomodoro: 45 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TimerMode>(() => {
    const saved = localStorage.getItem('timerMode');
    return (saved as TimerMode) || 'pomodoro';
  });
  
  // Separate time for each mode (current countdown)
  const [modeTimes, setModeTimes] = useState<Record<TimerMode, number>>(() => {
    const saved = localStorage.getItem('modeTimes');
    return saved ? JSON.parse(saved) : {
      pomodoro: DEFAULT_DURATIONS.pomodoro,
      shortBreak: DEFAULT_DURATIONS.shortBreak,
      longBreak: DEFAULT_DURATIONS.longBreak,
    };
  });
  
  // Custom durations (what to reset to)
  // Initialize from modeTimes if customDurations doesn't exist (migration)
  const [customDurations, setCustomDurations] = useState<Record<TimerMode, number>>(() => {
    const savedCustom = localStorage.getItem('customDurations');
    if (savedCustom) {
      return JSON.parse(savedCustom);
    }
    
    // Migration: use existing modeTimes as custom durations
    const savedModeTimes = localStorage.getItem('modeTimes');
    if (savedModeTimes) {
      return JSON.parse(savedModeTimes);
    }
    
    return {
      pomodoro: DEFAULT_DURATIONS.pomodoro,
      shortBreak: DEFAULT_DURATIONS.shortBreak,
      longBreak: DEFAULT_DURATIONS.longBreak,
    };
  });
  
  const timeLeft = modeTimes[mode];
  
  const [isRunning, setIsRunning] = useState(false);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState<StreakData>(() => {
    const saved = localStorage.getItem('streak');
    return saved ? JSON.parse(saved) : {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalSessions: 0,
    };
  });

  const setMode = useCallback((newMode: TimerMode) => {
    console.log(`🎨 Switching to ${newMode} mode`);
    setModeState(newMode);
    setIsRunning(false);
    localStorage.setItem('timerMode', newMode);
    
    // Update body class for background color
    document.body.className = `${newMode}-mode`;
    console.log(`✅ Body class set to: ${document.body.className}`);
    console.log(`⏱️ Preserved time for ${newMode}: ${Math.floor(modeTimes[newMode] / 60)}m ${modeTimes[newMode] % 60}s`);
  }, [modeTimes]);

  useEffect(() => {
    localStorage.setItem('customDurations', JSON.stringify(customDurations));
  }, [customDurations]);

  useEffect(() => {
    localStorage.setItem('modeTimes', JSON.stringify(modeTimes));
  }, [modeTimes]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    document.body.className = `${mode}-mode`;
    console.log(`🎨 Initial body class set to: ${document.body.className}`);
  }, [mode]);

  // Update document title with timer
  useEffect(() => {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getModeLabel = (mode: TimerMode): string => {
      switch (mode) {
        case 'pomodoro':
          return 'Pomodoro';
        case 'shortBreak':
          return 'Short Break';
        case 'longBreak':
          return 'Long Break';
      }
    };

    const modeLabel = getModeLabel(mode);
    const timeString = formatTime(timeLeft);
    
    if (isRunning) {
      document.title = `⏱️ ${timeString} - ${modeLabel} | Mindoro`;
    } else {
      document.title = `${timeString} - ${modeLabel} | Mindoro`;
    }

    // Restore default title on unmount
    return () => {
      document.title = 'Mindoro';
    };
  }, [timeLeft, mode, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setModeTimes((prev) => {
          const newTime = prev[mode] - 1;
          
          if (newTime <= 0) {
            setIsRunning(false);
            playSound('complete');
            // Update streak only for completed pomodoro sessions
            if (mode === 'pomodoro') {
              updateStreak();
            }
            return { ...prev, [mode]: 0 };
          }
          
          return { ...prev, [mode]: newTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const playSound = (type: 'start' | 'pause' | 'reset' | 'complete') => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds for different actions
    switch (type) {
      case 'start':
        // Ascending beep - exciting start
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'pause':
        // Descending beep - gentle pause
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(350, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'reset':
        // Quick double beep
        oscillator.frequency.setValueAtTime(450, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.08);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.15);
        break;
        
      case 'complete':
        // Continuous alarm-like ringing sound (3 seconds)
        oscillator.type = 'sine';
        
        // Repeating alarm pattern: Ring-Ring-Ring (like a phone or alarm)
        const ringPattern = [
          { start: 0, end: 0.4, freq: 800 },      // Ring 1
          { start: 0.5, end: 0.9, freq: 800 },    // Ring 2
          { start: 1.0, end: 1.4, freq: 800 },    // Ring 3
          { start: 1.5, end: 1.9, freq: 800 },    // Ring 4
          { start: 2.0, end: 2.4, freq: 800 },    // Ring 5
          { start: 2.5, end: 3.0, freq: 800 },    // Ring 6 (final, longer)
        ];
        
        ringPattern.forEach((ring, index) => {
          const osc = index === 0 ? oscillator : audioContext.createOscillator();
          const gain = index === 0 ? gainNode : audioContext.createGain();
          
          if (index > 0) {
            osc.connect(gain);
            gain.connect(audioContext.destination);
          }
          
          osc.type = 'sine';
          osc.frequency.value = ring.freq;
          
          // Volume envelope for each ring
          gain.gain.setValueAtTime(0, audioContext.currentTime + ring.start);
          gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + ring.start + 0.05);
          gain.gain.setValueAtTime(0.4, audioContext.currentTime + ring.end - 0.05);
          gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + ring.end);
          
          osc.start(audioContext.currentTime + ring.start);
          osc.stop(audioContext.currentTime + ring.end);
        });
        break;
    }
  };

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastDate = streak.lastCompletionDate ? new Date(streak.lastCompletionDate).toDateString() : null;
    
    if (lastDate === today) {
      // Already completed today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let newStreak = streak.currentStreak;
    
    if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak += 1;
    } else if (lastDate === null || lastDate !== today) {
      // First time or streak broken
      newStreak = 1;
    }

    const newStreakData: StreakData = {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastCompletionDate: today,
      totalSessions: streak.totalSessions + 1,
    };

    setStreak(newStreakData);
  }, [streak]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    playSound('start');
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    playSound('pause');
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setModeTimes((prev) => ({
      ...prev,
      [mode]: customDurations[mode]
    }));
    playSound('reset');
    console.log(`🔄 Reset ${mode} timer to ${Math.floor(customDurations[mode] / 60)} minutes`);
  }, [mode, customDurations]);

  const incrementTime = useCallback(() => {
    if (isRunning) return; // Don't allow changes while running
    setModeTimes((prev) => ({
      ...prev,
      [mode]: prev[mode] + 60 // Add 1 minute
    }));
  }, [mode, isRunning]);

  const decrementTime = useCallback(() => {
    if (isRunning) return; // Don't allow changes while running
    setModeTimes((prev) => ({
      ...prev,
      [mode]: Math.max(60, prev[mode] - 60) // Subtract 1 minute, minimum 1 minute
    }));
  }, [mode, isRunning]);

  const setCustomDuration = useCallback((targetMode: TimerMode, minutes: number) => {
    const seconds = minutes * 60;
    // Update custom durations (for reset)
    setCustomDurations((prev) => ({
      ...prev,
      [targetMode]: seconds
    }));
    // Also update current time for that mode
    setModeTimes((prev) => ({
      ...prev,
      [targetMode]: seconds
    }));
  }, []);

  const getModeDuration = useCallback((targetMode: TimerMode) => {
    return Math.floor(customDurations[targetMode] / 60);
  }, [customDurations]);

  const addTask = useCallback((text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  return (
    <TimerContext.Provider
      value={{
        mode,
        setMode,
        timeLeft,
        isRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        incrementTime,
        decrementTime,
        setCustomDuration,
        getModeDuration,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        streak,
        updateStreak,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
