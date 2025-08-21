import React from 'react';
import * as Icons from 'lucide-react';
import { getLoadingConfig, getCoreConfig } from '../../config/industry';

const LoadingScreen = () => {
  const config = getLoadingConfig();
  const coreConfig = getCoreConfig();

  // ADD THIS DEBUG LINE HERE:
  console.log('Logo URL from env:', import.meta.env.VITE_LOGO_URL);
  console.log('Core config logoUrl:', coreConfig.logoUrl);

  const IconComponent = Icons[config.icon] || Icons.MessageCircle;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Animated logo with industry-specific effects */}
          <div
            className="w-24 h-24 text-white rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
            style={{ backgroundColor: config.colors.primary }}
          >
            {coreConfig.logoUrl ? (
              <img src={coreConfig.logoUrl} alt={`${coreConfig.companyName} Logo`} className="w-full h-full object-contain" />
            ) : (
              <>
                {config.type === 'growth' && (
                  <div className="growth-animation">
                    <IconComponent size={40} className="animate-grow" />
                  </div>
                )}
                {config.type === 'building' && (
                  <div className="building-animation">
                    <IconComponent size={40} className="animate-build" />
                  </div>
                )}
                {config.type === 'generic' && (
                  <div className="pulse-animation">
                    <IconComponent size={40} className="animate-pulse-gentle" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Specialized animation effects */}
          <div className="absolute inset-0 -z-10">
            {config.type === 'growth' && (
              <>
                <div className="absolute inset-0 bg-green-400 rounded-2xl animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-green-300 rounded-2xl animate-ping opacity-15 animation-delay-75"></div>
              </>
            )}
            {config.type === 'building' && (
              <>
                <div className="absolute inset-0 bg-orange-400 rounded-2xl animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl animate-ping opacity-15 animation-delay-75"></div>
              </>
            )}
            {config.type === 'generic' && (
              <div
                className="absolute inset-0 rounded-2xl animate-ping opacity-30 -z-10"
                style={{ backgroundColor: config.colors.accent }}
              ></div>
            )}
          </div>
        </div>

        {/* Brand Name with Fade-in */}
        <h1
          className="text-4xl font-display font-bold mt-6 animate-fade-in"
          style={{ color: config.colors.primary }}
        >
          {import.meta.env.VITE_COMPANY_NAME || 'TradeSphere'}
        </h1>

        {/* Loading Message */}
        <p className="text-gray-600 dark:text-gray-400 animate-fade-in-delay">
          {config.message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;