import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Quotes = () => {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quote Engine
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Quote engine chat interface coming soon...
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Quotes;