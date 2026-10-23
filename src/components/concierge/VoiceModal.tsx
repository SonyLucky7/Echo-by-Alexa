"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Mic, MicOff, Plus, ArrowUp, Volume2, VolumeX } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { EmberOrbVisualizer } from "./EmberOrbVisualizer";
import { DiningCards } from "./DiningCards";

function renderFormattedText(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const VoiceModal: React.FC = () => {
  const {
    isOpen,
    voiceState,
    transcripts,
    frequencies,
    interimTranscript,
    isMuted,
    errorMessage,
    startVoice,
    toggleMute,
    handleMicTap,
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
  }, [transcripts, interimTranscript]);

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
  const isSpeaking = voiceState === "speaking";
  const isProcessing = voiceState === "processing";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Smart Dining Concierge Screen Canvas (Matches Reference Image 1) */}
      <div className="relative w-full max-w-3xl h-[92vh] max-h-[820px] bg-gradient-to-b from-[#0F1015] via-[#0B0C10] to-[#070709] border border-white/10 sm:rounded-[36px] rounded-3xl shadow-[0_0_90px_rgba(56,189,248,0.1)] flex flex-col text-ivory overflow-hidden">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[200px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[220px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        {/* 1. Minimal Header */}
        <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-black/20">
          <span className="font-serif font-medium text-base tracking-widest text-ivory">
            ECHO
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${
                isMuted
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "hover:bg-white/10 text-ivory/60 hover:text-ivory"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={closeVoice}
              className="p-2 rounded-full hover:bg-white/10 text-ivory/60 hover:text-ivory transition-colors"
              aria-label="Close Concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 2. Interactive Assistant Display Area */}
        <main className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-5">
          {/* Headline (Directly Matches Reference Image 1) */}
          <div className="text-center pt-2 pb-1">
            <h2 className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-[#7dd3fc]">
              Talk to your concierge now
            </h2>
          </div>

          {/* Main Visualizer: High-Performance Fluid Acoustic Waveform (Reference 1) */}
          <div className="py-1">
            <EmberOrbVisualizer state={voiceState} frequencies={frequencies} />
          </div>

          {/* Transcript History */}
          <div className="space-y-4 pt-1">
            {transcripts.map((item, idx) => {
              const isUser = item.speaker === "user";

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  } animate-in fade-in duration-300`}
                >
                  {/* User Utterance: Minimal soft pill on Right */}
                  {isUser ? (
                    <div className="bg-white/10 text-ivory px-4 sm:px-5 py-2.5 rounded-2xl text-sm sm:text-base font-sans max-w-lg shadow-sm">
                      {item.text}
                    </div>
                  ) : (
                    /* Assistant Response: Clean Editorial Typography & Cards */
                    <div className="w-full max-w-3xl space-y-3 py-1">
                      <p className="text-sm sm:text-base font-sans font-light text-ivory/95 leading-relaxed tracking-tight">
                        {renderFormattedText(item.text)}
                      </p>

                      {/* Interactive Cards (Table Reservation, Menu Dishes, Sommelier, Web Search) */}
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

            {/* Live Interim Speech Utterance */}
            {interimTranscript && (
              <div className="flex flex-col items-end animate-in fade-in duration-150">
                <div className="bg-white/10 text-ivory/80 px-4 py-2 rounded-2xl text-sm font-sans italic max-w-lg">
                  {interimTranscript}
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="text-ivory/40 font-mono text-xs py-1">
                Thinking...
              </div>
            )}

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* 3. Quick Suggestion Pills (Completely scrollbar-free) */}
        {showPills && (
          <div className="relative z-20 px-5 sm:px-8 py-2 overflow-x-auto no-scrollbar bg-black/25">
            <div className="flex items-center gap-2 min-w-max pb-0.5">
              {[
                "Tonight's signature wood-fired dishes",
                "Reserve a table for 2",
                "Research web: best California wine pairings",
                "What is koji fermentation and fruitwood cooking?",
                "Vegan hearth options",
                "Check my order status",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickPill(prompt)}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 text-xs text-ivory/80 hover:text-white transition-all duration-200 whitespace-nowrap shadow-xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Floating Pill Input Bar (Matches Reference Image 1) */}
        <footer className="relative z-20 bg-gradient-to-t from-black via-[#0C0D12] to-transparent pt-2 pb-5 px-5 sm:px-8">
          <form
            onSubmit={handleSendPrompt}
            className="flex items-center gap-2.5 bg-[#14151B] border border-white/15 focus-within:border-white/30 rounded-full px-4 py-2.5 shadow-2xl transition-all"
          >
            {/* Plus toggle button on left */}
            <button
              type="button"
              onClick={() => setShowPills((prev) => !prev)}
              className="p-1 rounded-full text-ivory/60 hover:text-ivory hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Toggle Suggestions"
            >
              <Plus className="w-5 h-5 text-ivory/70" />
            </button>

            {/* Input prompt field */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Write your prompt here.."
              className="flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/40 outline-none font-light"
            />

            {/* Mic voice toggle button with instant interrupt & listen */}
            <button
              type="button"
              onClick={handleMicTap}
              className={`p-1.5 rounded-full transition-all shrink-0 cursor-pointer ${
                isMuted
                  ? "text-red-400 hover:bg-red-500/20"
                  : isListening
                  ? "text-ember-light bg-white/10"
                  : isSpeaking
                  ? "text-ember"
                  : "text-ivory/60 hover:text-ivory"
              }`}
              title={
                isSpeaking
                  ? "Tap to interrupt & speak"
                  : isListening
                  ? "Listening (tap to stop)"
                  : "Tap to speak"
              }
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Arrow Button on right */}
            <button
              type="button"
              onClick={handleSendPrompt}
              disabled={!textInput.trim()}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-ember to-amber-300 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shrink-0 cursor-pointer"
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
