
import React from 'react';
import type { Page } from '../types';
import { Page as Pages } from '../types';
import Icon from './Icon';
import { useAppContext } from '../hooks/useAppContext';

interface HeaderProps {
  navigate: (page: Page) => void;
  currentPage: Page;
}

const NavItem: React.FC<{
  page: Page;
  label: string;
  icon: string;
  currentPage: Page;
  onClick: () => void;
}> = ({ page, label, icon, currentPage, onClick }) => {
  const isActive = currentPage === page;
  const activeClasses = 'text-[var(--accent-primary)] border-[var(--accent-primary)]';
  const inactiveClasses = 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--background-secondary)]';

  return (
    <li>
      <button
        onClick={onClick}
        className={`flex flex-col md:flex-row items-center justify-center gap-2 w-full px-4 py-3 rounded-lg transition-colors duration-200 text-lg border-b-4 ${isActive ? activeClasses : inactiveClasses}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon name={icon} className="w-7 h-7" />
        <span className="text-sm md:text-base font-medium">{label}</span>
      </button>
    </li>
  );
};

const Header: React.FC<HeaderProps> = ({ navigate, currentPage }) => {
  const { user } = useAppContext();

  return (
    <header className="mb-8">
      <div className="relative text-center mb-6">
        <h1 className="text-6xl text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-script)' }}>StoryVault</h1>
        
        <div className="absolute top-0 right-0 h-full flex items-center">
          <button 
            onClick={() => navigate(Pages.Profile)} 
            className="p-1 rounded-full hover:bg-[var(--background-secondary)] transition-colors"
            aria-label="View Profile"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="User avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[var(--accent-primary)]" />
            ) : (
              <Icon name="user-circle" className="w-10 h-10 text-[var(--text-secondary)]" />
            )}
          </button>
        </div>
      </div>
      <nav>
        <ul className="grid grid-cols-4 gap-2 md:gap-4 p-1 border-b-2 border-[var(--border-color)]">
          <NavItem page={Pages.Home} label="Home" icon="home" currentPage={currentPage} onClick={() => navigate(Pages.Home)} />
          <NavItem page={Pages.Vault} label="Vault" icon="vault" currentPage={currentPage} onClick={() => navigate(Pages.Vault)} />
          <NavItem page={Pages.Chat} label="Chat" icon="chat" currentPage={currentPage} onClick={() => navigate(Pages.Chat)} />
          <NavItem page={Pages.Settings} label="Settings" icon="settings" currentPage={currentPage} onClick={() => navigate(Pages.Settings)} />
        </ul>
      </nav>
    </header>
  );
};

export default Header;
