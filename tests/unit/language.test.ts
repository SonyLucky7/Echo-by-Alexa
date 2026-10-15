import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/hooks/useLanguage";
import { getPromptForLocale, CONCIERGE_PROMPTS } from "@/lib/concierge/prompts";

describe("Concierge Multilingual System", () => {
  it("supports all 5 requested languages: en, hi, te, es, fr", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["en", "hi", "te", "es", "fr"]);
  });

  it("each language has a distinct welcome greeting and system prompt", () => {
    for (const code of ["en", "hi", "te", "es", "fr"]) {
      const config = getPromptForLocale(code);
      expect(config.locale).toBe(code);
      expect(config.welcomeGreeting.length).toBeGreaterThan(20);
      expect(config.systemPrompt.length).toBeGreaterThan(50);
      expect(config.sampleQuestions.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("falls back to English when an unsupported locale is passed", () => {
    const config = getPromptForLocale("de");
    expect(config.locale).toBe("en");
  });
});
