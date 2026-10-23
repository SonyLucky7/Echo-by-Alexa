"use client";

import React, { useEffect, useRef, useState } from "react";
import { VoiceState } from "@/hooks/useVoice";

interface EmberOrbVisualizerProps {
  state: VoiceState;
  frequencies: number[];
}

export const EmberOrbVisualizer: React.FC<EmberOrbVisualizerProps> = ({
  state,
  frequencies,
}) => {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isMuted = state === "muted";

  // Real-time audio energy (0 to 1) from frequencies
  const rawAvg =
    frequencies && frequencies.length > 0
      ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
      : 0.2;

  const [wavePaths, setWavePaths] = useState({
    wave1: "",
    wave2: "",
    wave3: "",
  });

  const phaseRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const energyRef = useRef<number>(0.35);

  useEffect(() => {
    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Target energy based on state
      const targetEnergy = isMuted
        ? 0.08
        : isSpeaking
        ? Math.max(0.65, rawAvg * 1.8)
        : isListening
        ? Math.max(0.4, rawAvg * 2.2)
        : isProcessing
        ? 0.5
        : 0.32;

      energyRef.current += (targetEnergy - energyRef.current) * 0.12;
      const energy = energyRef.current;

      const speed = isSpeaking
        ? 0.045
        : isListening
        ? 0.03
        : isProcessing
        ? 0.038
        : isMuted
        ? 0.005
        : 0.016;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      // Generate organic fluid acoustic silk ribbons (Matches Reference Image 1)
      const width = 800;
      const height = 180;
      const centerY = height / 2;
      const baseAmp = 42 * energy;
      const pointsCount = 64;
      const step = width / pointsCount;

      const buildRibbon = (
        freq: number,
        phaseOffset: number,
        ampMult: number
      ) => {
        let topPoints: { x: number; y: number }[] = [];
        let bottomPoints: { x: number; y: number }[] = [];

        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          const normX = x / width;
          // Smooth taper at edges
          const envelope = Math.pow(Math.sin(Math.PI * normX), 1.6);

          const h1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset);
          const h2 = Math.cos(normX * Math.PI * (freq * 1.3) - phase * 0.6);
          const yOffsetTop =
            (h1 * 0.7 + h2 * 0.35 + 0.25) * baseAmp * ampMult * envelope;

          const hB1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset + 0.8);
          const hB2 = Math.cos(normX * Math.PI * (freq * 1.1) - phase * 0.5);
          const yOffsetBottom =
            (hB1 * 0.65 + hB2 * 0.35 + 0.25) * baseAmp * (ampMult * 0.95) * envelope;

          topPoints.push({ x, y: centerY - yOffsetTop });
          bottomPoints.push({ x, y: centerY + yOffsetBottom });
        }

        // Closed ribbon polygon
        let d = `M ${topPoints[0].x.toFixed(1)} ${topPoints[0].y.toFixed(1)}`;
        for (let i = 1; i < topPoints.length; i++) {
          d += ` L ${topPoints[i].x.toFixed(1)} ${topPoints[i].y.toFixed(1)}`;
        }
        for (let i = bottomPoints.length - 1; i >= 0; i--) {
          d += ` L ${bottomPoints[i].x.toFixed(1)} ${bottomPoints[i].y.toFixed(1)}`;
        }
        d += " Z";
        return d;
      };

      setWavePaths({
        wave1: buildRibbon(1.6, 0, 1.0), // Deep Indigo / Violet
        wave2: buildRibbon(2.2, 1.4, 1.25), // Electric Cyan / Soft Blue
        wave3: buildRibbon(1.9, 2.9, 1.45), // Warm Ember / Soft Gold
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSpeaking, isListening, isProcessing, isMuted, rawAvg]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-2xl mx-auto py-2">
      {/* Fluid Acoustic Waveform Canvas (Matches Reference Image 1) */}
      <div className="relative w-full h-32 sm:h-38 flex items-center justify-center overflow-visible">
        {/* Soft atmospheric radial backlight glow */}
        <div
          className="absolute w-4/5 h-28 rounded-full pointer-events-none blur-[65px] transition-all duration-300"
          style={{
            background: isSpeaking || isListening
              ? "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.4) 0%, rgba(139, 92, 246, 0.3) 40%, rgba(56, 189, 248, 0.15) 70%, transparent 85%)"
              : "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.2) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(56, 189, 248, 0.1) 80%, transparent 90%)",
            transform: `scale(${1 + rawAvg * 0.25})`,
          }}
        />

        {/* 100% Vector Fluid Acoustic Silk Waveform SVG (No harsh white straight lines!) */}
        <svg
          viewBox="0 0 800 180"
          className="w-full h-full relative z-10 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient 1: Deep Indigo / Violet */}
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.08" />
              <stop offset="35%" stopColor="#A855F7" stopOpacity="0.5" />
              <stop offset="65%" stopColor="#6366F1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.08" />
            </linearGradient>

            {/* Gradient 2: Electric Cyan / Soft Blue */}
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.08" />
              <stop offset="40%" stopColor="#0EA5E9" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
            </linearGradient>

            {/* Gradient 3: Warm Hearth Ember / Soft Gold */}
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C58F58" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#C58F58" stopOpacity="0.7" />
              <stop offset="85%" stopColor="#FBBF24" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#C58F58" stopOpacity="0.1" />
            </linearGradient>

            {/* Soft Glow Filter */}
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Violet/Indigo silk ribbon */}
          {wavePaths.wave1 && (
            <path
              d={wavePaths.wave1}
              fill="url(#waveGrad1)"
              style={{ mixBlendMode: "screen" }}
            />
          )}

          {/* Layer 2: Electric Cyan silk ribbon */}
          {wavePaths.wave2 && (
            <path
              d={wavePaths.wave2}
              fill="url(#waveGrad2)"
              style={{ mixBlendMode: "screen" }}
            />
          )}

          {/* Layer 3: Warm Ember / Gold silk ribbon */}
          {wavePaths.wave3 && (
            <path
              d={wavePaths.wave3}
              fill="url(#waveGrad3)"
              style={{ mixBlendMode: "screen" }}
              filter="url(#waveGlow)"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
