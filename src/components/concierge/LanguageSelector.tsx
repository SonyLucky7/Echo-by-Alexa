"use client";

import React from "react";
import { useLanguage, SUPPORTED_LANGUAGES } from "@/hooks/useLanguage";
import { SupportedLocale } from "@/types";

export interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = "" }) => {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`flex items-center space-x-1 bg-ivory-100 p-1 rounded-full border border-ivory-300 ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang.code === locale;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLocale(lang.code as SupportedLocale)}
            className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition-all duration-200 ${
              isActive
                ? "bg-charcoal text-ivory font-medium shadow-sm"
                : "text-charcoal/60 hover:text-charcoal hover:bg-ivory-200"
            }`}
            title={lang.nativeLabel}
          >
            {lang.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
