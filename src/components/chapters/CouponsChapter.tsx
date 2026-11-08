"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Coffee, Film, Flower2, Footprints, Heart, Home, RotateCcw, Sparkles } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import Confetti from "@/components/fx/Confetti";
import GoldHeart from "@/components/ui/GoldHeart";
import { useStory } from "@/components/StoryProvider";
import { birthday } from "@/config/birthday";
import { getMusic } from "@/lib/audio";
import { seeded } from "@/lib/random";

const ICONS = { coffee: Coffee, home: Home, film: Film, heart: Heart, walk: Footprints, flower: Flower2 } as const;
type IconKey = keyof typeof ICONS;
const STORE = "magic-of-you:redeemed";

/* ───────────── scratch-off layer ───────────── */
function ScratchLayer({ onReveal, label }: { onReveal: () => void; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(false);
  const moves = useRef(0);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    // shimmering gold foil
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#b98d4f");
    g.addColorStop(0.3, "#f3dca8");
    g.addColorStop(0.5, "#fff4d8");
    g.addColorStop(0.7, "#d6b47c");
    g.addColorStop(1, "#a87d42");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    const rnd = seeded(5);
    for (let i = 0; i < 70; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.4})`;
      ctx.beginPath();
      ctx.arc(rnd() * r.width, rnd() * r.height, rnd() * 1.8 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(71,38,61,0.85)";
    ctx.textAlign = "center";
    const serif = getComputedStyle(document.body).getPropertyValue("--font-cormorant") || "Georgia";
    ctx.font = `600 22px ${serif}, Georgia, serif`;
    ctx.fillText("✦ Scratch here ✦", r.width / 2, r.height / 2 - 4);
    ctx.font = `500 11px system-ui, sans-serif`;
    ctx.fillText("to reveal your gift", r.width / 2, r.height / 2 + 18);
  }, []);

  const check = useCallback(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true });
    if (!c || !ctx || done.current) return;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      total++;
      if (data[i] < 40) clear++;
    }
    if (clear / total > 0.45) {
      done.current = true;
      onReveal();
    }
  }, [onReveal]);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    const ctx = c?.getContext("2d", { willReadFrequently: true });
    if (!c || !ctx || done.current) return;
    const r = c.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 38;
    ctx.beginPath();
    const p = last.current ?? { x, y };
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
    last.current = { x, y };
    if (++moves.current % 6 === 0) check();
  };

  return (
    <canvas
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Scratch to reveal: ${label}. Press Enter to reveal.`}
      className="focus-ring absolute inset-0 h-full w-full cursor-pointer rounded-[18px]"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        last.current = null;
        scratch(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons || e.pointerType === "touch") scratch(e);
      }}
      onPointerUp={() => {
        last.current = null;
        check();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!done.current) {
            done.current = true;
            onReveal();
          }
        }
      }}
    />
  );
}

/* ───────────── one coupon ticket ───────────── */
function Coupon({ index, total, revealed, redeemed, onReveal, onRedeem }: { index: number; total: number; revealed: boolean; redeemed: boolean; onReveal: () => void; onRedeem: () => void }) {
  const c = birthday.coupons[index];
  const Icon = ICONS[(c.icon as IconKey) in ICONS ? (c.icon as IconKey) : "heart"];
  return (
    <div className="relative mx-auto aspect-[4/5] max-h-[52dvh] w-full max-w-[320px]">
      {/* ticket */}
      <div className="paper absolute inset-0 overflow-hidden rounded-[18px]">
        <div className="pointer-events-none absolute inset-2 rounded-[12px] border-2 border-dashed border-gold/60" />
        {/* side notches */}
        <span className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#2c1530]" />
        <span className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#2c1530]" />
        <div className="relative flex h-full flex-col items-center justify-center px-7 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-[#a87d42]">
            Love coupon · {index + 1} of {total}
          </p>
          <motion.div
            className="mt-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose/40 to-gold/40 text-burgundy"
            animate={revealed ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Icon size={30} strokeWidth={1.6} />
          </motion.div>
          <h3 className="mt-4 font-serif text-[1.85rem] font-semibold leading-tight text-burgundy">{c.title}</h3>
          <p className="mt-2 font-hand text-[1.35rem] leading-snug text-[#4a2c3d]">{c.detail}</p>
          <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#7a5a6b]">Valid forever · from {birthday.senderName}</p>
          {revealed && (
            <div className="mt-4 min-h-[44px]">
              {!redeemed ? (
                <button type="button" onClick={onRedeem} className="btn-ghost !border-burgundy/40 !bg-burgundy/5 !text-burgundy">
                  <Heart size={14} /> Redeem
                </button>
              ) : (
                <p className="text-xs font-medium text-burgundy">Show this to your son ❤️</p>
              )}
            </div>
          )}
        </div>
        {/* redeemed stamp */}
        <AnimatePresence>
          {redeemed && (
            <motion.div
              className="pointer-events-none absolute right-5 top-10 flex h-24 w-24 items-center justify-center rounded-full border-[3px] border-rose text-center font-serif text-sm font-semibold uppercase leading-tight tracking-wider text-rose"
              initial={{ scale: 2.2, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 0.85, rotate: -14 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
            >
              <span>
                <Check className="mx-auto" size={18} />
                Redeemed
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* scratch foil */}
      <AnimatePresence>
        {!revealed && (
          <motion.div key="foil" className="absolute inset-3" exit={{ opacity: 0, scale: 1.05, filter: "blur(6px)" }} transition={{ duration: 0.6 }}>
            <ScratchLayer onReveal={onReveal} label={`coupon ${index + 1}`} />
          </motion.div>
        )}
      </AnimatePresence>
      {revealed && <Confetti count={18} seed={index + 40} />}
    </div>
  );
}

/* ───────────── wish lanterns finale ───────────── */
function Lanterns({ onRestart, onBack }: { onRestart: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    getMusic().setMood("tender");
    const ts = [1500, 5000, 8500, 12000].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
    return () => ts.forEach(clearTimeout);
  }, []);
  const lanterns = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: 18 }, (_, i) => ({
      i,
      left: 4 + r() * 88,
      size: 26 + r() * 30,
      delay: 0.2 + r() * 6,
      dur: 13 + r() * 9,
      sway: (r() - 0.5) * 80,
      blur: r() < 0.3 ? 1.5 : 0,
    }));
  }, []);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6 }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b0a22_0%,#1d1236_45%,#47263D_85%,#6b3456_100%)]" />
      <ParticleField variant="stars" count={120} />
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[radial-gradient(80%_100%_at_50%_100%,rgba(243,190,130,0.35),transparent_70%)]" />
      {/* her lantern, released first from the centre */}
      <div
        className="absolute bottom-[-12%] left-1/2 -ml-[34px]"
        style={{ animation: "lantern-rise 24s ease-in 0.2s forwards", "--sway": "-30px" } as React.CSSProperties}
      >
        <LanternShape size={68} />
      </div>
      {lanterns.map((l) => (
        <div
          key={l.i}
          className="absolute bottom-[-14%] opacity-0"
          style={{ left: `${l.left}%`, filter: l.blur ? `blur(${l.blur}px)` : undefined, animation: `lantern-rise ${l.dur}s ease-in ${l.delay}s infinite`, "--sway": `${l.sway}px` } as React.CSSProperties}
        >
          <LanternShape size={l.size} />
        </div>
      ))}

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 pb-[calc(var(--safe-bottom)+24px)] text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(11,10,34,0.75),transparent)]" />
        <div className="relative min-h-[9rem] [text-shadow:0_2px_18px_rgba(11,10,34,0.95)]">
          <AnimatePresence mode="wait">
            {step >= 1 && step < 3 && (
              <motion.p key={step} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.4 }} className="font-serif text-[1.75rem] italic leading-snug text-ivory sm:text-4xl">
                {step === 1 ? "Every wish you made today..." : "is now floating up to the stars."}
              </motion.p>
            )}
            {step >= 3 && (
              <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2 }} className="flex flex-col items-center">
                <GoldHeart size={54} className="animate-pulse-glow" />
                <p className="mt-5 max-w-sm font-hand text-[2.3rem] leading-tight text-[#fff4d8] drop-shadow-[0_0_18px_rgba(214,180,124,0.9)] sm:text-5xl">{birthday.lanternMessage}</p>
                <p className="gold-text mt-5 font-serif text-[1.6rem] font-semibold tracking-[0.12em] sm:text-3xl">HAPPY BIRTHDAY, {birthday.momTitle.toUpperCase()}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative mt-10 flex w-full max-w-[320px] flex-col gap-3">
            <button type="button" onClick={onRestart} className="btn-magic w-full">
              <RotateCcw size={15} /> Relive the magic
            </button>
            <button type="button" onClick={onBack} className="btn-ghost w-full">
              <ArrowLeft size={14} /> Back to my coupons
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function LanternShape({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size * 1.25, animation: "lantern-flicker 2.4s ease-in-out infinite" }}>
      <svg viewBox="0 0 40 50" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="lantern-glow" cx="50%" cy="70%" r="70%">
            <stop offset="0%" stopColor="#fff4d0" />
            <stop offset="45%" stopColor="#ffbf6b" />
            <stop offset="100%" stopColor="#e0703f" />
          </radialGradient>
        </defs>
        <ellipse cx="20" cy="28" rx="34" ry="34" fill="#ffb560" opacity="0.18" />
        <path d="M8 6 C 6 20, 6 34, 11 44 L 29 44 C 34 34, 34 20, 32 6 C 26 3, 14 3, 8 6 Z" fill="url(#lantern-glow)" />
        <path d="M14 5 C 13 20, 13 34, 15 44 M26 5 C 27 20, 27 34, 25 44" stroke="#c9653a" strokeWidth="0.6" opacity="0.5" fill="none" />
        <rect x="11" y="43" width="18" height="3" rx="1" fill="#8a4a2a" />
        <ellipse cx="20" cy="40" rx="3" ry="4" fill="#fff9e6" />
      </svg>
    </div>
  );
}

/* ───────────── chapter ───────────── */
export default function CouponsChapter() {
  const { restart, goTo } = useStory();
  const total = birthday.coupons.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [redeemed, setRedeemed] = useState<Set<number>>(() => new Set());
  const [intro, setIntro] = useState(true);
  const [lanterns, setLanterns] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "[]") as number[];
      if (saved.length) setRedeemed(new Set(saved));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const reveal = useCallback(
    (k: number) => {
      setRevealed((s) => new Set(s).add(k));
      getMusic().chime();
    },
    [],
  );
  const redeem = (k: number) => {
    setRedeemed((s) => {
      const n = new Set(s).add(k);
      try {
        localStorage.setItem(STORE, JSON.stringify([...n]));
      } catch {
        /* ignore */
      }
      return n;
    });
    getMusic().chime();
  };
  const go = (d: number) => {
    setDir(d);
    setI((x) => (x + d + total) % total);
  };
  const allRevealed = revealed.size >= total;

  if (lanterns) {
    return (
      <section className="scene" aria-label="Wish lanterns">
        <Lanterns onRestart={restart} onBack={() => setLanterns(false)} />
      </section>
    );
  }

  return (
    <section className="scene" aria-label="One last surprise: love coupons">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,#5b3352_0%,#2c1530_50%,#120812_100%)]" />
      <ParticleField variant="fireflies" count={24} />
      <Petals count={8} seed={303} />

      <AnimatePresence mode="wait">
        {intro ? (
          <motion.div key="intro" className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 text-center" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.6 }}>
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.3 }}>
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-bright to-gold text-plum shadow-[0_0_60px_rgba(243,220,168,0.6)]">
                <Sparkles size={40} />
              </div>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1.2 }} className="mt-8 text-[11px] font-semibold uppercase tracking-[0.4em] text-gold">
              One last surprise
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1.2 }} className="mt-3 font-serif text-[2.6rem] font-semibold leading-tight text-ivory sm:text-6xl">
              Your <span className="gold-text italic">Love Coupons</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.2 }} className="mt-4 max-w-xs font-serif text-xl italic leading-snug text-ivory/85 sm:max-w-md">
              Not just words. Real gifts from me to you, that you can redeem any day you like.
            </motion.p>
            <motion.button type="button" onClick={() => setIntro(false)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }} className="btn-magic mt-9">
              Open my coupons
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="deck" className="relative z-10 flex min-h-dvh flex-col items-center px-5 pb-[calc(var(--safe-bottom)+20px)] pt-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <p className="font-serif text-[1.3rem] italic text-ivory/90">{revealed.has(i) ? "A gift, just for you ❤️" : "Scratch the gold to reveal your gift"}</p>
            <div className="relative mt-5 w-full" style={{ perspective: 1200 }}>
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: dir * 140, rotateY: dir * 35 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: dir * -140, rotateY: dir * -35 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                  <Coupon index={i} total={total} revealed={revealed.has(i)} redeemed={redeemed.has(i)} onReveal={() => reveal(i)} onRedeem={() => redeem(i)} />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button type="button" onClick={() => go(-1)} className="btn-ghost !px-3" aria-label="Previous coupon">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5" aria-label={`${revealed.size} of ${total} coupons revealed`}>
                {birthday.coupons.map((_, k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setDir(k > i ? 1 : -1);
                      setI(k);
                    }}
                    aria-label={`Coupon ${k + 1}`}
                    className={`h-2.5 rounded-full transition-all ${k === i ? "w-6 bg-gold" : revealed.has(k) ? "w-2.5 bg-rose" : "w-2.5 bg-ivory/25"}`}
                  />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} className="btn-ghost !px-3" aria-label="Next coupon">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-5 min-h-[56px]">
              {allRevealed ? (
                <motion.button type="button" onClick={() => setLanterns(true)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: [1, 1.04, 1] }} transition={{ scale: { duration: 2, repeat: Infinity }, opacity: { duration: 0.8 } }} className="btn-magic">
                  <Sparkles size={16} /> Release a wish lantern
                </motion.button>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold/80">
                  {revealed.size} / {total} gifts revealed
                </p>
              )}
            </div>
            <button type="button" onClick={() => goTo("keepsake")} className="mt-2 text-[10px] uppercase tracking-[0.3em] text-ivory/45 hover:text-ivory/80">
              ‹ Back to the keepsake
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
