"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "./useLanguage";
import { getPromptForLocale } from "@/lib/concierge/prompts";

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: { name: string; args: any }[];
  toolResults?: { tool: string; result: any }[];
  timestamp: Date;
}

export function useConcierge() {
  const { locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Initialize with localized welcome greeting
  useEffect(() => {
    const promptConfig = getPromptForLocale(locale);
    setSuggestions(promptConfig.sampleQuestions.slice(0, 3));

    // If conversation is empty or first greeting needs to adapt to language switch
    setMessages((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: "welcome-msg",
            role: "assistant",
            content: promptConfig.welcomeGreeting,
            timestamp: new Date(),
          },
        ];
      }
      return prev;
    });
  }, [locale]);

  // Listen to global open/ask events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);
    const handleAsk = (e: CustomEvent<string>) => {
      setIsOpen(true);
      if (e.detail) {
        sendMessage(e.detail);
      }
    };

    window.addEventListener("echo:open-concierge", handleOpen);
    window.addEventListener("echo:close-concierge", handleClose);
    window.addEventListener("echo:ask-concierge", handleAsk as EventListener);

    return () => {
      window.removeEventListener("echo:open-concierge", handleOpen);
      window.removeEventListener("echo:close-concierge", handleClose);
      window.removeEventListener("echo:ask-concierge", handleAsk as EventListener);
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsgId = `user-${Date.now()}`;
      const userMsg: ChatMessageItem = {
        id: userMsgId,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/concierge/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), locale }),
        });

        if (!res.ok) {
          throw new Error("Concierge service temporarily unavailable");
        }

        const data = await res.json();
        const assistantMsg: ChatMessageItem = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: data.text || "I have received your request.",
          toolCalls: data.toolCalls,
          toolResults: data.toolResults,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }

        // Check if any cart modification took place
        const hasCartChange = data.toolCalls?.some(
          (c: any) =>
            c.name === "add_to_cart" ||
            c.name === "update_cart_item" ||
            c.name === "remove_from_cart"
        );
        if (hasCartChange) {
          window.dispatchEvent(new CustomEvent("echo:cart-updated"));
        }
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content:
              "I apologize for the momentary hesitation. Please let me know how I can further assist your dining experience.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, locale]
  );

  return {
    isOpen,
    setIsOpen,
    isLoading,
    messages,
    suggestions,
    sendMessage,
    openConcierge: () => setIsOpen(true),
    closeConcierge: () => setIsOpen(false),
  };
}
