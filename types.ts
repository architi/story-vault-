export interface Story {
  id: string;
  question: string;
  content: string;
  createdAt: string;
  photos: string[]; // Array of base64 strings
}

export interface Question {
  id: string;
  text: string;
}

export interface User {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  timestamp: string;
  type: 'text' | 'story' | 'audio';
  text?: string;
  story?: Story;
  audioUrl?: string;
  duration?: number; // in seconds
}

export interface ChatContact {
  id: string;
  name: string;
  isAppUser: boolean;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  phoneNumber?: string;
  messages: ChatMessage[];
}


export enum ThemeName {
  VintageMemoir = 'vintage-memoir',
  ModernPastel = 'modern-pastel',
  DarkElegant = 'dark-elegant',
  MinimalLight = 'minimal-light',
}

export interface Theme {
  name: string;
  value: ThemeName;
}

export enum Page {
  Login = 'login',
  Home = 'home',
  Write = 'write',
  Vault = 'vault',
  Chat = 'chat',
  StoryDetail = 'story-detail',
  Settings = 'settings',
  Profile = 'profile',
}