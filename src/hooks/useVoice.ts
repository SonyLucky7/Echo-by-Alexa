"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";
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
  speaker: "user" | "concierge" | "alexa";
  text: string;
  toolResults?: Array<{ tool: string; result: any }>;
  suggestions?: string[];
  timestamp: Date;
}

export function useVoice() {
  const locale: SupportedLocale = "en";
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

  // Start speech recognition in English only
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice recognition not supported in this browser. Please use text prompt.");
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
      recognition.lang = "en-US";

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
          console.warn("Speech recognition notice:", e.error);
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
  }, [isMuted, voiceState]);

  // Fallback to browser synthesis if needed (English only)
  const fallbackWebSpeech = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceState("listening");
      startListening();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
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
  }, [startListening]);

  // Speak response using ElevenLabs TTS (English only)
  const speakResponse = useCallback(
    async (text: string) => {
      setVoiceState("speaking");

      try {
        const resp = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, locale: "en" }),
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
            fallbackWebSpeech(text);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("ElevenLabs TTS error, transitioning to Web Speech:", err);
      }

      fallbackWebSpeech(text);
    },
    [fallbackWebSpeech, startListening]
  );

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
        body: JSON.stringify({ message: speech, locale: "en" }),
      });

      if (!res.ok) throw new Error("Concierge chat failed");

      const data = await res.json();
      const reply = data.text || "I have received your request.";

      setTranscripts((prev) => [
        ...prev,
        {
          speaker: "concierge",
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

      // Speak response aloud in English
      speakResponse(reply);
    } catch (err: any) {
      const errReply = "I could not fully hear you. Could you please repeat that?";
      setTranscripts((prev) => [
        ...prev,
        { speaker: "concierge", text: errReply, timestamp: new Date() },
      ]);
      speakResponse(errReply);
    }
  };

  // Start voice session with authentic welcome audio
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

      // 3. Welcome user with authentic voice audio
      const promptConfig = getPromptForLocale("en");
      setTranscripts([
        {
          speaker: "concierge",
          text: promptConfig.welcomeGreeting,
          timestamp: new Date(),
        },
      ]);

      setVoiceState("speaking");
      const audio = new Audio("/audio/welcome.mp3");
      audioElementRef.current = audio;

      if (analyserRef.current) {
        analyserRef.current.attachAudioElement(audio);
      }

      audio.onended = () => {
        setVoiceState("listening");
        startListening();
      };

      audio.onerror = () => {
        // Fallback to ElevenLabs TTS if file cannot load
        speakResponse(promptConfig.welcomeGreeting);
      };

      await audio.play();
    } catch (err: any) {
      console.error("Microphone access or audio init error:", err);
      // Even if mic is denied, still play greeting so user hears the voice
      const promptConfig = getPromptForLocale("en");
      setTranscripts([
        {
          speaker: "concierge",
          text: promptConfig.welcomeGreeting,
          timestamp: new Date(),
        },
      ]);
      const audio = new Audio("/audio/welcome.mp3");
      audioElementRef.current = audio;
      audio.play().catch(() => {});
      setVoiceState("idle");
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
