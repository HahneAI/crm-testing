import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Clock, Settings } from 'lucide-react';

const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-around md:hidden">
      <NavLink to="/dashboard" className="flex flex-col items-center">
        <Home size={24} />
        <span className="text-xs">Home</span>
      </NavLink>
      <NavLink to="/jobs" className="flex flex-col items-center">
        <Briefcase size={24} />
        <span className="text-xs">Jobs</span>
      </NavLink>
      <NavLink to="/time-entry" className="flex flex-col items-center">
        <Clock size={24} />
        <span className="text-xs">Time</span>
      </NavLink>
      <NavLink to="/settings" className="flex flex-col items-center">
        <Settings size={24} />
        <span className="text-xs">Settings</span>
      </NavLink>
    </nav>
  );
};

export default MobileNav;
