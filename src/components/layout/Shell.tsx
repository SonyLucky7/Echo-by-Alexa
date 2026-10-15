"use client";

import React, { useState } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

export interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Expose callbacks via window events or global state
  useEffectEvent((eventName: string, handler: () => void) => {
    // helpers
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navigation
        cartCount={cartCount}
        onOpenCart={() => {
          window.dispatchEvent(new CustomEvent("echo:open-cart"));
        }}
        onOpenVoice={() => {
          window.dispatchEvent(new CustomEvent("echo:open-voice"));
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function useEffectEvent(fn: (name: string, handler: () => void) => void) {
  // placeholder helper
}
