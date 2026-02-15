import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechToTextProps {
  onResult: (text: string) => void;
  continuous?: boolean;
}

export const useSpeechToText = ({ onResult, continuous = false }: UseSpeechToTextProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // 1. Create a Ref to track state instantly inside the event listener
  const isListeningRef = useRef(isListening);

  // 2. Sync the Ref with the State
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    // Browser Compatibility Check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Web Speech API not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }
      const fullText = (finalTranscript + interimTranscript).trim();
      if (fullText) onResult(fullText);
    };

    recognitionRef.current = recognition;

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [onResult, continuous]);

  // Stable Start Function
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Mic start error:", e);
      }
    }
  }, []);

  // Stable Stop Function
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  // --- GLOBAL KEYBOARD SHORTCUT (RIGHT ALT) ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 3. Check for Right Alt AND ignore repeated key presses (holding down)
      if (event.code === "AltRight" && !event.repeat) {
        event.preventDefault();
        
        // Use the Ref to decide action instantly
        if (isListeningRef.current) {
           stopListening();
        } else {
           startListening();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startListening, stopListening]);

  return { isListening, toggleListening, hasSupport: !!recognitionRef.current };
};