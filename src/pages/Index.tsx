import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import TaskList from '@/components/TaskList';
import StreakCounter from '@/components/StreakCounter';
import LinksPanel from '@/components/LinksPanel';
import { pageContainer, pageSection } from '@/lib/motion-variants';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Navbar />
      <main className="flex-1 flex flex-col items-stretch px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)_minmax(0,1fr)] gap-6 lg:gap-8 items-start"
          variants={pageContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={pageSection} className="min-w-0 w-full lg:order-1">
            <TaskList />
          </motion.div>
          <motion.div
            variants={pageSection}
            className="min-w-0 w-full flex flex-col gap-6 lg:order-2 lg:justify-self-center lg:max-w-[400px]"
          >
            <Timer />
            <StreakCounter />
          </motion.div>
          <motion.div variants={pageSection} className="min-w-0 w-full lg:order-3">
            <LinksPanel />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
