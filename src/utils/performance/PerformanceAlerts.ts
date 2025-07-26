import toast from 'react-hot-toast';

export const sendPerformanceAlert = (message: string, severity: 'low' | 'medium' | 'high') => {
  const toastMethod = severity === 'high' ? toast.error : severity === 'medium' ? toast : toast;
  toastMethod(`Performance Alert (${severity}): ${message}`);

  // In a real application, this would send data to a monitoring service
  console.log(`Performance Alert (${severity}): ${message}`);
};
