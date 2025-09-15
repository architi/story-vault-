
import React, { useState, useEffect } from 'react';
import { useAppContext } from './hooks/useAppContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import WriteScreen from './components/WriteScreen';
import VaultScreen from './components/VaultScreen';
import StoryDetailScreen from './components/StoryDetailScreen';
import SettingsScreen from './components/SettingsScreen';
import ChatScreen from './components/ChatScreen';
import ProfileScreen from './components/ProfileScreen';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AuthPopup from './components/AuthPopup';
import type { Story, User } from './types';
import { Page } from './types';

type AppStatus = 'loading' | 'onboarding' | 'ready';

const App: React.FC = () => {
  const { isAuthenticated, theme, fontSize, hasCompletedOnboarding, completeOnboarding, user, saveUser } = useAppContext();
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>('loading');
  const [isAuthPopupVisible, setIsAuthPopupVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (hasCompletedOnboarding) {
        setAppStatus('ready');
      } else {
        // Show splash for 2.5s, then move to onboarding
        const timer = setTimeout(() => {
          setAppStatus('onboarding');
        }, 2500);
        return () => clearTimeout(timer);
      }
    } else {
      setAppStatus('loading'); // Reset if logged out
    }
  }, [isAuthenticated, hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setAppStatus('ready');
  };

  if (!isAuthenticated) {
    return (
      <div className={`theme-${theme} bg-[var(--background-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300`} style={{ fontSize: `${fontSize}px` }}>
        <LoginScreen />
      </div>
    );
  }

  if (appStatus === 'loading') {
    return <SplashScreen />;
  }
  
  if (appStatus === 'onboarding') {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  const navigate = (page: Page) => {
    setActiveStory(null);
    setEditingStory(null);
    setCurrentPage(page);
  };

  const viewStory = (story: Story) => {
    setActiveStory(story);
    setCurrentPage(Page.StoryDetail);
  };

  const editStory = (story: Story) => {
    setEditingStory(story);
    setCurrentPage(Page.Write);
  };

  const handleWriteStoryRequest = () => {
    if (user) {
      setEditingStory(null);
      setCurrentPage(Page.Write);
    } else {
      setIsAuthPopupVisible(true);
    }
  };
  
  const handleAuthSuccess = (userData: User) => {
    saveUser(userData);
    setIsAuthPopupVisible(false);
    setEditingStory(null);
    setCurrentPage(Page.Write);
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.Home:
        return <HomeScreen onWriteStory={handleWriteStoryRequest} />;
      case Page.Write:
        return <WriteScreen story={editingStory} onSave={() => navigate(Page.Vault)} />;
      case Page.Vault:
        return <VaultScreen onViewStory={viewStory} />;
      case Page.Chat:
        return <ChatScreen />;
      case Page.StoryDetail:
        return activeStory ? <StoryDetailScreen story={activeStory} onEdit={editStory} onDelete={() => navigate(Page.Vault)} /> : <VaultScreen onViewStory={viewStory} />;
      case Page.Settings:
        return <SettingsScreen onLoginRequest={() => setIsAuthPopupVisible(true)} />;
      case Page.Profile:
        return <ProfileScreen onSave={() => navigate(Page.Home)} />;
      default:
        return <HomeScreen onWriteStory={handleWriteStoryRequest} />;
    }
  };

  return (
    <div className={`theme-${theme} bg-[var(--background-primary)] text-[var(--text-primary)] min-h-screen transition-colors duration-300`} style={{ fontSize: `${fontSize}px` }}>
       {isAuthPopupVisible && <AuthPopup onSuccess={handleAuthSuccess} onClose={() => setIsAuthPopupVisible(false)} />}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Header navigate={navigate} currentPage={currentPage}/>
        <main className="mt-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;