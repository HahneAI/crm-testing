import React, { useState, useEffect } from 'react';
import { MobileCard } from '../mobile/MobileCards';
import reportWebVitals from '../../utils/performance/WebVitals';

const PerformanceDashboard: React.FC = () => {
  const [vitals, setVitals] = useState<any>({});

  useEffect(() => {
    const handleVitals = (metric: any) => {
      setVitals((prevVitals: any) => ({
        ...prevVitals,
        [metric.name]: metric.value,
      }));
    };
    reportWebVitals(handleVitals);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Performance Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MobileCard title="Largest Contentful Paint (LCP)">
          <p>{vitals.LCP ? `${vitals.LCP.toFixed(2)} ms` : 'Loading...'}</p>
        </MobileCard>
        <MobileCard title="First Input Delay (FID)">
          <p>{vitals.FID ? `${vitals.FID.toFixed(2)} ms` : 'Loading...'}</p>
        </MobileCard>
        <MobileCard title="Cumulative Layout Shift (CLS)">
          <p>{vitals.CLS ? vitals.CLS.toFixed(4) : 'Loading...'}</p>
        </MobileCard>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
