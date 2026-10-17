"use client";

import React, { useState, useRef } from "react";
import { ArrowUp, Mic } from "lucide-react";

export interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  suggestions,
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    onSendMessage(suggestion);
  };

  const handleOpenVoice = () => {
    window.dispatchEvent(new CustomEvent("echo:open-voice"));
  };

  return (
    <div className="p-4 bg-ivory border-t border-ivory-300">
      {/* Suggestion pills */}
      {suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 no-scrollbar">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSuggestionClick(s)}
              className="text-xs bg-ivory-100 hover:bg-ivory-200 text-charcoal/80 px-3 py-1.5 rounded-full border border-ivory-300 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenVoice}
          aria-label="Speak"
          className="p-2.5 rounded-xl bg-ivory-100 hover:bg-ember/15 text-charcoal hover:text-ember transition-colors border border-ivory-300 flex-shrink-0"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about our menu, pairings, or place an order..."
          disabled={isLoading}
          className="flex-1 bg-ivory-50 border border-ivory-300 rounded-xl px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-charcoal text-ivory hover:bg-ember disabled:opacity-40 disabled:hover:bg-charcoal transition-colors flex-shrink-0"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
