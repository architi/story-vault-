import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Button from './Button';

const LoginScreen: React.FC = () => {
  const { login } = useAppContext();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20 text-center px-4">
      <h1 className="text-7xl md:text-8xl text-[var(--accent-primary)] mb-4" style={{ fontFamily: 'var(--font-script)' }}>StoryVault</h1>
      <p className="text-2xl text-[var(--text-secondary)] mb-12" style={{ fontFamily: 'var(--font-serif)' }}>Preserve your memories, one story at a time.</p>
      <div className="space-y-4 w-full max-w-sm">
        <Button onClick={login} className="w-full text-xl py-4">
          Begin Your Story
        </Button>
        <p className="text-sm text-[var(--text-secondary)]">
          This is a demo. Clicking the button will log you in.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;