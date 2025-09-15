
import React, { useState, useEffect, useRef } from 'react';
import type { Story } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import { generateStoryStarter } from '../services/geminiService';
import Button from './Button';
import Icon from './Icon';

interface WriteScreenProps {
  story: Story | null;
  onSave: () => void;
}

// Fix: Add missing Web Speech API type definitions to resolve compilation errors.
// These types are not included in default TypeScript DOM libraries.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  // FIX: The index signature should return SpeechRecognitionResult, not SpeechRecognitionAlternative.
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Add types for the Web Speech API to the global window object
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

type SaveStatus = 'idle' | 'saving' | 'saved';

const WriteScreen: React.FC<WriteScreenProps> = ({ story, onSave }) => {
  const { addStory, updateStory, currentQuestion } = useAppContext();
  
  const [question, setQuestion] = useState(story?.question || currentQuestion);
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [content, setContent] = useState(story?.content || '');
  const [photos, setPhotos] = useState<string[]>(story?.photos || []);
  const [isInspiring, setIsInspiring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);


  useEffect(() => {
    // Check for browser support on component mount
    const hasSupport = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSpeechSupported(hasSupport);
  }, []);
  
  // Typewriter effect for the question
  useEffect(() => {
    if (!question) return;

    // Reset displayed question when the source question changes.
    setDisplayedQuestion('');

    let i = 0;
    const intervalId = setInterval(() => {
      // Use the counter `i` to get a slice of the full question.
      // This is a robust way to build the string and avoids state-related race conditions.
      setDisplayedQuestion(question.slice(0, i));
      i++;

      // When the counter exceeds the length of the string, stop the animation.
      if (i > question.length + 1) {
        clearInterval(intervalId);
      }
    }, 50); // Typing speed in milliseconds.

    // Cleanup: clear the interval when the component unmounts or the `question` dependency changes.
    return () => clearInterval(intervalId);
  }, [question]);


  useEffect(() => {
    // If the story prop changes, update the form
    if (story) {
      setQuestion(story.question);
      setContent(story.content);
      setPhotos(story.photos);
    } else {
      // For new story, reset form
      setQuestion(currentQuestion);
      setContent('');
      setPhotos([]);
    }
  }, [story, currentQuestion]);

  // Load draft from localStorage on initial load for new stories
  useEffect(() => {
    if (!story) { // Only for new stories
      const savedDraft = localStorage.getItem('storyvault_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.question === currentQuestion) {
            if (window.confirm("You have an unsaved draft for this story. Would you like to restore it?")) {
              setContent(draft.content);
              setPhotos(draft.photos);
            } else {
              // User chose not to restore, so clear the draft.
              localStorage.removeItem('storyvault_draft');
            }
          }
        } catch (e) {
          console.error("Failed to parse draft from localStorage", e);
          localStorage.removeItem('storyvault_draft');
        }
      }
    }
  }, [story, currentQuestion]);

  // Auto-save draft to localStorage
  useEffect(() => {
    const isDraftable = !story && (content.trim() !== '' || photos.length > 0);

    if (isDraftable) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');

      saveTimeoutRef.current = window.setTimeout(() => {
        const draft = { question, content, photos };
        localStorage.setItem('storyvault_draft', JSON.stringify(draft));
        setSaveStatus('saved');

        setTimeout(() => setSaveStatus('idle'), 2000); // Reset indicator
      }, 2500); // 2.5 second debounce time
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, photos, question, story]);


  useEffect(() => {
    // Cleanup on unmount: stop recording if active
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const remainingSlots = 3 - photos.length;
      
      if (files.length > remainingSlots) {
        alert(`You can only attach a maximum of 3 photos. You can add ${remainingSlots} more.`);
        // Reset the file input value to allow re-selection of files
        event.target.value = '';
        return;
      }

      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result && photos.length < 3) {
            setPhotos(prev => [...prev, e.target.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      // Reset the file input value to allow re-selection of the same file if needed
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleInspireMe = async () => {
    setIsInspiring(true);
    const starter = await generateStoryStarter(question);
    setContent(prev => `${prev}${prev ? '\n\n' : ''}${starter}`);
    setIsInspiring(false);
  };

  const handleToggleRecording = () => {
    if (!isSpeechSupported) {
      alert("Voice-to-text is not supported by your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false; // Only process final results for simplicity

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setContent(prevContent => {
            const trimmedPrev = prevContent.trim();
            let newText = finalTranscript.trim();

            // Capitalize if it's the start of a new sentence.
            if (trimmedPrev === '' || /[.?!]\s*$/.test(trimmedPrev)) {
              newText = newText.charAt(0).toUpperCase() + newText.slice(1);
            }

            // Add a space if needed before the new text
            const prefix = (trimmedPrev && !/\s$/.test(trimmedPrev)) ? ' ' : '';
            
            // Add the new text with a period and a space at the end.
            const updatedContent = `${prevContent}${prefix}${newText}. `;
            return updatedContent.replace(/\s\s+/g, ' ');
          });
        }
      };
      
      recognition.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (story) {
      updateStory({ ...story, question, content, photos });
    } else {
      addStory({ question, content, photos });
    }
    // Clear the draft upon successful submission
    localStorage.removeItem('storyvault_draft');
    onSave();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="border-b-2 border-[var(--border-color)] pb-4">
        <p className="text-lg font-medium text-[var(--text-secondary)]">Question:</p>
        <h2 className="text-3xl min-h-[3rem]" style={{ fontFamily: 'var(--font-typewriter)' }}>
          {displayedQuestion}
          <span className="inline-block w-1 border-r-4 border-r-[var(--accent-primary)] animate-[blink-caret_1s_step-end_infinite]"></span>
        </h2>
      </header>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your story begins here..."
          className="w-full h-96 p-4 bg-[var(--background-secondary)] border-2 border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition-shadow"
          style={{ fontFamily: 'var(--font-serif)'}}
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-[var(--text-secondary)] italic h-5">
            {saveStatus === 'saving' && 'Saving draft...'}
            {saveStatus === 'saved' && 'Draft saved.'}
          </p>
          <p className="text-right text-sm text-[var(--text-secondary)]">{wordCount} words</p>
        </div>
      </div>

      <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-color)]">
        <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-serif)'}}>Attach Photos (Up to 3)</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{photos.length} of 3 photos attached.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group bg-white p-2 pb-6 shadow-md border border-gray-200 transform -rotate-2">
              <img src={photo} alt={`story visual ${index + 1}`} className="w-full h-24 object-cover" />
              <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Icon name="trash" className="w-3 h-3"/>
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <label className="cursor-pointer w-full h-32 flex items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-md hover:bg-[var(--accent-primary)]/10 transition-colors">
              <Icon name="photo" className="w-8 h-8 text-[var(--text-secondary)]" />
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={photos.length >= 3} />
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-color)]/50">
        <Button type="submit" className="flex-1 text-lg">
          {story ? 'Update Story' : 'Save Story'}
        </Button>
        <Button type="button" onClick={handleInspireMe} variant="secondary" className="flex-1" disabled={isInspiring || isRecording}>
          <Icon name="sparkles" className="w-5 h-5" />
          {isInspiring ? 'Thinking...' : 'Inspire Me'}
        </Button>
        <Button
          type="button"
          onClick={handleToggleRecording}
          variant={isRecording ? 'danger' : 'secondary'}
          className="flex-1"
          disabled={!isSpeechSupported}
          title={!isSpeechSupported ? "Speech recognition not supported in this browser" : ""}
        >
          <Icon name="mic" className="w-5 h-5" />
          {isRecording ? 'Stop Recording' : 'Record Voice'}
        </Button>
      </div>
    </form>
  );
};

export default WriteScreen;
