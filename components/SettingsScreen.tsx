
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { THEMES } from '../constants';
import Button from './Button';
import type { ThemeName } from '../types';
import Icon from './Icon';

interface SettingsScreenProps {
  onLoginRequest: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLoginRequest }) => {
  const { theme, setTheme, fontSize, setFontSize, logout, user } = useAppContext();

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Settings</h2>
        <p className="text-lg text-[var(--text-secondary)]">Personalize your StoryVault experience.</p>
      </header>

      {/* Theme Selector */}
      <section>
        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Appearance Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value as ThemeName)}
              className={`p-2 rounded-lg border-4 transition-colors ${theme === t.value ? 'border-[var(--accent-primary)]' : 'border-transparent bg-transparent'}`}
            >
              <div className={`theme-${t.value} p-6 rounded-md shadow-inner border border-black/10`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]"></div>
                  <div>
                    <div className="h-4 w-24 rounded bg-[var(--text-primary)] mb-2"></div>
                    <div className="h-3 w-16 rounded bg-[var(--text-secondary)]"></div>
                  </div>
                </div>
                <p className="mt-4 text-lg font-bold text-center text-[var(--text-primary)]" style={t.value === 'vintage-memoir' ? { fontFamily: 'var(--font-serif)' } : {}}>{t.name}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Font Size Slider */}
      <section>
        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Font Size</h3>
        <div className="bg-[var(--background-secondary)] p-6 rounded-lg border border-[var(--border-color)]">
            <div className="flex items-center gap-4">
                <span className="text-sm">A</span>
                <input
                    type="range"
                    min="16"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-[var(--accent-primary)]/20 rounded-lg appearance-none cursor-pointer"
                    style={{
                        accentColor: 'var(--accent-primary)',
                    }}
                />
                <span className="text-2xl">A</span>
            </div>
            <p className="text-center mt-2 text-[var(--text-secondary)]">Current size: {fontSize}px</p>
        </div>
      </section>

      {/* Account Section */}
      <section>
        <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>Account</h3>
        <div className="bg-[var(--background-secondary)] p-6 rounded-lg border border-[var(--border-color)] space-y-4">
          {user ? (
            <>
              <p className="font-medium text-center text-lg">
                You are logged <span className="font-bold text-[var(--accent-primary)]">in</span>.
              </p>
              <Button onClick={logout} variant="secondary" className="w-full">
                <Icon name="logout" className="w-5 h-5"/>
                Logout
              </Button>
            </>
          ) : (
             <>
              <p className="font-medium text-center text-lg">
                You are logged <span className="font-bold text-[var(--accent-primary)]">out</span>.
              </p>
              <Button onClick={onLoginRequest} variant="primary" className="w-full">
                Login
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default SettingsScreen;
