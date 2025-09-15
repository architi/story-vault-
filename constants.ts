
import type { Question, Theme, ChatContact } from './types';
import { ThemeName } from './types';

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'What is one of your fondest childhood memories?' },
  { id: 'q2', text: 'Describe a place where you felt perfectly at peace.' },
  { id: 'q3', text: 'Who has been the most influential person in your life and why?' },
  { id: 'q4', text: 'What was the most challenging obstacle you\'ve overcome?' },
  { id: 'q5', text: 'Tell a story about a favorite family tradition.' },
  { id: 'q6', text: 'What piece of advice would you give to your younger self?' },
  { id: 'q7', text: 'Describe a time you laughed so hard you cried.' },
  { id: 'q8', text: 'What is a skill you are proud to have learned?' },
  { id: 'q9', text: 'What did you want to be when you grew up, and how did that change over time?' },
  // FIX: Corrected typo from `_id` to `id`.
  { id: 'q10', text: 'Share a story about a favorite pet or animal from your life.' },
];

export const THEMES: Theme[] = [
  { name: 'Vintage Memoir', value: ThemeName.VintageMemoir },
  { name: 'Modern Pastel', value: ThemeName.ModernPastel },
  { name: 'Dark & Elegant', value: ThemeName.DarkElegant },
  { name: 'Minimal Light', value: ThemeName.MinimalLight },
];

export const MOCK_APP_USERS: ChatContact[] = [
  {
    id: 'user1',
    name: 'Eleanor Vance',
    isAppUser: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=user1',
    lastMessage: 'That sounds like a wonderful idea! Let\'s do it.',
    lastMessageTime: '10:42 AM',
    messages: [
      { id: 'm1', type: 'text', text: 'Hey, did you see the new question of the week?', sender: 'them', timestamp: '10:40 AM' },
      { id: 'm2', type: 'text', text: 'I did! It got me thinking about grandma\'s old stories.', sender: 'me', timestamp: '10:41 AM' },
      { id: 'm3', type: 'text', text: 'That sounds like a wonderful idea! Let\'s do it.', sender: 'them', timestamp: '10:42 AM' },
    ],
  },
  {
    id: 'user2',
    name: 'Marcus Holloway',
    isAppUser: true,
    avatarUrl: 'https://i.pravatar.cc/150?u=user2',
    lastMessage: 'Just sent you the photo from the lake.',
    lastMessageTime: 'Yesterday',
    messages: [
      { id: 'm4', type: 'text', text: 'Just sent you the photo from the lake.', sender: 'them', timestamp: 'Yesterday' },
    ],
  },
];

export const MOCK_PHONE_CONTACTS: ChatContact[] = [
    {
        id: 'phone1',
        name: 'Aunt Carol',
        isAppUser: false,
        phoneNumber: '555-123-4567',
        messages: [],
    },
    {
        id: 'phone2',
        name: 'Ben Carter',
        isAppUser: false,
        phoneNumber: '555-987-6543',
        messages: [],
    },
    {
        id: 'phone3',
        name: 'Grandpa Joe',
        isAppUser: false,
        phoneNumber: '555-555-1212',
        messages: [],
    }
];