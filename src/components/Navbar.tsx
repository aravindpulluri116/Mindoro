import { useState } from 'react';
import { Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from './SettingsModal';

const Navbar = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <nav className="w-full py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold text-xl flex items-center gap-2">
              Mindoro <Heart className="w-5 h-5 fill-white" />
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-white hover:bg-white/10 gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </nav>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default Navbar;
