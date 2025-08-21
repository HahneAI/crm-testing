// Simplified industry configuration for initial integration
export const getCoreConfig = () => {
  return {
    companyName: import.meta.env.VITE_COMPANY_NAME || 'TradeSphere',
    logoUrl: import.meta.env.VITE_LOGO_URL || '/logo.svg',
    headerIcon: import.meta.env.VITE_HEADER_ICON || 'MessageCircle',
    colors: {
      background: import.meta.env.VITE_PRIMARY_COLOR || '#2563eb',
      text: {
        onPrimary: '#ffffff'
      }
    }
  };
};

export const getTerminologyConfig = () => {
  return {
    businessType: 'AI Pricing Assistant',
    serviceTerms: ['pricing', 'estimation', 'analysis'],
    projectLanguage: 'projects',
    estimateLanguage: 'pricing',
    placeholderExamples: 'Describe the job details...',
    buttonTexts: {
      send: 'Send',
      clear: 'Clear Chat'
    }
  };
};

export const getSmartVisualThemeConfig = (theme: 'light' | 'dark' = 'light') => {
  return {
    colors: {
      primary: import.meta.env.VITE_PRIMARY_COLOR || '#2563eb',
      background: theme === 'dark' ? '#1f2937' : '#ffffff',
      text: {
        primary: theme === 'dark' ? '#ffffff' : '#000000'
      }
    }
  };
};

// Export any other functions y