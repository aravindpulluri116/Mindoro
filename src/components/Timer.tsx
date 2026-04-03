import { useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Target } from 'lucide-react';
import { useTimer, TimerMode, formatFocusDuration } from '@/context/TimerContext';
import { FloatingShell } from '@/components/FloatingShell';
import { springSnappy, springSoft } from '@/lib/motion-variants';

type StartRipple = { id: number; cx: number; cy: number };

const Timer = () => {
  const reduceMotion = useReducedMotion();
  const [startRipple, setStartRipple] = useState<StartRipple | null>(null);
  const {
    mode,
    setMode,
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    incrementTime,
    decrementTime,
    activeTask,
  } = useTimer();

  const displayMins = Math.floor(timeLeft / 60);
  const displaySecs = timeLeft % 60;

  const getModeLabel = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro':
        return 'Pomodoro';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'pomodoro':
        return '#D95550';
      case 'shortBreak':
        return '#69CEE5';
      case 'longBreak':
        return '#5577C0';
    }
  };

  const modes: TimerMode[] = ['pomodoro', 'shortBreak', 'longBreak'];

  const handlePlayPause = (e: MouseEvent<HTMLButtonElement>) => {
    if (isRunning) {
      pauseTimer();
      return;
    }
    if (!reduceMotion) {
      const rect = e.currentTarget.getBoundingClientRect();
      setStartRipple({
        id: Date.now(),
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      });
    }
    startTimer();
  };

  return (
    <div className="w-full">
      <FloatingShell className="p-7 sm:p-10 lg:p-12">
        <div
          className="flex flex-wrap justify-center gap-0.5 sm:gap-1 mb-5"
          role="tablist"
          aria-label="Timer mode"
        >
          {modes.map((m) => (
            <motion.button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`relative px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium outline-none focus-visible:ring-1 focus-visible:ring-white/35 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
                mode === m ? 'text-white' : 'text-white/45 hover:text-white/85'
              }`}
              whileTap={{ scale: 0.98 }}
              transition={springSnappy}
            >
              {mode === m && (
                <motion.div
                  layoutId="timer-mode-pill"
                  className="absolute inset-0 rounded-md bg-white/[0.11]"
                  transition={springSnappy}
                />
              )}
              <span className="relative z-10 whitespace-nowrap">{getModeLabel(m)}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'pomodoro' && (
            <motion.div
              key="focus-strip"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={springSoft}
              className="mb-4"
            >
              {activeTask ? (
                <div className="flex flex-nowrap items-center justify-center gap-2 min-w-0 max-w-full px-2 text-sm text-white/85">
                  <Target className="size-3.5 shrink-0 text-white/55" aria-hidden />
                  <span className="text-white/45 shrink-0">Working on</span>
                  <span className="font-medium text-white truncate min-w-0 flex-1 basis-0 max-w-[10rem] sm:max-w-[14rem] text-center">
                    {activeTask.text}
                  </span>
                  <span className="text-white/35 shrink-0" aria-hidden>
                    ·
                  </span>
                  <span className="text-white/50 tabular-nums shrink-0 whitespace-nowrap">
                    {formatFocusDuration(activeTask.secondsSpent)} logged
                  </span>
                </div>
              ) : (
                <p className="text-center text-white/50 text-sm px-2">
                  Tap the target on a to-do to track time on that task.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-8 min-h-[7.5rem] sm:min-h-[9rem] lg:min-h-[10rem] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={springSoft}
              className="w-full"
            >
              <div
                className="timer-clock-digits font-bold text-white font-poppins tabular-nums tracking-tight leading-none text-8xl sm:text-9xl md:text-[6.5rem] lg:text-[7.25rem] xl:text-[7.75rem]"
                data-timer-mode={mode}
                data-running={isRunning ? 'true' : 'false'}
              >
                {displayMins.toString().padStart(2, '0')}:{displaySecs.toString().padStart(2, '0')}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="flex items-center justify-center gap-2 mt-5"
            initial={false}
            animate={{ opacity: 1 }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, y: 2 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnappy}
              onClick={decrementTime}
              disabled={isRunning}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Decrease time"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.9 }}
              transition={springSnappy}
              onClick={incrementTime}
              disabled={isRunning}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Increase time"
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center">
          {startRipple &&
            createPortal(
              <motion.div
                key={startRipple.id}
                aria-hidden
                className="pointer-events-none fixed z-[1000] rounded-full bg-black/28"
                style={{
                  left: startRipple.cx,
                  top: startRipple.cy,
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{ width: 0, height: 0, opacity: 0.65 }}
                animate={{ width: '220vmax', height: '220vmax', opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => setStartRipple(null)}
              />,
              document.body
            )}
          <motion.button
            type="button"
            onClick={handlePlayPause}
            className="relative z-[1] inline-flex items-center justify-center gap-2 bg-white hover:bg-white/92 font-semibold px-9 py-3 text-base rounded-xl shadow-[0_6px_20px_-6px_rgba(0,0,0,0.15)] min-w-[152px]"
            style={{ color: getModeColor() }}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 24px -8px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.97 }}
            transition={springSnappy}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isRunning ? 'pause' : 'start'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={springSnappy}
                className="inline-flex items-center gap-1.5"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    START
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: -75 }}
            whileTap={{ scale: 0.92 }}
            transition={springSnappy}
            onClick={resetTimer}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/18 text-white border border-white/15"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>
      </FloatingShell>
    </div>
  );
};

export default Timer;
