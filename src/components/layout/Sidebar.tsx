import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Clock, 
  Package, 
  Users, 
  Building2, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = () => {
  const { isAdmin, signOut, userProfile } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium' 
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;
  
const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/jobs', name: 'Jobs', icon: <Briefcase size={20} /> },
  { path: '/quotes', name: 'Quote Engine', icon: <Calculator size={20} /> }, // NEW
  { path: '/labor', name: 'Labor Hours', icon: <Clock size={20} /> },
  { path: '/materials', name: 'Materials', icon: <Package size={20} /> },
  { path: '/employees', name: 'Employees', icon: <Users size={20} />, adminOnly: true },
  { path: '/companies', name: 'Companies', icon: <Building2 size={20} />, adminOnly: true },
  { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
];

  
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);
  
  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
        onClick={toggleMobileMenu}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar - Desktop & Mobile */}
      <aside 
        className={`bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-300 ease-in-out
          ${mobileOpen 
            ? 'fixed inset-0 z-40' 
            : 'fixed -left-full md:left-0 md:sticky top-0 w-64 md:h-screen z-30'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2 rounded-md">
              <AlertCircle size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl">FieldSync</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Field Service Management</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="md:hidden" 
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
              {userProfile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium truncate">{userProfile?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userProfile?.role || 'User'}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={navLinkClass}
                  onClick={closeMobileMenu}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      
      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;