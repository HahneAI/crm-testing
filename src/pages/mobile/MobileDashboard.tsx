import React from 'react';
import MobileHeader from '../../components/mobile/MobileHeader';
import MobileNav from '../../components/mobile/MobileNav';
import { MobileCard } from '../../components/mobile/MobileCards';
import JobStatusCard from '../../components/dashboard/JobStatusCard';
import RecentJobsList from '../../components/dashboard/RecentJobsList';
import LaborHoursChart from '../../components/dashboard/LaborHoursChart';

const MobileDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader toggleSidebar={() => {}} />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4">
          <MobileCard title="Job Status">
            <JobStatusCard />
          </MobileCard>
          <MobileCard title="Recent Jobs">
            <RecentJobsList />
          </MobileCard>
          <MobileCard title="Labor Hours">
            <LaborHoursChart />
          </MobileCard>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default MobileDashboard;
