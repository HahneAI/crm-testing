import { AlertCircle } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-gray-900 dark:text-gray-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 bg-primary-600 text-white rounded-lg flex items-center justify-center animate-pulse-slow">
            <AlertCircle size={32} />
          </div>
          <div className="absolute inset-0 bg-primary-600 rounded-lg animate-ping opacity-25"></div>
        </div>
        
        <h1 className="text-2xl font-bold mt-4">Loading FieldSync</h1>
        <p className="text-gray-500 dark:text-gray-400">Please wait while we set things up...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;