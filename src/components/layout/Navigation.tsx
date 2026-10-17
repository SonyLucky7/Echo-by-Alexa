"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHeroMode = isHome && !isScrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 ${
          isHeroMode
            ? "bg-transparent border-b border-transparent py-5 text-ivory"
            : isScrolled
            ? "bg-ivory/95 backdrop-blur-2xl shadow-[0_8px_30px_rgba(22,22,22,0.06)] border-b border-ember/20 py-3 text-charcoal"
            : "bg-ivory/90 backdrop-blur-xl border-b border-charcoal/8 py-4 text-charcoal"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Wordmark with Live Ember Glow */}
          <Link
            href="/"
            className="flex flex-col text-left group outline-none focus-visible:ring-2 focus-visible:ring-charcoal rounded"
          >
            <span
              className={`font-serif text-2xl md:text-3xl tracking-[0.2em] font-semibold transition-colors ${
                isHeroMode ? "text-ivory group-hover:text-ember" : "text-charcoal group-hover:text-ember"
              }`}
            >
              ECHO
            </span>
            <span
              className={`text-[9px] tracking-[0.25em] uppercase font-light -mt-0.5 hidden sm:block ${
                isHeroMode ? "text-ivory/60" : "text-olive"
              }`}
            >
              Hearth & Botanicals
            </span>
          </Link>

          {/* Desktop Navigation Links with Guaranteed Animated Underlines */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <Link
              href="/menu"
              className={`group relative py-1 transition-colors ${
                isHeroMode ? "text-ivory/80 hover:text-ivory" : "text-charcoal/80 hover:text-charcoal"
              }`}
            >
              <span>Curated Menu</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/#hearth-story"
              className={`group relative py-1 transition-colors ${
                isHeroMode ? "text-ivory/80 hover:text-ivory" : "text-charcoal/80 hover:text-charcoal"
              }`}
            >
              <span>Our Hearth</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/#hours-location"
              className={`group relative py-1 transition-colors ${
                isHeroMode ? "text-ivory/80 hover:text-ivory" : "text-charcoal/80 hover:text-charcoal"
              }`}
            >
              <span>Hours & Location</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/reservations"
              className={`group relative py-1 transition-colors ${
                isHeroMode ? "text-ivory/80 hover:text-ivory" : "text-charcoal/80 hover:text-charcoal"
              }`}
            >
              <span>Reserve Table</span>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-ember to-ember-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </Link>

            <Link
              href="/staff/orders"
              className={`text-xs transition-colors flex items-center gap-1.5 py-1 ${
                isHeroMode ? "text-ivory/50 hover:text-ivory" : "text-charcoal/40 hover:text-charcoal"
              }`}
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
              {/* Dynamic Live Equalizer / Music Beat Lines */}
              <div className="flex items-center gap-[2.5px] h-4.5 px-0.5" aria-hidden="true">
                <span className="w-[2.5px] bg-ember-light rounded-full animate-soundwave-1" />
                <span className="w-[2.5px] bg-ember rounded-full animate-soundwave-2" />
                <span className="w-[2.5px] bg-ember-light rounded-full animate-soundwave-3" />
                <span className="w-[2.5px] bg-ember rounded-full animate-soundwave-4" />
              </div>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className={`relative p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 group border ${
                isHeroMode
                  ? "text-ivory hover:text-ember bg-white/10 hover:bg-white/20 border-white/15"
                  : "text-charcoal hover:text-ember bg-cream/50 hover:bg-cream border-charcoal/10 hover:border-ember/30"
              }`}
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
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isHeroMode ? "text-ivory hover:bg-white/10" : "text-charcoal hover:bg-cream"
              }`}
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
