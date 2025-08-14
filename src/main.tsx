import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';
import { Toaster } from 'react-hot-toast';

// PWA Registration with environment safety for Bolt.new compatibility
const registerPWA = async () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const { registerSW } = await import('virtual:pwa-register');
      const updateSW = registerSW({
        onNeedRefresh() {
          if (confirm('New content available. Reload?')) {
            updateSW(true);
          }
        },
        onOfflineReady() {
          console.log('TradeSphere is ready to work offline');
        },
      });
    } catch (error) {
      // Silently fail in development environments that don't support PWA
      console.log('PWA registration skipped (development environment)');
    }
  }
};

// Register PWA if environment supports it
registerPWA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);