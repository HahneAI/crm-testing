import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from '../common/Card';
import { useTheme } from '../../context/ThemeContext';

Chart.register(...registerables);

interface LaborData {
  labels: string[];
  datasets: {
    actual: number[];
    projected: number[];
  };
}

interface LaborHoursChartProps {
  data: LaborData;
  className?: string;
}

const LaborHoursChart = ({ data, className = '' }: LaborHoursChartProps) => {
  const { theme } = useTheme();
  const chartRef = useRef<Chart<'line'> | null>(null);
  
  useEffect(() => {
    // Update chart colors when theme changes
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [theme]);
  
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Actual Hours',
        data: data.datasets.actual,
        borderColor: '#3B82F6', // primary-500
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#3B82F6',
        tension: 0.4,
      },
      {
        label: 'Projected Hours',
        data: data.datasets.projected,
        borderColor: '#9CA3AF', // gray-400
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.4,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
    },
  };
  
  return (
    <Card title="Labor Hours Trend" className={className}>
      <div className="h-64">
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
        />
      </div>
    </Card>
  );
};

export default LaborHoursChart;