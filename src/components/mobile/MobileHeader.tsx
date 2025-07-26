import React from 'react';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  toggleSidebar: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center md:hidden">
      <h1 className="text-lg font-bold">TradeSphere</h1>
      <button onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
    </header>
  );
};

export default MobileHeader;
