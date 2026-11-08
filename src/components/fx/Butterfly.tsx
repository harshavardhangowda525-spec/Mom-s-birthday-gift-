"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { seeded } from "@/lib/random";
import { useLowPower } from "@/lib/useLowPower";

type Tint = "gold" | "rose" | "lavender";
const TINTS: Record<Tint, [string, string]> = {
  gold: ["#fff1cf", "#d6b47c"],
  rose: ["#ffd6df", "#e8a7b6"],
  lavender: ["#ebe0f7", "#b9a5d1"],
};

export function ButterflyShape({ size = 34, tint = "gold", speed = 0.32 }: { size?: number; tint?: Tint; speed?: number }) {
  const [a, b] = TINTS[tint];
  const id = `bf-${tint}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ filter: `drop-shadow(0 0 6px ${b})`, overflow: "visible" }}>
      <defs>
        <radialGradient id={id} cx="30%" cy="40%" r="80%">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </radialGradient>
      </defs>
      <g style={{ transformOrigin: "20px 20px", animation: `wing ${speed}s ease-in-out infinite` }}>
        <path d="M20 20 C 10 4, 0 8, 3 17 C 5 22, 14 22, 20 20 Z" fill={`url(#${id})`} opacity="0.95" />
        <path d="M20 20 C 30 4, 40 8, 37 17 C 35 22, 26 22, 20 20 Z" fill={`url(#${id})`} opacity="0.95" />
        <path d="M20 21 C 12 24, 6 32, 11 35 C 15 37, 19 29, 20 21 Z" fill={`url(#${id})`} opacity="0.8" />
        <path d="M20 21 C 28 24, 34 32, 29 35 C 25 37, 21 29, 20 21 Z" fill={`url(#${id})`} opacity="0.8" />
      </g>
      <rect x="19.2" y="13" width="1.6" height="16" rx="0.8" fill="#5a3a2a" />
    </svg>
  );
}

/** A small flock of butterflies drifting along gentle looping paths. */
export function Butterflies({
  count = 5,
  seed = 3,
  origin,
  className = "",
}: {
  count?: number;
  seed?: number;
  /** Start every butterfly from one point (e.g. out of the gift box), in % of the container. */
  origin?: { x: number; y: number };
  className?: string;
}) {
  const { low } = useLowPower();
  const flock = useMemo(() => {
    const r = seeded(seed);
    const tints: Tint[] = ["gold", "rose", "lavender"];
    return Array.from({ length: count }, (_, i) => {
      const xs = Array.from({ length: 5 }, () => r() * 90 + 5);
      const ys = Array.from({ length: 5 }, () => r() * 80 + 5);
      return {
        i,
        tint: tints[i % 3],
        size: 22 + r() * 20,
        dur: 14 + r() * 10,
        delay: origin ? i * 0.12 : r() * 3,
        xs: origin ? [origin.x, ...xs] : [...xs, xs[0]],
        ys: origin ? [origin.y, ...ys] : [...ys, ys[0]],
      };
    });
  }, [count, seed, origin]);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className}`}>
      {flock.slice(0, low ? Math.ceil(count / 2) : count).map((b) => (
        <motion.div
          key={b.i}
          className="absolute"
          style={{ left: 0, top: 0 }}
          initial={{ left: `${b.xs[0]}%`, top: `${b.ys[0]}%`, opacity: 0 }}
          animate={{
            left: b.xs.map((x) => `${x}%`),
            top: b.ys.map((y) => `${y}%`),
            opacity: [0, 1, 1, 1, 1, origin ? 0.9 : 1],
          }}
          transition={{
            duration: b.dur,
            delay: b.delay,
            ease: "easeInOut",
            repeat: origin ? 0 : Infinity,
          }}
        >
          <ButterflyShape size={b.size} tint={b.tint} speed={0.25 + (b.i % 3) * 0.06} />
        </motion.div>
      ))}
    </div>
  );
}
