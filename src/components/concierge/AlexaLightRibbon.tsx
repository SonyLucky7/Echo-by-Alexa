"use client";

import React from "react";
import { VoiceState } from "@/hooks/useVoice";

interface AlexaLightRibbonProps {
  state: VoiceState;
  frequencies: number[];
}

export const AlexaLightRibbon: React.FC<AlexaLightRibbonProps> = ({
  state,
  frequencies,
}) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isProcessing = state === "processing";

  // Calculate audio energy from frequencies (0 to 1)
  const energy =
    frequencies && frequencies.length > 0
      ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
      : 0;

  return (
    <div className="relative w-full h-16 flex items-end justify-center overflow-hidden pointer-events-none">
      {/* 1. Ambient Bottom Cyan/Blue Glow on Screen Surface */}
      <div
        className={`absolute inset-x-0 bottom-0 h-14 transition-opacity duration-500 blur-xl ${
          isSpeaking
            ? "bg-gradient-to-t from-cyan-500/30 via-blue-600/20 to-transparent opacity-90"
            : isListening
            ? "bg-gradient-to-t from-cyan-400/40 via-sky-500/25 to-transparent opacity-100"
            : isProcessing
            ? "bg-gradient-to-t from-blue-500/30 via-indigo-500/20 to-transparent opacity-70 animate-pulse"
            : "bg-gradient-to-t from-cyan-600/10 to-transparent opacity-30"
        }`}
      />

      {/* 2. Signature Alexa Curved Acoustic Light Ribbon */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {/* Animated fluid SVG waveform for active voice */}
        {(isListening || isSpeaking) ? (
          <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-md px-6">
            {frequencies.slice(0, 16).map((freq, idx) => {
              // Dynamic bar height based on FFT energy
              const height = Math.max(
                4,
                Math.round(freq * 36 * (isSpeaking ? 1.2 : 1.0) + (isListening ? 6 : 4))
              );

              return (
                <div
                  key={idx}
                  className="flex-1 max-w-[6px] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(0,202,255,0.7)]"
                  style={{
                    height: `${height}px`,
                    background:
                      "linear-gradient(to top, #00CAFF 0%, #2563EB 60%, #93C5FD 100%)",
                    opacity: Math.max(0.4, freq * 1.2),
                  }}
                />
              );
            })}
          </div>
        ) : isProcessing ? (
          /* Processing: Alexa Morphing Breathing Arc (like video 00:46) */
          <div className="flex items-center gap-2 mb-2 animate-pulse">
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00CAFF]" />
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shadow-[0_0_12px_#00CAFF]" />
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00CAFF]" />
          </div>
        ) : (
          /* Resting / Ready State: Clean Cyan Horizon Hairline */
          <div className="w-48 h-[3px] rounded-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent shadow-[0_0_10px_rgba(0,202,255,0.5)] mb-2" />
        )}
      </div>

      {/* 3. Base Horizon Lightbar along the bottom edge */}
      <div
        className={`absolute bottom-0 inset-x-0 h-[2px] transition-all duration-300 ${
          isSpeaking || isListening
            ? "bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#00CAFF]"
            : "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        }`}
      />
    </div>
  );
};
