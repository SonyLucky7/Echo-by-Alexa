"use client";

import React from "react";
import Link from "next/link";
import { X, Mic, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoice: () => void;
  onOpenCart: () => void;
  cartCount: number;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  onOpenVoice,
  onOpenCart,
  cartCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-md flex flex-col justify-between p-6 animate-fade-in text-ivory"
      role="dialog"
      aria-modal="true"
    >
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-ivory/10">
          <Link
            href="/"
            onClick={onClose}
            className="font-serif text-2xl tracking-widest font-semibold text-ivory"
          >
            ECHO
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-ivory/80 hover:text-ivory hover:bg-ivory/10"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-6 text-lg font-light">
          <Link
            href="/"
            onClick={onClose}
            className="hover:text-ember transition-colors py-1"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={onClose}
            className="hover:text-ember transition-colors py-1 flex items-center justify-between"
          >
            <span>Curated Menu</span>
            <span className="text-xs uppercase tracking-wider bg-olive/40 px-2 py-0.5 rounded text-ivory/80">
              Seasonal
            </span>
          </Link>
          <Link
            href="/#hearth-story"
            onClick={onClose}
            className="hover:text-ember transition-colors py-1"
          >
            Our Hearth & Botanicals
          </Link>
          <Link
            href="/#hours-location"
            onClick={onClose}
            className="hover:text-ember transition-colors py-1"
          >
            Hours & Location
          </Link>
          <Link
            href="/staff/orders"
            onClick={onClose}
            className="text-ivory/50 hover:text-ivory text-sm py-1 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Portal</span>
          </Link>
        </nav>
      </div>

      <div className="pt-6 border-t border-ivory/10 flex flex-col gap-3">
        <Button
          variant="ember"
          size="lg"
          onClick={() => {
            onClose();
            onOpenVoice();
          }}
          className="w-full flex items-center justify-center gap-2"
        >
          <Mic className="w-4 h-4" />
          <span>Voice Assistant</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            onClose();
            onOpenCart();
          }}
          className="w-full border-ivory/30 text-ivory hover:bg-ivory/10 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>View Cart ({cartCount})</span>
        </Button>
      </div>
    </div>
  );
};
