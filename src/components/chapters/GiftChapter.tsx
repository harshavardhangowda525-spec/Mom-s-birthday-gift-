"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import { Butterflies } from "@/components/fx/Butterfly";
import { useStory } from "@/components/StoryProvider";
import { getMusic } from "@/lib/audio";
import { birthday } from "@/config/birthday";

type Phase = "idle" | "untie" | "open" | "fly" | "zoom" | "revealed";

const ORIGIN = { x: 48, y: 52 };

function GiftBox({ phase }: { phase: Phase }) {
  const untied = phase !== "idle";
  const opened = phase === "open" || phase === "fly" || phase === "zoom" || phase === "revealed";
  return (
    <svg viewBox="0 0 240 240" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="box-front" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5a2f4c" />
          <stop offset="55%" stopColor="#47263D" />
          <stop offset="100%" stopColor="#2b1528" />
        </linearGradient>
        <linearGradient id="box-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d3a5c" />
          <stop offset="100%" stopColor="#47263D" />
        </linearGradient>
        <linearGradient id="ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b98d4f" />
          <stop offset="40%" stopColor="#f3dca8" />
          <stop offset="60%" stopColor="#fff4d8" />
          <stop offset="100%" stopColor="#c9a066" />
        </linearGradient>
        <radialGradient id="inner-light" cx="50%" cy="100%" r="80%">
          <stop offset="0%" stopColor="#fff9f2" />
          <stop offset="40%" stopColor="#f3dca8" />
          <stop offset="100%" stopColor="#d6b47c" stopOpacity="0" />
        </radialGradient>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.1" fill="#d6b47c" opacity="0.35" />
        </pattern>
      </defs>

      {/* soft floor shadow */}
      <ellipse cx="120" cy="224" rx="78" ry="9" fill="#000" opacity="0.35" />

      {/* light escaping from the opened box */}
      <motion.path
        d="M52 112 L 20 -60 L 220 -60 L 188 112 Z"
        fill="url(#inner-light)"
        initial={{ opacity: 0, scaleY: 0.2 }}
        animate={opened ? { opacity: [0, 1, 0.85], scaleY: 1 } : { opacity: 0, scaleY: 0.2 }}
        style={{ transformOrigin: "120px 112px", mixBlendMode: "screen" }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />

      {/* box body */}
      <rect x="52" y="112" width="136" height="108" rx="6" fill="url(#box-front)" />
      <rect x="52" y="112" width="136" height="108" rx="6" fill="url(#dots)" />
      <rect x="52" y="112" width="136" height="10" fill="#000" opacity="0.25" />
      <rect x="111" y="112" width="18" height="108" fill="url(#ribbon)" />

      {/* lid + bow (lifts away) */}
      <motion.g
        initial={false}
        animate={opened ? { y: -150, x: 60, rotate: 28, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.3, ease: [0.5, 0, 0.2, 1] }}
        style={{ transformOrigin: "120px 100px" }}
      >
        <rect x="44" y="88" width="152" height="30" rx="5" fill="url(#box-lid)" />
        <rect x="44" y="88" width="152" height="30" rx="5" fill="url(#dots)" />
        <rect x="110" y="88" width="20" height="30" fill="url(#ribbon)" />
        <rect x="44" y="112" width="152" height="4" fill="#000" opacity="0.2" />

        {/* bow loops loosen */}
        <motion.g
          initial={false}
          animate={untied ? { scale: 0.55, rotate: -18, opacity: 0.0, y: -10 } : { scale: 1, rotate: 0, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ transformOrigin: "120px 86px" }}
        >
          <path d="M120 86 C 90 50, 62 62, 74 82 C 82 94, 104 92, 120 86 Z" fill="url(#ribbon)" stroke="#b98d4f" strokeWidth="1" />
          <path d="M120 86 C 150 50, 178 62, 166 82 C 158 94, 136 92, 120 86 Z" fill="url(#ribbon)" stroke="#b98d4f" strokeWidth="1" />
          <path d="M116 88 C 108 104, 98 116, 90 122" stroke="url(#ribbon)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M124 88 C 132 104, 142 116, 152 122" stroke="url(#ribbon)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="120" cy="86" r="9" fill="#f3dca8" stroke="#b98d4f" />
        </motion.g>
        {/* loose ribbon ends after untie */}
        <motion.path
          d="M120 86 C 140 60, 170 70, 190 40"
          stroke="url(#ribbon)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={untied ? { pathLength: 1, opacity: [0, 1, 1, 0] } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: 1.2 }}
        />
      </motion.g>
    </svg>
  );
}

export default function GiftChapter() {
  const { next } = useStory();
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const open = () => {
    if (phase !== "idle") return;
    getMusic().start();
    setPhase("untie");
    const at = (ms: number, p: Phase) => timers.current.push(window.setTimeout(() => setPhase(p), ms));
    at(700, "open");
    at(1500, "fly");
    at(3300, "zoom");
    at(4400, "revealed");
  };

  const lit = phase === "open" || phase === "fly" || phase === "zoom";

  return (
    <section className="scene vignette flex items-center justify-center" aria-label="The mysterious gift">
      {/* deep plum night */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,#3a1f3d_0%,#211326_45%,#120812_100%)]" />

      {/* enchanted world revealed behind */}
      <AnimatePresence>
        {(phase === "zoom" || phase === "revealed") && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#2d1840_0%,#6b3f6e_38%,#c98aa5_68%,#f3c9b8_100%)]" />
            <div className="absolute left-1/2 top-[62%] h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,244,216,0.75)_0%,rgba(243,220,168,0.25)_30%,transparent_65%)]" />
            <ParticleField variant="fireflies" count={34} />
            <Petals count={16} seed={21} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* spotlight beam */}
      <AnimatePresence>
        {phase !== "revealed" && phase !== "zoom" && (
          <motion.div
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-1/2 top-0 h-[78%] w-[150%] max-w-[900px] -translate-x-1/2"
            style={{
              background: "linear-gradient(180deg, rgba(243,220,168,0.0) 0%, rgba(243,220,168,0.14) 55%, rgba(243,220,168,0.22) 100%)",
              clipPath: "polygon(44% 0, 56% 0, 78% 100%, 22% 100%)",
              filter: "blur(10px)",
              animation: "rays 6s ease-in-out infinite",
            }}
          />
        )}
      </AnimatePresence>

      {phase !== "revealed" && <ParticleField variant="dust" count={phase === "idle" ? 46 : 80} intensity={lit ? 2.4 : 1} />}
      {phase === "idle" && <Petals count={10} seed={4} />}

      {/* the gift + camera push-in */}
      <AnimatePresence>
        {phase !== "revealed" && (
          <motion.div
            key="gift-stage"
            className="relative z-10 flex flex-col items-center px-6 text-center"
            animate={phase === "zoom" ? { scale: 6, opacity: 0 } : { scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: phase === "zoom" ? 1.4 : 0.6, ease: [0.7, 0, 0.84, 0] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* orbiting golden sparks */}
              <div className="animate-spin-slow pointer-events-none absolute left-1/2 top-[58%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 sm:h-[360px] sm:w-[360px]" style={{ animationDuration: "18s" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    className="animate-twinkle absolute h-1.5 w-1.5 rounded-full bg-gold-bright shadow-[0_0_12px_4px_rgba(243,220,168,0.7)]"
                    style={{
                      left: `${50 + 48 * Math.cos((i / 8) * Math.PI * 2)}%`,
                      top: `${50 + 22 * Math.sin((i / 8) * Math.PI * 2)}%`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>
              <div className={`h-[230px] w-[230px] sm:h-[280px] sm:w-[280px] ${phase === "idle" ? "animate-floaty" : ""}`}>
                <button
                  type="button"
                  onClick={open}
                  disabled={phase !== "idle"}
                  aria-label="Open your gift"
                  className="focus-ring h-full w-full rounded-3xl"
                >
                  <GiftBox phase={phase} />
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {phase === "idle" && (
                <motion.div
                  exit={{ opacity: 0, y: 10, transition: { duration: 0.5 } }}
                  className="mt-8 flex flex-col items-center"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6, duration: 1.6 }}
                    className="glow-text max-w-[19rem] font-serif text-[1.65rem] italic leading-snug text-ivory sm:max-w-md sm:text-4xl"
                  >
                    Someone has created a little magic just for you...
                  </motion.p>
                  <motion.button
                    type="button"
                    onClick={open}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 1.2 }}
                    className="btn-magic mt-9"
                  >
                    <Sparkles size={16} /> Open your gift
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {(phase === "fly" || phase === "zoom") && <Butterflies count={7} seed={9} origin={ORIGIN} className="z-20" />}

      {/* golden flash for the camera transition */}
      <AnimatePresence>
        {phase === "zoom" && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(circle_at_50%_55%,#fff9f2_0%,#f3dca8_40%,rgba(214,180,124,0)_80%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.9, times: [0, 0.45, 1] }}
          />
        )}
      </AnimatePresence>

      {/* the reveal */}
      <AnimatePresence>
        {phase === "revealed" && (
          <motion.div className="relative z-20 flex flex-col items-center px-6 text-center" initial="hidden" animate="show">
            <motion.p
              variants={{ hidden: { opacity: 0, letterSpacing: "0.6em" }, show: { opacity: 1, letterSpacing: "0.38em" } }}
              transition={{ duration: 1.6 }}
              className="text-[11px] font-semibold uppercase text-plum/80"
            >
              For {birthday.momName}
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.92, filter: "blur(10px)" }, show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" } }}
              transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-serif text-[2.9rem] font-semibold leading-[1.02] text-ivory drop-shadow-[0_4px_30px_rgba(71,38,61,0.6)] sm:text-7xl"
            >
              Happy Birthday,
              <br />
              <span className="gold-text">{birthday.momTitle}</span> <span aria-label="love">❤️</span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 1.4, delay: 1.5 }}
              className="mt-6 max-w-xs font-hand text-[1.7rem] leading-tight text-plum sm:max-w-md sm:text-4xl"
            >
              Today, I created a whole little world just for you.
            </motion.p>
            <motion.button
              type="button"
              onClick={next}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 1.2, delay: 2.8 }}
              className="btn-magic mt-10"
            >
              Begin your magical journey
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {phase === "revealed" && <Butterflies count={5} seed={33} />}
    </section>
  );
}
