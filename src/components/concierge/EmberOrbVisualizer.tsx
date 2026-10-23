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
    core: "",
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
        ? 0.04
        : isMuted
        ? 0.005
        : 0.016;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      // Generate smooth organic fluid acoustic waves (Reference Image 1)
      const width = 800;
      const height = 180;
      const centerY = height / 2;
      const baseAmp = 38 * energy;
      const pointsCount = 64;
      const step = width / pointsCount;

      const buildPath = (
        freq: number,
        phaseOffset: number,
        ampMult: number,
        isFilled: boolean
      ) => {
        let topPoints: { x: number; y: number }[] = [];
        let bottomPoints: { x: number; y: number }[] = [];

        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          const normX = x / width;
          // Sinusoidal envelope to taper gracefully to 0 at edges
          const envelope = Math.pow(Math.sin(Math.PI * normX), 1.6);

          const h1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset);
          const h2 = Math.cos(normX * Math.PI * (freq * 1.3) - phase * 0.6);
          const yOffsetTop =
            (h1 * 0.7 + h2 * 0.35 + 0.2) * baseAmp * ampMult * envelope;

          const hB1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset + 0.8);
          const hB2 = Math.cos(normX * Math.PI * (freq * 1.1) - phase * 0.5);
          const yOffsetBottom =
            (hB1 * 0.65 + hB2 * 0.35 + 0.2) * baseAmp * (ampMult * 0.95) * envelope;

          topPoints.push({ x, y: centerY - yOffsetTop });
          bottomPoints.push({ x, y: centerY + yOffsetBottom });
        }

        if (!isFilled) {
          // Line path
          return topPoints.reduce((acc, p, idx) => {
            return idx === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }, "");
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

      // Core bright center filament
      let corePath = "";
      for (let i = 0; i <= pointsCount; i++) {
        const x = i * step;
        const normX = x / width;
        const envelope = Math.pow(Math.sin(Math.PI * normX), 1.8);
        const yOffset =
          Math.sin(normX * Math.PI * 4 + phase * 1.2) *
          (baseAmp * 0.35 * energy) *
          envelope;
        const y = centerY + yOffset;
        corePath += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }

      setWavePaths({
        wave1: buildPath(1.6, 0, 1.0, true), // Violet / Indigo
        wave2: buildPath(2.2, 1.4, 1.25, true), // Cyan / Electric Blue
        wave3: buildPath(1.9, 2.9, 1.45, true), // Warm Hearth Ember / Gold
        core: corePath,
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
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-2xl mx-auto py-1">
      {/* Fluid Acoustic Waveform Canvas (Matches Reference Image 1) */}
      <div className="relative w-full h-32 sm:h-38 flex items-center justify-center overflow-visible">
        {/* Soft atmospheric radial backlight glow */}
        <div
          className="absolute w-4/5 h-28 rounded-full pointer-events-none blur-[65px] transition-all duration-300"
          style={{
            background: isSpeaking || isListening
              ? "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.45) 0%, rgba(139, 92, 246, 0.35) 40%, rgba(56, 189, 248, 0.2) 70%, transparent 85%)"
              : "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.25) 0%, rgba(139, 92, 246, 0.18) 50%, rgba(56, 189, 248, 0.12) 80%, transparent 90%)",
            transform: `scale(${1 + rawAvg * 0.3})`,
          }}
        />

        {/* 100% Vector Guaranteed-Rendering Waveform SVG */}
        <svg
          viewBox="0 0 800 180"
          className="w-full h-full relative z-10 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradient 1: Deep Indigo / Violet */}
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.1" />
              <stop offset="35%" stopColor="#A855F7" stopOpacity="0.5" />
              <stop offset="65%" stopColor="#6366F1" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.1" />
            </linearGradient>

            {/* Gradient 2: Electric Cyan / Sky */}
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.1" />
              <stop offset="40%" stopColor="#0EA5E9" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
            </linearGradient>

            {/* Gradient 3: Warm Hearth Ember / Radiant Gold */}
            <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C58F58" stopOpacity="0.15" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#C58F58" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#FBBF24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C58F58" stopOpacity="0.15" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="waveGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
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

          {/* Layer 4: Bright White/Gold core filament */}
          {wavePaths.core && (
            <path
              d={wavePaths.core}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 16px rgba(197,143,88,0.8))"
              opacity={isSpeaking ? 0.95 : isListening ? 0.9 : 0.75}
            />
          )}
        </svg>
      </div>

      {/* Dynamic Voice Status Badge with Dancing Equalizer */}
      <div className="flex items-center gap-2 mt-2 px-3.5 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
        {isSpeaking ? (
          <div className="flex items-center gap-2 text-ember font-mono text-[11px] uppercase tracking-wider font-semibold">
            {/* 4-Bar Dancing Soundwave EQ */}
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-1 bg-ember rounded-full animate-soundwave-1" />
              <span className="w-1 bg-ember-light rounded-full animate-soundwave-2" />
              <span className="w-1 bg-amber-300 rounded-full animate-soundwave-3" />
              <span className="w-1 bg-ember rounded-full animate-soundwave-4" />
            </div>
            <span>ECHO Speaking</span>
          </div>
        ) : isListening ? (
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Listening... speak now</span>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center gap-2 text-amber-300 font-mono text-[11px] uppercase tracking-wider font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Formulating response...</span>
          </div>
        ) : isMuted ? (
          <div className="flex items-center gap-2 text-red-400 font-mono text-[11px] uppercase tracking-wider font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Microphone Muted</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-ivory/60 font-mono text-[11px] uppercase tracking-wider font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-ivory/40" />
            <span>Ready · Tap mic to speak</span>
          </div>
        )}
      </div>
    </div>
  );
};
