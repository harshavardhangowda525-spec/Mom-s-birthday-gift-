"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import { useStory } from "@/components/StoryProvider";
import { birthday } from "@/config/birthday";

/** Leaf anchor points on the tree (% of the tree box). Supports up to 12 wishes. */
const LEAF_SPOTS = [
  [50, 12], [28, 22], [72, 21], [15, 38], [85, 37], [40, 32], [60, 33], [30, 48], [70, 47], [50, 24], [20, 28], [80, 28],
];

function Leaf({ lit, opened }: { lit: boolean; opened: boolean }) {
  return (
    <svg viewBox="0 0 40 50" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`leaf-${opened ? "o" : "c"}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={opened ? "#fff4d8" : "#ffe8b0"} />
          <stop offset="60%" stopColor="#d6b47c" />
          <stop offset="100%" stopColor="#a87d42" />
        </linearGradient>
      </defs>
      <path d="M20 2 C 36 14, 38 32, 20 48 C 2 32, 4 14, 20 2 Z" fill={`url(#leaf-${opened ? "o" : "c"})`} stroke="#fff4d8" strokeWidth={lit ? 1.5 : 0.8} />
      <path d="M20 6 L 20 44 M20 18 L 12 12 M20 18 L 28 12 M20 28 L 11 22 M20 28 L 29 22 M20 37 L 13 32 M20 37 L 27 32" stroke="#a87d42" strokeWidth="0.9" opacity="0.7" />
    </svg>
  );
}

export default function TreeChapter() {
  const { next } = useStory();
  const wishes = birthday.wishes.slice(0, LEAF_SPOTS.length);
  const [opened, setOpened] = useState<Set<number>>(() => new Set());
  const [active, setActive] = useState<number | null>(null);
  const [glow, setGlow] = useState(false);
  const all = opened.size >= wishes.length;

  useEffect(() => {
    if (!all || active !== null) return;
    const t = setTimeout(() => setGlow(true), 500);
    return () => clearTimeout(t);
  }, [all, active]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const openLeaf = (i: number) => {
    setActive(i);
    setOpened((s) => (s.has(i) ? s : new Set(s).add(i)));
  };

  const wish = active !== null ? wishes[active] : null;

  return (
    <section className="scene vignette" aria-label="The magical wishing tree">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#140b22_0%,#2c1a40_35%,#4d2d55_65%,#3a1f36_100%)]" />
      <motion.div
        className="absolute left-1/2 top-[40%] h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(243,220,168,0.55) 0%, rgba(232,167,182,0.2) 40%, transparent 70%)" }}
        animate={{ opacity: glow ? 1 : 0.35, scale: glow ? 1.15 : 1 }}
        transition={{ duration: 2.4 }}
      />
      <ParticleField variant="fireflies" count={glow ? 60 : 32} intensity={glow ? 1.6 : 1} />
      <Petals count={8} seed={55} />

      {/* ground */}
      <div className="absolute inset-x-[-10%] bottom-0 h-[24%] rounded-t-[50%] bg-[radial-gradient(80%_100%_at_50%_0%,#5b3556_0%,#2a1424_70%)]" />
      <div className="absolute inset-x-0 bottom-[16%] h-[10%] opacity-60" style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(255,235,245,0.35), transparent 70%)" }} />

      <div className="relative z-10 flex min-h-dvh flex-col items-center px-4 pb-[calc(var(--safe-bottom)+24px)] pt-24 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }} className="max-w-xs font-serif text-[1.45rem] italic leading-snug text-ivory sm:max-w-md sm:text-3xl">
          {glow ? "" : "Every golden leaf holds a wish for you. Tap a leaf to read it."}
        </motion.p>

        {/* the tree */}
        <div className="relative mt-2 aspect-[4/5] w-full max-w-[440px]">
          <svg viewBox="0 0 400 500" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2a1520" />
                <stop offset="50%" stopColor="#5a3443" />
                <stop offset="100%" stopColor="#2a1520" />
              </linearGradient>
              <radialGradient id="canopy" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f3dca8" stopOpacity={glow ? 0.6 : 0.25} />
                <stop offset="100%" stopColor="#b9a5d1" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="200" cy="170" rx="190" ry="150" fill="url(#canopy)" />
            {/* trunk */}
            <path d="M178 500 C 184 420, 170 360, 186 300 C 192 270, 208 270, 214 300 C 230 360, 216 420, 222 500 Z" fill="url(#bark)" />
            {/* branches */}
            <g stroke="url(#bark)" strokeLinecap="round" fill="none">
              <path d="M196 300 C 180 240, 150 200, 112 160 C 90 136, 70 120, 60 100" strokeWidth="14" />
              <path d="M204 300 C 220 240, 250 200, 288 160 C 310 136, 330 120, 340 100" strokeWidth="14" />
              <path d="M200 290 C 200 220, 198 140, 200 60" strokeWidth="12" />
              <path d="M150 210 C 120 200, 90 205, 60 190" strokeWidth="8" />
              <path d="M250 210 C 280 200, 310 205, 340 190" strokeWidth="8" />
              <path d="M112 160 C 115 130, 125 105, 120 80" strokeWidth="7" />
              <path d="M288 160 C 285 130, 275 105, 280 80" strokeWidth="7" />
              <path d="M200 150 C 170 130, 150 120, 130 112" strokeWidth="6" />
              <path d="M200 150 C 230 130, 250 120, 270 112" strokeWidth="6" />
              <path d="M200 250 C 160 250, 140 240, 120 240" strokeWidth="6" />
              <path d="M200 250 C 240 250, 260 240, 280 240" strokeWidth="6" />
            </g>
            {/* tiny decorative lights along branches */}
            {Array.from({ length: 26 }).map((_, i) => {
              const a = (i / 26) * Math.PI * 2;
              const x = 200 + Math.cos(a) * (120 + (i % 4) * 18);
              const y = 160 + Math.sin(a) * (90 + (i % 3) * 14);
              return <circle key={i} cx={x} cy={y} r={glow ? 3 : 1.8} fill="#fff4d8" opacity={glow ? 0.95 : 0.6} style={{ animation: `twinkle ${2 + (i % 4) * 0.6}s ease-in-out ${i * 0.15}s infinite`, transformBox: "fill-box", transformOrigin: "center" }} />;
            })}
          </svg>

          {wishes.map((w, i) => {
            const [x, y] = LEAF_SPOTS[i];
            const isOpen = opened.has(i);
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => openLeaf(i)}
                aria-label={`Open wish ${i + 1}${w.placeholder ? "" : ` from ${w.from}`}${isOpen ? " (read)" : ""}`}
                className="focus-ring absolute h-[13%] w-[10%] min-w-[38px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: `${x}%`, top: `${y}%`, filter: `drop-shadow(0 0 ${glow ? 16 : isOpen ? 10 : 6}px rgba(243,220,168,0.95))` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, rotate: [-6, 6, -6] }}
                transition={{ opacity: { delay: 0.6 + i * 0.2 }, scale: { delay: 0.6 + i * 0.2, type: "spring" }, rotate: { duration: 3.5 + (i % 3), repeat: Infinity, ease: "easeInOut" } }}
                whileTap={{ scale: 0.9 }}
              >
                <Leaf lit={glow} opened={isOpen} />
                {!isOpen && <span className="absolute -right-1 top-0 h-2.5 w-2.5 rounded-full bg-ivory shadow-[0_0_10px_#fff]" />}
              </motion.button>
            );
          })}
        </div>

        <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">
          {opened.size} / {wishes.length} wishes opened
        </p>

        <AnimatePresence>
          {glow && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.6 }} className="mt-3 flex flex-col items-center">
              <p className="glow-text font-serif text-[1.75rem] italic leading-tight text-ivory sm:text-4xl">
                All these wishes. All this love.
                <br />
                <span className="gold-text not-italic font-semibold">All for you.</span>
              </p>
              <motion.button type="button" onClick={next} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="btn-magic mt-6">
                One more thing first…
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* unfolding letter */}
      <AnimatePresence>
        {wish && active !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Wish ${active + 1}`}
          >
            <div className="absolute inset-0 bg-[#0c0612]/70 backdrop-blur-sm" onClick={() => setActive(null)} />
            <div className="relative w-full max-w-sm" style={{ perspective: 1000 }}>
              {/* top half */}
              <motion.div
                className="paper relative rounded-t-md px-7 pb-3 pt-8"
                initial={{ scale: 0.2, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#a87d42]">A wish for you</p>
                <p className="mt-3 font-hand text-[1.9rem] leading-tight text-burgundy">Dear {birthday.momTitle},</p>
              </motion.div>
              {/* bottom half unfolds */}
              <motion.div
                className="paper relative rounded-b-md px-7 pb-7 pt-1"
                style={{ transformOrigin: "top center" }}
                initial={{ rotateX: -175, opacity: 0.6 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-[#d8c6a8]" />
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="mt-3 font-hand text-[1.6rem] leading-snug text-[#4a2c3d]">
                  {wish.message}
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-4 text-right font-hand text-2xl text-burgundy">
                  — {wish.from}
                </motion.p>
              </motion.div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="focus-ring absolute -right-2 -top-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 bg-plum text-ivory shadow-lg"
                aria-label="Close wish"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
