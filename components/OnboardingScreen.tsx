import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Button from './Button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSlides = [
  {
    title: 'Preserve Your Memories',
    subtitle: 'Answer weekly questions to capture your life stories.',
    backgroundStyle: { backgroundColor: '#e0dcd3' } 
  },
  {
    title: 'Your Stories, Your Way',
    subtitle: 'Write or speak your stories. Add photos, and customize fonts and themes.',
    backgroundStyle: { backgroundColor: '#d4cbc0' }
  },
  {
    title: 'A Legacy to Share',
    subtitle: 'Transform your stories into a keepsake book for loved ones.',
    backgroundStyle: { backgroundColor: '#c5b8a9' }
  }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { theme } = useAppContext();
  const [step, setStep] = useState(0);
  const isLastStep = step === onboardingSlides.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(s => s + 1);
    }
  };

  return (
    <div className={`theme-${theme} fixed inset-0 flex flex-col justify-between p-8 text-center text-[var(--text-primary)] transition-colors duration-500`} style={onboardingSlides[step].backgroundStyle}>
      {/* Skip Button */}
      <div className="relative z-10 w-full flex justify-end">
        <button onClick={onComplete} className="font-bold text-lg opacity-80 hover:opacity-100">
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center" key={step}>
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-serif)' }}>{onboardingSlides[step].title}</h1>
          <p className="text-2xl opacity-90 max-w-md mx-auto">{onboardingSlides[step].subtitle}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Navigation Dots */}
        <div className="flex gap-3">
          {onboardingSlides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${step === index ? 'bg-[var(--accent-primary)] scale-125' : 'bg-black/20'}`}
            />
          ))}
        </div>
        
        {/* Action Button */}
        {isLastStep ? (
          <Button onClick={onComplete} className="w-full max-w-sm text-xl py-4">
            Get Started
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full max-w-sm text-xl py-4">
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;