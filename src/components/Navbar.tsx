import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from './SettingsModal';
import { springSoft } from '@/lib/motion-variants';

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <motion.nav
        className="w-full py-4 px-6"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={springSoft}
          >
            <h1 className="text-white font-semibold text-xl flex items-center gap-2">
              Mindoro{' '}
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              >
                <Heart className="w-5 h-5 fill-white" />
              </motion.span>
            </h1>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springSoft, delay: 0.08 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={springSoft}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
                className="text-white hover:bg-white/10 gap-2 rounded-xl"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Navbar;
