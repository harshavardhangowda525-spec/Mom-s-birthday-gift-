"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import { Butterflies } from "@/components/fx/Butterfly";
import { useStory } from "@/components/StoryProvider";
import { seeded } from "@/lib/random";

function GlowFlower({ x, y, s, hue, delay }: { x: number; y: number; s: number; hue: "rose" | "lav" | "gold"; delay: number }) {
  const c = hue === "rose" ? ["#ffd9e1", "#E8A7B6"] : hue === "lav" ? ["#efe6fa", "#B9A5D1"] : ["#fff1cf", "#D6B47C"];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C 2 -20, -3 -40, 0 -60" stroke="#3d5a3f" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M0 -25 C 10 -32, 16 -28, 18 -24 C 10 -22, 4 -22, 0 -25 Z" fill="#4c6e4b" opacity="0.8" />
      <g transform="translate(0 -62)" style={{ animation: `pulse-glow ${3 + delay}s ease-in-out ${delay}s infinite`, transformBox: "fill-box", transformOrigin: "center" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-9" rx="6" ry="10" fill={c[1]} opacity="0.9" transform={`rotate(${i * 60})`} />
        ))}
        <circle r="5" fill={c[0]} />
      </g>
    </g>
  );
}

export default function GardenChapter() {
  const { next } = useStory();
  const [step, setStep] = useState(0);

  // gentle parallax from pointer / touch
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const farX = useTransform(sx, (v) => v * -8);
  const midX = useTransform(sx, (v) => v * -18);
  const nearX = useTransform(sx, (v) => v * -34);
  const nearY = useTransform(sy, (v) => v * -10);

  useEffect(() => {
    const ts = [setTimeout(() => setStep(1), 900), setTimeout(() => setStep(2), 4200), setTimeout(() => setStep(3), 7000)];
    return () => ts.forEach(clearTimeout);
  }, []);

  const flowers = useMemo(() => {
    const r = seeded(42);
    const hues = ["rose", "lav", "gold"] as const;
    return Array.from({ length: 14 }, (_, i) => ({
      x: (i / 13) * 400 + (r() - 0.5) * 20,
      y: 205 + r() * 30,
      s: 0.7 + r() * 0.6,
      hue: hues[i % 3],
      delay: r() * 2,
    })).filter((f) => f.x < 150 || f.x > 250);
  }, []);

  return (
    <section
      className="scene vignette"
      aria-label="The enchanted garden"
      onPointerMove={(e) => {
        mx.set((e.clientX / window.innerWidth - 0.5) * 2);
        my.set((e.clientY / window.innerHeight - 0.5) * 2);
      }}
    >
      {/* dreamy sky */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#2a1838_0%,#5b3a6e_22%,#a978a8_46%,#e8a7b6_66%,#f6cdb9_82%,#fbe3c7_100%)]" />
      <motion.div style={{ x: farX }} className="absolute left-1/2 top-[52%] h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,244,216,0.95)_0%,rgba(255,226,190,0.45)_22%,transparent_60%)]" />
      {/* sun rays */}
      <div
        className="animate-spin-slow absolute left-1/2 top-[52%] h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{
          background: "repeating-conic-gradient(from 0deg, rgba(255,244,216,0.35) 0deg 4deg, transparent 4deg 18deg)",
          maskImage: "radial-gradient(circle, black 0%, transparent 55%)",
          WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 55%)",
          animationDuration: "120s",
        }}
      />

      {/* layered hills */}
      <motion.svg style={{ x: farX }} viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-x-[-5%] bottom-0 h-[52%] w-[110%]" aria-hidden>
        <path d="M0 150 C 60 110, 120 130, 180 115 C 250 98, 320 130, 400 110 L 400 300 L 0 300 Z" fill="#b97ea3" opacity="0.55" />
      </motion.svg>
      <motion.svg style={{ x: midX }} viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-x-[-8%] bottom-0 h-[44%] w-[116%]" aria-hidden>
        <path d="M0 160 C 70 120, 130 170, 200 140 C 270 112, 330 160, 400 135 L 400 300 L 0 300 Z" fill="#7c4a74" opacity="0.8" />
      </motion.svg>

      {/* fog */}
      <div className="pointer-events-none absolute inset-x-[-20%] bottom-[18%] h-[22%] opacity-70" style={{ background: "radial-gradient(60% 50% at 50% 50%, rgba(255,240,245,0.7), transparent 70%)", animation: "fog 14s ease-in-out infinite alternate" }} />

      {/* golden path */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[44%] w-full" aria-hidden>
        <defs>
          <linearGradient id="path-gold" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#fff4d8" />
            <stop offset="100%" stopColor="#d6b47c" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path d="M0 165 C 80 140, 140 175, 210 150 C 280 128, 340 165, 400 150 L 400 300 L 0 300 Z" fill="#47263D" />
        <motion.path
          d="M200 300 C 150 270, 260 240, 205 215 C 165 196, 230 178, 200 160"
          stroke="url(#path-gold)"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={step >= 3 ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.6, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 8px rgba(243,220,168,0.9))" }}
        />
        {step >= 3 &&
          [0, 1, 2].map((i) => (
            <motion.g key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 + i * 0.25, duration: 0.8 }}>
              <path d={`M${186 + i * 11} 160 v-12 a4.5 4.5 0 0 1 9 0 v12 z`} fill="#f3dca8" opacity="0.95" style={{ filter: "drop-shadow(0 0 6px #f3dca8)" }} />
            </motion.g>
          ))}
      </svg>

      {/* glowing flowers in the foreground */}
      <motion.svg style={{ x: nearX, y: nearY }} viewBox="0 0 400 260" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-[-6%] bottom-0 h-[34%] w-[112%]" aria-hidden>
        {flowers.map((f, i) => (
          <GlowFlower key={i} {...f} />
        ))}
      </motion.svg>

      <ParticleField variant="fireflies" count={38} />
      <Petals count={14} seed={12} />
      <Butterflies count={4} seed={5} />

      {/* words */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center px-6 pb-[34vh] pt-[22vh] text-center">
        <AnimatePresence>
          {step >= 1 && (
            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 2 }}
              className="max-w-[21rem] text-balance font-serif text-[1.85rem] italic leading-snug text-ivory drop-shadow-[0_2px_18px_rgba(45,20,50,0.7)] sm:max-w-xl sm:text-5xl"
            >
              Some people make the world beautiful simply by being in it.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {step >= 2 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8 }}
              className="mt-6 font-hand text-[2.3rem] leading-none text-[#fff4d8] drop-shadow-[0_0_18px_rgba(214,180,124,0.9)] sm:text-6xl"
            >
              For me, that person is you.
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex-1" />
        <AnimatePresence>
          {step >= 3 && (
            <motion.button
              type="button"
              onClick={next}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 1 }}
              className="btn-magic mt-8"
            >
              Follow the golden path
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {step < 3 && (
        <button type="button" onClick={() => setStep(3)} className="focus-ring absolute bottom-[calc(var(--safe-bottom)+16px)] right-4 z-20 rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-ivory/60">
          Skip ›
        </button>
      )}
    </section>
  );
}
