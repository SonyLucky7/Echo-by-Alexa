"use client";

import { useState, useEffect } from "react";
import { SupportedLocale } from "@/types";

export interface LanguageOption {
  code: SupportedLocale;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
];

const STORAGE_KEY = "echo_preferred_locale";

export function useLanguage() {
  const [locale, setLocaleState] = useState<SupportedLocale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        setLocaleState(saved);
      }
    } catch {}

    const handleLanguageChange = (e: CustomEvent<SupportedLocale>) => {
      if (e.detail && SUPPORTED_LANGUAGES.some((l) => l.code === e.detail)) {
        setLocaleState(e.detail);
      }
    };

    window.addEventListener("echo:set-language", handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener("echo:set-language", handleLanguageChange as EventListener);
    };
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {}
    window.dispatchEvent(new CustomEvent("echo:set-language", { detail: newLocale }));
  };

  return {
    locale,
    setLocale,
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguage: SUPPORTED_LANGUAGES.find((l) => l.code === locale) || SUPPORTED_LANGUAGES[0],
  };
}
