import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

// Define the interface for the hook's return value
interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
}

// Add type definitions for the Web Speech API which might be missing in some TS environments
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

// Window interface extension
declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export const useSpeechToText = (options?: {
  continuous?: boolean;
  lang?: string;
  onResult?: (text: string) => void;
}): UseSpeechToTextReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const retryCountRef = useRef(0);
  const isListeningRef = useRef(false); // Track state in ref to avoid stale closures in event handlers

  // Update ref whenever state changes
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = options?.continuous ?? true; // Default to continuous for dictation
      recognitionRef.current.interimResults = true; // We want real-time feedback
      recognitionRef.current.lang = options?.lang || 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        // Loop through results from the resultIndex to avoiding processing old results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const text = result[0].transcript;
            setTranscript(prev => {
              const newTranscript = prev ? `${prev} ${text}` : text;
              return newTranscript;
            });
            if (options?.onResult) {
              options.onResult(text);
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);

        switch (event.error) {
          case 'not-allowed':
            toast.error("Microphone access denied", {
              description: "Please allow microphone permissions in your browser settings."
            });
            setIsListening(false);
            break;
          case 'network':
            // Retry logic for network errors (common in Web Speech API)
            if (retryCountRef.current < 2 && isListeningRef.current) { // Try up to 2 times
              retryCountRef.current += 1;
              console.log(`[Speech] Network error, retrying (${retryCountRef.current}/2)...`);
              setTimeout(() => {
                // Check ref to see if we still want to be listening
                if (isListeningRef.current) recognitionRef.current?.start();
              }, 1000);
              return; // Don't stop listening yet
            }

            toast.error("Connection Error", {
              description: "Speech service unreachable. Please ensure you are online."
            });
            setIsListening(false);
            break;
          case 'no-speech':
            // Ignore to keep listening
            break;
          case 'audio-capture':
            toast.error("No Microphone Found", {
              description: "Please check your microphone settings."
            });
            setIsListening(false);
            break;
          case 'aborted':
            // user stopped manually or another instance started
            setIsListening(false);
            break;
          default:
            console.log("Unhandled speech error:", event.error);
            setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // If we are supposed to be listening (and didn't stop due to error), restart
        // Add a small delay before restarting - Chrome often needs a breather or it will fail immediately
        if (isListeningRef.current) {
          retryCountRef.current = 0;
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                // Ignore errors if already started
              }
            }
          }, 300); // 300ms delay to stabilize engine
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options?.continuous, options?.lang, options?.onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        retryCountRef.current = 0;
        toast.success("Listening...", { description: "Speak clearly." });
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    } else if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser.");
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      setIsListening(false); // Update state (and ref via effect)
      recognitionRef.current.stop();
      toast.info("Stopped listening.");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport: !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)),
  };
};