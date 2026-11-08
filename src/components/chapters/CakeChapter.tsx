"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Wind } from "lucide-react";
import Fireworks from "@/components/fx/Fireworks";
import Confetti from "@/components/fx/Confetti";
import Petals from "@/components/fx/Petals";
import ParticleField from "@/components/fx/ParticleField";
import { useStory } from "@/components/StoryProvider";
import { getMusic } from "@/lib/audio";
import { birthday } from "@/config/birthday";

type Phase = "wish" | "blowing" | "celebrate";
const CANDLES = [-48, -24, 0, 24, 48];

function Cake({ phase }: { phase: Phase }) {
  const out = phase !== "wish";
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd3dd" />
          <stop offset="100%" stopColor="#e8a7b6" />
        </linearGradient>
        <linearGradient id="sponge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d88fa3" />
          <stop offset="50%" stopColor="#f2b9c6" />
          <stop offset="100%" stopColor="#c97c92" />
        </linearGradient>
        <linearGradient id="gold-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b98d4f" />
          <stop offset="50%" stopColor="#fff4d8" />
          <stop offset="100%" stopColor="#b98d4f" />
        </linearGradient>
        <radialGradient id="flame-glow">
          <stop offset="0%" stopColor="#fff4d8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f3a64a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="candle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f6e7d0" />
          <stop offset="50%" stopColor="#fffaf2" />
          <stop offset="100%" stopColor="#e9d4b4" />
        </linearGradient>
      </defs>
      {/* plate */}
      <ellipse cx="150" cy="268" rx="132" ry="16" fill="url(#gold-band)" />
      <ellipse cx="150" cy="264" rx="124" ry="12" fill="#fff4d8" opacity="0.6" />
      {/* bottom tier */}
      <rect x="40" y="185" width="220" height="80" rx="12" fill="url(#sponge)" />
      <rect x="40" y="238" width="220" height="7" fill="url(#gold-band)" />
      <path d="M40 195 Q 40 182 55 182 H 245 Q 260 182 260 195 V 205 Q 250 222 240 205 Q 228 228 214 205 Q 200 218 188 205 Q 174 230 160 205 Q 146 220 132 205 Q 118 228 104 205 Q 90 220 78 205 Q 64 226 52 205 Q 46 214 40 205 Z" fill="url(#frost)" />
      {Array.from({ length: 11 }).map((_, i) => (
        <circle key={i} cx={52 + i * 19.6} cy="256" r="3.2" fill="#f3dca8" />
      ))}
      {/* top tier */}
      <rect x="78" y="120" width="144" height="68" rx="10" fill="url(#sponge)" />
      <rect x="78" y="166" width="144" height="5" fill="url(#gold-band)" />
      <path d="M78 130 Q 78 118 90 118 H 210 Q 222 118 222 130 V 138 Q 214 154 204 138 Q 194 158 182 138 Q 170 150 160 138 Q 148 160 136 138 Q 124 152 114 138 Q 102 158 92 138 Q 84 148 78 138 Z" fill="url(#frost)" />
      {/* roses */}
      {[
        [58, 196, "#E8A7B6"],
        [242, 196, "#B9A5D1"],
        [150, 198, "#fff4d8"],
        [92, 128, "#B9A5D1"],
        [208, 128, "#E8A7B6"],
      ].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="9" fill={c as string} />
          <path d="M-5 0 A5 5 0 1 1 5 0 A3.5 3.5 0 1 1 -2 0" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
          <path d="M-8 6 Q -14 10 -16 4 Q -12 2 -8 6 Z M8 6 Q 14 10 16 4 Q 12 2 8 6 Z" fill="#7aa07a" />
        </g>
      ))}
      {/* candles */}
      {CANDLES.map((dx, i) => (
        <g key={i} transform={`translate(${150 + dx} 118)`}>
          <rect x="-4" y="-38" width="8" height="38" rx="2" fill="url(#candle)" />
          <path d="M-4 -30 L 4 -34 M-4 -20 L 4 -24 M-4 -10 L 4 -14" stroke="#e8a7b6" strokeWidth="2" />
          <line x1="0" y1="-38" x2="0" y2="-43" stroke="#3a2a20" strokeWidth="1.2" />
          {/* flame */}
          <motion.g
            initial={false}
            animate={out ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ delay: out ? i * 0.12 : 0, duration: out ? 0.35 : 0.5 }}
            style={{ transformOrigin: "0px -42px" }}
          >
            <circle cx="0" cy="-52" r="16" fill="url(#flame-glow)" />
            <g style={{ animation: `flame ${0.9 + i * 0.13}s ease-in-out infinite`, transformOrigin: "0px -42px" }}>
              <path d="M0 -64 C 6 -56, 6 -46, 0 -42 C -6 -46, -6 -56, 0 -64 Z" fill="#ffcf6b" />
              <path d="M0 -58 C 3 -53, 3 -47, 0 -44 C -3 -47, -3 -53, 0 -58 Z" fill="#fff9f2" />
            </g>
          </motion.g>
          {/* smoke */}
          {out && (
            <g>
              {[0, 1, 2].map((k) => (
                <circle
                  key={k}
                  cx={k * 2 - 2}
                  cy="-48"
                  r="4"
                  fill="#e8dfe8"
                  style={{ animation: `smoke 1.8s ease-out ${0.2 + i * 0.12 + k * 0.25}s forwards`, opacity: 0, transformBox: "fill-box", transformOrigin: "center" }}
                />
              ))}
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function CakeChapter() {
  const { next } = useStory();
  const [phase, setPhase] = useState<Phase>("wish");
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const blow = () => {
    if (phase !== "wish") return;
    const music = getMusic();
    if (!music.started) music.start();
    setPhase("blowing");
    timer.current = window.setTimeout(() => {
      setPhase("celebrate");
      music.setMood("celebration");
      music.playBirthdayTune();
    }, 1300);
  };

  const party = phase === "celebrate";

  return (
    <section className="scene vignette" aria-label="Make a wish">
      <motion.div
        className="absolute inset-0"
        animate={{ background: party ? "radial-gradient(110% 80% at 50% 40%, #6b3456 0%, #3a1c34 50%, #1a0c18 100%)" : "radial-gradient(110% 80% at 50% 50%, #3d1f38 0%, #211326 55%, #0e060e 100%)" }}
        transition={{ duration: 2 }}
      />
      {/* bokeh */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 60}%`,
              width: 30 + (i % 4) * 22,
              height: 30 + (i % 4) * 22,
              background: i % 3 === 0 ? "rgba(232,167,182,0.18)" : i % 3 === 1 ? "rgba(243,220,168,0.16)" : "rgba(185,165,209,0.16)",
              filter: "blur(6px)",
              animation: `twinkle ${4 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </div>
      {/* fairy-light garland */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 top-[9%] h-14 w-full" aria-hidden>
        <path d="M0 10 Q 100 55 200 18 Q 300 -10 400 30" stroke="#6b4a3a" strokeWidth="1" fill="none" />
        {Array.from({ length: 14 }).map((_, i) => {
          const t = i / 13;
          const x = t * 400;
          const y = t < 0.5 ? 10 + Math.sin(t * 2 * Math.PI) * 25 + t * 16 : 18 + Math.sin((t - 0.5) * 2 * Math.PI) * -18 + (t - 0.5) * 24;
          return <circle key={i} cx={x} cy={y + 4} r="3" fill={i % 2 ? "#f3dca8" : "#E8A7B6"} style={{ animation: `twinkle ${1.8 + (i % 3) * 0.5}s ease-in-out ${i * 0.2}s infinite`, transformBox: "fill-box", transformOrigin: "center" }} />;
        })}
      </svg>

      {party && <Fireworks active rate={800} className="opacity-80" />}
      {party && <Confetti count={44} />}
      {party && <Petals count={18} seed={88} />}
      <ParticleField variant="dust" count={party ? 50 : 26} intensity={party ? 1.8 : 0.8} />

      {/* golden wave */}
      <AnimatePresence>
        {party && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[58%] z-10 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ boxShadow: "0 0 0 6px rgba(243,220,168,0.8), 0 0 80px 30px rgba(243,220,168,0.6)", background: "radial-gradient(circle, rgba(255,244,216,0.6), transparent 70%)" }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 70, opacity: 0 }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 flex min-h-dvh flex-col items-center justify-center px-5 pb-[calc(var(--safe-bottom)+24px)] pt-24 text-center">
        <AnimatePresence mode="wait">
          {!party ? (
            <motion.p key="wish" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.2 }} className="max-w-xs font-serif text-[1.75rem] italic leading-snug text-ivory sm:max-w-md sm:text-4xl">
              Close your eyes, {birthday.momTitle}.
              <br />
              <span className="text-gold-bright">Make your most beautiful wish.</span>
            </motion.p>
          ) : (
            <motion.div key="hb" className="flex flex-col items-center">
              <motion.h2
                initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.6, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-[2.6rem] font-semibold leading-none [text-shadow:0_4px_24px_rgba(20,8,20,0.9)] sm:text-6xl"
              >
                <span className="gold-text">HAPPY BIRTHDAY,</span>
                <br />
                <span className="text-ivory glow-text">{birthday.momTitle.toUpperCase()}!</span>
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 1.2 }} className="mt-4 max-w-xs font-hand text-[1.6rem] leading-tight text-rose [text-shadow:0_2px_14px_rgba(20,8,20,0.95)] sm:max-w-md sm:text-3xl">
                May every wish you make bring you happiness, love, and beautiful moments.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="relative mt-6 h-[min(46vh,330px)] w-[min(86vw,360px)]"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: party ? 0.92 : 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Cake phase={phase} />
        </motion.div>

        <div className="mt-4 min-h-[60px]">
          <AnimatePresence mode="wait">
            {phase === "wish" && (
              <motion.button key="blow" type="button" onClick={blow} exit={{ opacity: 0 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="btn-magic">
                <Wind size={16} /> Blow out the candles
              </motion.button>
            )}
            {party && (
              <motion.button key="cont" type="button" onClick={next} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4 }} className="btn-magic">
                There’s one more surprise…
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
