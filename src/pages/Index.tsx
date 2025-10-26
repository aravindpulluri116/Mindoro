import Navbar from '@/components/Navbar';
import Timer from '@/components/Timer';
import TaskList from '@/components/TaskList';
import StreakCounter from '@/components/StreakCounter';
import Integrations from '@/components/Integrations';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <Timer />
        <TaskList />
        <StreakCounter />
        <Integrations />
      </main>
    </div>
  );
};

export default Index;
