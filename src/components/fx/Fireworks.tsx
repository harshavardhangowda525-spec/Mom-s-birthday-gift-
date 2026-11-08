"use client";

import { useEffect, useRef } from "react";
import { useLowPower } from "@/lib/useLowPower";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
type Rocket = { x: number; y: number; vy: number; ty: number; c: string };

const PALETTE = ["243,220,168", "214,180,124", "232,167,182", "255,249,242", "185,165,209"];

/**
 * Elegant, lightweight canvas fireworks: golden willow bursts and heart bursts.
 * `active` toggles launching; existing sparks fade naturally.
 */
export default function Fireworks({ active = true, rate = 900, hearts = true, className = "" }: { active?: boolean; rate?: number; hearts?: boolean; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const { low, reduce } = useLowPower();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sparks: Spark[] = [];
    const rockets: Rocket[] = [];
    const maxSparks = low ? 260 : 600;
    let raf = 0;
    let last = 0;
    let n = 0;

    const burst = (x: number, y: number, c: string) => {
      n++;
      const heart = hearts && n % 3 === 0;
      const count = low ? 46 : 80;
      for (let i = 0; i < count && sparks.length < maxSparks; i++) {
        const a = (i / count) * Math.PI * 2;
        let vx: number;
        let vy: number;
        if (heart) {
          const hx = 16 * Math.pow(Math.sin(a), 3);
          const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
          vx = hx * 0.16;
          vy = hy * 0.16;
        } else {
          const s = 1.4 + Math.random() * 2.6;
          vx = Math.cos(a) * s;
          vy = Math.sin(a) * s;
        }
        const max = 70 + Math.random() * 50;
        sparks.push({ x, y, vx, vy, life: max, max, c: Math.random() < 0.25 ? "255,249,242" : c, r: 1 + Math.random() * 1.2 });
      }
    };

    const loop = (ts: number) => {
      if (activeRef.current && ts - last > rate && rockets.length < 3) {
        last = ts;
        rockets.push({
          x: w * (0.15 + Math.random() * 0.7),
          y: h + 10,
          vy: -(h * 0.012 + Math.random() * 3),
          ty: h * (0.12 + Math.random() * 0.33),
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        });
      }
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = `rgba(${r.c},0.9)`;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.ty || r.vy > -1) {
          burst(r.x, r.y, r.c);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.975;
        s.vy = s.vy * 0.975 + 0.035;
        s.life -= 1;
        const k = s.life / s.max;
        ctx.fillStyle = `rgba(${s.c},${k})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * (0.5 + k), 0, Math.PI * 2);
        ctx.fill();
        if (s.life <= 0) sparks.splice(i, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [low, reduce, rate, hearts]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
