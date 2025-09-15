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

// Enhanced Web Speech API type definitions
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
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: any;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  onnomatch: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

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
  const [speechError, setSpeechError] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  
  // New state for live transcription
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscriptBuffer, setFinalTranscriptBuffer] = useState('');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Enhanced browser support detection
    const checkSpeechSupport = () => {
      const hasSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      console.log('Speech recognition support:', hasSupport);
      
      // Additional checks for HTTPS and permissions
      if (hasSupport && location.protocol !== 'https:' && location.hostname !== 'localhost') {
        console.warn('Speech recognition requires HTTPS or localhost');
        setIsSpeechSupported(false);
        return;
      }
      
      setIsSpeechSupported(hasSupport);
    };

    checkSpeechSupport();
  }, []);
  
  // Typewriter effect for the question
  useEffect(() => {
    if (!question) return;

    setDisplayedQuestion('');

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedQuestion(question.slice(0, i));
      i++;

      if (i > question.length + 1) {
        clearInterval(intervalId);
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [question]);

  useEffect(() => {
    if (story) {
      setQuestion(story.question);
      setContent(story.content);
      setPhotos(story.photos);
    } else {
      setQuestion(currentQuestion);
      setContent('');
      setPhotos([]);
    }
  }, [story, currentQuestion]);

  // Load draft from localStorage
  useEffect(() => {
    if (!story) {
      const savedDraft = localStorage.getItem('storyvault_draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (draft.question === currentQuestion) {
            if (window.confirm("You have an unsaved draft for this story. Would you like to restore it?")) {
              setContent(draft.content);
              setPhotos(draft.photos);
            } else {
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

  // Auto-save draft
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

        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 2500);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, photos, question, story]);

  // Auto-scroll textarea when live transcription is active
  useEffect(() => {
    if (isRecording && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [content, interimTranscript, isRecording]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    setIsRecording(false);
    setIsListening(false);
    setSpeechError('');
    
    // Clear interim transcript and apply any pending final transcript
    setInterimTranscript('');
    if (finalTranscriptBuffer) {
      applyFinalTranscript(finalTranscriptBuffer);
      setFinalTranscriptBuffer('');
    }
  };

  const startRecognition = () => {
    if (!isSpeechSupported) {
      alert("Voice-to-text is not supported by your browser. Please use Chrome, Edge, or Safari on HTTPS.");
      return;
    }

    // Request microphone permission first
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone permission granted');
        initializeSpeechRecognition();
      })
      .catch((err) => {
        console.error('Microphone permission denied:', err);
        setSpeechError('Microphone access denied. Please allow microphone access and try again.');
      });
  };

  const applyFinalTranscript = (transcript: string) => {
    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript) return;

    setContent(prevContent => {
      const trimmedPrev = prevContent.trim();
      let newText = trimmedTranscript;

      // Capitalize if it's the start of a new sentence
      if (trimmedPrev === '' || /[.?!]\s*$/.test(trimmedPrev)) {
        newText = newText.charAt(0).toUpperCase() + newText.slice(1);
      }

      // Add appropriate spacing
      let separator = '';
      if (trimmedPrev && !/\s$/.test(prevContent)) {
        separator = ' ';
      }

      // Add period if the text doesn't end with punctuation
      if (!/[.?!]$/.test(newText)) {
        newText += '.';
      }

      const updatedContent = `${prevContent}${separator}${newText} `;
      return updatedContent.replace(/\s+/g, ' ');
    });
  };

  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Enhanced configuration for live transcription
      recognition.continuous = true;
      recognition.interimResults = true; // This enables live transcription
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
        setIsListening(false);
        setSpeechError('');
        setInterimTranscript('');
        setFinalTranscriptBuffer('');
      };

      recognition.onspeechstart = () => {
        console.log('Speech detected');
        setIsListening(true);
      };

      recognition.onspeechend = () => {
        console.log('Speech ended');
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        
        // Apply any remaining final transcript before stopping
        if (finalTranscriptBuffer) {
          applyFinalTranscript(finalTranscriptBuffer);
          setFinalTranscriptBuffer('');
        }
        
        setIsRecording(false);
        setIsListening(false);
        setInterimTranscript('');
        
        // Auto-restart if we're still supposed to be recording
        if (recognitionRef.current && isRecording) {
          console.log('Restarting speech recognition...');
          restartTimeoutRef.current = window.setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Failed to restart recognition:', error);
                stopRecognition();
              }
            }
          }, 100);
        } else {
          recognitionRef.current = null;
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        
        let errorMessage = '';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            // Auto-restart for no-speech errors
            if (isRecording) {
              restartTimeoutRef.current = window.setTimeout(() => {
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.start();
                  } catch (error) {
                    console.error('Failed to restart after no-speech:', error);
                    stopRecognition();
                  }
                }
              }, 1000);
              return; // Don't show error or stop for no-speech
            }
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check your microphone settings.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          default:
            errorMessage = 'Speech recognition error: ${event.error}';
        }
        
        setSpeechError(errorMessage);
        stopRecognition();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update interim transcript for live display
        setInterimTranscript(interimTranscript);

        // Process final results
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          
          // Store final transcript to be applied
          setFinalTranscriptBuffer(prev => prev + finalTranscript);
          
          // Apply final transcript immediately
          applyFinalTranscript(finalTranscript);
          
          // Clear interim transcript since we have final results
          setInterimTranscript('');
        }
      };
      
      recognition.start();
      console.log('Starting speech recognition...');
      
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setSpeechError('Failed to initialize speech recognition. Please try again.');
      stopRecognition();
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const remainingSlots = 3 - photos.length;
      
      if (files.length > remainingSlots) {
        alert('You can only attach a maximum of 3 photos. You can add ${remainingSlots} more.');
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
      event.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleInspireMe = async () => {
    setIsInspiring(true);
    try {
      const starter = await generateStoryStarter(question);
      setContent(prev => `${prev}${prev ? '\n\n' : ''}${starter}`);
    } catch (error) {
      console.error('Error generating story starter:', error);
      alert('Failed to generate inspiration. Please try again.');
    } finally {
      setIsInspiring(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stop recording before saving
    if (isRecording) {
      stopRecognition();
    }
    
    if (story) {
      updateStory({ ...story, question, content, photos });
    } else {
      addStory({ question, content, photos });
    }
    
    localStorage.removeItem('storyvault_draft');
    onSave();
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Enhanced recording button status
  const getRecordingButtonText = () => {
    if (!isSpeechSupported) return 'Speech Not Supported';
    if (isRecording && isListening) return 'Listening...';
    if (isRecording) return 'Ready to Listen';
    return 'Record Voice';
  };

  const getRecordingButtonVariant = () => {
    if (!isSpeechSupported) return 'secondary';
    if (isRecording) return 'danger';
    return 'secondary';
  };

  // Get the display value for the textarea (content + interim transcript)
  const getTextareaDisplayValue = () => {
    if (isRecording && interimTranscript) {
      const trimmedContent = content.trim();
      const separator = trimmedContent && !/\s$/.test(content) ? ' ' : '';
      return `${content}${separator}${interimTranscript}`;
    }
    return content;
  };

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
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={getTextareaDisplayValue()}
            onChange={(e) => {
              // Only allow manual editing when not recording
              if (!isRecording) {
                setContent(e.target.value);
              }
            }}
            placeholder="Your story begins here..."
            className={`w-full h-96 p-4 bg-[var(--background-secondary)] border-2 border-[var(--border-color)] rounded-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition-shadow ${
              isRecording ? 'cursor-not-allowed' : ''
            }`}
            style={{ fontFamily: 'var(--font-serif)'}}
            required
            readOnly={isRecording}
          />
          {isRecording && interimTranscript && (
            <div className="absolute bottom-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              Live transcription active
            </div>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-[var(--text-secondary)] italic h-5">
              {saveStatus === 'saving' && 'Saving draft...'}
              {saveStatus === 'saved' && 'Draft saved.'}
            </p>
            {speechError && (
              <p className="text-sm text-red-600 italic">
                {speechError}
              </p>
            )}
            {isRecording && (
              <p className="text-sm text-green-600 italic flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                {isListening ? 'Listening...' : 'Microphone active'}
                {interimTranscript && ' • Live transcription'}
              </p>
            )}
          </div>
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
        <Button 
          type="button" 
          onClick={handleInspireMe} 
          variant="secondary" 
          className="flex-1" 
          disabled={isInspiring || isRecording}
        >
          <Icon name="sparkles" className="w-5 h-5" />
          {isInspiring ? 'Thinking...' : 'Inspire Me'}
        </Button>
        <Button
          type="button"
          onClick={handleToggleRecording}
          variant={getRecordingButtonVariant()}
          className="flex-1"
          disabled={!isSpeechSupported}
          title={!isSpeechSupported ? "Speech recognition requires Chrome, Edge, or Safari on HTTPS" : ""}
        >
          <Icon name="mic" className="w-5 h-5" />
          {getRecordingButtonText()}
        </Button>
      </div>

      {!isSpeechSupported && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Speech-to-text not supported:</strong> Please use Chrome, Edge, or Safari on a secure connection (HTTPS) to use voice recording.
          </p>
        </div>
      )}
    </form>
  );
};

export default WriteScreen;