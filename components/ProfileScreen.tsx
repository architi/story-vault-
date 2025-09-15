import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import type { User } from '../types';
import Button from './Button';
import Icon from './Icon';

interface ProfileScreenProps {
  onSave: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onSave }) => {
  const { user, saveUser } = useAppContext();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [alert, setAlert] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlert('Name cannot be empty.');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setAlert('Please enter a valid email.');
      return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
        setAlert('Please enter a valid 10-digit phone number.');
        return;
    }
    
    const updatedUser: User = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ...(avatar && { avatar }),
    };
    saveUser(updatedUser);
    onSave();
  };

  return (
    <div className="animate-fade-in space-y-8">
      <header className="text-center">
        <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Your Profile</h2>
        <p className="text-lg text-[var(--text-secondary)]">
          {user ? 'Update your personal details.' : 'Create your profile.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-8 rounded-lg shadow-lg border border-[var(--border-color)] space-y-6 notebook-lines">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {avatar ? (
              <img src={avatar} alt="Profile avatar" className="w-32 h-32 rounded-full object-cover border-4 border-[var(--accent-primary)]" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[var(--background-primary)] border-4 border-[var(--accent-primary)] flex items-center justify-center">
                <Icon name="user-circle" className="w-24 h-24 text-[var(--text-secondary)]" />
              </div>
            )}
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-[var(--accent-primary)] text-white p-2 rounded-full cursor-pointer hover:bg-[var(--accent-secondary)] transition-colors">
              <Icon name="edit" className="w-5 h-5" />
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Click the edit icon to change your photo.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-[var(--text-secondary)] mb-1">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-[var(--text-secondary)] mb-1">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-lg font-medium text-[var(--text-secondary)] mb-1">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="10-Digit Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full p-3 rounded-md border-2 border-[var(--accent-primary)]/20 bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] placeholder:text-[var(--text-secondary)]/80"
            />
          </div>
        </div>

        {alert && <p className="text-red-500 text-center font-bold">{alert}</p>}

        <Button type="submit" className="w-full text-xl py-3">
          {user ? 'Update Profile' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfileScreen;