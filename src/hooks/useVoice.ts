"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";
import { getPromptForLocale } from "@/lib/concierge/prompts";

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

  // If text starts with JSON array or object, parse human content
  if (text.startsWith("[") || text.startsWith("{") || text.includes('"name":') || text.includes('"id":')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed[0]?.name) {
        text = `Tonight from our wood-fire hearth, we feature ${parsed.slice(0, 2).map((d: any) => d.name).join(" and ")}.`;
      } else if (parsed.message) {
        text = parsed.message;
      }
    } catch {
      text = text.replace(/"[^"]*":/g, "").replace(/[{}[\]_"]+/g, " ");
    }
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold **text**
    .replace(/\*(.*?)\*/g, "$1") // Italic *text*
    .replace(/__(.*?)__/g, "$1") // Underline
    .replace(/_(.*?)_/g, "$1") // Italic _text_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Markdown links
    .replace(/`([^`]+)`/g, "$1") // Inline code
    .replace(/```[\s\S]*?```/g, "") // Code blocks
    .replace(/#+\s+/g, "") // Headers
    .replace(/^\s*[-*+]\s+/gm, "") // Bullet lists
    .replace(/\$(\d+(?:\.\d{2})?)/g, "$1 dollars") // $38.00 -> 38.00 dollars
    .replace(/&/g, " and ")
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "") // Emojis
    .replace(/[{}[\]_"\\]+/g, " ") // Strip any leftover braces, brackets, quotes
    .replace(/\s+/g, " ")
    .trim();
}

// Module-level locked voice reference to ensure 1 consistent voice across entire session
let selectedVoice: SpeechSynthesisVoice | null = null;

function resolveBestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  const chosen =
    englishVoices.find((v) => v.name.includes("Natural") || v.name.includes("Online (Natural)")) ||
    englishVoices.find((v) => v.name.includes("Google") && (v.lang === "en-US" || v.lang === "en_US")) ||
    englishVoices.find((v) => v.name.includes("Jenny")) ||
    englishVoices.find((v) => v.name.includes("Aria")) ||
    englishVoices.find((v) => v.name.includes("Samantha")) ||
    englishVoices[0] ||
    voices[0];

  selectedVoice = chosen;
  return chosen;
}

/**
 * Finds the single highest quality, human-sounding English voice available on the client device
 */
export function getBestNaturalVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  return resolveBestVoice();
}

export function useVoice() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([]);
  const [frequencies, setFrequencies] = useState<number[]>(new Array(16).fill(0.2));
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronization refs to avoid stale closures in audio/speech callbacks
  const isOpenRef = useRef(false);
  const voiceStateRef = useRef<VoiceState>("idle");
  const isMutedRef = useRef(false);
  const isProcessingRef = useRef(false);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<RealAudioAnalyser | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const synthOscillatorIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const speechCooldownTimerRef = useRef<any>(null);
  const handleUserUtteranceRef = useRef<(text: string) => Promise<void>>(() => Promise.resolve());

  // Keep refs in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Pre-load natural voices on client mount so greeting always uses the highest quality voice
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      resolveBestVoice();
      const onVoicesChanged = () => {
        resolveBestVoice();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        if (window.speechSynthesis.onvoiceschanged === onVoicesChanged) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Frequency loop: throttled to ~30fps when listening or speaking
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
        if (analyserRef.current && voiceStateRef.current === "listening") {
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

  // Synthetic frequency oscillator: visualizer canvas renders 60fps GPU undulation autonomously without React re-render lag
  const startSynthOscillator = useCallback(() => {
    // Autonomous GPU canvas motion in EmberOrbVisualizer
  }, []);

  const stopSynthOscillator = useCallback(() => {
    // Autonomous GPU canvas motion in EmberOrbVisualizer
  }, []);

  // Stop any active speech immediately
  const cancelAllSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopSynthOscillator();
    activeUtteranceRef.current = null;
  }, [stopSynthOscillator]);

  // Safely start listening with SpeechRecognition
  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isMutedRef.current || !isOpenRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Speech recognition not available. Please type your message.");
      return;
    }

    // Stop existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
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
        // Do not process microphone input while assistant is responding or speaking!
        if (isProcessingRef.current || voiceStateRef.current === "speaking") {
          return;
        }

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

        if (finalUtterance.trim()) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          setInterimTranscript("");
          // Lock to prevent duplicate calls
          try {
            recognition.stop();
          } catch {}
          handleUserUtteranceRef.current(finalUtterance.trim());
          return;
        }

        if (liveInterim.trim()) {
          setInterimTranscript(liveInterim.trim());

          // Silence timeout: if user pauses for 1.4s, finalize and send
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (liveInterim.trim() && !isProcessingRef.current) {
              setInterimTranscript("");
              try {
                recognition.stop();
              } catch {}
              handleUserUtteranceRef.current(liveInterim.trim());
            }
          }, 1400);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === "no-speech") return;
        if (e.error === "not-allowed") {
          setErrorMessage("Microphone access denied. Please enable mic permissions.");
          setVoiceState("error");
        }
      };

      recognition.onend = () => {
        setInterimTranscript("");
        // Automatically restart after 100ms debounce only if we're still in listening state
        if (
          isOpenRef.current &&
          !isMutedRef.current &&
          !isProcessingRef.current &&
          voiceStateRef.current === "listening"
        ) {
          setTimeout(() => {
            if (
              isOpenRef.current &&
              !isMutedRef.current &&
              !isProcessingRef.current &&
              voiceStateRef.current === "listening"
            ) {
              try {
                recognition.start();
              } catch {}
            }
          }, 100);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
    }
  }, []);

  // Single reliable speech synthesis function (NO overlapping audio!)
  const speakResponse = useCallback(
    (text: string) => {
      cancelAllSpeech();

      // Pause speech recognition while the assistant is speaking so it doesn't hear itself!
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        isProcessingRef.current = false;
        setVoiceState("listening");
        startListening();
        return;
      }

      const spokenText = cleanTextForSpeech(text);
      if (!spokenText) {
        isProcessingRef.current = false;
        setVoiceState("listening");
        startListening();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const naturalVoice = getBestNaturalVoice();
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      activeUtteranceRef.current = utterance;
      setVoiceState("speaking");
      startSynthOscillator();

      if (window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }

      let safetyWatchdog: any = null;

      const finishSpeech = () => {
        if (safetyWatchdog) clearTimeout(safetyWatchdog);
        stopSynthOscillator();
        activeUtteranceRef.current = null;
        isProcessingRef.current = false;

        // 350ms cooldown before re-opening microphone to avoid speaker echo
        if (speechCooldownTimerRef.current) clearTimeout(speechCooldownTimerRef.current);
        speechCooldownTimerRef.current = setTimeout(() => {
          if (isOpenRef.current && !isMutedRef.current) {
            setVoiceState("listening");
            startListening();
          } else {
            setVoiceState("idle");
          }
        }, 350);
      };

      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;

      // Chrome safety watchdog: if Chrome drops onend event, transition to listening after calculated duration
      const wordsCount = spokenText.split(" ").length;
      const estimatedDurationMs = Math.max(3000, (wordsCount / 2.2) * 1000 + 1500);
      safetyWatchdog = setTimeout(() => {
        if (activeUtteranceRef.current === utterance) {
          finishSpeech();
        }
      }, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    },
    [cancelAllSpeech, startListening, startSynthOscillator, stopSynthOscillator]
  );

  // Master handler for user message turn (with single-inflight guard)
  const handleUserUtterance = async (speech: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setInterimTranscript("");
    cancelAllSpeech();

    const cleanInput = speech.trim();
    if (!cleanInput) {
      isProcessingRef.current = false;
      return;
    }

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

      // Speak response aloud with single voice
      speakResponse(reply);
    } catch (err: any) {
      const errReply = "I could not hear clearly. Could you please repeat that?";
      setTranscripts((prev) => [
        ...prev,
        { speaker: "concierge", text: errReply, timestamp: new Date() },
      ]);
      speakResponse(errReply);
    }
  };

  handleUserUtteranceRef.current = handleUserUtterance;

  // Start voice session
  const startVoice = async () => {
    cancelAllSpeech();
    setVoiceState("connecting");
    setErrorMessage(null);
    setInterimTranscript("");
    isProcessingRef.current = false;

    try {
      // 1. Request microphone access for real analyser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      if (!analyserRef.current) {
        analyserRef.current = new RealAudioAnalyser(stream);
      } else {
        analyserRef.current.attachStream(stream);
      }

      // 2. Set welcome greeting message
      const promptConfig = getPromptForLocale("en");
      setTranscripts([
        {
          speaker: "concierge",
          text: promptConfig.welcomeGreeting,
          timestamp: new Date(),
        },
      ]);

      // 3. Speak the welcome greeting with single clean voice
      speakResponse(promptConfig.welcomeGreeting);
    } catch (err: any) {
      console.warn("Microphone access prompt:", err);
      const promptConfig = getPromptForLocale("en");
      setTranscripts([
        {
          speaker: "concierge",
          text: promptConfig.welcomeGreeting,
          timestamp: new Date(),
        },
      ]);
      // Still speak greeting cleanly
      speakResponse(promptConfig.welcomeGreeting);
    }
  };

  // Stop voice session
  const stopVoice = useCallback(() => {
    cancelAllSpeech();
    isProcessingRef.current = false;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (speechCooldownTimerRef.current) clearTimeout(speechCooldownTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setVoiceState("idle");
    setInterimTranscript("");
  }, [cancelAllSpeech]);

  // Toggle Mute / Mic State
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      isMutedRef.current = false;
      setVoiceState("listening");
      startListening();
    } else {
      cancelAllSpeech();
      setIsMuted(true);
      isMutedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setVoiceState("muted");
    }
  };

  // Handle direct Mic button tap on the input bar
  const handleMicTap = () => {
    if (voiceState === "speaking") {
      // Interrupt assistant speech immediately and start listening to user!
      cancelAllSpeech();
      isProcessingRef.current = false;
      setIsMuted(false);
      isMutedRef.current = false;
      setVoiceState("listening");
      startListening();
    } else if (voiceState === "listening") {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setVoiceState("idle");
    } else {
      // Start listening
      setIsMuted(false);
      isMutedRef.current = false;
      setVoiceState("listening");
      startListening();
    }
  };

  const closeVoice = () => {
    stopVoice();
    setIsOpen(false);
  };

  const sendMessage = (text: string) => {
    handleUserUtterance(text);
  };

  // Listen to custom open/close events
  useEffect(() => {
    const handleOpenVoice = () => {
      setVoiceState("idle");
      setErrorMessage(null);
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
  }, [stopVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVoice();
      if (analyserRef.current) analyserRef.current.destroy();
    };
  }, [stopVoice]);

  return {
    isOpen,
    setIsOpen,
    voiceState,
    transcripts,
    frequencies,
    interimTranscript,
    isMuted,
    errorMessage,
    startVoice,
    stopVoice,
    toggleMute,
    handleMicTap,
    closeVoice,
    sendMessage,
  };
}
