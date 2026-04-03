import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Target } from 'lucide-react';
import { useTimer, formatFocusDuration } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FloatingShell } from '@/components/FloatingShell';
import { springSnappy, springSoft } from '@/lib/motion-variants';

const TaskList = () => {
  const { tasks, addTask, toggleTask, deleteTask, activeTaskId, setActiveTaskId } =
    useTimer();
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      addTask(newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskText('');
    }
  };

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  return (
    <div className="w-full">
      <FloatingShell className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-white font-semibold text-lg sm:text-xl">To-do</h2>
          <motion.span
            key={`${done}-${total}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springSnappy}
            className="text-white/60 text-sm tabular-nums"
          >
            {done} / {total}
          </motion.span>
        </div>

        <div className="space-y-2 mb-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -18, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 14, scale: 0.98 }}
                transition={springSoft}
                className={`flex items-center gap-2 sm:gap-3 rounded-xl p-3 border group shadow-[0_4px_14px_-6px_rgba(0,0,0,0.18)] bg-white/[0.05] hover:bg-white/[0.09] ${
                  activeTaskId === task.id
                    ? 'border-white/35 ring-1 ring-white/15 bg-white/[0.1]'
                    : 'border-white/[0.06] hover:border-white/12'
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-pomodoro shrink-0"
                />
                <motion.button
                  type="button"
                  disabled={task.completed}
                  whileHover={task.completed ? {} : { scale: 1.08 }}
                  whileTap={task.completed ? {} : { scale: 0.92 }}
                  transition={springSnappy}
                  onClick={() => {
                    if (task.completed) return;
                    setActiveTaskId(activeTaskId === task.id ? null : task.id);
                  }}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    task.completed
                      ? 'text-white/20 cursor-not-allowed'
                      : activeTaskId === task.id
                        ? 'text-white bg-white/15'
                        : 'text-white/45 hover:text-white hover:bg-white/10'
                  }`}
                  title={
                    task.completed
                      ? 'Complete tasks cannot be a focus'
                      : activeTaskId === task.id
                        ? 'Clear focus'
                        : 'Track time on this task'
                  }
                  aria-label={
                    activeTaskId === task.id ? 'Clear focus task' : 'Set focus task'
                  }
                >
                  <Target
                    className={`w-4 h-4 ${activeTaskId === task.id ? 'fill-white/20' : ''}`}
                  />
                </motion.button>
                <div className="flex-1 min-w-0 text-left">
                  <span
                    className={`text-white block ${
                      task.completed ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {task.text}
                  </span>
                  <span className="text-white/45 text-xs tabular-nums">
                    {formatFocusDuration(task.secondsSpent)} focus · {formatFocusDuration(task.secondsRest ?? 0)}{' '}
                    rest
                  </span>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  transition={springSnappy}
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 sm:opacity-100 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-opacity"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isAdding ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={springSoft}
              className="space-y-2"
            >
              <Input
                autoFocus
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What are you working on?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white rounded-xl"
              />
              <div className="flex flex-wrap gap-2">
                <motion.div whileTap={{ scale: 0.97 }} transition={springSnappy}>
                  <Button
                    onClick={handleAddTask}
                    size="sm"
                    className="bg-white text-pomodoro hover:bg-white/90 font-medium rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }} transition={springSnappy}>
                  <Button
                    onClick={() => {
                      setIsAdding(false);
                      setNewTaskText('');
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10 rounded-lg"
                  >
                    Cancel
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="add-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={springSoft}
            >
              <motion.button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full bg-black/20 hover:bg-black/30 text-white border-2 border-dashed border-white/30 font-medium py-6 rounded-xl flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01, borderColor: 'rgba(255,255,255,0.45)' }}
                whileTap={{ scale: 0.99 }}
                transition={springSnappy}
              >
                <Plus className="w-5 h-5" />
                Add Task
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </FloatingShell>
    </div>
  );
};

export default TaskList;
