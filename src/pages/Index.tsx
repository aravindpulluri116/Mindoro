import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import TaskList from '@/components/TaskList';
import StreakCounter from '@/components/StreakCounter';
import Integrations from '@/components/Integrations';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Navbar />
      <main className="flex-1 flex flex-col items-center px-8 py-8">
        {/* Three column layout: Tasks | Timer | Apps */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-start">
          {/* Left Column - Tasks */}
          <div className="lg:order-1 order-2">
            <TaskList />
          </div>
          
          {/* Middle Column - Timer & Progress */}
          <div className="lg:order-2 order-1 flex flex-col">
            <Timer />
            <StreakCounter />
          </div>
          
          {/* Right Column - Apps/Integrations */}
          <div className="lg:order-3 order-3">
            <Integrations />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
