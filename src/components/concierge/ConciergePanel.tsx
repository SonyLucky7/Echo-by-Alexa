"use client";

import React from "react";
import { Sparkles, X, Flame } from "lucide-react";
import { useConcierge } from "@/hooks/useConcierge";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { LanguageSelector } from "./LanguageSelector";

export const ConciergePanel: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    isLoading,
    messages,
    suggestions,
    sendMessage,
  } = useConcierge();

  return (
    <>
      {/* Floating Animated AI Emoji Orb (No text, pure kinetic luxury talisman) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-orb-float">
          {/* Ambient Diffused Golden Glow */}
          <div className="absolute inset-0 rounded-full bg-ember/40 blur-xl animate-orb-breathe pointer-events-none" />

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-charcoal via-[#1C1612] to-charcoal border border-ember/40 shadow-[0_0_30px_rgba(197,143,88,0.45)] hover:shadow-[0_0_45px_rgba(197,143,88,0.7)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group overflow-hidden"
            aria-label="Open AI Assistant"
          >
            {/* Swirling Kinetic Background Ring */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-ember/30 via-ember-light/20 to-transparent animate-orb-swirl blur-[2px]" />

            {/* Glowing Flame / Sparkle Emoji Core */}
            <div className="relative z-10 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_10px_rgba(230,181,135,0.8)] group-hover:scale-115 transition-transform duration-300">
                ✨
              </span>
            </div>

            {/* Micro Live Status Pulse */}
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ember shadow-[0_0_6px_#C58F58]" />
          </button>
        </div>
      )}

      {/* Floating Concierge Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[680px] z-50 flex flex-col bg-ivory rounded-none sm:rounded-3xl shadow-2xl border border-ivory-300 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="px-5 py-4 bg-charcoal text-ivory flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-ember border border-ember/40 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-medium text-base text-ivory">
                    Dining Assistant
                  </h3>
                  <span className="text-[10px] bg-ember/20 text-ember px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    AI Concierge
                  </span>
                </div>
                <p className="text-xs text-ivory/60 font-sans">
                  Progressive Hearth & Botanicals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-ivory/70 hover:text-ivory transition-colors"
                aria-label="Close concierge"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subheader Language Selector */}
          <div className="px-4 py-2.5 bg-ivory-50 border-b border-ivory-200 flex items-center justify-between text-xs">
            <span className="text-charcoal/60 font-serif italic flex items-center gap-1">
              <Flame className="w-3 h-3 text-ember" />
              Language:
            </span>
            <LanguageSelector />
          </div>

          {/* Chat Messages */}
          <ChatMessages messages={messages} isLoading={isLoading} />

          {/* Chat Input */}
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            suggestions={suggestions}
          />
        </div>
      )}
    </>
  );
};
