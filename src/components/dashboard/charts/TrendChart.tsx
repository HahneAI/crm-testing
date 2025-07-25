import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TrendChartProps {
  data: any[];
  type: 'revenue' | 'jobs' | 'profit';
  timeRange: string;
  height?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({
  data,
  type,
  timeRange,
  height = 300
}) => {
  const getColor = (type: string) => {
    const colors = {
      revenue: '#10B981',
      jobs: '#3B82F6',
      profit: '#8B5CF6'
    };
    return colors[type] || '#6B7280';
  };

  const formatYAxis = (value: number) => {
    if (type === 'revenue' || type === 'profit') {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return value.toString();
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={formatYAxis}
        />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value: number) => {
            if (type === 'revenue' || type === 'profit') {
              return [`$${value.toLocaleString()}`, type.charAt(0).toUpperCase() + type.slice(1)];
            }
            return [value, type.charAt(0).toUpperCase() + type.slice(1)];
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={getColor(type)}
          strokeWidth={2}
          dot={{ fill: getColor(type), strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
