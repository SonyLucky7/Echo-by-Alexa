"use client";

import React from "react";
import { VoiceState } from "@/hooks/useVoice";

export interface VoiceVisualizerProps {
  frequencies: number[];
  state: VoiceState;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ frequencies, state }) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isMuted = state === "muted";

  // Calculate average energy
  const avgEnergy = frequencies.length > 0
    ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
    : 0;

  // Scale orb based on real audio energy
  const orbScale = isMuted ? 1.0 : 1.0 + avgEnergy * 0.45;
  const glowOpacity = isMuted ? 0.2 : 0.4 + avgEnergy * 0.6;

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      {/* Dynamic Background Glow */}
      <div
        className="absolute w-56 h-56 rounded-full transition-transform duration-75 ease-out pointer-events-none"
        style={{
          background: isSpeaking
            ? "radial-gradient(circle, rgba(197, 143, 88, 0.45) 0%, rgba(65, 74, 62, 0.15) 60%, transparent 80%)"
            : isListening
            ? "radial-gradient(circle, rgba(65, 74, 62, 0.5) 0%, rgba(197, 143, 88, 0.2) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(197, 143, 88, 0.2) 0%, transparent 70%)",
          transform: `scale(${orbScale})`,
          opacity: glowOpacity,
        }}
      />

      {/* Center Spherical Orb */}
      <div
        className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-75 border border-white/20"
        style={{
          transform: `scale(${orbScale})`,
          background: isSpeaking
            ? "radial-gradient(circle at 35% 35%, #E6B587 0%, #C58F58 50%, #161616 100%)"
            : isListening
            ? "radial-gradient(circle at 35% 35%, #5E6A5A 0%, #414A3E 60%, #161616 100%)"
            : isProcessing
            ? "radial-gradient(circle at 35% 35%, #C58F58 0%, #414A3E 100%)"
            : "radial-gradient(circle at 35% 35%, #2A2A2A 0%, #161616 100%)",
        }}
      >
        {/* Subtle Inner Hearth Rings */}
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/10 blur-sm" />
        </div>
      </div>

      {/* Real FFT Frequency Equalizer Bars */}
      <div className="flex items-center justify-center gap-1.5 mt-8 h-12 w-full max-w-xs">
        {frequencies.map((freq, idx) => {
          // Height directly mapped from FFT (0 to 1) -> 4px to 44px
          const barHeight = Math.max(4, Math.round(freq * 44));
          const isCenter = idx >= 6 && idx <= 9;

          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-75 ease-out ${
                isSpeaking
                  ? "bg-ember"
                  : isListening
                  ? "bg-forest-light"
                  : "bg-white/20"
              }`}
              style={{
                height: `${barHeight}px`,
                opacity: Math.max(0.3, freq),
              }}
            />
          );
        })}
      </div>

      {/* Status indicator label */}
      <p className="mt-4 text-xs font-serif uppercase tracking-widest text-ivory/60">
        {isMuted
          ? "Microphone Muted"
          : isSpeaking
          ? "Alexa Speaking"
          : isListening
          ? "Listening to You..."
          : isProcessing
          ? "Contemplating Order..."
          : state === "connecting"
          ? "Connecting Hearth Voice..."
          : "Voice Concierge Idle"}
      </p>
    </div>
  );
};
