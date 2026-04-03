import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { FloatingShell } from '@/components/FloatingShell';
import { springSnappy, springSoft, staggerGrid, gridTile } from '@/lib/motion-variants';

const StreakCounter = () => {
  const { streak } = useTimer();

  return (
    <div className="w-full">
      <FloatingShell className="p-6 sm:p-8">
        <motion.h3
          className="text-white font-semibold text-lg mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={springSoft}
        >
          <motion.span
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame className="w-5 h-5 text-orange-400" />
          </motion.span>
          Your Progress
        </motion.h3>

        <motion.div
          className="grid grid-cols-3 gap-3 sm:gap-4"
          variants={staggerGrid}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={gridTile}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={springSnappy}
            className="bg-white/[0.06] rounded-xl p-4 text-center border border-white/[0.08] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.16)]"
          >
            <div className="flex justify-center mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <motion.div
              key={streak.currentStreak}
              initial={{ scale: 1.2, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springSnappy}
              className="text-3xl font-bold text-white mb-1 tabular-nums"
            >
              {streak.currentStreak}
            </motion.div>
            <div className="text-white/60 text-xs">Day Streak</div>
          </motion.div>

          <motion.div
            variants={gridTile}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={springSnappy}
            className="bg-white/[0.06] rounded-xl p-4 text-center border border-white/[0.08] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.16)]"
          >
            <div className="flex justify-center mb-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <motion.div
              key={streak.longestStreak}
              initial={{ scale: 1.15, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springSnappy}
              className="text-3xl font-bold text-white mb-1 tabular-nums"
            >
              {streak.longestStreak}
            </motion.div>
            <div className="text-white/60 text-xs">Best Streak</div>
          </motion.div>

          <motion.div
            variants={gridTile}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={springSnappy}
            className="bg-white/[0.06] rounded-xl p-4 text-center border border-white/[0.08] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.16)]"
          >
            <div className="flex justify-center mb-2">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <motion.div
              key={streak.totalSessions}
              initial={{ scale: 1.15, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={springSnappy}
              className="text-3xl font-bold text-white mb-1 tabular-nums"
            >
              {streak.totalSessions}
            </motion.div>
            <div className="text-white/60 text-xs">Sessions</div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-4 pt-4 border-t border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 280, damping: 28 }}
        >
          <p className="text-white/70 text-sm text-center">
            {streak.currentStreak === 0 &&
              'Complete your first Pomodoro session to start your streak! 🎯'}
            {streak.currentStreak === 1 && 'Great start! Keep it going tomorrow! 💪'}
            {streak.currentStreak >= 2 &&
              streak.currentStreak < 7 &&
              `${streak.currentStreak} days strong! You're building momentum! 🔥`}
            {streak.currentStreak >= 7 &&
              streak.currentStreak < 30 &&
              `Amazing ${streak.currentStreak}-day streak! You're unstoppable! 🚀`}
            {streak.currentStreak >= 30 &&
              `Legendary ${streak.currentStreak}-day streak! You're a productivity master! 👑`}
          </p>
        </motion.div>
      </FloatingShell>
    </div>
  );
};

export default StreakCounter;
