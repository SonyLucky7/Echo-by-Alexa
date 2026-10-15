import { describe, it, expect } from "vitest";
import { getConfig } from "@/lib/config";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";

describe("Voice AI Subsystem (ElevenLabs & WebAudio)", () => {
  it("configures ElevenLabs Voice ID to tm4rC0Q4St1T4Nq6wyLZ", () => {
    const config = getConfig();
    expect(config.elevenLabsVoiceId).toBe("tm4rC0Q4St1T4Nq6wyLZ");
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
