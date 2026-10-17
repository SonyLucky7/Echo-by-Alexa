"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Mic, MicOff, Plus, ArrowUp } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { EmberOrbVisualizer } from "./EmberOrbVisualizer";
import { DiningCards } from "./DiningCards";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const isListening = voiceState === "listening";
  const isProcessing = voiceState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Smart Dining Concierge Screen Canvas (Matches Reference Image 1 & 2) */}
      <div className="relative w-full max-w-3xl h-[92vh] max-h-[820px] bg-gradient-to-b from-[#141519] via-[#0E0F12] to-[#090A0D] border border-white/10 sm:rounded-[32px] rounded-2xl shadow-[0_0_80px_rgba(197,143,88,0.2)] flex flex-col text-ivory overflow-hidden">
        {/* Warm Ambient Hearth Atmosphere Glows */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[250px] bg-ember/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-ember-light/10 blur-[130px] rounded-full pointer-events-none" />

        {/* 1. Sleek Top Bar (No personal names) */}
        <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/25">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-ember shadow-[0_0_10px_#C58F58]" />
            <div>
              <span className="font-serif font-medium text-base tracking-widest text-ivory">
                ECHO
              </span>
              <span className="text-[10px] uppercase tracking-widest text-olive-light font-mono block -mt-0.5">
                Hearth & Botanicals
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeVoice}
            className="p-2 rounded-full hover:bg-white/10 text-ivory/60 hover:text-ivory transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* 2. Interactive Assistant Display Area */}
        <main className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-5">
          {/* Main Visualizer: Fluid Acoustic Waveform (Reference Image 1) */}
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
                {/* User Utterance Bubble on Right */}
                {isUser ? (
                  <div className="bg-[#1C1612] border border-ember/30 text-ivory px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl rounded-tr-xs text-sm sm:text-base font-sans max-w-lg shadow-lg">
                    {item.text}
                  </div>
                ) : (
                  /* Assistant Response: Clean Editorial Typography & Cards */
                  <div className="w-full max-w-3xl space-y-3">
                    <p className="text-sm sm:text-base font-sans font-light text-ivory/95 leading-relaxed tracking-tight">
                      {item.text}
                    </p>

                    {/* Interactive Cards (Table Booking with Time Slots, Dish Cards, Sommelier) */}
                    {item.toolResults && item.toolResults.length > 0 && (
                      <DiningCards
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
            <div className="flex items-center gap-2 text-ember font-mono text-xs py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
              <span>Thinking...</span>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* 3. Quick Suggestion Pills (Reference Image 1 & 2) */}
        {showPills && (
          <div className="relative z-20 px-5 sm:px-8 py-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-2 min-w-max">
              {[
                "Tonight's signature wood-fired dishes",
                "Reserve a table for 2",
                "Vegan hearth options",
                "Sommelier wine pairings",
                "Check my order status",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPill(prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-ember/20 border border-white/10 hover:border-ember/50 text-xs text-ivory/80 hover:text-ember-light transition-all duration-200 whitespace-nowrap shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Floating Pill Input Bar (Matches Reference Image 1 & 2 Bottom Bar) */}
        <footer className="relative z-20 bg-gradient-to-t from-black via-[#0E0F12]/95 to-transparent pt-2 pb-5 px-5 sm:px-8">
          <form
            onSubmit={handleSendPrompt}
            className="flex items-center gap-2.5 bg-[#16171B] border border-white/15 rounded-full px-4 py-2 shadow-2xl focus-within:border-ember focus-within:ring-1 focus-within:ring-ember transition-all"
          >
            {/* Plus toggle button on left (matches Reference Image 1 '+') */}
            <button
              type="button"
              onClick={() => setShowPills((prev) => !prev)}
              className="p-1.5 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/10 transition-colors"
              title="Toggle Suggestions"
            >
              <Plus className="w-5 h-5 text-ember" />
            </button>

            {/* Input prompt field (matches Reference Image 1 'Write your prompt here..') */}
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

            {/* Send Arrow Button on right (matches Reference Image 1 glowing circular send button) */}
            <button
              type="button"
              onClick={handleSendPrompt}
              disabled={!textInput.trim()}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-ember-dark to-ember flex items-center justify-center text-ivory shadow-[0_0_15px_rgba(197,143,88,0.6)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shrink-0"
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
