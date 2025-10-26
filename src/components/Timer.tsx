import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer, TimerMode } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import MotivationalQuote from './MotivationalQuote';

const Timer = () => {
  const { mode, setMode, timeLeft, isRunning, startTimer, pauseTimer, resetTimer } = useTimer();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const getModeMessage = () => {
    switch (mode) {
      case 'pomodoro':
        return 'Time to focus!';
      case 'shortBreak':
        return 'Take a short break!';
      case 'longBreak':
        return 'Take a long break!';
    }
  };

  const modes: TimerMode[] = ['pomodoro', 'shortBreak', 'longBreak'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-lg">
        {/* Mode Toggle */}
        <div className="flex gap-3 mb-8 justify-center">
          {modes.map((m) => (
            <motion.button
              key={m}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(m)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                mode === m
                  ? 'bg-black/30 text-white'
                  : 'bg-transparent text-white/70 hover:text-white'
              }`}
            >
              {getModeLabel(m)}
            </motion.button>
          ))}
        </div>

        {/* Timer Display */}
        <motion.div
          key={timeLeft}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="text-center mb-8"
        >
          <div className="text-8xl font-bold text-white mb-4 font-poppins">
            {formatTime(timeLeft)}
          </div>
          <p className="text-white/90 text-lg font-medium">{getModeMessage()}</p>
        </motion.div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center items-center">
          <Button
            onClick={isRunning ? pauseTimer : startTimer}
            size="lg"
            className="bg-white text-pomodoro hover:bg-white/90 font-semibold px-12 py-6 text-lg rounded-lg shadow-lg transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                START
              </>
            )}
          </Button>
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: -90 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* AI Motivational Quote */}
        <MotivationalQuote />
      </div>
    </motion.div>
  );
};

export default Timer;
