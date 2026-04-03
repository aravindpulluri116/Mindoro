import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Target } from 'lucide-react';
import { useTimer, TimerMode, formatFocusDuration } from '@/context/TimerContext';
import { springSnappy, springSoft } from '@/lib/motion-variants';

const Timer = () => {
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

  return (
    <div className="w-full">
      <motion.div
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg border border-white/5"
        whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
        transition={springSoft}
      >
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 justify-center rounded-xl bg-black/15 p-1.5">
          {modes.map((m) => (
            <motion.button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`relative px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm sm:text-base outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                mode === m ? 'text-white' : 'text-white/65 hover:text-white'
              }`}
              whileTap={{ scale: 0.97 }}
              transition={springSnappy}
            >
              {mode === m && (
                <motion.div
                  layoutId="timer-mode-pill"
                  className="absolute inset-0 rounded-lg bg-black/35 shadow-inner"
                  transition={springSnappy}
                />
              )}
              <span className="relative z-10">{getModeLabel(m)}</span>
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

        <div className="text-center mb-6 min-h-[6rem] sm:min-h-[7rem] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={springSoft}
              className="w-full"
            >
              <div className="font-bold text-white font-poppins tabular-nums tracking-tight text-7xl sm:text-8xl md:text-9xl">
                {displayMins.toString().padStart(2, '0')}:{displaySecs.toString().padStart(2, '0')}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="flex items-center justify-center gap-2 mt-4"
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

        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center">
          <motion.button
            type="button"
            onClick={isRunning ? pauseTimer : startTimer}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-white/92 font-semibold px-7 py-2.5 text-sm rounded-lg shadow-md min-w-[132px]"
            style={{ color: getModeColor() }}
            whileHover={{ scale: 1.03, boxShadow: '0 12px 28px rgba(0,0,0,0.18)' }}
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
                    <Pause className="w-4 h-4" />
                    PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
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
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/18 text-white border border-white/10"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Timer;
