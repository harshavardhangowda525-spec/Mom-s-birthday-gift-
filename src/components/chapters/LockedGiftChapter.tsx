"use client";

import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Confetti from "@/components/fx/Confetti";
import { useStory } from "@/components/StoryProvider";
import { birthday } from "@/config/birthday";
import { getMusic } from "@/lib/audio";

const TEASES = ["Not yet! 😄", "Patience, Mom…", "No peeking!", "Almost there…", "It’s worth the wait ✨", "Nice try 😉"];

function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** A row of chain links between two points. */
function Chain({ x1, y1, x2, y2, links = 11 }: { x1: number; y1: number; x2: number; y2: number; links?: number }) {
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      {Array.from({ length: links }).map((_, i) => {
        const t = i / (links - 1);
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        const flat = i % 2 === 0;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx={flat ? 9 : 8}
            ry={flat ? 5 : 2.2}
            transform={`rotate(${ang} ${x} ${y})`}
            fill="none"
            stroke="url(#lg-gold)"
            strokeWidth={flat ? 3 : 3.4}
          />
        );
      })}
    </g>
  );
}

function Chest({ open, lockControls }: { open: boolean; lockControls: ReturnType<typeof useAnimationControls> }) {
  return (
    <svg viewBox="0 0 300 260" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4d8" />
          <stop offset="45%" stopColor="#f3dca8" />
          <stop offset="100%" stopColor="#a87d42" />
        </linearGradient>
        <linearGradient id="lg-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6d3a5c" />
          <stop offset="100%" stopColor="#3a1a30" />
        </linearGradient>
        <linearGradient id="lg-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#84476f" />
          <stop offset="100%" stopColor="#552a48" />
        </linearGradient>
        <radialGradient id="lg-light" cx="50%" cy="100%" r="90%">
          <stop offset="0%" stopColor="#fff9f2" />
          <stop offset="40%" stopColor="#f3dca8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f3dca8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="150" cy="250" rx="120" ry="10" fill="#000" opacity="0.35" />

      {/* light pouring out when opened */}
      <motion.path
        d="M62 118 L 0 -120 L 300 -120 L 238 118 Z"
        fill="url(#lg-light)"
        style={{ mixBlendMode: "screen", transformOrigin: "150px 118px" }}
        initial={false}
        animate={open ? { opacity: [0, 1, 0.85], scaleY: [0.2, 1, 1] } : { opacity: 0, scaleY: 0.2 }}
        transition={{ delay: open ? 1.9 : 0, duration: 1.2 }}
      />

      {/* body */}
      <rect x="50" y="118" width="200" height="124" rx="10" fill="url(#lg-wood)" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="50" x2="250" y1={146 + i * 26} y2={146 + i * 26} stroke="#2a1224" strokeWidth="1.5" opacity="0.5" />
      ))}
      <rect x="50" y="118" width="200" height="124" rx="10" fill="none" stroke="url(#lg-gold)" strokeWidth="5" />
      <rect x="82" y="118" width="12" height="124" fill="url(#lg-gold)" opacity="0.9" />
      <rect x="206" y="118" width="12" height="124" fill="url(#lg-gold)" opacity="0.9" />
      {[[60, 232], [240, 232], [60, 128], [240, 128]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#fff4d8" />
      ))}

      {/* lid: swings open around its back hinge */}
      <motion.g style={{ transformOrigin: "50px 118px" }} initial={false} animate={open ? { rotate: -38, y: -18 } : { rotate: 0, y: 0 }} transition={{ delay: open ? 1.7 : 0, duration: 1, ease: [0.5, 0, 0.2, 1.4] }}>
        <path d="M46 120 V 92 C 46 52, 254 52, 254 92 V 120 Z" fill="url(#lg-lid)" stroke="url(#lg-gold)" strokeWidth="5" />
        <path d="M82 120 V 72 M94 120 V 68" stroke="url(#lg-gold)" strokeWidth="6" />
        <path d="M206 120 V 68 M218 120 V 72" stroke="url(#lg-gold)" strokeWidth="6" />
        <path d="M46 112 H 254" stroke="url(#lg-gold)" strokeWidth="3" />
        <path transform="translate(150 84) scale(0.55)" d="M0 22 C -26 4, -32 -16, -18 -24 C -9 -29, -2 -24, 0 -16 C 2 -24, 9 -29, 18 -24 C 32 -16, 26 4, 0 22 Z" fill="#E8A7B6" opacity="0.9" />
      </motion.g>

      {/* chains: fall away when opened */}
      <motion.g initial={false} animate={open ? { y: 240, rotate: -18, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }} transition={{ delay: open ? 0.8 : 0, duration: 1.1, ease: "easeIn" }} style={{ transformOrigin: "150px 160px" }}>
        <Chain x1={44} y1={74} x2={256} y2={238} links={13} />
      </motion.g>
      <motion.g initial={false} animate={open ? { y: 240, rotate: 18, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }} transition={{ delay: open ? 0.95 : 0, duration: 1.1, ease: "easeIn" }} style={{ transformOrigin: "150px 160px" }}>
        <Chain x1={256} y1={74} x2={44} y2={238} links={13} />
      </motion.g>

      {/* heart padlock */}
      <motion.g animate={lockControls} style={{ transformOrigin: "150px 140px" }}>
        <motion.g initial={false} animate={open ? { y: [0, -14, 260], rotate: [0, -10, 40], opacity: [1, 1, 0] } : { y: 0, rotate: 0, opacity: 1 }} transition={{ duration: 1.2, times: [0, 0.3, 1], ease: "easeIn" }} style={{ transformOrigin: "150px 160px" }}>
          {/* shackle: pops up when unlocking */}
          <motion.path
            d="M136 142 V 128 C 136 110, 164 110, 164 128 V 142"
            fill="none"
            stroke="url(#lg-gold)"
            strokeWidth="6"
            strokeLinecap="round"
            initial={false}
            animate={open ? { y: -10 } : { y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <path transform="translate(150 162) scale(1.15)" d="M0 22 C -26 4, -32 -16, -18 -24 C -9 -29, -2 -24, 0 -16 C 2 -24, 9 -29, 18 -24 C 32 -16, 26 4, 0 22 Z" fill="url(#lg-gold)" stroke="#a87d42" strokeWidth="1" />
          <circle cx="150" cy="158" r="4.5" fill="#47263D" />
          <path d="M148 160 L 147 172 L 153 172 L 152 160 Z" fill="#47263D" />
        </motion.g>
      </motion.g>
    </svg>
  );
}

export default function LockedGiftChapter() {
  const { next } = useStory();
  const now = useNow();
  const unlockAt = new Date(birthday.lockedGift.unlockAt).getTime();
  const [preview, setPreview] = useState(false);
  const [opened, setOpened] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [tease, setTease] = useState<string | null>(null);
  const taps = useRef(0);
  const teaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chest = useAnimationControls();
  const lock = useAnimationControls();

  useEffect(() => {
    setPreview(new URLSearchParams(window.location.search).has("unlock"));
  }, []);

  const unlocked = preview || (now !== null && now >= unlockAt);
  const left = now === null ? null : Math.max(0, unlockAt - now);
  const parts =
    left === null
      ? null
      : [
          { v: Math.floor(left / 86400000), l: "Days" },
          { v: Math.floor((left / 3600000) % 24), l: "Hours" },
          { v: Math.floor((left / 60000) % 60), l: "Minutes" },
          { v: Math.floor((left / 1000) % 60), l: "Seconds" },
        ];

  const tapChest = () => {
    if (unlocked) {
      if (!opened) openIt();
      return;
    }
    taps.current++;
    setTease(TEASES[(taps.current - 1) % TEASES.length]);
    if (teaseTimer.current) clearTimeout(teaseTimer.current);
    teaseTimer.current = setTimeout(() => setTease(null), 1400);
    void chest.start({ x: [0, -10, 10, -8, 8, -4, 0], rotate: [0, -2, 2, -1.5, 1.5, 0, 0], transition: { duration: 0.6 } });
    void lock.start({ rotate: [0, 14, -12, 8, -5, 0], transition: { duration: 0.7 } });
  };

  const openIt = () => {
    setOpened(true);
    getMusic().chime();
    setTimeout(() => {
      setReveal(true);
      getMusic().playBirthdayTune();
    }, 2900);
  };

  return (
    <section className="scene vignette" aria-label="A gift on its way">
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_45%,#4a2846_0%,#24122a_50%,#0c060e_100%)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[70%] w-[140%] max-w-[900px] -translate-x-1/2"
        style={{ background: "linear-gradient(180deg, rgba(243,220,168,0) 0%, rgba(243,220,168,0.12) 60%, rgba(243,220,168,0.2) 100%)", clipPath: "polygon(42% 0, 58% 0, 80% 100%, 20% 100%)", filter: "blur(10px)" }}
      />
      <ParticleField variant="dust" count={reveal ? 80 : 40} intensity={reveal ? 2 : 1} />
      {reveal && <Confetti count={50} seed={29} />}

      <div className="relative z-10 flex min-h-dvh flex-col items-center px-5 pb-[calc(var(--safe-bottom)+24px)] pt-28 text-center">
        <AnimatePresence mode="wait">
          {!reveal ? (
            <motion.div key="intro" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6 }}>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4 }} className="font-serif text-[1.7rem] italic leading-snug text-ivory sm:text-4xl">
                Not every gift fits inside a screen.
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1.4 }} className="mt-3 font-hand text-[1.9rem] leading-tight text-gold-bright drop-shadow-[0_0_14px_rgba(214,180,124,0.7)] sm:text-4xl">
                {unlocked ? "Your gift has arrived ✨" : "Something special is on its way to you…"}
              </motion.p>
            </motion.div>
          ) : (
            <motion.div key="reveal" initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1.4 }}>
              <h2 className="font-serif text-[2.4rem] font-semibold leading-tight sm:text-6xl">
                <span className="gold-text">{birthday.lockedGift.unlockedTitle}</span> <span aria-hidden>🎁</span>
              </h2>
              <p className="mx-auto mt-3 max-w-xs font-hand text-[1.7rem] leading-tight text-rose sm:max-w-md sm:text-3xl">{birthday.lockedGift.unlockedMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the chest */}
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} className="mt-6">
        <motion.button
          type="button"
          onClick={tapChest}
          animate={chest}
          className="focus-ring relative h-[min(38vh,290px)] w-[min(82vw,330px)] rounded-3xl"
          aria-label={unlocked ? "Open your gift" : `A locked gift chest. It unlocks on ${birthday.lockedGift.unlockLabel}.`}
        >
          <div className={`h-full w-full ${opened ? "" : "animate-floaty"}`}>
            <Chest open={opened} lockControls={lock} />
          </div>
          <AnimatePresence>
            {tease && !unlocked && (
              <motion.span
                key={taps.current}
                className="pointer-events-none absolute left-1/2 top-[-6px] -translate-x-1/2 whitespace-nowrap rounded-full bg-ivory px-4 py-1.5 font-hand text-xl text-burgundy shadow-lg"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
              >
                {tease}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        </motion.div>

        {/* countdown or open button */}
        <div className="mt-6 min-h-[120px]">
          {!unlocked ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}>
              <p className="flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-gold/90">
                <Lock size={12} /> Unlocks on {birthday.lockedGift.unlockLabel}
              </p>
              <div className="mt-3 flex justify-center gap-2.5" aria-live="off">
                {(parts ?? [{ v: 0, l: "Days" }, { v: 0, l: "Hours" }, { v: 0, l: "Minutes" }, { v: 0, l: "Seconds" }]).map((p) => (
                  <div key={p.l} className="w-[4.3rem] rounded-xl border border-gold/40 bg-plum/60 py-2 backdrop-blur">
                    <p className="font-serif text-[1.9rem] font-semibold leading-none text-ivory tabular-nums">{parts ? String(p.v).padStart(2, "0") : "--"}</p>
                    <p className="mt-1 text-[8.5px] font-semibold uppercase tracking-[0.2em] text-gold/80">{p.l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] italic text-ivory/55">Come back on that day… and tap the chest again.</p>
            </motion.div>
          ) : !opened ? (
            <motion.button type="button" onClick={openIt} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -3, 0] }} transition={{ y: { duration: 1.6, repeat: Infinity }, opacity: { delay: 1.8 } }} className="btn-magic">
              <Sparkles size={16} /> Open your gift
            </motion.button>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={next}
          initial={{ opacity: 0 }}
          animate={{ opacity: !unlocked || reveal ? 1 : 0 }}
          transition={{ delay: reveal ? 2 : 3.2, duration: 1 }}
          className={`${reveal ? "btn-magic" : "btn-ghost"} mt-2`}
          style={{ pointerEvents: !unlocked || reveal ? "auto" : "none" }}
        >
          {reveal ? "Continue the celebration" : "I’ll wait… let’s have cake! 🎂"}
        </motion.button>
      </div>
    </section>
  );
}
