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
            ? "bg-ivory/90 backdrop-blur-md shadow-subtle border-b border-charcoal/5 py-3.5"
            : "bg-ivory/60 backdrop-blur-sm py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="flex flex-col text-left group outline-none focus-visible:ring-2 focus-visible:ring-charcoal rounded"
          >
            <span className="font-serif text-2xl md:text-3xl tracking-widest font-semibold text-charcoal group-hover:text-ember transition-colors">
              ECHO
            </span>
            <span className="text-[9px] tracking-widest uppercase font-light text-olive -mt-1 hidden sm:block">
              Hearth & Botanicals
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-charcoal/80">
            <Link
              href="/menu"
              className="hover:text-ember transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-ember after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
            >
              Curated Menu
            </Link>
            <Link
              href="/#hearth-story"
              className="hover:text-ember transition-colors py-1"
            >
              Our Hearth
            </Link>
            <Link
              href="/#hours-location"
              className="hover:text-ember transition-colors py-1"
            >
              Hours & Location
            </Link>
            <Link
              href="/staff/orders"
              className="text-xs text-charcoal/40 hover:text-charcoal transition-colors flex items-center gap-1"
              title="Staff Kitchen Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff</span>
            </Link>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-3">
            {/* Voice Concierge Button */}
            <button
              type="button"
              onClick={onOpenVoice}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-charcoal/15 bg-cream/60 hover:bg-cream text-charcoal text-xs font-medium tracking-wide transition-all duration-200"
              title="Open Alexa Concierge"
            >
              <Mic className="w-3.5 h-3.5 text-ember" />
              <span className="hidden sm:inline">Concierge</span>
              <span className="sm:hidden">Alexa</span>
            </button>

            {/* Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full text-charcoal hover:bg-cream/80 transition-colors border border-charcoal/10"
              aria-label={`View cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-charcoal text-ivory text-[10px] font-semibold w-5 h-5 rounded-full flex items-center justify-center border-2 border-ivory animate-fade-in">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-charcoal hover:bg-cream"
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
