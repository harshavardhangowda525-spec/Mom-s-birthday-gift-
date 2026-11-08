"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import { Butterflies } from "@/components/fx/Butterfly";
import SafeImage from "@/components/ui/SafeImage";
import GoldHeart from "@/components/ui/GoldHeart";
import { useStory, type DoorId } from "@/components/StoryProvider";
import { birthday, photoById, type FamilyPhoto } from "@/config/birthday";

const DOORS: { id: DoorId; title: string; glow: string; panel: [string, string]; accent: string }[] = [
  { id: "smile", title: birthday.doors.smile.title, glow: "rgba(232,167,182,0.85)", panel: ["#7a3d58", "#4b2238"], accent: "#E8A7B6" },
  { id: "memories", title: birthday.doors.memories.title, glow: "rgba(243,220,168,0.9)", panel: ["#6b4a2e", "#3e2a1a"], accent: "#D6B47C" },
  { id: "love", title: birthday.doors.love.title, glow: "rgba(185,165,209,0.9)", panel: ["#4d3c6b", "#2c2140"], accent: "#B9A5D1" },
];

function photosFor(ids: readonly string[]) {
  return ids.map((id) => photoById(id)).filter(Boolean) as FamilyPhoto[];
}

/* ───────────── the arched door graphic ───────────── */
function DoorArt({ door, open, done }: { door: (typeof DOORS)[number]; open: boolean; done: boolean }) {
  const gid = `door-${door.id}`;
  return (
    <div className="relative aspect-[3/5] w-full" style={{ perspective: 600 }}>
      {/* light behind the door */}
      <div
        className="absolute inset-[6%] rounded-t-full"
        style={{ background: `radial-gradient(circle at 50% 60%, #fff9f2 0%, ${door.glow} 45%, transparent 80%)`, opacity: open ? 1 : 0.35, transition: "opacity 0.8s" }}
      />
      {/* two panels */}
      {[0, 1].map((side) => (
        <motion.div
          key={side}
          className="absolute top-[6%] h-[94%] w-[44%] overflow-hidden"
          style={{
            left: side === 0 ? "6%" : "50%",
            transformOrigin: side === 0 ? "left center" : "right center",
            borderTopLeftRadius: side === 0 ? "999px 999px" : 0,
            borderTopRightRadius: side === 1 ? "999px 999px" : 0,
            background: `linear-gradient(${side ? 250 : 110}deg, ${door.panel[0]}, ${door.panel[1]})`,
            boxShadow: "inset 0 0 0 1.5px rgba(243,220,168,0.55)",
          }}
          animate={{ rotateY: open ? (side === 0 ? -105 : 105) : 0 }}
          transition={{ duration: 1.2, ease: [0.6, 0, 0.2, 1] }}
        >
          <div className="absolute inset-[14%_18%_10%_18%] rounded-t-full border border-gold/40" style={{ borderTopLeftRadius: side === 0 ? 999 : 4, borderTopRightRadius: side === 1 ? 999 : 4 }} />
          <span className="absolute top-1/2 h-2 w-2 rounded-full bg-gold-bright shadow-[0_0_8px_#f3dca8]" style={{ [side === 0 ? "right" : "left"]: "10%" }} />
        </motion.div>
      ))}
      {/* ornate arch frame */}
      <svg viewBox="0 0 120 200" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4d8" />
            <stop offset="50%" stopColor={door.accent} />
            <stop offset="100%" stopColor="#b98d4f" />
          </linearGradient>
        </defs>
        <path d="M6 200 V 62 A 54 54 0 0 1 114 62 V 200" fill="none" stroke={`url(#${gid})`} strokeWidth="5" />
        <path d="M0 200 V 60 A 60 60 0 0 1 120 60 V 200" fill="none" stroke={`url(#${gid})`} strokeWidth="1.2" opacity="0.7" />
        {/* crown ornament per door */}
        {door.id === "smile" && (
          <g transform="translate(60 6)">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-7" rx="5" ry="8" fill="#E8A7B6" transform={`rotate(${r})`} />
            ))}
            <circle r="4" fill="#fff4d8" />
          </g>
        )}
        {door.id === "memories" && (
          <g transform="translate(60 4)">
            <path d="M0 -12 L 3.5 -3.5 L 12 0 L 3.5 3.5 L 0 12 L -3.5 3.5 L -12 0 L -3.5 -3.5 Z" fill="#f3dca8" />
            <circle r="2.5" fill="#fff" />
          </g>
        )}
        {door.id === "love" && (
          <path transform="translate(48 -8) scale(0.75)" d="M16 28 C 6 21, 1 15, 3 9 C 5 3, 12 2, 16 8 C 20 2, 27 3, 29 9 C 31 15, 26 21, 16 28 Z" fill="#B9A5D1" stroke="#f3dca8" strokeWidth="1.5" />
        )}
        {/* vines */}
        <path d="M6 190 C 14 160, 0 130, 10 100 C 18 80, 8 70, 16 50" stroke="#6d8a5e" strokeWidth="1.5" fill="none" opacity="0.7" />
        <path d="M114 190 C 106 160, 120 130, 110 100 C 102 80, 112 70, 104 50" stroke="#6d8a5e" strokeWidth="1.5" fill="none" opacity="0.7" />
        {[30, 70, 110, 150].map((y, i) => (
          <g key={y}>
            <circle cx={i % 2 ? 12 : 8} cy={200 - y} r="3" fill={door.accent} />
            <circle cx={i % 2 ? 108 : 112} cy={200 - y - 10} r="3" fill={door.accent} />
          </g>
        ))}
      </svg>
      {done && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
          <GoldHeart size={26} className="animate-pulse-glow" />
        </div>
      )}
    </div>
  );
}

/* ───────────── shared "collect heart" footer ───────────── */
function CollectFooter({ onCollect, collected, onBack, delay = 2.5 }: { onCollect: () => void; collected: boolean; onBack: () => void; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1 }}
      className="mt-8 flex flex-col items-center gap-3"
    >
      {!collected ? (
        <button type="button" onClick={onCollect} className="btn-magic">
          <Heart size={16} fill="currentColor" /> Collect your golden heart
        </button>
      ) : (
        <button type="button" onClick={onBack} className="btn-magic">
          <ArrowLeft size={16} /> Return to the doors
        </button>
      )}
      {!collected && (
        <button type="button" onClick={onBack} className="btn-ghost">
          <ArrowLeft size={14} /> Back to the doors
        </button>
      )}
    </motion.div>
  );
}

/* ───────────── Door 1: YOUR SMILE ───────────── */
function SmileRoom({ collected, onCollect, onBack }: RoomProps) {
  const photos = photosFor(birthday.doors.smile.photoIds);
  const [front, setFront] = useState(0);
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_30%,#9c5a74_0%,#5e2c46_45%,#2a1424_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_42%,rgba(255,214,223,0.45),transparent_70%)]" />
      <Petals count={18} seed={77} />
      <ParticleField variant="dust" count={30} />
      <FloralCorners color="#E8A7B6" />

      <p className="relative text-[11px] font-semibold uppercase tracking-[0.4em] text-rose">Door One</p>
      <h2 className="relative mt-2 font-serif text-4xl font-medium text-ivory sm:text-5xl">{birthday.doors.smile.title}</h2>

      <div className="relative mt-8 h-[min(56vh,420px)] w-full max-w-sm">
        {photos.map((p, i) => {
          const offset = (i - front + photos.length) % photos.length;
          const isFront = offset === 0;
          return (
            <div key={p.id} className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 - offset, pointerEvents: "none" }}>
              <motion.button
                type="button"
                onClick={() => setFront(isFront ? (front + 1) % photos.length : i)}
                aria-label={isFront ? `Show next photo` : `Bring forward: ${p.alt}`}
                className="focus-ring pointer-events-auto relative w-[68%] max-w-[260px] rounded-sm bg-ivory p-2.5 pb-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)]"
                animate={{
                  x: offset === 0 ? 0 : offset === 1 ? 58 : -58,
                  y: offset * 10,
                  rotate: offset === 0 ? -2 : offset === 1 ? 8 : -9,
                  scale: isFront ? 1 : 0.86,
                  opacity: isFront ? 1 : 0.8,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
              >
                <SafeImage src={p.src} alt={p.alt} focus={p.focus} className="aspect-[4/5] w-full" />
                <span className="absolute inset-x-0 bottom-2 font-hand text-xl text-burgundy">{isFront ? "♡" : ""}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
      <p className="relative mt-1 text-[11px] uppercase tracking-[0.3em] text-ivory/50">Tap the photos</p>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1.4 }}
        className="relative mt-6 max-w-sm font-hand text-[1.9rem] leading-tight text-[#ffe3ea] drop-shadow-[0_0_14px_rgba(232,167,182,0.7)] sm:text-4xl"
      >
        “{birthday.doors.smile.message}”
      </motion.p>
      <div className="relative">
        <CollectFooter onCollect={onCollect} collected={collected} onBack={onBack} />
      </div>
    </div>
  );
}

/* ───────────── Door 2: OUR MEMORIES ───────────── */
const FLOAT_SPOTS = [
  { x: 6, y: 8, r: -7, d: 0 },
  { x: 52, y: 2, r: 6, d: 1.2 },
  { x: 2, y: 50, r: 5, d: 0.6 },
  { x: 50, y: 46, r: -5, d: 1.8 },
];

function MemoriesRoom({ collected, onCollect, onBack }: RoomProps) {
  const photos = photosFor(birthday.doors.memories.photoIds).slice(0, FLOAT_SPOTS.length);
  const [focus, setFocus] = useState<FamilyPhoto | null>(null);
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_35%,#7a5a33_0%,#46301f_45%,#1c120c_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_45%,rgba(255,236,190,0.35),transparent_70%)]" />
      <ParticleField variant="dust" count={55} />

      <p className="relative text-[11px] font-semibold uppercase tracking-[0.4em] text-gold">Door Two</p>
      <h2 className="relative mt-2 font-serif text-4xl font-medium text-ivory sm:text-5xl">{birthday.doors.memories.title}</h2>

      <div className="relative mt-8 h-[min(50vh,400px)] w-full max-w-md">
        {photos.map((p, i) => {
          const s = FLOAT_SPOTS[i];
          return (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => setFocus(p)}
              aria-label={`Open memory: ${p.alt}`}
              className="focus-ring absolute w-[46%] rounded-md border border-gold/60 bg-[#2a1d12] p-1.5 shadow-[0_0_30px_-4px_rgba(243,220,168,0.55)]"
              style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: s.r }}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
              transition={{ opacity: { delay: 0.3 + i * 0.25, duration: 1 }, scale: { delay: 0.3 + i * 0.25, duration: 1 }, y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: s.d } }}
            >
              <SafeImage src={p.src} alt={p.alt} focus={p.focus} className="aspect-[4/3] w-full rounded-sm" />
            </motion.button>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 1.4 }}
        className="relative mt-6 max-w-sm font-hand text-[1.9rem] leading-tight text-[#fff1cf] drop-shadow-[0_0_14px_rgba(214,180,124,0.8)] sm:text-4xl"
      >
        “{birthday.doors.memories.message}”
      </motion.p>
      <div className="relative">
        <CollectFooter onCollect={onCollect} collected={collected} onBack={onBack} />
      </div>

      <AnimatePresence>
        {focus && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/70 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFocus(null)}
            role="dialog"
            aria-modal="true"
            aria-label={focus.alt}
          >
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-md border border-gold/60 bg-[#2a1d12] p-2 shadow-[0_0_60px_rgba(243,220,168,0.4)]">
              <SafeImage src={focus.src} alt={focus.alt} focus={focus.focus} className="max-h-[65vh] w-full rounded-sm" eager />
            </motion.div>
            <p className="mt-4 max-w-sm text-center font-serif text-xl italic text-ivory">{focus.caption}</p>
            <button type="button" className="btn-ghost mt-5" onClick={() => setFocus(null)}>
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────────── Door 3: THE LOVE YOU GIVE ───────────── */
function LoveRoom({ collected, onCollect, onBack }: RoomProps) {
  const [opened, setOpened] = useState(false);
  const lines = birthday.doors.love.lines;
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_30%,#6e5a92_0%,#3b2d58_45%,#1a1228_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_50%,rgba(243,220,168,0.25),transparent_70%)]" />
      <ParticleField variant="fireflies" count={28} />
      <Butterflies count={3} seed={81} />

      <p className="relative text-[11px] font-semibold uppercase tracking-[0.4em] text-lavender">Door Three</p>
      <h2 className="relative mt-2 font-serif text-4xl font-medium text-ivory sm:text-5xl">{birthday.doors.love.title}</h2>

      <div className="relative mt-8 w-full max-w-sm" style={{ perspective: 900 }}>
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key="envelope"
              type="button"
              onClick={() => setOpened(true)}
              aria-label="Open the letter"
              className="focus-ring relative mx-auto block aspect-[4/3] w-[86%]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.5 } }}
              transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 1 } }}
            >
              <svg viewBox="0 0 200 150" className="h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" aria-hidden>
                <rect x="4" y="20" width="192" height="126" rx="6" fill="#f6eedf" />
                <path d="M4 26 L 100 96 L 196 26" fill="none" stroke="#d8c6a8" strokeWidth="2" />
                <path d="M4 146 L 80 82 M 196 146 L 120 82" stroke="#e2d3b8" strokeWidth="2" />
                <path d="M4 26 L 100 96 L 196 26 L 196 20 L 4 20 Z" fill="#efe2cb" />
                <circle cx="100" cy="92" r="16" fill="#8d5a8a" stroke="#d6b47c" strokeWidth="2" />
                <path transform="translate(91 84) scale(0.55)" d="M16 28 C 6 21, 1 15, 3 9 C 5 3, 12 2, 16 8 C 20 2, 27 3, 29 9 C 31 15, 26 21, 16 28 Z" fill="#f3dca8" />
              </svg>
              <span className="mt-3 block text-[11px] uppercase tracking-[0.3em] text-ivory/70">Tap to open</span>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              className="paper relative rounded-md px-6 py-7 text-left"
              initial={{ rotateX: -80, opacity: 0, y: 40, transformOrigin: "top center" }}
              animate={{ rotateX: 0, opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-hand text-2xl text-burgundy">Dear Mom,</p>
              <div className="mt-2 space-y-2.5">
                {lines.map((l, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.9, duration: 0.9 }}
                    className={`font-serif text-[1.08rem] leading-snug ${i === lines.length - 1 ? "font-semibold italic text-burgundy" : "text-[#4a2c3d]"}`}
                  >
                    {l}
                  </motion.p>
                ))}
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + lines.length * 0.9 }} className="mt-4 text-right font-hand text-2xl text-burgundy">
                — {birthday.senderSignature}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {opened && (
        <div className="relative">
          <CollectFooter onCollect={onCollect} collected={collected} onBack={onBack} delay={1 + lines.length * 0.9 + 0.6} />
        </div>
      )}
      {!opened && (
        <button type="button" onClick={onBack} className="btn-ghost relative mt-8">
          <ArrowLeft size={14} /> Back to the doors
        </button>
      )}
    </div>
  );
}

function FloralCorners({ color }: { color: string }) {
  const flower = (
    <g>
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="0" cy="-9" rx="6" ry="10" fill={color} opacity="0.85" transform={`rotate(${r})`} />
      ))}
      <circle r="4.5" fill="#fff4d8" />
    </g>
  );
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-60" aria-hidden>
      {[
        [6, 6, 0.5],
        [94, 6, 0.4],
        [5, 94, 0.45],
        [95, 94, 0.5],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          {flower}
        </g>
      ))}
    </svg>
  );
}

type RoomProps = { collected: boolean; onCollect: () => void; onBack: () => void };

/* ───────────── the hub ───────────── */
export default function DoorsChapter() {
  const { hearts, collectHeart, next } = useStory();
  const [opening, setOpening] = useState<DoorId | null>(null);
  const [room, setRoom] = useState<DoorId | null>(null);
  const [flyHeart, setFlyHeart] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(() => {
      setRoom(opening);
      setOpening(null);
    }, 1500);
    return () => clearTimeout(t);
  }, [opening]);

  const allDone = hearts.size >= 3;

  const collect = (d: DoorId) => {
    collectHeart(d);
    setFlyHeart(true);
    setTimeout(() => setFlyHeart(false), 1600);
  };

  const Room = room === "smile" ? SmileRoom : room === "memories" ? MemoriesRoom : room === "love" ? LoveRoom : null;

  return (
    <section className="scene" aria-label="The three magical doors">
      <AnimatePresence mode="wait">
        {Room && room ? (
          <motion.div key={room} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.9 }} className="relative">
            <Room collected={hearts.has(room)} onCollect={() => collect(room)} onBack={() => setRoom(null)} />
          </motion.div>
        ) : (
          <motion.div key="hub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="vignette relative flex min-h-dvh flex-col items-center px-4 pb-10 pt-28 text-center">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#1d1030_0%,#3a2150_40%,#6b3f6e_75%,#47263D_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[radial-gradient(70%_60%_at_50%_100%,rgba(243,220,168,0.35),transparent_70%)]" />
            <ParticleField variant="fireflies" count={30} />
            <Petals count={8} seed={19} />

            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="relative max-w-xs font-serif text-[1.6rem] italic leading-snug text-ivory sm:max-w-md sm:text-4xl">
              {allDone ? "All three hearts are glowing..." : "Three doors. Three little worlds. Each one holds a piece of my heart."}
            </motion.p>

            {/* heart slots */}
            <div className="relative mt-5 flex items-center gap-3" aria-label={`${hearts.size} of 3 golden hearts collected`}>
              {DOORS.map((d) => (
                <motion.div key={d.id} animate={hearts.has(d.id) ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.8 }}>
                  <GoldHeart size={30} filled={hearts.has(d.id)} glow={hearts.has(d.id)} />
                </motion.div>
              ))}
            </div>

            <div className="relative mt-12 grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-8">
              {DOORS.map((d, i) => (
                <motion.button
                  key={d.id}
                  type="button"
                  onClick={() => setOpening(d.id)}
                  disabled={!!opening}
                  className="focus-ring group flex flex-col items-center rounded-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.2, duration: 1 }}
                  aria-label={`Open door: ${d.title}${hearts.has(d.id) ? " (heart collected)" : ""}`}
                >
                  <motion.div whileHover={{ y: -4 }} className="w-full" style={{ filter: `drop-shadow(0 0 18px ${d.glow})` }}>
                    <DoorArt door={d} open={opening === d.id} done={hearts.has(d.id)} />
                  </motion.div>
                  <span className="mt-3 font-serif text-[0.95rem] leading-tight text-ivory sm:text-lg">{d.title}</span>
                </motion.button>
              ))}
            </div>

            <div className="relative mt-10 min-h-[56px]">
              {allDone ? (
                <motion.button type="button" onClick={next} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="btn-magic">
                  Rise into the stars
                </motion.button>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.3em] text-ivory/55">Open each door to collect its heart</p>
              )}
            </div>

            {/* light flood when a door opens */}
            <AnimatePresence>
              {opening && (
                <motion.div
                  className="pointer-events-none fixed inset-0 z-40"
                  style={{ background: `radial-gradient(circle at 50% 55%, #fff9f2 0%, ${DOORS.find((d) => d.id === opening)!.glow} 35%, transparent 75%)` }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0, 1], scale: [0.4, 0.6, 2.2] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, times: [0, 0.5, 1] }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* collected heart flourish */}
      <AnimatePresence>
        {flyHeart && (
          <motion.div
            className="pointer-events-none fixed left-1/2 top-1/2 z-[80] -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2.6, 2.2], opacity: [0, 1, 1], y: [0, 0, -40] }}
            exit={{ opacity: 0, scale: 0.5, y: -260 }}
            transition={{ duration: 1 }}
          >
            <GoldHeart size={64} className="animate-pulse-glow" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
