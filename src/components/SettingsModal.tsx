import { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer, TimerMode } from '@/context/TimerContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'pomodoro' | 'shortBreak' | 'longBreak';

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { setCustomDuration, getModeDuration } = useTimer();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('pomodoro');
  const [pomodoroTime, setPomodoroTime] = useState('45');
  const [shortBreakTime, setShortBreakTime] = useState('5');
  const [longBreakTime, setLongBreakTime] = useState('15');

  // Update state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPomodoroTime(getModeDuration('pomodoro').toString());
      setShortBreakTime(getModeDuration('shortBreak').toString());
      setLongBreakTime(getModeDuration('longBreak').toString());
      setActiveTab('pomodoro');
    }
  }, [isOpen, getModeDuration]);

  const handleSave = () => {
    const pomo = Math.max(1, parseInt(pomodoroTime) || 45);
    const short = Math.max(1, parseInt(shortBreakTime) || 5);
    const long = Math.max(1, parseInt(longBreakTime) || 15);
    
    setCustomDuration('pomodoro', pomo);
    setCustomDuration('shortBreak', short);
    setCustomDuration('longBreak', long);
    onClose();
  };

  const getCurrentTime = () => {
    switch (activeTab) {
      case 'pomodoro':
        return pomodoroTime;
      case 'shortBreak':
        return shortBreakTime;
      case 'longBreak':
        return longBreakTime;
    }
  };

  const setCurrentTime = (value: string) => {
    switch (activeTab) {
      case 'pomodoro':
        setPomodoroTime(value);
        break;
      case 'shortBreak':
        setShortBreakTime(value);
        break;
      case 'longBreak':
        setLongBreakTime(value);
        break;
    }
  };

  const getTabLabel = (tab: SettingsTab) => {
    switch (tab) {
      case 'pomodoro':
        return 'Pomodoro';
      case 'shortBreak':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
    }
  };

  const incrementTime = () => {
    const current = parseInt(getCurrentTime()) || 0;
    setCurrentTime((current + 1).toString());
  };

  const decrementTime = () => {
    const current = parseInt(getCurrentTime()) || 0;
    setCurrentTime(Math.max(1, current - 1).toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg shadow-2xl max-w-lg w-full p-8 relative z-10 mx-4 border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Timer Settings</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-lg">
                {(['pomodoro', 'shortBreak', 'longBreak'] as SettingsTab[]).map((tab) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-md font-medium transition-all text-sm ${
                      activeTab === tab
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {getTabLabel(tab)}
                  </motion.button>
                ))}
              </div>

              {/* Time Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/90 mb-3 text-center">
                  Time (minutes)
                </label>
                <div className="flex items-center gap-3">
                  {/* Decrement Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={decrementTime}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <ChevronDown className="w-6 h-6 text-white" />
                  </motion.button>

                  {/* Input Field */}
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={getCurrentTime()}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      if (value === '' || /^[0-9]+$/.test(value)) {
                        setCurrentTime(value);
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="flex-1 px-4 py-3 text-center text-4xl font-bold text-white bg-white/10 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none cursor-text min-w-0 placeholder-white/30"
                    placeholder="0"
                    autoComplete="off"
                  />

                  {/* Increment Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={incrementTime}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <ChevronUp className="w-6 h-6 text-white" />
                  </motion.button>
                </div>
                <p className="text-xs text-white/60 text-center mt-3">
                  Enter any duration (minimum 1 minute)
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition-all border border-white/30 shadow-lg"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

