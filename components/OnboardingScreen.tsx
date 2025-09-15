import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Button from './Button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSlides = [
  {
    title: "Preserve Your Memories",
    subtitle: "Answer weekly questions to capture your life stories.",
    backgroundStyle: { backgroundUrl: "happy_family.jpg" },
  },
  {
    title: "Your Stories, Your Way",
    subtitle:
      "Write or speak your stories. Add photos, and customize fonts and themes.",
    backgroundStyle: { backgroundUrl: "public/speech_to_text.jpg" },
  },
  {
    title: "A Legacy to Share",
    subtitle: "Transform your stories into a keepsake book for loved ones.",
    backgroundStyle: { backgroundUrl: "public/book.jpg" },
  },
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
    <div className={`theme-${theme} fixed inset-0 overflow-hidden`}>
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{ 
          backgroundImage: `url(${onboardingSlides[step].backgroundStyle.backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Gradient Overlays for Better Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8 text-center text-white">
        
        {/* Skip Button */}
        <div className="flex justify-end">
          <button 
            onClick={onComplete} 
            className="group relative px-4 py-2 font-semibold text-white/80 hover:text-white transition-all duration-300 ease-out"
          >
            <span className="relative z-10">Skip</span>
            <div className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 ease-out backdrop-blur-sm" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-4">
          <div 
            key={step}
            className="max-w-2xl mx-auto"
          >
            {/* Title with Enhanced Typography */}
            <h1 
              className=" text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                {onboardingSlides[step].title}
              </span>
            </h1>
            
            {/* Subtitle with Better Spacing */}
            <p className="text-black text-lg md:text-xl lg:text-2xl max-w-lg mx-auto leading-relaxed drop-shadow-md font-light">
              {onboardingSlides[step].subtitle}
            </p>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="flex flex-col items-center gap-8">
          {/* Enhanced Navigation Dots */}
          <div className="flex items-center gap-3">
            {onboardingSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setStep(index)}
                className="group relative transition-all duration-300 ease-out"
              >
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step === index 
                      ? 'bg-gradient-to-r from-red-400 to-red-600 scale-125 shadow-lg shadow-red-500/30' 
                      : 'bg-white/40 hover:bg-white/60 hover:scale-110'
                  }`}
                />
                {step === index && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-400 opacity-30" />
                )}
              </button>
            ))}
          </div>
          
          {/* Enhanced Action Button */}
          <div className="w-full max-w-sm">
            {isLastStep ? (
              <Button 
                onClick={onComplete} 
                className="w-full text-lg md:text-xl py-4 px-8 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 rounded-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="w-full text-lg md:text-xl py-4 px-8 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 rounded-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  Next
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            )}
          </div>
          
          {/* Progress Indicator */}
          <div className="text-sm text-white/60 font-medium">
            {step + 1} of {onboardingSlides.length}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default OnboardingScreen;