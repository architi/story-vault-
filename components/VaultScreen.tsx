import React from 'react';
import type { Story } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Icon from './Icon';

interface VaultScreenProps {
  onViewStory: (story: Story) => void;
}

const StoryCard: React.FC<{ story: Story; onClick: () => void }> = ({ story, onClick }) => (
  <button onClick={onClick} className="text-left w-full bg-[var(--background-secondary)] p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[var(--border-color)]">
    <h3 className="text-xl font-bold text-[var(--accent-primary)] mb-2 truncate" style={{ fontFamily: 'var(--font-serif)' }}>{story.question}</h3>
    <p className="text-[var(--text-secondary)] text-sm mb-4">
      {new Date(story.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <p className="line-clamp-3 text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
      {story.content}
    </p>
    {story.photos.length > 0 && (
      <div className="mt-4 bg-white p-1 shadow-sm border border-gray-200 w-full">
        <img src={story.photos[0]} alt="Story thumbnail" className="w-full h-32 object-cover"/>
      </div>
    )}
  </button>
);


const VaultScreen: React.FC<VaultScreenProps> = ({ onViewStory }) => {
  const { stories } = useAppContext();

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h2 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Your Story Vault</h2>
        <p className="text-lg text-[var(--text-secondary)]">A collection of your precious memories.</p>
      </header>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(story => (
            <StoryCard key={story.id} story={story} onClick={() => onViewStory(story)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-[var(--background-secondary)] rounded-lg border-2 border-dashed border-[var(--border-color)]">
          <Icon name="vault" className="w-16 h-16 mx-auto text-[var(--text-secondary)] mb-4" />
          <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Your vault is empty</h3>
          <p className="text-[var(--text-secondary)]">Start by answering your first question on the Home screen.</p>
        </div>
      )}
    </div>
  );
};

export default VaultScreen;