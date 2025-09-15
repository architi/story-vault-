import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Story, ThemeName, User } from '../types';
import { ThemeName as Themes } from '../types';
import { QUESTIONS } from '../constants';

interface AppContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  user: User | null;
  saveUser: (user: User) => void;
  stories: Story[];
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => void;
  updateStory: (story: Story) => void;
  deleteStory: (storyId: string) => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  currentQuestion: string;
  nextQuestion: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const MOCK_STORIES: Story[] = [
    {
      id: 's1',
      question: 'What is one of your fondest childhood memories?',
      content: 'I remember spending summers at my grandparents\' lake house. The smell of pine needles and the cool water on a hot day are etched in my memory. We would fish from the dock in the morning and tell stories around the campfire at night. One time, my grandfather taught me how to skip stones, and I spent a whole afternoon practicing until I got seven skips in a row. It felt like a magical achievement.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      photos: ['https://picsum.photos/400/300?random=1'],
    },
    {
      id: 's2',
      question: 'Describe a place where you felt perfectly at peace.',
      content: 'There is a small, hidden garden behind the old city library. It has a stone bench under a large willow tree, surrounded by lavender bushes. The gentle hum of bees and the rustling leaves create a serene symphony. I would go there to read for hours, feeling completely disconnected from the hustle and bustle of the world. It was my secret sanctuary.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      photos: [],
    },
];


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialState('isAuthenticated', false));
  const [user, setUser] = useState<User | null>(() => getInitialState('storyvault_user', null));
  const [stories, setStories] = useState<Story[]>(() => getInitialState('stories', MOCK_STORIES));
  const [theme, setThemeState] = useState<ThemeName>(() => getInitialState('theme', Themes.VintageMemoir));
  const [fontSize, setFontSizeState] = useState<number>(() => getInitialState('fontSize', 18));
  const [questionIndex, setQuestionIndex] = useState<number>(() => getInitialState('questionIndex', 0));
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(getInitialState('hasCompletedOnboarding', false));
  
  const currentQuestion = QUESTIONS[questionIndex % QUESTIONS.length].text;

  useEffect(() => {
    localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);
  
  useEffect(() => {
    localStorage.setItem('storyvault_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('fontSize', JSON.stringify(fontSize));
  }, [fontSize]);
  
  useEffect(() => {
    localStorage.setItem('questionIndex', JSON.stringify(questionIndex));
  }, [questionIndex]);

  useEffect(() => {
    localStorage.setItem('hasCompletedOnboarding', JSON.stringify(hasCompletedOnboarding));
  }, [hasCompletedOnboarding]);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // On logout, we can reset the onboarding status for demo purposes, or leave it.
    // Let's leave it, so a user logging back in doesn't see it again.
  };

  const saveUser = (userData: User) => {
    setUser(userData);
  };

  const addStory = (storyData: Omit<Story, 'id' | 'createdAt'>) => {
    const newStory: Story = {
      ...storyData,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };
    setStories(prev => [newStory, ...prev]);
  };
  
  const updateStory = (updatedStory: Story) => {
    setStories(prev => prev.map(s => s.id === updatedStory.id ? updatedStory : s));
  };
  
  const deleteStory = (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
  };

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
  };
  
  const nextQuestion = useCallback(() => {
    setQuestionIndex(prev => prev + 1);
  },[]);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, login, logout, user, saveUser, stories, addStory, updateStory, deleteStory, theme, setTheme, fontSize, setFontSize, currentQuestion, nextQuestion, hasCompletedOnboarding, completeOnboarding }}>
      {children}
    </AppContext.Provider>
  );
};