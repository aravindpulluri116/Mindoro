import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  /** Total seconds logged on this task while in Pomodoro with this task selected. */
  secondsSpent: number;
  /** Total seconds on short/long break with this task selected as focus. */
  secondsRest: number;
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
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  activeTask: Task | null;
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

function formatTimeForTabTitle(totalMs: number): string {
  const t = Math.max(0, totalMs) / 1000;
  const mins = Math.floor(t / 60);
  const secs = Math.floor(t % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getModeLabelForTab(m: TimerMode): string {
  switch (m) {
    case 'pomodoro':
      return 'Pomodoro';
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
  }
}

function truncateForTabTitle(raw: string, maxLen: number): string {
  const single = raw.replace(/\s+/g, ' ').trim();
  if (!single) return '';
  return single.length <= maxLen ? single : `${single.slice(0, maxLen - 1)}…`;
}

function isBreakMode(m: TimerMode): boolean {
  return m === 'shortBreak' || m === 'longBreak';
}

function buildTabTitle(totalMs: number, mode: TimerMode, taskText: string | null | undefined): string {
  const timeString = formatTimeForTabTitle(totalMs);
  const taskSnippet = taskText ? truncateForTabTitle(taskText, 42) : '';
  const taskPart = taskSnippet ? ` · ${taskSnippet}` : '';
  return `${timeString}${taskPart} - ${getModeLabelForTab(mode)} | Mindoro`;
}

const TIMER_LIVE_KEY = 'mindoroTimerLive';
const PENDING_EXPIRED_KEY = 'mindoroPendingExpired';

type TimerLiveV1 = {
  v: 1;
  phaseEndAt: number;
  mode: TimerMode;
  focusSegmentStart: number | null;
  restSegmentStart: number | null;
};

function parseModeTimesRecord(): Record<TimerMode, number> {
  const saved = localStorage.getItem('modeTimes');
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Record<string, number>;
      return {
        pomodoro: typeof parsed.pomodoro === 'number' ? parsed.pomodoro : DEFAULT_DURATIONS.pomodoro,
        shortBreak: typeof parsed.shortBreak === 'number' ? parsed.shortBreak : DEFAULT_DURATIONS.shortBreak,
        longBreak: typeof parsed.longBreak === 'number' ? parsed.longBreak : DEFAULT_DURATIONS.longBreak,
      };
    } catch {
      /* fall through */
    }
  }
  return {
    pomodoro: DEFAULT_DURATIONS.pomodoro,
    shortBreak: DEFAULT_DURATIONS.shortBreak,
    longBreak: DEFAULT_DURATIONS.longBreak,
  };
}

function clearTimerLivePersist() {
  try {
    localStorage.removeItem(TIMER_LIVE_KEY);
  } catch {
    /* ignore */
  }
}

function writeTimerLivePersist(
  phaseEndAt: number,
  mode: TimerMode,
  focusSegmentStart: number | null,
  restSegmentStart: number | null
) {
  try {
    const payload: TimerLiveV1 = {
      v: 1,
      phaseEndAt,
      mode,
      focusSegmentStart,
      restSegmentStart,
    };
    localStorage.setItem(TIMER_LIVE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

type InitialTimerLoad = {
  remainingMs: number;
  isRunning: boolean;
  phaseEndAt: number | null;
  focusSegmentStart: number | null;
  restSegmentStart: number | null;
};

function readInitialTimerLoad(
  times: Record<TimerMode, number>,
  savedMode: TimerMode
): InitialTimerLoad {
  const defaultRemaining = (times[savedMode] ?? DEFAULT_DURATIONS.pomodoro) * 1000;

  try {
    const raw = localStorage.getItem(TIMER_LIVE_KEY);
    if (raw) {
      const o = JSON.parse(raw) as Partial<TimerLiveV1>;
      if (o.v === 1 && typeof o.phaseEndAt === 'number' && o.mode) {
        const now = Date.now();
        if (o.phaseEndAt > now) {
          return {
            remainingMs: o.phaseEndAt - now,
            isRunning: true,
            phaseEndAt: o.phaseEndAt,
            focusSegmentStart: typeof o.focusSegmentStart === 'number' ? o.focusSegmentStart : null,
            restSegmentStart: typeof o.restSegmentStart === 'number' ? o.restSegmentStart : null,
          };
        }
        clearTimerLivePersist();
        try {
          sessionStorage.setItem(
            PENDING_EXPIRED_KEY,
            JSON.stringify({
              mode: o.mode,
              phaseEndAt: o.phaseEndAt,
              focusSegmentStart: typeof o.focusSegmentStart === 'number' ? o.focusSegmentStart : null,
              restSegmentStart: typeof o.restSegmentStart === 'number' ? o.restSegmentStart : null,
            })
          );
        } catch {
          /* ignore */
        }
        return {
          remainingMs: savedMode === o.mode ? 0 : defaultRemaining,
          isRunning: false,
          phaseEndAt: null,
          focusSegmentStart: null,
          restSegmentStart: null,
        };
      }
    }
  } catch {
    clearTimerLivePersist();
  }

  return {
    remainingMs: defaultRemaining,
    isRunning: false,
    phaseEndAt: null,
    focusSegmentStart: null,
    restSegmentStart: null,
  };
}

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<TimerMode>(() => {
    const saved = localStorage.getItem('timerMode');
    return (saved as TimerMode) || 'pomodoro';
  });
  
  // Separate time for each mode (current countdown)
  const [modeTimes, setModeTimes] = useState<Record<TimerMode, number>>(() => parseModeTimesRecord());
  
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

  const bootstrapRef = useRef<{
    initialTimer: InitialTimerLoad;
  } | null>(null);
  if (bootstrapRef.current === null) {
    const savedMode = (localStorage.getItem('timerMode') as TimerMode) || 'pomodoro';
    const times = parseModeTimesRecord();
    bootstrapRef.current = {
      initialTimer: readInitialTimerLoad(times, savedMode),
    };
  }
  const initialTimer = bootstrapRef.current.initialTimer;

  const [remainingMs, setRemainingMs] = useState(initialTimer.remainingMs);
  const [isRunning, setIsRunning] = useState(initialTimer.isRunning);

  const phaseEndAtRef = useRef<number | null>(initialTimer.phaseEndAt);
  const remainingMsRef = useRef(0);

  remainingMsRef.current = remainingMs;
  const timeLeft = Math.max(0, Math.floor(remainingMs / 1000));
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Task[];
      return parsed.map((t) => ({
        ...t,
        secondsSpent: typeof t.secondsSpent === 'number' ? t.secondsSpent : 0,
        secondsRest: typeof t.secondsRest === 'number' ? t.secondsRest : 0,
      }));
    } catch {
      return [];
    }
  });

  const [activeTaskId, setActiveTaskIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('activeTaskId');
    } catch {
      return null;
    }
  });

  const activeTaskIdRef = useRef<string | null>(activeTaskId);
  const modeRef = useRef(mode);
  const isRunningRef = useRef(isRunning);
  const tasksRef = useRef<Task[]>(tasks);
  const lastTabTitleRef = useRef('');
  /** Wall-clock start of the current Pomodoro run segment (after each start / resume / task switch). */
  const focusSegmentStartRef = useRef<number | null>(initialTimer.focusSegmentStart);
  /** Wall-clock start of the current break run segment (short/long) with a focus task. */
  const restSegmentStartRef = useRef<number | null>(initialTimer.restSegmentStart);

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId && !tasks.some((t) => t.id === activeTaskId)) {
      setActiveTaskIdState(null);
      localStorage.removeItem('activeTaskId');
    }
  }, [tasks, activeTaskId]);

  const flushPomodoroFocusToTask = useCallback(() => {
    const id = activeTaskIdRef.current;
    const start = focusSegmentStartRef.current;
    focusSegmentStartRef.current = null;
    if (!id || start == null) return;
    const deltaSec = Math.max(0, Math.round((Date.now() - start) / 1000));
    if (deltaSec === 0) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, secondsSpent: (t.secondsSpent ?? 0) + deltaSec } : t
      )
    );
  }, []);

  const flushRestToTask = useCallback(() => {
    const id = activeTaskIdRef.current;
    const start = restSegmentStartRef.current;
    restSegmentStartRef.current = null;
    if (!id || start == null) return;
    const deltaSec = Math.max(0, Math.round((Date.now() - start) / 1000));
    if (deltaSec === 0) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, secondsRest: (t.secondsRest ?? 0) + deltaSec } : t
      )
    );
  }, []);

  const setActiveTaskId = useCallback(
    (id: string | null) => {
      if (isRunningRef.current && modeRef.current === 'pomodoro') {
        flushPomodoroFocusToTask();
        focusSegmentStartRef.current = id ? Date.now() : null;
      } else if (isRunningRef.current && isBreakMode(modeRef.current)) {
        flushRestToTask();
        restSegmentStartRef.current = id ? Date.now() : null;
      }
      setActiveTaskIdState(id);
      if (id) localStorage.setItem('activeTaskId', id);
      else localStorage.removeItem('activeTaskId');
      const end = phaseEndAtRef.current;
      if (isRunningRef.current && end != null && end > Date.now()) {
        writeTimerLivePersist(
          end,
          modeRef.current,
          focusSegmentStartRef.current,
          restSegmentStartRef.current
        );
      }
    },
    [flushPomodoroFocusToTask, flushRestToTask]
  );

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
    if (isRunningRef.current) {
      if (modeRef.current === 'pomodoro') {
        flushPomodoroFocusToTask();
      } else if (isBreakMode(modeRef.current)) {
        flushRestToTask();
      }
    }
    focusSegmentStartRef.current = null;
    restSegmentStartRef.current = null;
    clearTimerLivePersist();
    console.log(`🎨 Switching to ${newMode} mode`);
    setModeState(newMode);
    setIsRunning(false);
    localStorage.setItem('timerMode', newMode);
    console.log(`⏱️ Preserved time for ${newMode}: ${Math.floor(modeTimes[newMode] / 60)}m ${modeTimes[newMode] % 60}s`);
  }, [modeTimes, flushPomodoroFocusToTask, flushRestToTask]);

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
    const cls = [`${mode}-mode`];
    if (isRunning) cls.push('timer-running');
    document.body.className = cls.join(' ');
  }, [mode, isRunning]);

  // Persist running deadline so refresh / tab close can restore (pagehide catches mobile closes).
  useEffect(() => {
    if (!isRunning) return;
    const snapshot = () => {
      const end = phaseEndAtRef.current;
      if (end != null && end > Date.now()) {
        writeTimerLivePersist(
          end,
          modeRef.current,
          focusSegmentStartRef.current,
          restSegmentStartRef.current
        );
      }
    };
    window.addEventListener('pagehide', snapshot);
    window.addEventListener('beforeunload', snapshot);
    const id = window.setInterval(snapshot, 3000);
    return () => {
      window.removeEventListener('pagehide', snapshot);
      window.removeEventListener('beforeunload', snapshot);
      window.clearInterval(id);
    };
  }, [isRunning]);

  // Session finished while the app was closed: apply streak / focus credit once.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(PENDING_EXPIRED_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      sessionStorage.removeItem(PENDING_EXPIRED_KEY);
      const exp = JSON.parse(raw) as {
        mode: TimerMode;
        phaseEndAt: number;
        focusSegmentStart: number | null;
        restSegmentStart?: number | null;
      };
      setModeTimes((prev) => ({ ...prev, [exp.mode]: 0 }));
      if (exp.mode === 'pomodoro') {
        setStreak((prev) => {
          const today = new Date().toDateString();
          const lastDate = prev.lastCompletionDate ? new Date(prev.lastCompletionDate).toDateString() : null;
          if (lastDate === today) return prev;
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toDateString();
          let newStreak = prev.currentStreak;
          if (lastDate === yesterdayStr) newStreak += 1;
          else if (lastDate === null || lastDate !== today) newStreak = 1;
          return {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, prev.longestStreak),
            lastCompletionDate: today,
            totalSessions: prev.totalSessions + 1,
          };
        });
        if (exp.focusSegmentStart != null) {
          const deltaSec = Math.max(0, Math.round((exp.phaseEndAt - exp.focusSegmentStart) / 1000));
          const taskId = activeTaskIdRef.current;
          if (taskId && deltaSec > 0) {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId ? { ...t, secondsSpent: (t.secondsSpent ?? 0) + deltaSec } : t
              )
            );
          }
        }
      } else if (isBreakMode(exp.mode) && exp.restSegmentStart != null) {
        const deltaSec = Math.max(0, Math.round((exp.phaseEndAt - exp.restSegmentStart) / 1000));
        const taskId = activeTaskIdRef.current;
        if (taskId && deltaSec > 0) {
          setTasks((prev) =>
            prev.map((t) =>
              t.id === taskId ? { ...t, secondsRest: (t.secondsRest ?? 0) + deltaSec } : t
            )
          );
        }
      }
      const savedMode = (localStorage.getItem('timerMode') as TimerMode) || 'pomodoro';
      if (savedMode === exp.mode) {
        setRemainingMs(0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // When paused, keep millisecond display aligned with stored seconds for this mode.
  useEffect(() => {
    if (!isRunning) {
      setRemainingMs(modeTimes[mode] * 1000);
      phaseEndAtRef.current = null;
    }
  }, [mode, modeTimes, isRunning]);

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

  useEffect(() => {
    if (!isRunning) return;

    let raf = 0;
    let intervalId = 0;
    let cancelled = false;

    // Shared tick: RAF is throttled in background tabs, so the interval keeps
    // remainingMs (and document title) accurate while another tab is focused.
    const applyTick = (): boolean => {
      if (cancelled) return true;
      const end = phaseEndAtRef.current;
      if (end == null) return true;

      const ms = Math.max(0, end - Date.now());
      setRemainingMs(ms);

      if (ms <= 0) {
        phaseEndAtRef.current = null;
        clearTimerLivePersist();
        setIsRunning(false);
        setModeTimes((prev) => ({ ...prev, [mode]: 0 }));
        playSound('complete');
        if (mode === 'pomodoro') {
          flushPomodoroFocusToTask();
          updateStreak();
        } else if (isBreakMode(mode)) {
          flushRestToTask();
        }
        return true;
      }

      const tid = activeTaskIdRef.current;
      const task = tid ? tasksRef.current.find((t) => t.id === tid) : undefined;
      const nextTitle = buildTabTitle(ms, modeRef.current, task?.text ?? null);
      if (nextTitle !== lastTabTitleRef.current) {
        lastTabTitleRef.current = nextTitle;
        document.title = nextTitle;
      }
      return false;
    };

    const tick = () => {
      if (cancelled) return;
      if (applyTick()) return;
      raf = requestAnimationFrame(tick);
    };

    const onVisibilityChange = () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      applyTick();
    };

    raf = requestAnimationFrame(tick);
    // Background tabs throttle RAF; poll a bit faster so the tab title can move each second.
    intervalId = window.setInterval(() => {
      if (!cancelled && document.hidden) applyTick();
    }, 500);

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isRunning, mode, flushPomodoroFocusToTask, flushRestToTask]); // eslint-disable-line react-hooks/exhaustive-deps -- omit updateStreak/playSound

  const startTimer = useCallback(() => {
    const ms = remainingMsRef.current;
    const end = Date.now() + ms;
    phaseEndAtRef.current = end;
    if (modeRef.current === 'pomodoro') {
      focusSegmentStartRef.current = Date.now();
      restSegmentStartRef.current = null;
    } else if (isBreakMode(modeRef.current) && activeTaskIdRef.current) {
      restSegmentStartRef.current = Date.now();
      focusSegmentStartRef.current = null;
    } else {
      focusSegmentStartRef.current = null;
      restSegmentStartRef.current = null;
    }
    writeTimerLivePersist(
      end,
      modeRef.current,
      focusSegmentStartRef.current,
      restSegmentStartRef.current
    );
    setIsRunning(true);
    playSound('start');
  }, []);

  const pauseTimer = useCallback(() => {
    if (mode === 'pomodoro') {
      flushPomodoroFocusToTask();
    } else if (isBreakMode(mode)) {
      flushRestToTask();
    }
    const end = phaseEndAtRef.current;
    if (end != null) {
      const ms = Math.max(0, end - Date.now());
      const secondsSnapshot = Math.max(0, Math.round(ms / 1000));
      setModeTimes((prev) => ({ ...prev, [mode]: secondsSnapshot }));
      setRemainingMs(secondsSnapshot * 1000);
    }
    phaseEndAtRef.current = null;
    clearTimerLivePersist();
    setIsRunning(false);
    playSound('pause');
  }, [mode, flushPomodoroFocusToTask, flushRestToTask]);

  const resetTimer = useCallback(() => {
    if (isRunning && mode === 'pomodoro') {
      flushPomodoroFocusToTask();
    } else if (isRunning && isBreakMode(mode)) {
      flushRestToTask();
    }
    focusSegmentStartRef.current = null;
    restSegmentStartRef.current = null;
    clearTimerLivePersist();
    setIsRunning(false);
    setModeTimes((prev) => ({
      ...prev,
      [mode]: customDurations[mode]
    }));
    playSound('reset');
    console.log(`🔄 Reset ${mode} timer to ${Math.floor(customDurations[mode] / 60)} minutes`);
  }, [mode, customDurations, isRunning, flushPomodoroFocusToTask, flushRestToTask]);

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
      secondsSpent: 0,
      secondsRest: 0,
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const willComplete = !task.completed;
      if (willComplete && activeTaskId === id && isRunning) {
        if (mode === 'pomodoro') {
          flushPomodoroFocusToTask();
        } else if (isBreakMode(mode)) {
          flushRestToTask();
        }
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      if (willComplete && activeTaskId === id) {
        setActiveTaskIdState(null);
        localStorage.removeItem('activeTaskId');
      }
    },
    [tasks, activeTaskId, isRunning, mode, flushPomodoroFocusToTask, flushRestToTask]
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    if (activeTaskIdRef.current === id) {
      setActiveTaskIdState(null);
      localStorage.removeItem('activeTaskId');
    }
  }, []);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId]
  );

  // Tab title while paused (running path updates title inside applyTick to avoid resetting
  // document.title on every React render — that was coalescing updates to ~2s in the tab bar).
  useEffect(() => {
    if (isRunning) return;
    const next = buildTabTitle(remainingMs, mode, activeTask?.text ?? null);
    if (next !== lastTabTitleRef.current) {
      lastTabTitleRef.current = next;
      document.title = next;
    }
  }, [remainingMs, mode, activeTask, isRunning]);

  useEffect(() => {
    return () => {
      document.title = 'Mindoro';
    };
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
        activeTaskId,
        setActiveTaskId,
        activeTask,
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

/** Human-readable logged focus time for a task. */
export function formatFocusDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return s === 0 ? '0s' : `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    if (m === 0 && r === 0) return `${h}h`;
    if (r === 0) return `${h}h ${m}m`;
    return `${h}h ${m}m ${r}s`;
  }
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
}
