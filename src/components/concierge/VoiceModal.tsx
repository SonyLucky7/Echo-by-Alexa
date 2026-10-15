"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  X,
  Send,
  CloudSun,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { LanguageSelector } from "./LanguageSelector";
import { AlexaLightRibbon } from "./AlexaLightRibbon";
import { AlexaCards } from "./AlexaCards";

export const VoiceModal: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    voiceState,
    transcripts,
    frequencies,
    isMuted,
    errorMessage,
    startVoice,
    stopVoice,
    toggleMute,
    closeVoice,
    sendMessage,
  } = useVoice();

  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live clock matching Echo Show status bar in video
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-start voice session on modal open
  useEffect(() => {
    if (isOpen && voiceState === "idle") {
      startVoice();
    }
  }, [isOpen, voiceState, startVoice]);

  // Scroll to bottom as new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcripts]);

  if (!isOpen) return null;

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    sendMessage(textInput.trim());
    setTextInput("");
  };

  const handleQuickPill = (prompt: string) => {
    sendMessage(prompt);
  };

  const latestAlexaTranscript = [...transcripts]
    .reverse()
    .find((t) => t.speaker === "alexa");

  const isSpeaking = voiceState === "speaking";
  const isListening = voiceState === "listening";
  const isProcessing = voiceState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Echo Show 15 Smart Display Frame */}
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[820px] bg-gradient-to-b from-[#080E1C] via-[#050912] to-[#02050A] border border-cyan-500/20 rounded-[28px] shadow-[0_0_80px_rgba(0,180,255,0.15)] flex flex-col text-ivory overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[250px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none" />

        {/* 1. Echo Show Top Status Bar (matches video 00:06 - 00:20) */}
        <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/20">
          {/* Left: Alexa+ Brandmark & Mode */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="font-sans font-semibold tracking-tight text-lg text-ivory">
                alexa
              </span>
              <span className="text-cyan-400 font-sans font-bold text-base leading-none">
                +
              </span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-xs font-mono uppercase tracking-widest text-ivory/60">
              Hearth & Dining Sanctuary
            </span>
          </div>

          {/* Right: Weather, Live Time, Profile, Close */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs text-ivory/80">
            <div className="hidden sm:flex items-center gap-1.5 font-mono">
              <CloudSun className="w-4 h-4 text-cyan-400" />
              <span>18°C Clear</span>
            </div>

            <span className="font-mono text-sm font-medium tracking-tight">
              {currentTime || "7:15 PM"}
            </span>

            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <User className="w-3.5 h-3.5" />
            </div>

            <LanguageSelector />

            <button
              type="button"
              onClick={closeVoice}
              className="p-1.5 rounded-full hover:bg-white/10 text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Exit Alexa Concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. Echo Show Interactive Display Area (00:09 - 00:46) */}
        <main className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-10 py-6 space-y-6">
          {/* Initial Welcome Message if empty */}
          {transcripts.length === 0 && (
            <div className="py-12 text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono mb-4">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Conversational AI · Gets Stuff Done</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-normal text-ivory tracking-tight mb-3">
                How may I assist your table tonight?
              </h2>
              <p className="text-sm sm:text-base text-ivory/70 font-light leading-relaxed">
                Speak naturally or choose an action below. I can reserve tables, recommend wine pairings, customize dishes, and guide you through our open hearth menu.
              </p>
            </div>
          )}

          {/* Transcript History */}
          {transcripts.map((item, idx) => {
            const isUser = item.speaker === "user";

            return (
              <div
                key={idx}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                } animate-in fade-in duration-300`}
              >
                {/* User Utterance Pill (Matches Video 00:09, 00:12) */}
                {isUser ? (
                  <div className="bg-[#121B2D] border border-cyan-500/30 text-ivory px-5 py-3 rounded-2xl rounded-tr-xs text-sm sm:text-base font-sans max-w-lg shadow-lg">
                    {item.text}
                  </div>
                ) : (
                  /* Alexa Response: Large, Clean Kinetic Typography (Matches Video 00:10, 00:23, 00:38) */
                  <div className="w-full max-w-3xl space-y-3">
                    <p className="text-base sm:text-xl md:text-2xl font-sans font-light text-ivory/95 leading-relaxed tracking-tight">
                      {item.text}
                    </p>

                    {/* Interactive Rich Cards for Dish/Table/Order (Matches Video 00:24 & 00:39) */}
                    {item.toolResults && item.toolResults.length > 0 && (
                      <AlexaCards
                        toolResults={item.toolResults}
                        onAction={(action) => sendMessage(action)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-3 text-cyan-400 font-mono text-xs py-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Alexa is consulting the kitchen hearth...</span>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* 3. Suggestion Action Pills (Matches Video 00:10, 00:39) */}
        <div className="relative z-20 px-6 sm:px-10 py-2.5 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/30">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mr-1 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3" /> Try asking:
            </span>

            {[
              "What are tonight's signature wood-fired dishes?",
              "Can you book a table for 2 tonight?",
              "Do you have vegetarian and vegan pairings?",
              "Add King Oyster Mushrooms to my cart",
              "What wine pairs best with the 45-day dry-aged ribeye?",
              "Check the status of my order",
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPill(prompt)}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/50 text-xs text-ivory/80 hover:text-cyan-300 transition-all duration-200 whitespace-nowrap shadow-xs"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Optional Text Input Drawer */}
        {showTextInput && (
          <form
            onSubmit={handleSendText}
            className="relative z-20 px-6 sm:px-10 py-2 bg-black/40 border-t border-white/10 flex items-center gap-3"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask Alexa anything about ECHO dishes, reservations, or pairings..."
              className="flex-1 bg-white/10 border border-white/15 rounded-full px-5 py-2.5 text-sm text-ivory placeholder:text-white/40 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="p-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-charcoal font-semibold disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 4. Alexa Control Console & Bottom Light Ribbon */}
        <footer className="relative z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-2 pb-5 px-6 sm:px-10">
          <div className="flex items-center justify-between">
            {/* Left Control: Mute & Volume */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                className={`p-3 rounded-full border transition-all ${
                  isMuted
                    ? "bg-red-500/20 text-red-300 border-red-500/40"
                    : "bg-white/10 text-ivory/80 border-white/15 hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <span className="text-xs font-mono text-ivory/60 hidden sm:inline">
                {isMuted
                  ? "Muted"
                  : isListening
                  ? "Listening..."
                  : isSpeaking
                  ? "Speaking..."
                  : isProcessing
                  ? "Processing..."
                  : "Ready"}
              </span>
            </div>

            {/* Center: Large Alexa Mic Activation Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    stopVoice();
                  } else {
                    startVoice();
                  }
                }}
                className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                  isSpeaking
                    ? "bg-cyan-400 text-charcoal shadow-[0_0_30px_rgba(0,202,255,0.7)] scale-105"
                    : isListening
                    ? "bg-gradient-to-tr from-cyan-400 to-blue-500 text-charcoal shadow-[0_0_35px_rgba(0,202,255,0.8)] scale-110"
                    : "bg-white/15 hover:bg-white/25 text-cyan-300 border border-cyan-400/40"
                }`}
                aria-label="Tap to speak with Alexa"
              >
                <Mic className="w-6 h-6" />
              </button>

              {/* Pulsing ring when active */}
              {(isListening || isSpeaking) && (
                <span className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
              )}
            </div>

            {/* Right Control: Text Keyboard Toggle & End Call */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTextInput((prev) => !prev)}
                className={`px-3 py-2 rounded-full border text-xs font-mono transition-all ${
                  showTextInput
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                    : "bg-white/10 text-ivory/70 border-white/15 hover:bg-white/20"
                }`}
              >
                {showTextInput ? "Voice Mode" : "Type Query"}
              </button>

              <button
                type="button"
                onClick={closeVoice}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-medium transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">End Session</span>
              </button>
            </div>
          </div>

          {/* Signature Alexa Electric Cyan Acoustic Ribbon (from Video 00:01, 00:10, 00:21) */}
          <AlexaLightRibbon state={voiceState} frequencies={frequencies} />
        </footer>
      </div>
    </div>
  );
};
