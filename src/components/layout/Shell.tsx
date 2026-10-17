"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { VoiceModal } from "@/components/concierge/VoiceModal";
import { useCart } from "@/hooks/useCart";

export interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navigation
        cartCount={itemCount}
        onOpenCart={() => {
          window.dispatchEvent(new CustomEvent("echo:open-cart"));
        }}
        onOpenVoice={() => {
          window.dispatchEvent(new CustomEvent("echo:open-voice"));
        }}
      />
      <main className={`flex-1 ${!isHome ? "pt-20" : ""}`}>{children}</main>
      <Footer />
      <CartDrawer />
      <VoiceModal />
    </div>
  );
};
