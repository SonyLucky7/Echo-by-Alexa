"use client";

import React, { useEffect, useRef } from "react";
import { VoiceState } from "@/hooks/useVoice";

interface EmberOrbVisualizerProps {
  state: VoiceState;
  frequencies?: number[];
}

export const EmberOrbVisualizer: React.FC<EmberOrbVisualizerProps> = ({
  state,
  frequencies,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<VoiceState>(state);
  const frequenciesRef = useRef<number[]>(frequencies || []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    frequenciesRef.current = frequencies || [];
  }, [frequencies]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let isRunning = true;
    let animFrame: number;
    let phase = 0;
    let currentEnergy = 0.35;

    // Handle high-DPI displays (Retina/4K)
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 140;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      if (ctx.resetTransform) {
        ctx.resetTransform();
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const render = () => {
      if (!isRunning) return;

      const currentState = stateRef.current;
      const freqs = frequenciesRef.current;
      const rawAvg =
        freqs.length > 0
          ? freqs.reduce((a, b) => a + b, 0) / freqs.length
          : 0.2;

      const isSpeaking = currentState === "speaking";
      const isListening = currentState === "listening";
      const isProcessing = currentState === "processing";
      const isMuted = currentState === "muted";

      // Target amplitude and phase speed based on conversational state
      const targetEnergy = isMuted
        ? 0.05
        : isSpeaking
        ? Math.max(0.68, rawAvg * 1.8)
        : isListening
        ? Math.max(0.48, rawAvg * 2.2)
        : isProcessing
        ? 0.54
        : 0.28;

      currentEnergy += (targetEnergy - currentEnergy) * 0.1;

      const speed = isSpeaking
        ? 0.045
        : isListening
        ? 0.034
        : isProcessing
        ? 0.038
        : isMuted
        ? 0.005
        : 0.018;

      phase += speed;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 800;
      const height = rect.height || 140;
      const centerY = height / 2;
      const baseAmp = Math.min(height * 0.45, 38 * currentEnergy);
      const pointsCount = 140;
      const step = width / pointsCount;

      ctx.clearRect(0, 0, width, height);

      // Draw one continuous closed fluid silk ribbon with Bézier curves
      const drawRibbon = (
        freq: number,
        phaseOffset: number,
        ampMult: number,
        fillGradient: CanvasGradient
      ) => {
        ctx.beginPath();

        const topPoints: { x: number; y: number }[] = [];
        const bottomPoints: { x: number; y: number }[] = [];

        for (let i = 0; i <= pointsCount; i++) {
          const x = i * step;
          const normX = x / width; // 0 to 1

          // Envelope: razor-sharp needle taper at both ends (Reference match)
          const envelope = Math.pow(Math.sin(normX * Math.PI), 2.2);

          // Dual harmonic undulation
          const h1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset);
          const h2 = Math.cos(normX * Math.PI * (freq * 1.3) - phase * 0.6);
          const yOffsetTop = (h1 * 0.72 + h2 * 0.35 + 0.25) * baseAmp * ampMult * envelope;

          const hB1 = Math.sin(normX * Math.PI * freq * 2 + phase + phaseOffset + 0.85);
          const hB2 = Math.cos(normX * Math.PI * (freq * 1.1) - phase * 0.5);
          const yOffsetBottom = (hB1 * 0.68 + hB2 * 0.35 + 0.25) * baseAmp * (ampMult * 0.95) * envelope;

          topPoints.push({ x, y: centerY - yOffsetTop });
          bottomPoints.push({ x, y: centerY + yOffsetBottom });
        }

        // Trace top edge with smooth quadratic Bézier interpolation
        ctx.moveTo(topPoints[0].x, topPoints[0].y);
        for (let i = 1; i < topPoints.length; i++) {
          const prev = topPoints[i - 1];
          const curr = topPoints[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        ctx.lineTo(topPoints[topPoints.length - 1].x, topPoints[topPoints.length - 1].y);

        // Trace bottom edge in reverse
        for (let i = bottomPoints.length - 1; i >= 0; i--) {
          const curr = bottomPoints[i];
          if (i === bottomPoints.length - 1) {
            ctx.lineTo(curr.x, curr.y);
          } else {
            const next = bottomPoints[i + 1];
            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;
            ctx.quadraticCurveTo(next.x, next.y, midX, midY);
          }
        }
        ctx.closePath();

        ctx.fillStyle = fillGradient;
        ctx.fill();
      };

      // Use screen blend mode for glowing additive luminescence (Direct match to reference image)
      ctx.globalCompositeOperation = "screen";

      // 1. Layer 1: Electric Cyan / Sky Blue Ribbon
      const cyanGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      cyanGrad.addColorStop(0, "rgba(56, 189, 248, 0.0)");
      cyanGrad.addColorStop(0.18, "rgba(56, 189, 248, 0.25)");
      cyanGrad.addColorStop(0.5, "rgba(14, 165, 233, 0.65)");
      cyanGrad.addColorStop(0.82, "rgba(56, 189, 248, 0.25)");
      cyanGrad.addColorStop(1, "rgba(56, 189, 248, 0.0)");
      drawRibbon(1.7, 0.0, 1.15, cyanGrad);

      // 2. Layer 2: Warm Amber / Sunset Hearth Ribbon
      const amberGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      amberGrad.addColorStop(0, "rgba(245, 158, 11, 0.0)");
      amberGrad.addColorStop(0.22, "rgba(245, 158, 11, 0.35)");
      amberGrad.addColorStop(0.5, "rgba(234, 88, 12, 0.75)");
      amberGrad.addColorStop(0.78, "rgba(251, 191, 36, 0.4)");
      amberGrad.addColorStop(1, "rgba(245, 158, 11, 0.0)");
      drawRibbon(2.1, 1.4, 1.25, amberGrad);

      // 3. Layer 3: Purple / Violet Silk Ribbon
      const violetGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      violetGrad.addColorStop(0, "rgba(168, 85, 247, 0.0)");
      violetGrad.addColorStop(0.28, "rgba(139, 92, 246, 0.3)");
      violetGrad.addColorStop(0.55, "rgba(168, 85, 247, 0.55)");
      violetGrad.addColorStop(0.82, "rgba(99, 102, 241, 0.25)");
      violetGrad.addColorStop(1, "rgba(168, 85, 247, 0.0)");
      drawRibbon(1.9, 2.8, 1.05, violetGrad);

      // 4. Layer 4: Central Luminescent White/Golden Core Ribbon (Bright focal center)
      const coreGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.0)");
      coreGrad.addColorStop(0.38, "rgba(255, 255, 255, 0.12)");
      coreGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.88)");
      coreGrad.addColorStop(0.62, "rgba(255, 255, 255, 0.12)");
      coreGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      drawRibbon(2.0, 0.8, 0.65, coreGrad);

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-3xl mx-auto py-2">
      <div className="relative w-full h-28 sm:h-34 flex items-center justify-center overflow-visible">
        {/* Soft atmospheric backlight halo */}
        <div
          className="absolute w-3/5 h-20 rounded-full pointer-events-none blur-[50px] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.35) 0%, rgba(56, 189, 248, 0.25) 45%, rgba(168, 85, 247, 0.15) 75%, transparent 85%)",
          }}
        />

        {/* 100% Hardware-Accelerated 60FPS Silk Wave Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full relative z-10 block pointer-events-none"
        />
      </div>
    </div>
  );
};
