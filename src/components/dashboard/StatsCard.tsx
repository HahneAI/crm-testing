import { ReactNode } from 'react';
import Card from '../common/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
}

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className = '',
}: StatsCardProps) => {
  const trendIsPositive = trend && trend > 0;
  const trendIsNegative = trend && trend < 0;
  const trendIsNeutral = trend === 0;
  
  const trendColors = {
    positive: 'text-success-500 dark:text-success-500',
    negative: 'text-error-500 dark:text-error-500',
    neutral: 'text-gray-500 dark:text-gray-400',
  };
  
  const trendColor = trendIsPositive 
    ? trendColors.positive 
    : trendIsNegative 
      ? trendColors.negative 
      : trendColors.neutral;
  
  return (
    <Card className={`hover:border-gray-300 dark:hover:border-gray-700 ${className}`} hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="text-primary-500 dark:text-primary-400 p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg">
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-3 flex items-center">
          <span className={`inline-flex items-center ${trendColor}`}>
            {trendIsPositive && '↑'}
            {trendIsNegative && '↓'}
            {trendIsNeutral && '→'} 
            {Math.abs(trend)}%
          </span>
          {trendLabel && <span className="text-sm ml-1.5 text-gray-500 dark:text-gray-400">{trendLabel}</span>}
        </div>
      )}
    </Card>
  );
};

export default StatsCard;