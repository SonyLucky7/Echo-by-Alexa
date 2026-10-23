"use client";

import React, { useEffect, useRef, useState } from "react";
import { VoiceState } from "@/hooks/useVoice";
import { Sparkles, Activity } from "lucide-react";

interface EmberOrbVisualizerProps {
  state: VoiceState;
  frequencies: number[];
  mode?: "waveform" | "orb";
  onToggleMode?: (mode: "waveform" | "orb") => void;
}

export const EmberOrbVisualizer: React.FC<EmberOrbVisualizerProps> = ({
  state,
  frequencies,
  mode: controlledMode,
  onToggleMode,
}) => {
  const [internalMode, setInternalMode] = useState<"waveform" | "orb">("waveform");
  const visualMode = controlledMode || internalMode;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const isProcessing = state === "processing";
  const isMuted = state === "muted";
  const isActive = isSpeaking || isListening;

  // Calculate dynamic volume energy (0 to 1) from real Web Audio FFT
  const rawAvg =
    frequencies && frequencies.length > 0
      ? frequencies.reduce((a, b) => a + b, 0) / frequencies.length
      : 0;

  // Smooth smoothed energy
  const energyRef = useRef<number>(0.35);

  // Set mode handler
  const handleSelectMode = (newMode: "waveform" | "orb") => {
    setInternalMode(newMode);
    if (onToggleMode) onToggleMode(newMode);
  };

  // Canvas Waveform Animation Loop
  useEffect(() => {
    if (visualMode !== "waveform") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const render = () => {
      if (!isRunning || !canvas || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width === 0 || height === 0) {
        animFrameRef.current = requestAnimationFrame(render);
        return;
      }

      // Smooth energy transition
      const targetEnergy = isMuted
        ? 0.1
        : isSpeaking
        ? Math.max(0.65, rawAvg * 1.8)
        : isListening
        ? Math.max(0.45, rawAvg * 2.4)
        : isProcessing
        ? 0.5
        : 0.32;

      energyRef.current += (targetEnergy - energyRef.current) * 0.1;
      const energy = energyRef.current;

      // Phase speed
      const speed = isSpeaking
        ? 0.045
        : isListening
        ? 0.032
        : isProcessing
        ? 0.038
        : isMuted
        ? 0.006
        : 0.018;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2;
      const baseAmp = height * 0.28 * energy;

      // 4 Organic Fluid Acoustic Silk Waveforms (Matches Reference Image 1: cyan, purple, ember)
      const waves = [
        {
          // Wave 1: Deep Indigo / Violet
          freq: 1.6,
          phaseOffset: 0,
          ampMult: 0.9,
          color1: "rgba(129, 140, 248, 0.4)",
          color2: "rgba(168, 85, 247, 0.45)",
          lineWidth: 2,
        },
        {
          // Wave 2: Electric Cyan / Sky
          freq: 2.2,
          phaseOffset: 1.5,
          ampMult: 1.15,
          color1: "rgba(56, 189, 248, 0.5)",
          color2: "rgba(99, 102, 241, 0.35)",
          lineWidth: 2.5,
        },
        {
          // Wave 3: Hearth Ember / Warm Amber
          freq: 1.9,
          phaseOffset: 3.1,
          ampMult: 1.35,
          color1: "rgba(197, 143, 88, 0.65)",
          color2: "rgba(245, 158, 11, 0.55)",
          lineWidth: 3,
        },
        {
          // Wave 4: Pale Gold / Luminous Core
          freq: 2.6,
          phaseOffset: 4.8,
          ampMult: 1.5,
          color1: "rgba(254, 243, 199, 0.8)",
          color2: "rgba(230, 181, 135, 0.75)",
          lineWidth: 2,
        },
      ];

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const pointsCount = 140;
      const step = width / pointsCount;

      waves.forEach((w) => {
        // Draw filled fluid silk envelope
        ctx.beginPath();

        // Top contour
        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          const normX = x / width;
          // Graceful taper at edges
          const envelope = Math.pow(Math.sin(Math.PI * normX), 1.5);

          const harmonic1 = Math.sin(normX * Math.PI * w.freq * 2 + phase + w.phaseOffset);
          const harmonic2 = Math.cos(normX * Math.PI * (w.freq * 1.4) - phase * 0.6);
          const yOffset = (harmonic1 * 0.65 + harmonic2 * 0.35 + 0.25) * baseAmp * w.ampMult * envelope;

          const y = centerY - yOffset;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        // Bottom mirrored contour
        for (let i = pointsCount; i >= 0; i--) {
          const x = i * step;
          const normX = x / width;
          const envelope = Math.pow(Math.sin(Math.PI * normX), 1.5);

          const harmonic1 = Math.sin(normX * Math.PI * w.freq * 2 + phase + w.phaseOffset + 0.8);
          const harmonic2 = Math.cos(normX * Math.PI * (w.freq * 1.2) - phase * 0.5);
          const yOffset = (harmonic1 * 0.6 + harmonic2 * 0.4 + 0.25) * baseAmp * (w.ampMult * 0.95) * envelope;

          const y = centerY + yOffset;
          ctx.lineTo(x, y);
        }

        ctx.closePath();

        // Gradient fill
        const grad = ctx.createLinearGradient(0, centerY - baseAmp * 1.5, width, centerY + baseAmp * 1.5);
        grad.addColorStop(0, w.color1);
        grad.addColorStop(0.5, w.color2);
        grad.addColorStop(1, w.color1);

        ctx.fillStyle = grad;
        ctx.shadowColor = w.color1;
        ctx.shadowBlur = 15;
        ctx.fill();

        // Draw crisp center stroke
        ctx.beginPath();
        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          const normX = x / width;
          const envelope = Math.pow(Math.sin(Math.PI * normX), 1.5);
          const harmonic = Math.sin(normX * Math.PI * w.freq * 2 + phase + w.phaseOffset);
          const y = centerY - harmonic * (baseAmp * 0.85 * w.ampMult) * envelope;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color1;
        ctx.lineWidth = w.lineWidth;
        ctx.stroke();
      });

      // Bright white central focal filament
      ctx.beginPath();
      for (let i = 0; i <= pointsCount; i++) {
        const x = i * step;
        const normX = x / width;
        const envelope = Math.pow(Math.sin(Math.PI * normX), 1.8);
        const yOffset =
          Math.sin(normX * Math.PI * 4 + phase * 1.2) *
          (baseAmp * 0.35 * energy) *
          envelope;
        const y = centerY + yOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "rgba(255, 255, 255, 0.95)";
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [visualMode, isSpeaking, isListening, isProcessing, isMuted, rawAvg]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-2xl mx-auto py-2">
      {/* Visualizer Mode Toggle Pill */}
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 mb-2 shadow-sm">
        <button
          type="button"
          onClick={() => handleSelectMode("waveform")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${
            visualMode === "waveform"
              ? "bg-gradient-to-r from-ember/80 to-ember-dark text-ivory shadow-[0_0_12px_rgba(197,143,88,0.5)] font-semibold"
              : "text-ivory/50 hover:text-ivory/90 hover:bg-white/5"
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>Waveform</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("orb")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 cursor-pointer ${
            visualMode === "orb"
              ? "bg-gradient-to-r from-purple-500/80 to-ember text-ivory shadow-[0_0_12px_rgba(168,85,247,0.5)] font-semibold"
              : "text-ivory/50 hover:text-ivory/90 hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Living Orb</span>
        </button>
      </div>

      {/* MODE 1: High-Performance Fluid Acoustic Waveform Canvas (Reference 1) */}
      {visualMode === "waveform" && (
        <div
          ref={containerRef}
          className="relative w-full h-36 sm:h-40 flex items-center justify-center overflow-hidden"
        >
          {/* Ambient dynamic radial atmospheric glow */}
          <div
            className="absolute w-4/5 h-28 rounded-full pointer-events-none blur-[65px] transition-all duration-300"
            style={{
              background: isActive
                ? "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.45) 0%, rgba(139, 92, 246, 0.35) 40%, rgba(56, 189, 248, 0.2) 70%, transparent 85%)"
                : "radial-gradient(ellipse at center, rgba(197, 143, 88, 0.25) 0%, rgba(139, 92, 246, 0.18) 50%, rgba(56, 189, 248, 0.12) 80%, transparent 90%)",
              transform: `scale(${1 + rawAvg * 0.4})`,
            }}
          />

          <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />
        </div>
      )}

      {/* MODE 2: Luminous 3D Volumetric AI Orb (Reference 2) */}
      {visualMode === "orb" && (
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-1">
          {/* Outer Breathing Radial Aura */}
          <div
            className="absolute inset-0 rounded-full blur-[45px] pointer-events-none transition-all duration-500"
            style={{
              background: isActive
                ? "radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(197, 143, 88, 0.4) 50%, rgba(56, 189, 248, 0.2) 80%, transparent 100%)"
                : "radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, rgba(197, 143, 88, 0.2) 60%, transparent 100%)",
              transform: `scale(${1 + rawAvg * 0.35})`,
            }}
          />

          {/* Volumetric Spherical Core */}
          <div
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden flex items-center justify-center border border-white/20 shadow-[0_0_50px_rgba(168,85,247,0.45)] transition-all duration-300"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgba(254, 243, 199, 0.8) 0%, rgba(197, 143, 88, 0.9) 25%, rgba(147, 51, 234, 0.85) 60%, rgba(15, 23, 42, 0.95) 100%)",
              transform: isSpeaking
                ? `scale(${1.04 + rawAvg * 0.12})`
                : isListening
                ? `scale(${1.02 + rawAvg * 0.18})`
                : "scale(1)",
            }}
          >
            {/* Internal Swirling Filament 1 */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-400/40 to-white/60 animate-orb-swirl mix-blend-screen filter blur-[3px]" />

            {/* Internal Swirling Filament 2 (Counter-rotation) */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400/50 via-purple-500/50 to-transparent animate-orb-swirl-reverse mix-blend-screen filter blur-[2px]" />

            {/* Internal Undulating Audio Wave Ribbon */}
            <div
              className="absolute inset-x-0 h-16 flex items-center justify-center opacity-85 transition-transform duration-75"
              style={{
                transform: `scaleY(${0.6 + rawAvg * 1.6}) rotate(${rawAvg * 20}deg)`,
              }}
            >
              <svg viewBox="0 0 100 40" className="w-full h-full fill-none stroke-white stroke-[2.5] drop-shadow-[0_0_8px_white]">
                <path d="M 0 20 Q 25 5, 50 20 T 100 20" />
              </svg>
            </div>

            {/* Glass Curvature Specular Highlight */}
            <div className="absolute top-2 left-3 w-14 h-8 rounded-full bg-gradient-to-b from-white/70 to-transparent rotate-[-25deg] blur-[1px] pointer-events-none" />
          </div>

          {/* Orbiting Particle Spark Ring */}
          <div
            className={`absolute inset-0 rounded-full border border-purple-400/30 ${
              isActive ? "animate-spin" : "animate-pulse"
            }`}
            style={{ animationDuration: isActive ? "8s" : "4s" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#FCD34D]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67E8F9]" />
          </div>
        </div>
      )}

      {/* Dynamic Voice Status Badge with Soundwave EQ */}
      <div className="flex items-center gap-2.5 mt-2 px-3.5 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
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
