"use client";

import { useMemo } from "react";
import { seeded } from "@/lib/random";
import { useLowPower } from "@/lib/useLowPower";

const PETAL_COLORS = ["#E8A7B6", "#f3c2cd", "#d98fa2", "#FFF9F2", "#B9A5D1"];

export default function Petals({ count = 14, seed = 7, className = "" }: { count?: number; seed?: number; className?: string }) {
  const { low } = useLowPower();
  const petals = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      i,
      left: r() * 100,
      size: 10 + r() * 14,
      delay: -r() * 18,
      dur: 11 + r() * 10,
      drift: (r() - 0.3) * 160,
      spin: 300 + r() * 500,
      color: PETAL_COLORS[Math.floor(r() * PETAL_COLORS.length)],
    }));
  }, [count, seed]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {petals.slice(0, low ? Math.ceil(count / 2) : count).map((p) => (
        <svg
          key={p.i}
          viewBox="0 0 20 20"
          width={p.size}
          height={p.size}
          className="absolute top-0"
          style={
            {
              left: `${p.left}%`,
              animation: `petal-fall ${p.dur}s linear ${p.delay}s infinite`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              willChange: "transform",
            } as React.CSSProperties
          }
        >
          <path d="M10 1 C 16 5, 18 12, 10 19 C 2 12, 4 5, 10 1 Z" fill={p.color} opacity="0.85" />
          <path d="M10 3 C 11 8, 11 13, 10 17" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" fill="none" />
        </svg>
      ))}
    </div>
  );
}
