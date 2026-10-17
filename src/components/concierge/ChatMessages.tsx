"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ChatMessageItem } from "@/hooks/useConcierge";
import { ToolResultCard } from "./ToolResultCard";

export interface ChatMessagesProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-charcoal">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 font-sans text-sm"
    >
      {messages.map((msg) => {
        const isUser = msg.role === "user";

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {!isUser && (
              <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 mt-0.5 border border-ember/20">
                <div className="w-2 h-2 rounded-full bg-ember" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                isUser
                  ? "bg-charcoal text-ivory rounded-tr-none shadow-sm"
                  : "bg-ivory border border-ivory-300 text-charcoal/90 rounded-tl-none shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{renderFormattedText(msg.content)}</p>

              {/* Render tool results if any */}
              {msg.toolResults &&
                msg.toolResults.map((tr, idx) => (
                  <ToolResultCard key={idx} tool={tr.tool} result={tr.result} />
                ))}

              <div
                className={`text-[10px] mt-1.5 ${
                  isUser ? "text-ivory/50 text-right" : "text-charcoal/40 text-left"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-center gap-2 pl-10 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-ember animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )}
    </div>
  );
};
