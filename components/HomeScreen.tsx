
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Button from './Button';

interface HomeScreenProps {
  onWriteStory: (question: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onWriteStory }) => {
  const { stories, currentQuestion, nextQuestion } = useAppContext();
  const answeredQuestionsCount = stories.length;

  return (
    <div className="animate-fade-in space-y-8">
      <header className="text-center">
        <h2 className="text-6xl md:text-7xl font-bold mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          Welcome!
        </h2>
        <p className="text-xl text-[var(--text-secondary)]">Ready to capture a new memory?</p>
      </header>
      
      <div className="bg-[var(--background-secondary)] p-8 rounded-lg shadow-lg border border-[var(--border-color)] relative overflow-hidden">
        {/* Envelope styling */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gray-50 border-b border-[var(--border-color)]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gray-100 border-r border-[var(--border-color)]" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-100 border-l border-[var(--border-color)]" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }}></div>
        
        <div className="relative bg-[var(--background-primary)] p-8 rounded shadow-inner border border-[var(--border-color)]">
          <h3 className="text-sm uppercase font-bold text-[var(--text-secondary)] mb-4 tracking-widest">This Week's Question</h3>
          <p className="text-3xl mb-8 text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-typewriter)' }}>{currentQuestion}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => onWriteStory(currentQuestion)} className="flex-grow text-xl">
              Write Your Story
            </Button>
            <Button onClick={nextQuestion} variant="secondary" className="flex-grow">
              Ask Another
            </Button>
          </div>
        </div>
      </div>

      <div className="text-center p-6 bg-[var(--background-secondary)]/50 rounded-lg border border-[var(--border-color)]">
        <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-serif)' }}>Your Progress</h3>
        <p className="text-4xl font-bold text-[var(--accent-primary)] my-2">{answeredQuestionsCount}</p>
        <p className="text-[var(--text-secondary)]">stories written. Keep up the great work!</p>
      </div>
    </div>
  );
};

export default HomeScreen;