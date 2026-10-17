"use client";

import React from "react";
import { VoiceState } from "@/hooks/useVoice";

interface EmberOrbVisualizerProps {
  state: VoiceState;
  frequencies: number[];
}

export const EmberOrbVisualizer: React.FC<EmberOrbVisualizerProps> = ({
  state,
  frequencies,
}) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isMuted = state === "muted";
  const isActive = isSpeaking || isListening;

  // Calculate dynamic energy (0 to 1) from real Web Audio FFT frequencies
  const avgEnergy =
    frequencies && frequencies.length > 0
      ? Math.min(frequencies.reduce((a, b) => a + b, 0) / frequencies.length, 1)
      : 0;

  // Dynamic scale multiplier
  const waveScale = isMuted ? 0.3 : isActive ? 1.0 + avgEnergy * 1.8 : isProcessing ? 0.75 : 0.45;

  const stateLabel = isMuted
    ? "Muted"
    : isSpeaking
    ? "Speaking"
    : isListening
    ? "Listening..."
    : isProcessing
    ? "Thinking..."
    : state === "connecting"
    ? "Connecting..."
    : "Ready";

  return (
    <div className="relative flex flex-col items-center justify-center py-6 sm:py-8 select-none w-full max-w-xl mx-auto">
      {/* Soft warm atmospheric hearth glow */}
      <div
        className="absolute w-80 h-32 rounded-full pointer-events-none blur-[70px] transition-all duration-300"
        style={{
          background: isActive
            ? "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.35) 0%, rgba(230, 181, 135, 0.15) 50%, transparent 75%)"
            : "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.18) 0%, transparent 70%)",
          transform: `scale(${1 + avgEnergy * 0.5})`,
          opacity: isMuted ? 0.2 : 0.85,
        }}
      />

      {/* Fluid Layered Organic Acoustic Waveform (Matches Reference Image 1) */}
      <div className="relative z-10 w-full h-24 sm:h-28 flex items-center justify-center overflow-hidden">
        {/* Layer 1: Back translucent deep ember wave */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out animate-wave-2"
          style={{
            transform: `scaleY(${waveScale * 0.85})`,
            opacity: isMuted ? 0.15 : 0.45,
          }}
        >
          <svg viewBox="0 0 600 120" className="w-full h-full fill-none stroke-ember-dark stroke-[4] drop-shadow-[0_0_8px_rgba(152,90,38,0.5)]">
            <path d="M 0 60 C 100 20, 200 100, 300 60 C 400 20, 500 100, 600 60" />
          </svg>
        </div>

        {/* Layer 2: Mid glowing hearth ember wave */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out animate-wave-1"
          style={{
            transform: `scaleY(${waveScale * 1.15})`,
            opacity: isMuted ? 0.25 : 0.75,
          }}
        >
          <svg viewBox="0 0 600 120" className="w-full h-full fill-none stroke-ember stroke-[4.5] drop-shadow-[0_0_12px_rgba(197,143,88,0.7)]">
            <path d="M 0 60 C 120 100, 220 20, 320 85 C 420 30, 520 85, 600 60" />
          </svg>
        </div>

        {/* Layer 3: Front bright gold acoustic wave */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `scaleY(${waveScale * 1.4})`,
            opacity: isMuted ? 0.35 : 0.95,
          }}
        >
          <svg viewBox="0 0 600 120" className="w-full h-full fill-none stroke-ember-light stroke-[5] drop-shadow-[0_0_18px_rgba(230,181,135,0.9)]">
            <path d="M 0 60 C 80 35, 180 85, 300 50 C 420 20, 520 95, 600 60" />
          </svg>
        </div>
      </div>

      {/* State label */}
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isActive
              ? "bg-ember animate-ping"
              : isProcessing
              ? "bg-ember-light animate-pulse"
              : "bg-ivory/40"
          }`}
        />
        <span className="text-[11px] uppercase tracking-[0.25em] text-ivory/60 font-mono font-medium">
          {stateLabel}
        </span>
      </div>
    </div>
  );
};
