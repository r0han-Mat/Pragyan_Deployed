import { useState, useEffect, useRef, useCallback } from "react";

interface UseSpeechToTextProps {
    onResult: (text: string) => void;
    continuous?: boolean;
}

export const useSpeechToText = ({ onResult, continuous = false }: UseSpeechToTextProps) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Web Speech API not supported.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        // We strictly use final results to prevent duplication loops in the current architecture.
        // If we want real-time preview, we'd need separate state for interim results in the consumer.
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let resultIndex = 0;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            // Only process new results we haven't seen yet
            for (let i = resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    const transcript = result[0].transcript.trim();
                    if (transcript) {
                        onResult(transcript);
                    }
                    resultIndex = i + 1; // Advance our pointer
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [onResult, continuous]);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Mic start error:", e);
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    return { isListening, toggleListening, hasSupport: !!recognitionRef.current };
};