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
      <main className="flex-1 flex flex-col items-stretch px-4 sm:px-6 lg:px-10 pt-3 sm:pt-4 lg:pt-5 pb-8 sm:pb-10 lg:pb-12">
        <motion.div
          className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(360px,540px)_minmax(0,1fr)] gap-8 lg:gap-10 xl:gap-12 items-start"
          variants={pageContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={pageSection} className="min-w-0 w-full lg:order-1">
            <TaskList />
          </motion.div>
          <motion.div
            variants={pageSection}
            className="min-w-0 w-full flex flex-col gap-8 lg:gap-10 lg:order-2 lg:justify-self-stretch"
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
