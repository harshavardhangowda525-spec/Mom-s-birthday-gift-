"use client";

import { motion } from "motion/react";
import { useEffect } from "react";
import Fireworks from "@/components/fx/Fireworks";
import Petals from "@/components/fx/Petals";
import { Butterflies } from "@/components/fx/Butterfly";
import ParticleField from "@/components/fx/ParticleField";
import GoldHeart from "@/components/ui/GoldHeart";
import { getMusic } from "@/lib/audio";

const TRAILS = [
  "M-20 420 C 80 300, 160 380, 220 260 S 360 120, 440 160",
  "M-20 160 C 90 220, 150 90, 240 150 S 380 300, 440 240",
  "M-20 560 C 100 520, 200 600, 300 520 S 400 470, 440 500",
];

export default function GrandCelebration({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const m = getMusic();
    m.setMood("celebration");
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ background: "radial-gradient(circle at 50% 40%, #fff9f2 0%, #f3dca8 30%, #47263D 100%)" }}
        animate={{ background: "radial-gradient(circle at 50% 40%, #6b3456 0%, #2c1530 55%, #0d0610 100%)" }}
        transition={{ duration: 2.6 }}
      />
      {/* heart expanding into the celebration */}
      <motion.div className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2" initial={{ scale: 1, opacity: 1 }} animate={{ scale: 40, opacity: 0 }} transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1] }}>
        <GoldHeart size={60} />
      </motion.div>

      <Fireworks active rate={650} className="opacity-85" />
      {/* sparkling light trails */}
      <svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {TRAILS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            stroke={i === 1 ? "#E8A7B6" : "#f3dca8"}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 6px #f3dca8)" }}
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{ pathLength: [0, 0.35, 0.35], pathOffset: [0, 0.3, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 4.5, delay: 1.2 + i * 1.3, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
          />
        ))}
      </svg>
      <Butterflies count={7} seed={64} />
      <Petals count={20} seed={101} />
      <ParticleField variant="dust" count={50} intensity={1.6} />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[calc(var(--safe-bottom)+24px)] text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.4 }} className="text-[11px] font-semibold uppercase tracking-[0.45em] text-gold">
          ✦ Today we celebrate ✦
        </motion.p>
        <h2 className="mt-5 font-serif [text-shadow:0_4px_24px_rgba(20,8,20,0.85)] text-[2.5rem] font-semibold leading-[1.05] sm:text-7xl">
          {["HAPPY BIRTHDAY", "TO THE MOST", "WONDERFUL MOM!"].map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i === 2 ? "gold-text" : "text-ivory glow-text"}`}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 2.4 + i * 0.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h2>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.6, duration: 1.4 }} className="mt-6 max-w-xs font-hand text-[1.9rem] leading-tight text-rose [text-shadow:0_2px_14px_rgba(20,8,20,0.95)] sm:max-w-md sm:text-4xl">
          You deserve all the happiness in the world.
        </motion.p>
        <motion.button type="button" onClick={onContinue} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 6.5, duration: 1 }} className="btn-magic mt-10">
          A little piece of forever
        </motion.button>
      </div>
    </div>
  );
}
