import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  format?: 'currency' | 'number' | 'percentage';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  trend?: number[];
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  format = 'number',
  color = 'blue',
  trend,
  loading = false
}) => {
  const formatValue = (val: number | string, fmt: string) => {
    if (typeof val === 'string') return val;

    switch (fmt) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'border-green-500 bg-green-50',
      blue: 'border-blue-500 bg-blue-50',
      purple: 'border-purple-500 bg-purple-50',
      orange: 'border-orange-500 bg-orange-50',
      red: 'border-red-500 bg-red-50'
    };
    return colors[color] || colors.blue;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatValue(value, format)}
          </p>

          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor(change)}`}>
              {change > 0 ? (
                <TrendingUpIcon className="w-4 h-4 mr-1" />
              ) : change < 0 ? (
                <TrendingDownIcon className="w-4 h-4 mr-1" />
              ) : null}
              <span>
                {Math.abs(change).toFixed(1)}% from last period
              </span>
            </div>
          )}
        </div>

        {trend && trend.length > 0 && (
          <div className="ml-4">
            <MiniChart data={trend} color={color} />
          </div>
        )}
      </div>
    </div>
  );
};

const MiniChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  const getStrokeColor = (color: string) => {
    const colors = {
      green: '#10B981',
      blue: '#3B82F6',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444'
    };
    return colors[color] || colors.blue;
  };

  return (
    <svg width="60" height="20" className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={getStrokeColor(color)}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default MetricCard;
