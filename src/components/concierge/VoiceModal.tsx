"use client";

import React, { useEffect } from "react";
import { Mic, MicOff, PhoneOff, Sparkles, X, Volume2, Flame } from "lucide-react";
import { useVoice } from "@/hooks/useVoice";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/Button";

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
  } = useVoice();

  // Automatically start voice session when modal is opened
  useEffect(() => {
    if (isOpen && voiceState === "idle") {
      startVoice();
    }
  }, [isOpen, voiceState, startVoice]);

  if (!isOpen) return null;

  const latestTranscript = transcripts[transcripts.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-charcoal-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-ivory">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal-900 to-black pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-ember border border-ember/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-medium text-ivory">Alexa</h3>
                <span className="text-[10px] bg-ember/20 text-ember px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Voice Concierge
                </span>
              </div>
              <p className="text-xs text-ivory/60 font-sans">
                ElevenLabs Voice AI (sXSV9RZ095VZyL64w3ap)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              type="button"
              onClick={closeVoice}
              className="p-2 rounded-full hover:bg-white/10 text-ivory/70 hover:text-ivory transition-colors"
              aria-label="Close voice concierge"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="relative z-10 px-6 py-4 flex-1 flex flex-col items-center justify-center min-h-[300px]">
          <VoiceVisualizer frequencies={frequencies} state={voiceState} />

          {/* Live Transcript Display */}
          <div className="w-full max-w-md mt-2 p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-h-[72px] flex items-center justify-center">
            {errorMessage ? (
              <p className="text-sm text-red-300 font-sans">{errorMessage}</p>
            ) : latestTranscript ? (
              <p className="text-sm font-sans leading-relaxed text-ivory/90">
                <span className="font-serif italic text-ember mr-1">
                  {latestTranscript.speaker === "alexa" ? "Alexa:" : "You:"}
                </span>{" "}
                {latestTranscript.text}
              </p>
            ) : (
              <p className="text-sm text-ivory/50 font-serif italic">
                Speak naturally. Alexa understands dishes, dietary preferences, and your dining cart.
              </p>
            )}
          </div>
        </div>

        {/* Suggested Voice Queries */}
        <div className="relative z-10 px-6 py-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar text-xs text-ivory/70">
            <span className="text-ember font-serif italic flex items-center gap-1 flex-shrink-0">
              <Flame className="w-3 h-3" /> Try saying:
            </span>
            {[
              "What are tonight's signature wood-fired dishes?",
              "Do you have vegan options?",
              "Add King Oyster Mushrooms to my cart",
              "Check the status of my order",
            ].map((q, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 whitespace-nowrap flex-shrink-0"
              >
                &ldquo;{q}&rdquo;
              </span>
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="relative z-10 px-6 py-5 border-t border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className={`p-3 rounded-full border transition-all ${
                isMuted
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : "bg-white/10 text-ivory border-white/20 hover:bg-white/20"
              }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <span className="text-xs text-ivory/60 font-sans">
              {isMuted ? "Muted" : "Active"}
            </span>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={closeVoice}
            className="border-red-400/30 text-red-200 hover:bg-red-500/20 gap-2 px-5"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
