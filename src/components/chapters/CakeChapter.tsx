"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CakeSlice, Wind } from "lucide-react";
import Fireworks from "@/components/fx/Fireworks";
import Confetti from "@/components/fx/Confetti";
import Petals from "@/components/fx/Petals";
import ParticleField from "@/components/fx/ParticleField";
import { useStory } from "@/components/StoryProvider";
import { getMusic } from "@/lib/audio";
import { birthday } from "@/config/birthday";

type Phase = "wish" | "blowing" | "cutReady" | "cutting" | "celebrate";

/* Cut timeline (seconds from tapping "Cut the cake"). Module-level so the
   animation targets stay referentially stable across phase changes. */
const CUT_TOTAL = 4.4;
const KNIFE = {
  x: [135, 135, 135, 165, 165, 165, 230],
  y: [-90, 150, -60, -60, 150, -60, -140],
  rotate: [0, 0, 0, 0, 0, 0, 20],
  opacity: [0, 1, 1, 1, 1, 1, 0],
};
const KNIFE_T = { duration: 2.6, times: [0, 0.2, 0.36, 0.48, 0.66, 0.82, 1], ease: "easeInOut" as const };
const LEFT = { x: -10 };
const RIGHT = { x: 10 };
const PART_T = { delay: 2.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const };
const SLICE = { y: [-110, -170, 0], scale: [0.45, 1, 1], rotate: [0, -8, 0], opacity: [0, 1, 1] };
const SLICE_T = { delay: 2.5, duration: 1.5, times: [0, 0.45, 1], ease: "easeInOut" as const };
const CANDLES = [-48, -24, 0, 24, 48];

function Cake({ phase }: { phase: Phase }) {
  const out = phase !== "wish";
  const cut = phase === "cutting" || phase === "celebrate";
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
      <defs>
        <g id="cake-body">
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
        </g>
        <clipPath id="cut-left" clipPathUnits="userSpaceOnUse">
          <rect x="-50" y="-100" width="185" height="400" />
        </clipPath>
        <clipPath id="cut-mid" clipPathUnits="userSpaceOnUse">
          <rect x="135" y="-100" width="30" height="400" />
        </clipPath>
        <clipPath id="cut-right" clipPathUnits="userSpaceOnUse">
          <rect x="165" y="-100" width="200" height="400" />
        </clipPath>
        <linearGradient id="gap-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a1f2c" stopOpacity="0.45" />
          <stop offset="35%" stopColor="#3a1f2c" stopOpacity="0" />
          <stop offset="65%" stopColor="#3a1f2c" stopOpacity="0" />
          <stop offset="100%" stopColor="#3a1f2c" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9ccd6" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#9aa0ae" />
        </linearGradient>
      </defs>

      {/* dessert plate for the slice */}
      <motion.g initial={false} animate={{ opacity: cut ? 1 : 0, scale: cut ? 1 : 0.6 }} transition={{ delay: cut ? 2.6 : 0, duration: 0.6 }} style={{ transformOrigin: "150px 304px" }}>
        <ellipse cx="150" cy="306" rx="58" ry="11" fill="url(#gold-band)" />
        <ellipse cx="150" cy="303" rx="48" ry="7.5" fill="#fff9f2" />
      </motion.g>

      <motion.g initial={false} animate={cut ? LEFT : { x: 0 }} transition={cut ? PART_T : { duration: 0 }}>
        <use href="#cake-body" clipPath="url(#cut-left)" />
      </motion.g>
      <motion.g initial={false} animate={cut ? RIGHT : { x: 0 }} transition={cut ? PART_T : { duration: 0 }}>
        <use href="#cake-body" clipPath="url(#cut-right)" />
      </motion.g>
      {/* the cut gap: the inside of the cake */}
      <motion.g initial={false} animate={{ opacity: cut ? 0 : 1 }} transition={{ delay: cut ? 2.4 : 0, duration: 0.4 }}>
        <use href="#cake-body" clipPath="url(#cut-mid)" />
      </motion.g>
      <motion.g initial={false} animate={{ opacity: cut ? 1 : 0 }} transition={{ delay: cut ? 2.2 : 0, duration: 0.6 }}>
        <rect x="125" y="121" width="50" height="47" fill="#c97c92" />
        <rect x="125" y="140" width="50" height="4" fill="#f6dfe4" opacity="0.8" />
        <rect x="125" y="166" width="50" height="5" fill="url(#gold-band)" />
        <rect x="125" y="185" width="50" height="80" fill="#c97c92" />
        {[205, 225].map((y) => (
          <rect key={y} x="125" y={y} width="50" height="4" fill="#f6dfe4" opacity="0.8" />
        ))}
        <rect x="125" y="238" width="50" height="7" fill="url(#gold-band)" />
        <rect x="125" y="121" width="50" height="144" fill="url(#gap-shade)" />
      </motion.g>

      {/* the slice lands on the dessert plate */}
      <g transform="translate(150 300)">
        <motion.g initial={false} animate={cut ? SLICE : { y: -110, scale: 0.45, rotate: 0, opacity: 0 }} transition={cut ? SLICE_T : { duration: 0 }}>
          {/* side face with layers */}
          <path d="M-44 -34 L 34 -34 L 34 0 L -44 0 Z" fill="#f2b9c6" />
          <rect x="-44" y="-24" width="78" height="4" fill="#fff4f6" />
          <rect x="-44" y="-13" width="78" height="4" fill="#fff4f6" />
          <rect x="-44" y="-4" width="78" height="4" fill="url(#gold-band)" />
          {[-36, -20, -2, 16, 28].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? -18 : -8} r="1.4" fill="#E8A7B6" />
          ))}
          {/* cut end (back) */}
          <path d="M34 -34 L 46 -46 L 46 -12 L 34 0 Z" fill="#d88fa3" />
          {/* frosted top */}
          <path d="M-44 -34 L 34 -34 L 46 -46 Z" fill="url(#frost)" />
          <path d="M-44 -34 Q -30 -26 -18 -34 Q -6 -26 6 -34 Q 18 -26 34 -34" fill="url(#frost)" />
          {/* rose + mini candle */}
          <g transform="translate(22 -40)">
            <circle r="6" fill="#B9A5D1" />
            <path d="M-3 0 A3 3 0 1 1 3 0" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" fill="none" />
          </g>
          <circle cx="-30" cy="-36" r="2.2" fill="#f3dca8" />
          <circle cx="0" cy="-36" r="2.2" fill="#f3dca8" />
        </motion.g>
      </g>

      {/* the knife */}
      {cut && (
        <motion.g initial={{ x: 135, y: -90, opacity: 0 }} animate={KNIFE} transition={KNIFE_T}>
          <path d="M-5 -6 L 5 -6 L 5 -80 C 5 -86, -5 -86, -5 -80 Z" fill="#7a4a3a" />
          <path d="M-5 -46 L 5 -46" stroke="#d6b47c" strokeWidth="2" />
          <path d="M-5 -66 L 5 -66" stroke="#d6b47c" strokeWidth="2" />
          <rect x="-8" y="-8" width="16" height="5" rx="1.5" fill="url(#gold-band)" />
          <path d="M-6 -3 L 6 -3 L 6 90 L 0 104 L -6 90 Z" fill="url(#blade)" stroke="#8a8f9c" strokeWidth="0.6" />
          <path d="M-2 4 L -2 86" stroke="#fff" strokeWidth="1" opacity="0.7" />
        </motion.g>
      )}
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
    timer.current = window.setTimeout(() => setPhase("cutReady"), 2200);
  };

  const cutCake = () => {
    if (phase !== "cutReady") return;
    setPhase("cutting");
    timer.current = window.setTimeout(() => {
      setPhase("celebrate");
      const music = getMusic();
      music.setMood("celebration");
      music.playBirthdayTune();
    }, CUT_TOTAL * 1000);
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
          {phase === "cutReady" || phase === "cutting" ? (
            <motion.p key="cut" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1 }} className="max-w-xs font-serif text-[1.75rem] italic leading-snug text-ivory sm:max-w-md sm:text-4xl">
              Your wish is on its way ✨
              <br />
              <span className="font-hand text-[2.1rem] not-italic text-gold-bright sm:text-5xl">Now, let’s cut the cake!</span>
            </motion.p>
          ) : !party ? (
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
            {phase === "cutReady" && (
              <motion.button key="cutbtn" type="button" onClick={cutCake} exit={{ opacity: 0 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="btn-magic">
                <CakeSlice size={16} /> Cut the cake
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
