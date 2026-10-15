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
      {/* Floating Concierge Launch Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 bg-charcoal text-ivory pl-4 pr-5 py-3.5 rounded-full shadow-2xl border border-ember/30 hover:border-ember transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Open Dining Concierge"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center text-ember">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ember rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-ember rounded-full" />
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-xs font-serif font-medium tracking-wide">
              Alexa Concierge
            </p>
            <p className="text-[10px] text-ivory/60 font-sans uppercase tracking-wider">
              Multilingual AI Dining
            </p>
          </div>
        </button>
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
                  <h3 className="font-serif font-medium text-base text-ivory">Alexa</h3>
                  <span className="text-[10px] bg-ember/20 text-ember px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Concierge
                  </span>
                </div>
                <p className="text-xs text-ivory/60 font-sans">
                  Progressive Global Hearth & Botanicals
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
