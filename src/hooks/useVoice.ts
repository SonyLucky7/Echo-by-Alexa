"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";
import { useLanguage } from "./useLanguage";
import { getPromptForLocale } from "@/lib/concierge/prompts";
import { SupportedLocale } from "@/types";

export type VoiceState =
  | "idle"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "muted"
  | "error";

export interface VoiceTranscriptItem {
  speaker: "user" | "alexa";
  text: string;
  toolResults?: Array<{ tool: string; result: any }>;
  suggestions?: string[];
  timestamp: Date;
}

export function useVoice() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<RealAudioAnalyser | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Frequency loop: reads real FFT frequencies
  const updateFrequencies = useCallback(() => {
    if (analyserRef.current) {
      const data = analyserRef.current.getFrequencies();
      setFrequencies(data);
    }
    animFrameRef.current = requestAnimationFrame(updateFrequencies);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateFrequencies);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateFrequencies]);

  // Listen to open voice events
  useEffect(() => {
    const handleOpenVoice = () => {
      setIsOpen(true);
    };
    const handleCloseVoice = () => {
      stopVoice();
      setIsOpen(false);
    };

    window.addEventListener("echo:open-voice", handleOpenVoice);
    window.addEventListener("echo:close-voice", handleCloseVoice);

    return () => {
      window.removeEventListener("echo:open-voice", handleOpenVoice);
      window.removeEventListener("echo:close-voice", handleCloseVoice);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      if (analyserRef.current) analyserRef.current.destroy();
    };
  }, []);

  // Speak Alexa response using ElevenLabs TTS or Web Speech API fallback
  const speakResponse = useCallback(
    async (text: string, currentLocale: SupportedLocale) => {
      setVoiceState("speaking");

      // 1. Try ElevenLabs TTS route
      try {
        const resp = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, locale: currentLocale }),
        });

        if (resp.ok) {
          const blob = await resp.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          audioElementRef.current = audio;

          if (analyserRef.current) {
            analyserRef.current.attachAudioElement(audio);
          }

          audio.onended = () => {
            setVoiceState("listening");
            startListening();
          };
          audio.onerror = () => {
            // Fallback to browser synthesis if audio decode fails
            fallbackWebSpeech(text, currentLocale);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("ElevenLabs TTS unavailable, transitioning to Web Speech API:", err);
      }

      // 2. Web Speech API synthesis fallback
      fallbackWebSpeech(text, currentLocale);
    },
    []
  );

  const fallbackWebSpeech = (text: string, currentLocale: SupportedLocale) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceState("listening");
      startListening();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Map locale to BCP 47 code
    const localeMap: Record<SupportedLocale, string> = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
      es: "es-ES",
      fr: "fr-FR",
    };
    utterance.lang = localeMap[currentLocale] || "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setVoiceState("listening");
      startListening();
    };
    utterance.onerror = () => {
      setVoiceState("listening");
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start speech recognition
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice recognition not supported in this browser. Please use text concierge.");
      setVoiceState("error");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const localeMap: Record<SupportedLocale, string> = {
        en: "en-US",
        hi: "hi-IN",
        te: "te-IN",
        es: "es-ES",
        fr: "fr-FR",
      };
      recognition.lang = localeMap[locale] || "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          handleUserUtterance(finalTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
      };

      recognition.onend = () => {
        if (voiceState === "listening" && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition failed to start:", err);
    }
  }, [locale, isMuted, voiceState]);

  // Handle transcribed user speech
  const handleUserUtterance = async (speech: string) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setVoiceState("processing");
    setTranscripts((prev) => [
      ...prev,
      { speaker: "user", text: speech, timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/concierge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: speech, locale }),
      });

      if (!res.ok) throw new Error("Concierge chat failed");

      const data = await res.json();
      const reply = data.text || "I have received your request.";

      setTranscripts((prev) => [
        ...prev,
        {
          speaker: "alexa",
          text: reply,
          toolResults: data.toolResults || [],
          suggestions: data.suggestions || [],
          timestamp: new Date(),
        },
      ]);

      // Check if cart was modified
      const hasCartChange = data.toolCalls?.some(
        (c: any) =>
          c.name === "add_to_cart" ||
          c.name === "update_cart_item" ||
          c.name === "remove_from_cart"
      );
      if (hasCartChange) {
        window.dispatchEvent(new CustomEvent("echo:cart-updated"));
      }

      // Speak response aloud
      speakResponse(reply, locale);
    } catch (err: any) {
      const errReply = "I could not fully hear you. Could you please repeat that?";
      setTranscripts((prev) => [
        ...prev,
        { speaker: "alexa", text: errReply, timestamp: new Date() },
      ]);
      speakResponse(errReply, locale);
    }
  };

  // Start voice session
  const startVoice = async () => {
    setVoiceState("connecting");
    setErrorMessage(null);

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 2. Attach to real audio analyser
      if (!analyserRef.current) {
        analyserRef.current = new RealAudioAnalyser(stream);
      } else {
        analyserRef.current.attachStream(stream);
      }

      // 3. Welcome user with localized greeting
      const promptConfig = getPromptForLocale(locale);
      setTranscripts([
        {
          speaker: "alexa",
          text: promptConfig.welcomeGreeting,
          timestamp: new Date(),
        },
      ]);

      speakResponse(promptConfig.welcomeGreeting, locale);
    } catch (err: any) {
      console.error("Microphone access denied or audio initialization failed:", err);
      setErrorMessage("Microphone access was denied. Please allow microphone permissions or use text concierge.");
      setVoiceState("error");
    }
  };

  const stopVoice = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState("idle");
    setFrequencies(new Array(16).fill(0));
  };

  const toggleMute = () => {
    if (!mediaStreamRef.current) return;
    const nextMuted = !isMuted;
    mediaStreamRef.current.getAudioTracks().forEach((t) => {
      t.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
    if (nextMuted) {
      setVoiceState("muted");
      if (recognitionRef.current) recognitionRef.current.abort();
    } else {
      setVoiceState("listening");
      startListening();
    }
  };

  return {
    isOpen,
    setIsOpen,
    voiceState,
    transcripts,
    frequencies,
    isMuted,
    errorMessage,
    locale,
    setLocale,
    startVoice,
    stopVoice,
    toggleMute,
    sendMessage: handleUserUtterance,
    closeVoice: () => {
      stopVoice();
      setIsOpen(false);
    },
  };
}
