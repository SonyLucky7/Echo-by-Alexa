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
  Plus,
  ArrowUp,
  Volume2,
} from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { LanguageSelector } from "./LanguageSelector";
import { EmberOrbVisualizer } from "./EmberOrbVisualizer";
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
  const [showPills, setShowPills] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live status clock
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

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    sendMessage(textInput.trim());
    setTextInput("");
  };

  const handleQuickPill = (prompt: string) => {
    sendMessage(prompt);
  };

  const isSpeaking = voiceState === "speaking";
  const isListening = voiceState === "listening";
  const isProcessing = voiceState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-charcoal/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Mobile/Tablet Smart Canvas in Website Colors (Matches Image 1 & 2) */}
      <div className="relative w-full max-w-4xl h-[94vh] max-h-[820px] bg-gradient-to-b from-[#141518] via-[#0E0F12] to-[#0A0A0C] border border-ember/25 rounded-[32px] shadow-[0_0_90px_rgba(197,143,88,0.2)] flex flex-col text-ivory overflow-hidden">
        {/* Warm Ambient Hearth Atmosphere Glows */}
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-ember/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[250px] bg-ember-light/10 blur-[150px] rounded-full pointer-events-none" />

        {/* 1. Sleek Top Status Bar (Matches Image 1 Status Area, No Names) */}
        <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            {/* Animated Glowing Micro-Orb Emblem */}
            <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-charcoal via-ember to-ember-light p-0.5 shadow-[0_0_15px_rgba(197,143,88,0.6)]">
              <div className="w-full h-full rounded-full bg-charcoal flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-ember-light animate-spin-slow" />
              </div>
            </div>
            <div>
              <span className="font-serif font-medium text-sm text-ivory tracking-wide block">
                Dining Assistant
              </span>
              <span className="text-[10px] uppercase tracking-widest text-olive-light font-mono -mt-0.5 block">
                Hearth & Botanicals
              </span>
            </div>
          </div>

          {/* Right Status Controls (Weather, Clock, Language, Close) */}
          <div className="flex items-center gap-3 sm:gap-5 text-xs text-ivory/80">
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-ember-light/90">
              <CloudSun className="w-4 h-4 text-ember" />
              <span>18°C Clear</span>
            </div>

            <span className="font-mono text-xs sm:text-sm font-medium tracking-tight">
              {currentTime || "7:15 PM"}
            </span>

            <LanguageSelector />

            <button
              type="button"
              onClick={closeVoice}
              className="p-1.5 rounded-full hover:bg-white/10 text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. Interactive Assistant Display Area */}
        <main className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-10 py-4 space-y-6">
          {/* Main Visualizer: 3D Ethereal Ember Orb & Layered Soundwave (Image 1 & Image 2) */}
          <div className="py-2">
            <EmberOrbVisualizer state={voiceState} frequencies={frequencies} />
          </div>

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
                {/* User Utterance Bubble on Right (Matches Image 1 right screen) */}
                {isUser ? (
                  <div className="bg-[#1C1612] border border-ember/30 text-ivory px-5 py-3 rounded-2xl rounded-tr-xs text-sm sm:text-base font-sans max-w-lg shadow-lg">
                    {item.text}
                  </div>
                ) : (
                  /* Assistant Response: Clean Editorial Typography & Cards (Matches Image 1 & 2) */
                  <div className="w-full max-w-3xl space-y-3">
                    <p className="text-base sm:text-xl font-sans font-light text-ivory/95 leading-relaxed tracking-tight">
                      {item.text}
                    </p>

                    {/* Interactive Cards (Table Booking with Time Slots, Dish Carousel, Sommelier) */}
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
            <div className="flex items-center gap-3 text-ember font-mono text-xs py-2">
              <span className="w-2 h-2 rounded-full bg-ember animate-ping" />
              <span>Consulting the hearth kitchen...</span>
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

        {/* 3. Quick Suggestion Pills (Matches Image 1 Quick Prompts) */}
        {showPills && (
          <div className="relative z-20 px-6 sm:px-10 py-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-2 min-w-max">
              {[
                "What are tonight's signature wood-fired dishes?",
                "Can you book a table for 2 tonight?",
                "Do you have vegetarian and vegan pairings?",
                "What wine pairs best with dry-aged ribeye?",
                "Check the status of my order",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPill(prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-ember/20 border border-white/10 hover:border-ember/50 text-xs text-ivory/80 hover:text-ember-light transition-all duration-200 whitespace-nowrap shadow-xs"
                >
                  &ldquo;{prompt}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Floating Pill Input Bar (Matches Image 2 Bottom Prompt Bar) */}
        <footer className="relative z-20 bg-gradient-to-t from-black via-[#0E0F12]/95 to-transparent pt-3 pb-6 px-6 sm:px-10">
          <form
            onSubmit={handleSendPrompt}
            className="flex items-center gap-3 bg-[#16171B] border border-white/15 rounded-full px-4 py-2 shadow-2xl focus-within:border-ember focus-within:ring-1 focus-within:ring-ember transition-all"
          >
            {/* Plus button on left (matches Image 2 '+') */}
            <button
              type="button"
              onClick={() => setShowPills((prev) => !prev)}
              className="p-1.5 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/10 transition-colors"
              title="Toggle Suggestions"
            >
              <Plus className="w-5 h-5 text-ember" />
            </button>

            {/* Input prompt field (matches Image 2 'Write your prompt here..') */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write your prompt here..."
              className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 outline-none font-light"
            />

            {/* Mic voice toggle button */}
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2 rounded-full transition-all ${
                isMuted
                  ? "text-red-400 hover:bg-red-500/20"
                  : isListening
                  ? "text-ember animate-pulse hover:bg-ember/20"
                  : "text-ivory/60 hover:text-ivory"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Arrow Button on right (matches Image 2 '↑' button with glowing circular ring) */}
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-ember-dark to-ember flex items-center justify-center text-ivory shadow-[0_0_15px_rgba(197,143,88,0.6)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shrink-0"
              aria-label="Send Prompt"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};
