import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const SplashScreen: React.FC = () => {
  const { theme } = useAppContext();

  const themeClasses = `theme-${theme}`;

  return (
    <div className={`${themeClasses} fixed inset-0 flex items-center justify-center bg-[var(--background-primary)] text-[var(--accent-primary)]`}>
      <h1 className="text-7xl md:text-8xl animate-splash-fade" style={{ fontFamily: 'var(--font-script)' }}>StoryVault</h1>
    </div>
  );
};

export default SplashScreen;