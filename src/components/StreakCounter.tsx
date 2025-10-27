import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';

const StreakCounter = () => {
  const { streak } = useTimer();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full lg:min-w-[600px] mt-8"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Your Progress
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Current Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 rounded-lg p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {streak.currentStreak}
            </div>
            <div className="text-white/60 text-xs">
              Day Streak
            </div>
          </motion.div>

          {/* Longest Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 rounded-lg p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {streak.longestStreak}
            </div>
            <div className="text-white/60 text-xs">
              Best Streak
            </div>
          </motion.div>

          {/* Total Sessions */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/5 rounded-lg p-4 text-center"
          >
            <div className="flex justify-center mb-2">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {streak.totalSessions}
            </div>
            <div className="text-white/60 text-xs">
              Sessions
            </div>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/70 text-sm text-center">
            {streak.currentStreak === 0 && "Complete your first Pomodoro session to start your streak! 🎯"}
            {streak.currentStreak === 1 && "Great start! Keep it going tomorrow! 💪"}
            {streak.currentStreak >= 2 && streak.currentStreak < 7 && `${streak.currentStreak} days strong! You're building momentum! 🔥`}
            {streak.currentStreak >= 7 && streak.currentStreak < 30 && `Amazing ${streak.currentStreak}-day streak! You're unstoppable! 🚀`}
            {streak.currentStreak >= 30 && `Legendary ${streak.currentStreak}-day streak! You're a productivity master! 👑`}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCounter;
