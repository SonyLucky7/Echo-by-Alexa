"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    sm: "max-w-xs",
    md: "max-w-md",
    lg: "max-w-lg",
  }[width];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-charcoal/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen ${widthClass} bg-ivory shadow-floating border-l border-charcoal/10 flex flex-col h-full text-left animate-slide-left`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10 bg-cream/40">
            {title ? (
              <h3 className="font-serif text-xl font-medium text-charcoal">{title}</h3>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
