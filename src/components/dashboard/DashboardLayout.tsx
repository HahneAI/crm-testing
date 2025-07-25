import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import DashboardMetrics from './DashboardMetrics';
import { DashboardProvider } from '../../contexts/DashboardContext';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
  showMetrics?: boolean;
  customActions?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
  showMetrics = false,
  customActions
}) => {
  const { userProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Header
            title={title}
            onMenuClick={() => setSidebarOpen(true)}
            customActions={customActions}
          />

          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {showMetrics && (
                <div className="mb-8">
                  <DashboardMetrics />
                </div>
              )}

              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardLayout;