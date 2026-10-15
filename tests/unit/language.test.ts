import { describe, it, expect } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/hooks/useLanguage";
import { getPromptForLocale, CONCIERGE_PROMPTS } from "@/lib/concierge/prompts";

describe("Concierge Language System", () => {
  it("supports English as the dedicated voice language", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(["en"]);
  });

  it("English has a distinct authentic welcome greeting and system prompt", () => {
    const config = getPromptForLocale("en");
    expect(config.locale).toBe("en");
    expect(config.welcomeGreeting.length).toBeGreaterThan(50);
    expect(config.welcomeGreeting).toContain("Hello, and welcome to ECHO");
    expect(config.systemPrompt.length).toBeGreaterThan(100);
    expect(config.sampleQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it("always resolves to English when any locale or undefined is passed", () => {
    const config1 = getPromptForLocale("de");
    expect(config1.locale).toBe("en");

    const config2 = getPromptForLocale(undefined);
    expect(config2.locale).toBe("en");
  });
});

