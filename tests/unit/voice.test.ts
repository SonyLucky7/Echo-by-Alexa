import { describe, it, expect } from "vitest";
import { getConfig } from "@/lib/config";
import { RealAudioAnalyser } from "@/lib/voice/webaudio";

describe("Voice AI Subsystem (ElevenLabs & WebAudio)", () => {
  it("configures ElevenLabs Voice ID to sXSV9RZ095VZyL64w3ap by default", () => {
    const config = getConfig();
    expect(config.elevenLabsVoiceId).toBe("sXSV9RZ095VZyL64w3ap");
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
