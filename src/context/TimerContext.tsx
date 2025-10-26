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
  tasks: Task[];
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  streak: StreakData;
  updateStreak: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const MODE_DURATIONS = {
  pomodoro: 45 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TimerMode>(() => {
    const saved = localStorage.getItem('timerMode');
    return (saved as TimerMode) || 'pomodoro';
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('timeLeft');
    return saved ? parseInt(saved) : MODE_DURATIONS.pomodoro;
  });
  
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
    setModeState(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
    setIsRunning(false);
    localStorage.setItem('timerMode', newMode);
    
    // Update body class for background color
    document.body.className = `${newMode}-mode`;
  }, []);

  useEffect(() => {
    localStorage.setItem('timeLeft', timeLeft.toString());
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    document.body.className = `${mode}-mode`;
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playNotificationSound();
            // Update streak only for completed pomodoro sessions
            if (mode === 'pomodoro') {
              updateStreak();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjaJ0/LRfS0GJ37K8N+UPwsVYbjq7KRTEQlEm9/xwXMfBzWO1fLRgC4HKoHN8uCUPQsVYrfq7KdVFApFnuDyvmwhBjaJ0/LRfS0GJ37K8N+UPwsVYbjq7KRTEQlEm9/xwXMfBzWO1fLRgC4HKoHN8uCUPQsVYrfq7KdVFApFnuDyvmwhBjaJ0/LRfS0GJ37K8N+UPwsVYbjq7KRTEQlEm9/xwXMfBzWO1fLRgC4HKoHN8uCUPQsVYrfq7KdVFApFnuDyvmwhBjaJ0/LRfS0GJ37K8N+UPwsVYbjq7KRTEQlEm9/xwXMfBzWO1fLRgC4HKoHN8uCUPQsVYrfq7KdVFApFnuDyvmwhBjaJ0/LRfS0GJ37K8N+UPwsVYbjq7KRTEQlEm9/xwXMfBzWO1fLRgC4HKoHN8uCUPQ==');
    audio.play().catch(() => {
      // Handle autoplay restrictions
    });
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
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  }, [mode]);

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
