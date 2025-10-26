import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check } from 'lucide-react';
import { useTimer } from '@/context/TimerContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const TaskList = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useTimer();
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-lg mx-auto mt-8"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-xl">Tasks</h2>
          <span className="text-white/60 text-sm">
            {tasks.filter(t => t.completed).length} / {tasks.length}
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all group"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-pomodoro"
                />
                <span
                  className={`flex-1 text-white ${
                    task.completed ? 'line-through opacity-60' : ''
                  }`}
                >
                  {task.text}
                </span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-white/10 text-white/60 hover:text-white transition-all"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Task Section */}
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Input
              autoFocus
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What are you working on?"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddTask}
                size="sm"
                className="bg-white text-pomodoro hover:bg-white/90 font-medium"
              >
                <Check className="w-4 h-4 mr-1" />
                Add
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskText('');
                }}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full bg-black/20 hover:bg-black/30 text-white border-2 border-dashed border-white/30 font-medium py-6"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </Button>
        )}

        {/* Placeholder for future integrations */}
        {tasks.length === 0 && !isAdding && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/50 text-xs text-center">
              🔗 Future: Sync with Google Tasks, Notion & Calendar
            </p>
          </div>
        )}
      </div>

      {/* Placeholder for streak tracking */}
      <div className="mt-4 text-center">
        <p className="text-white/40 text-sm">
          🔥 Streak tracking coming soon
        </p>
      </div>
    </motion.div>
  );
};

export default TaskList;
