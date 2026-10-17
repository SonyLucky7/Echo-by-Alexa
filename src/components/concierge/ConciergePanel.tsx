"use client";

import React from "react";

export const ConciergePanel: React.FC = () => {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent("echo:open-voice"));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-orb-float">
      {/* Ambient Diffused Golden Glow */}
      <div className="absolute inset-0 rounded-full bg-ember/35 blur-xl animate-orb-breathe pointer-events-none" />

      <button
        type="button"
        onClick={handleOpen}
        className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-charcoal via-[#1C1612] to-charcoal border border-ember/40 shadow-[0_0_30px_rgba(197,143,88,0.45)] hover:shadow-[0_0_45px_rgba(197,143,88,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden"
        aria-label="Open AI Dining Concierge"
      >
        {/* Swirling Kinetic Background Ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-ember/30 via-ember-light/20 to-transparent animate-orb-swirl blur-[2px]" />

        {/* Glowing Animated Sparkle Emoji Core */}
        <div className="relative z-10 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_10px_rgba(230,181,135,0.85)] group-hover:scale-115 transition-transform duration-300">
            ✨
          </span>
        </div>

        {/* Micro Live Status Pulse */}
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ember shadow-[0_0_6px_#C58F58]" />
      </button>
    </div>
  );
};
