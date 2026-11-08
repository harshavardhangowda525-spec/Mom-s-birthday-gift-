"use client";

import { useEffect, useRef } from "react";
import { useLowPower } from "@/lib/useLowPower";

type Variant = "dust" | "fireflies" | "stars";

type Props = {
  variant?: Variant;
  count?: number;
  className?: string;
  /** Pull particles towards the centre (used during reveals). */
  intensity?: number;
};

type P = { x: number; y: number; vx: number; vy: number; r: number; a: number; ph: number; hue: number };

const COLORS = ["243,220,168", "214,180,124", "255,249,242", "232,167,182"];

export default function ParticleField({ variant = "dust", count = 60, className = "", intensity = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { low, reduce } = useLowPower();
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const n = Math.round(count * (low ? 0.5 : 1));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const make = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * (variant === "fireflies" ? 0.35 : 0.12),
      vy: variant === "dust" ? -(0.15 + Math.random() * 0.35) : (Math.random() - 0.5) * 0.25,
      r: variant === "stars" ? Math.random() * 1.3 + 0.3 : variant === "fireflies" ? Math.random() * 2 + 1.2 : Math.random() * 1.6 + 0.5,
      a: Math.random(),
      ph: Math.random() * Math.PI * 2,
      hue: Math.floor(Math.random() * COLORS.length),
    });
    const ps: P[] = Array.from({ length: n }, make);

    let t = 0;
    const draw = () => {
      if (!running) return;
      t += 1;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduce) {
          p.x += p.vx * intensityRef.current;
          p.y += p.vy * intensityRef.current;
          if (variant === "fireflies") {
            p.vx += (Math.random() - 0.5) * 0.02;
            p.vy += (Math.random() - 0.5) * 0.02;
            p.vx = Math.max(-0.5, Math.min(0.5, p.vx));
            p.vy = Math.max(-0.5, Math.min(0.5, p.vy));
          }
        }
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const flicker = 0.5 + 0.5 * Math.sin(t * (variant === "stars" ? 0.02 : 0.04) + p.ph);
        const alpha = (variant === "stars" ? 0.25 + flicker * 0.75 : 0.2 + flicker * 0.8) * Math.min(1, intensityRef.current);
        const color = variant === "fireflies" ? "243,220,168" : variant === "stars" ? (p.hue === 3 ? "232,167,182" : "255,249,242") : COLORS[p.hue];

        if (variant !== "stars" || p.r > 1.1) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          g.addColorStop(0, `rgba(${color},${alpha * 0.55})`);
          g.addColorStop(1, `rgba(${color},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${color},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [variant, count, low, reduce]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
