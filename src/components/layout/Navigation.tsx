"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, ShoppingBag, Menu as MenuIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";

export interface NavigationProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenVoice?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  cartCount = 0,
  onOpenCart = () => {},
  onOpenVoice = () => {},
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-ivory/95 backdrop-blur-2xl shadow-[0_8px_30px_rgba(22,22,22,0.06)] border-b border-ember/20 py-3"
            : "bg-ivory/80 backdrop-blur-xl border-b border-charcoal/8 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Wordmark with Live Ember Glow */}
          <Link
            href="/"
            className="flex flex-col text-left group outline-none focus-visible:ring-2 focus-visible:ring-charcoal rounded"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl md:text-3xl tracking-[0.2em] font-semibold text-charcoal group-hover:text-ember transition-colors">
                ECHO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-ember shadow-[0_0_8px_#C58F58] animate-pulse -mt-0.5" />
            </div>
            <span className="text-[9px] tracking-[0.25em] uppercase font-light text-olive -mt-0.5 hidden sm:block">
              Hearth & Botanicals
            </span>
          </Link>

          {/* Desktop Navigation Links with Guaranteed Animated Underlines */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-charcoal/80">
            <Link
              href="/menu"
              className="group relative py-1 text-charcoal/80 hover:text-charcoal transition-colors"
            >
              <span>Curated Menu</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/#hearth-story"
              className="group relative py-1 text-charcoal/80 hover:text-charcoal transition-colors"
            >
              <span>Our Hearth</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/#hours-location"
              className="group relative py-1 text-charcoal/80 hover:text-charcoal transition-colors"
            >
              <span>Hours & Location</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <button
              type="button"
              onClick={onOpenVoice}
              className="group relative py-1 text-charcoal/80 hover:text-charcoal transition-colors"
            >
              <span>Reserve Table</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </button>

            <Link
              href="/staff/orders"
              className="text-xs text-charcoal/40 hover:text-charcoal transition-colors flex items-center gap-1.5 py-1"
              title="Staff Kitchen Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff</span>
            </Link>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            {/* Animated Luxury Speak Button */}
            <button
              type="button"
              onClick={onOpenVoice}
              className="px-4 py-2 rounded-full bg-charcoal hover:bg-black text-ivory text-xs font-medium tracking-wider border border-ember/30 shadow-[0_0_15px_rgba(197,143,88,0.25)] hover:shadow-[0_0_25px_rgba(197,143,88,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5"
              aria-label="Speak"
            >
              <Mic className="w-3.5 h-3.5 text-ember-light" />
              <span className="hidden sm:inline">Speak</span>
              {/* Micro Acoustic Waveform Animation */}
              <div className="hidden sm:flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-ember-light rounded-full animate-wave-1" />
                <span className="w-0.5 h-3 bg-ember rounded-full animate-wave-2" />
                <span className="w-0.5 h-1.5 bg-ember-light rounded-full animate-wave-1" />
              </div>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-charcoal hover:text-ember bg-cream/50 hover:bg-cream border border-charcoal/10 hover:border-ember/30 transition-all duration-300 hover:scale-105 active:scale-95 group"
              aria-label={`View cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-charcoal to-ember text-ivory text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-ivory shadow-md animate-in zoom-in-75 duration-200">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-charcoal hover:bg-cream transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenVoice={onOpenVoice}
        onOpenCart={onOpenCart}
        cartCount={cartCount}
      />
    </>
  );
};
