import React from "react";
import { Flame } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="relative mb-6">
        <div className="w-14 h-14 rounded-full bg-ember/15 animate-ping absolute inset-0" />
        <div className="w-14 h-14 rounded-full bg-charcoal text-ember border border-ember/30 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(197,143,88,0.3)]">
          <Flame className="w-6 h-6 animate-pulse text-ember" />
        </div>
      </div>
      <p className="font-serif text-lg font-medium text-charcoal tracking-wide">
        Kindling the Hearth
      </p>
      <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-widest font-mono">
        Loading seasonal elements...
      </p>
    </div>
  );
}
