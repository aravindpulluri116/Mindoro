import { motion } from 'framer-motion';
import { Calendar, CheckSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Integrations = () => {
  const handleIntegrationClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const integrations = [
    {
      name: 'Google Tasks',
      icon: CheckSquare,
      color: 'text-blue-400',
      bgColor: 'hover:bg-blue-500/10',
      url: 'https://tasks.google.com/',
    },
    {
      name: 'Notion',
      icon: FileText,
      color: 'text-white',
      bgColor: 'hover:bg-white/10',
      url: 'https://www.notion.so/',
    },
    {
      name: 'Calendar',
      icon: Calendar,
      color: 'text-green-400',
      bgColor: 'hover:bg-green-500/10',
      url: 'https://calendar.google.com/',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h3 className="text-white font-semibold text-lg mb-4">
          Connect Your Tools
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Button
                onClick={() => handleIntegrationClick(integration.url)}
                variant="ghost"
                className={`w-full h-auto flex flex-col items-center gap-2 py-4 bg-white/5 ${integration.bgColor} text-white transition-all`}
              >
                <integration.icon className={`w-8 h-8 ${integration.color}`} />
                <span className="text-xs font-medium">{integration.name}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-white/50 text-xs text-center mt-4">
          Quick access to your favorite productivity tools
        </p>
      </div>
    </motion.div>
  );
};

export default Integrations;
