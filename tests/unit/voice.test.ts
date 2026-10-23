import { describe, it, expect } from "vitest";
import { getConfig } from "@/lib/config";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";
import { cleanTextForSpeech } from "@/hooks/useVoice";

describe("Voice AI Subsystem (ElevenLabs & WebAudio)", () => {
  it("configures ElevenLabs Voice ID to tm4rC0Q4St1T4Nq6wyLZ", () => {
    const config = getConfig();
    expect(config.elevenLabsVoiceId).toBe("tm4rC0Q4St1T4Nq6wyLZ");
  });

  it("cleanTextForSpeech cleans markdown, currency, and symbols for natural human speech", () => {
    const raw = "Tonight we feature **Wood-Fired Duck Breast** ($38.00) with [Ember Jus](https://example.com) & *foraged spruce*! 🦆";
    const cleaned = cleanTextForSpeech(raw);
    expect(cleaned).toContain("Wood-Fired Duck Breast");
    expect(cleaned).toContain("38.00 dollars");
    expect(cleaned).toContain("Ember Jus");
    expect(cleaned).toContain("foraged spruce");
    expect(cleaned).toContain(" and ");
    expect(cleaned).not.toContain("**");
    expect(cleaned).not.toContain("https://");
    expect(cleaned).not.toContain("🦆");
  });

  it("RealAudioAnalyser produces 16 normalized frequency bins", () => {
    const analyser = new RealAudioAnalyser();
    const freqs = analyser.getFrequencies();
    expect(Array.isArray(freqs)).toBe(true);
    expect(freqs.length).toBe(16);
    // When idle or in testing environment without audio stream, values should be within [0, 1]
    for (const val of freqs) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
    analyser.destroy();
  });

  it("handles destroy and detach without throws", () => {
    const analyser = new RealAudioAnalyser();
    expect(() => analyser.destroy()).not.toThrow();
  });
});
