"use client";

import React from "react";
import { Mic } from "lucide-react";

export const ConciergePanel: React.FC = () => {
  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent("echo:open-voice"));
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={handleOpen}
        className="relative w-14 h-14 rounded-full bg-[#18181B] border border-white/15 hover:border-ember/60 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(197,143,88,0.35)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="Open Dining Concierge"
      >
        <Mic className="w-5 h-5 text-ivory/80 group-hover:text-ember transition-colors" />
      </button>
    </div>
  );
};
