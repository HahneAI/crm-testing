import React from 'react';

interface MobileCardProps {
  title: string;
  children: React.ReactNode;
}

export const MobileCard: React.FC<MobileCardProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
};
