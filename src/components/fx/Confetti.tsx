"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { seeded } from "@/lib/random";

const COLORS = ["#D6B47C", "#f3dca8", "#E8A7B6", "#FFF9F2", "#B9A5D1"];

/** One elegant burst of gold leaf & petals (not endless confetti spam). */
export default function Confetti({ count = 36, seed = 11 }: { count?: number; seed?: number }) {
  const bits = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      i,
      x: (r() - 0.5) * 110,
      y: -(30 + r() * 45),
      fall: 60 + r() * 50,
      rot: r() * 720 - 360,
      w: 5 + r() * 7,
      h: 8 + r() * 10,
      petal: r() < 0.45,
      c: COLORS[Math.floor(r() * COLORS.length)],
      d: r() * 0.4,
      dur: 3.5 + r() * 2.5,
    }));
  }, [count, seed]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b) => (
        <motion.span
          key={b.i}
          className="absolute left-1/2 top-1/2"
          style={{
            width: b.w,
            height: b.h,
            background: b.c,
            borderRadius: b.petal ? "70% 0 70% 0" : 2,
            boxShadow: `0 0 6px ${b.c}`,
          }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0.4 }}
          animate={{
            x: [`0vw`, `${b.x * 0.6}vw`, `${b.x}vw`],
            y: [`0vh`, `${b.y}vh`, `${b.y + b.fall}vh`],
            opacity: [0, 1, 0],
            rotate: b.rot,
            scale: 1,
          }}
          transition={{ duration: b.dur, delay: b.d, ease: [0.15, 0.6, 0.4, 1] }}
        />
      ))}
    </div>
  );
}
