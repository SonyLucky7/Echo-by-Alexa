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

/**
 * Strips markdown syntax, asterisks, brackets, and symbols so voice synthesizers
 * speak natural human English rather than pronouncing formatting symbols.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold **text**
    .replace(/\*(.*?)\*/g, "$1") // Italic *text*
    .replace(/__(.*?)__/g, "$1") // Underline
    .replace(/_(.*?)_/g, "$1") // Italic _text_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Markdown links [Title](url) -> Title
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/#+\s+/g, "") // Headers
    .replace(/^\s*[-*+]\s+/gm, "") // Bullet list markers
    .replace(/\$(\d+(?:\.\d{2})?)/g, "$1 dollars") // $38.00 -> 38.00 dollars
    .replace(/&/g, " and ")
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "") // Emojis
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds the highest quality, human-sounding English voice available on the client device
 */
function getBestNaturalVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  return (
    englishVoices.find((v) => v.name.includes("Natural") || v.name.includes("Online")) ||
    englishVoices.find((v) => v.name.includes("Google") && v.lang.includes("US")) ||
    englishVoices.find((v) => v.name.includes("Samantha")) ||
    englishVoices.find((v) => v.name.includes("Jenny")) ||
    englishVoices.find((v) => v.name.includes("Guy")) ||
    englishVoices.find((v) => v.name.includes("Aria")) ||
    englishVoices[0] ||
    voices[0]
  );
}

export function useVoice() {
  const locale: SupportedLocale = "en";
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0));
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<RealAudioAnalyser | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const synthOscillatorIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);

  // Frequency loop: only runs when modal is open and audio is active, throttled to ~30fps
  useEffect(() => {
    if (!isOpen || (voiceState !== "speaking" && voiceState !== "listening")) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    let lastTime = 0;
    const loop = (timestamp: number) => {
      if (timestamp - lastTime >= 33) {
        lastTime = timestamp;
        if (analyserRef.current) {
          const data = analyserRef.current.getFrequencies();
          setFrequencies(data);
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isOpen, voiceState]);

  // Listen to open/close voice events
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

  // Web Speech synthetic audio waveform oscillation so visualizer dances while speaking
  const startSynthOscillator = useCallback(() => {
    if (synthOscillatorIntervalRef.current) {
      clearInterval(synthOscillatorIntervalRef.current);
    }
    let phase = 0;
    synthOscillatorIntervalRef.current = setInterval(() => {
      phase += 0.25;
      const simulatedFreqs = Array.from({ length: 16 }, (_, i) => {
        const val = Math.sin(phase + i * 0.45) * 0.4 + Math.cos(phase * 0.7 + i * 0.3) * 0.35 + 0.35;
        return Math.max(0.08, Math.min(val, 0.95));
      });
      setFrequencies(simulatedFreqs);
    }, 45);
  }, []);

  const stopSynthOscillator = useCallback(() => {
    if (synthOscillatorIntervalRef.current) {
      clearInterval(synthOscillatorIntervalRef.current);
      synthOscillatorIntervalRef.current = null;
    }
  }, []);

  // Start speech recognition with live interim transcription and silence timeout
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
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
        setInterimTranscript("");
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let liveInterim = "";
        let finalUtterance = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalUtterance += trans;
          } else {
            liveInterim += trans;
          }
        }

        if (liveInterim.trim()) {
          setInterimTranscript(liveInterim.trim());

          // Reset silence timer: if user stops speaking for 1.3s, finalize
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (liveInterim.trim()) {
              setInterimTranscript("");
              handleUserUtterance(liveInterim.trim());
            }
          }, 1300);
        }

        if (finalUtterance.trim()) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          setInterimTranscript("");
          handleUserUtterance(finalUtterance.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === "no-speech") {
          // Gracefully continue listening
          return;
        }
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          setErrorMessage("Microphone access was denied. Please allow microphone permissions.");
          setVoiceState("error");
        }
      };

      recognition.onend = () => {
        setInterimTranscript("");
        // Automatically restart if still in listening state and unmuted
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

  // High-Quality Web Speech synthesis with natural voice, anti-garbage-collection ref, and waveform
  const fallbackWebSpeech = useCallback(
    (rawText: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setVoiceState("listening");
        startListening();
        return;
      }

      window.speechSynthesis.cancel();
      stopSynthOscillator();

      const spokenText = cleanTextForSpeech(rawText);
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "en-US";
      utterance.rate = 1.02; // Crisp natural cadence
      utterance.pitch = 1.0;

      const naturalVoice = getBestNaturalVoice();
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      // Keep utterance in ref to avoid Chromium GC bug
      activeUtteranceRef.current = utterance;

      setVoiceState("speaking");
      startSynthOscillator();

      // Chromium keep-alive heartbeat
      const heartbeat = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(heartbeat);
        }
      }, 5000);

      utterance.onend = () => {
        clearInterval(heartbeat);
        stopSynthOscillator();
        activeUtteranceRef.current = null;
        setVoiceState("listening");
        startListening();
      };

      utterance.onerror = () => {
        clearInterval(heartbeat);
        stopSynthOscillator();
        activeUtteranceRef.current = null;
        setVoiceState("listening");
        startListening();
      };

      window.speechSynthesis.speak(utterance);
    },
    [startListening, startSynthOscillator, stopSynthOscillator]
  );

  // Speak response using ElevenLabs TTS or Natural Web Speech
  const speakResponse = useCallback(
    async (text: string) => {
      setVoiceState("speaking");
      const spokenText = cleanTextForSpeech(text);

      try {
        const resp = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: spokenText, locale: "en" }),
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
            fallbackWebSpeech(spokenText);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn("ElevenLabs TTS unavailable, using enhanced Web Speech:", err);
      }

      fallbackWebSpeech(spokenText);
    },
    [fallbackWebSpeech, startListening]
  );

  // Master handler for user utterance (from speech or typed prompt)
  const handleUserUtterance = async (speech: string) => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setInterimTranscript("");

    const cleanInput = speech.trim();
    if (!cleanInput) return;

    setVoiceState("processing");
    setTranscripts((prev) => [
      ...prev,
      { speaker: "user", text: cleanInput, timestamp: new Date() },
    ]);

    try {
      const res = await fetch("/api/concierge/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: cleanInput, locale: "en" }),
      });

      if (!res.ok) throw new Error("Concierge chat failed");

      const data = await res.json();
      const reply = data.text || "I have received your request. How else may I assist?";

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
    setInterimTranscript("");

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

      // 3. Welcome user with natural voice audio
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
        speakResponse(promptConfig.welcomeGreeting);
      };

      await audio.play();
    } catch (err: any) {
      console.warn("Microphone access or audio init fallback:", err);
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
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopSynthOscillator();
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
    activeUtteranceRef.current = null;
    setVoiceState("idle");
    setInterimTranscript("");
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
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
    interimTranscript,
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
