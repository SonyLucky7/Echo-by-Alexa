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

  // Calculate live audio energy (0 to 1)
  const avgEnergy =
    frequencies && frequencies.length > 0
      ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
      : 0;

  // Scale orb dynamically with audio energy
  const orbScale = isMuted ? 0.95 : 1.0 + avgEnergy * 0.35;
  const glowIntensity = isMuted ? 0.2 : 0.5 + avgEnergy * 0.5;

  return (
    <div className="relative flex flex-col items-center justify-center py-6 select-none">
      {/* 1. Large Ambient Radiance (matches Image 1 ambient lighting) */}
      <div
        className="absolute w-72 h-72 rounded-full transition-all duration-150 ease-out pointer-events-none blur-[60px]"
        style={{
          background: isSpeaking
            ? "radial-gradient(circle, rgba(197, 143, 88, 0.6) 0%, rgba(230, 181, 135, 0.3) 40%, rgba(65, 74, 62, 0.1) 70%, transparent 80%)"
            : isListening
            ? "radial-gradient(circle, rgba(230, 181, 135, 0.7) 0%, rgba(197, 143, 88, 0.4) 45%, transparent 75%)"
            : isProcessing
            ? "radial-gradient(circle, rgba(197, 143, 88, 0.5) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(197, 143, 88, 0.3) 0%, transparent 70%)",
          transform: `scale(${orbScale * 1.15})`,
          opacity: glowIntensity,
        }}
      />

      {/* 2. Ethereal 3D Luminous Sphere with Swirling Organic Ribbons (matches Image 1 center screen) */}
      <div
        className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-100 ease-out border border-ember/30 shadow-[0_0_50px_rgba(197,143,88,0.5)]"
        style={{
          transform: `scale(${orbScale})`,
          background:
            "radial-gradient(circle at 40% 35%, #2A1A10 0%, #161616 65%, #0B0B0C 100%)",
        }}
      >
        {/* Outer glass highlight rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/20 pointer-events-none" />

        {/* Swirling Organic Ribbon Layer 1 */}
        <div
          className={`absolute w-48 h-48 rounded-[42%] bg-gradient-to-tr from-ember/60 via-ember-light/50 to-transparent blur-[6px] transition-opacity duration-300 ${
            isSpeaking || isListening ? "animate-orb-swirl" : "animate-orb-swirl opacity-70"
          }`}
          style={{ animationDuration: isSpeaking ? "5s" : "12s" }}
        />

        {/* Swirling Organic Ribbon Layer 2 (Reverse) */}
        <div
          className={`absolute w-44 h-44 rounded-[46%] bg-gradient-to-br from-ivory/40 via-ember/50 to-transparent blur-[5px] transition-opacity duration-300 ${
            isSpeaking || isListening
              ? "animate-orb-swirl-reverse"
              : "animate-orb-swirl-reverse opacity-60"
          }`}
          style={{ animationDuration: isSpeaking ? "7s" : "16s" }}
        />

        {/* Swirling Ribbon Layer 3 - Core Flame Filament */}
        <div
          className="absolute w-36 h-36 rounded-full border border-ember-light/40 animate-pulse blur-[1px]"
          style={{ transform: `scale(${1 + avgEnergy * 0.2})` }}
        />

        {/* Glowing Central Nucleus */}
        <div
          className="relative z-20 w-16 h-16 rounded-full transition-transform duration-75 blur-[2px]"
          style={{
            background:
              "radial-gradient(circle, #FFF4E8 0%, #E6B587 40%, #C58F58 80%, transparent 100%)",
            transform: `scale(${1 + avgEnergy * 0.4})`,
            boxShadow: "0 0 30px rgba(230, 181, 135, 0.9)",
          }}
        />
      </div>

      {/* 3. Organic Fluid Layered Acoustic Soundwave (matches Image 2) */}
      <div className="relative z-10 w-full max-w-sm mt-6 flex items-center justify-center h-14 overflow-hidden">
        {/* Layer 1: Back warm translucent wave */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-40 animate-wave-2"
          style={{ transform: `scaleY(${0.8 + avgEnergy * 1.4})` }}
        >
          <svg viewBox="0 0 300 60" className="w-full h-full fill-none stroke-ember-dark stroke-[3]">
            <path d="M 0 30 C 50 10, 100 50, 150 30 C 200 10, 250 50, 300 30" />
          </svg>
        </div>

        {/* Layer 2: Mid glowing ember wave */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-70 animate-wave-1"
          style={{ transform: `scaleY(${1.0 + avgEnergy * 1.8})` }}
        >
          <svg viewBox="0 0 300 60" className="w-full h-full fill-none stroke-ember stroke-[3.5]">
            <path d="M 0 30 C 60 50, 120 10, 180 45 C 240 15, 270 40, 300 30" />
          </svg>
        </div>

        {/* Layer 3: Front bright gold acoustic wave */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-90 transition-transform duration-75"
          style={{ transform: `scaleY(${0.9 + avgEnergy * 2.2})` }}
        >
          <svg viewBox="0 0 300 60" className="w-full h-full fill-none stroke-ember-light stroke-[4]">
            <path d="M 0 30 C 40 18, 90 42, 150 25 C 210 10, 260 48, 300 30" />
          </svg>
        </div>
      </div>

      {/* 4. Understated State Indicator (No names!) */}
      <p className="mt-2 text-xs font-serif uppercase tracking-[0.2em] text-ivory/60">
        {isMuted
          ? "Muted"
          : isSpeaking
          ? "Responding..."
          : isListening
          ? "I'm listening..."
          : isProcessing
          ? "Thinking..."
          : state === "connecting"
          ? "Connecting..."
          : "Ready"}
      </p>
    </div>
  );
};
