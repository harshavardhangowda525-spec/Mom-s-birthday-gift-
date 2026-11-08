"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Starfield from "@/components/fx/Starfield";
import ParticleField from "@/components/fx/ParticleField";
import SafeImage from "@/components/ui/SafeImage";
import { useStory } from "@/components/StoryProvider";
import { birthday } from "@/config/birthday";
import { heartLayout } from "@/lib/random";
import { useSize } from "@/lib/useSize";

/** Constellation anchor points as fractions of the sky (portrait friendly). Supports up to 15 photos. */
const SPOTS = [
  [0.5, 0.24], [0.22, 0.33], [0.78, 0.34], [0.3, 0.5], [0.7, 0.52], [0.5, 0.64], [0.2, 0.71],
  [0.8, 0.72], [0.5, 0.42], [0.12, 0.5], [0.88, 0.5], [0.36, 0.8], [0.64, 0.82], [0.35, 0.2], [0.65, 0.2],
];

export default function UniverseChapter() {
  const { next } = useStory();
  const photos = birthday.photos.slice(0, SPOTS.length);
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());
  const [formed, setFormed] = useState(false);
  const [dir, setDir] = useState(0);

  const node = Math.max(58, Math.min(92, w * 0.2));
  const allSeen = seen.size >= photos.length;

  // A dense heart outline: photos sit on evenly spread points, golden stars fill the rest.
  const HEART_N = 28;
  const heart = useMemo(() => heartLayout(HEART_N), []);
  const R = Math.min(w * 0.42, h * 0.28);
  const heartXY = useCallback((k: number) => ({ x: w / 2 + heart[k].x * R, y: h * 0.44 + heart[k].y * R }), [heart, R, w, h]);
  const slots = useMemo(() => photos.map((_, i) => Math.round(((i + 0.5) * HEART_N) / photos.length) % HEART_N), [photos]);
  const positions = useMemo(
    () => photos.map((_, i) => (formed ? heartXY(slots[i]) : { x: SPOTS[i][0] * w, y: SPOTS[i][1] * h })),
    [photos, formed, w, h, heartXY, slots],
  );
  const nodeSize = formed ? node * 0.78 : node;

  const show = useCallback(
    (i: number, d = 0) => {
      const n = (i + photos.length) % photos.length;
      setDir(d);
      setOpen(n);
      setSeen((s) => (s.has(n) ? s : new Set(s).add(n)));
    },
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") show(open + 1, 1);
      if (e.key === "ArrowLeft") show(open - 1, -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (open === null) return;
    if (info.offset.x < -60 || info.velocity.x < -400) show(open + 1, 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) show(open - 1, -1);
  };

  const current = open !== null ? photos[open] : null;

  return (
    <section className="scene" aria-label="The universe of memories">
      <Starfield />
      <div ref={ref} className="absolute inset-0">
        {/* golden constellation lines */}
        {w > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <filter id="line-glow">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {!formed &&
              positions.slice(0, -1).map((p, i) => {
                const q = positions[i + 1];
                return (
                  <motion.line
                    key={`c-${i}`}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ x1: p.x, y1: p.y, x2: q.x, y2: q.y, pathLength: 1, opacity: 0.45 }}
                    exit={{ opacity: 0 }}
                    transition={{ pathLength: { delay: 0.8 + i * 0.25, duration: 1.2 }, opacity: { delay: 0.8 + i * 0.25, duration: 1 } }}
                    stroke="#f3dca8"
                    strokeWidth={1}
                    strokeDasharray="3 5"
                    filter="url(#line-glow)"
                  />
                );
              })}
            {formed &&
              heart.map((_, k) => {
                const p = heartXY(k);
                const q = heartXY((k + 1) % HEART_N);
                return (
                  <motion.line
                    key={`h-${k}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={{ delay: 1.6 + k * 0.05, duration: 0.6 }}
                    stroke="#f3dca8"
                    strokeWidth={1.6}
                    filter="url(#line-glow)"
                  />
                );
              })}
            {formed &&
              heart.map((_, k) => {
                if (slots.includes(k)) return null;
                const p = heartXY(k);
                return (
                  <motion.circle
                    key={`s-${k}`}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill="#fff4d8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ delay: 1.6 + k * 0.05, duration: 2.4, repeat: Infinity }}
                    filter="url(#line-glow)"
                  />
                );
              })}
          </svg>
        )}

        {/* photo stars */}
        {w > 0 &&
          photos.map((p, i) => (
            <motion.button
              key={p.id}
              type="button"
              onClick={() => show(i)}
              aria-label={`Memory ${i + 1}: ${p.alt}${seen.has(i) ? " (seen)" : ""}`}
              className="focus-ring absolute left-0 top-0 rounded-full"
              initial={{ opacity: 0, scale: 0.2, x: positions[i].x - node / 2, y: positions[i].y - node / 2, width: node, height: node }}
              animate={{ opacity: 1, scale: 1, x: positions[i].x - nodeSize / 2, y: positions[i].y - nodeSize / 2, width: nodeSize, height: nodeSize }}
              transition={{ opacity: { delay: 0.3 + i * 0.2, duration: 1 }, scale: { delay: 0.3 + i * 0.2, duration: 1 }, default: { duration: 2.2, ease: [0.22, 1, 0.36, 1] } }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className="absolute inset-[-10px] rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(243,220,168,0.55) 0%, transparent 70%)",
                  animation: `twinkle ${3 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
              <span className={`absolute inset-0 overflow-hidden rounded-full border-2 ${seen.has(i) ? "border-gold-bright" : "border-gold/60"} shadow-[0_0_24px_rgba(243,220,168,0.6)]`}>
                <SafeImage src={p.src} alt="" focus={p.focus} className="h-full w-full" />
              </span>
              {!seen.has(i) && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-gold-bright shadow-[0_0_10px_#f3dca8]" />}
            </motion.button>
          ))}
      </div>

      {/* words */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-[calc(var(--safe-bottom)+28px)] text-center">
        <AnimatePresence mode="wait">
          {!formed ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.5, duration: 1 }} className="flex flex-col items-center">
              <p className="font-serif text-xl italic text-ivory/90">Every star here is a memory. Tap one.</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.3em] text-gold/80">
                {seen.size} / {photos.length} memories explored
              </p>
              {allSeen && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setFormed(true)}
                  className="btn-magic pointer-events-auto mt-4"
                >
                  Gather the stars
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div key="heart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2, duration: 1.6 }} className="flex flex-col items-center">
              <p className="glow-text font-serif text-[1.9rem] italic leading-tight text-ivory sm:text-4xl">Every beautiful memory leads back to you.</p>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={next}
                className="btn-magic pointer-events-auto mt-6"
              >
                Visit the wishing tree
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {formed && <ParticleField variant="dust" count={40} intensity={1.6} />}

      {/* lightbox */}
      <AnimatePresence>
        {current && open !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Memory ${open + 1} of ${photos.length}`}
          >
            <motion.div
              className="absolute inset-0 bg-[#07040b]/75"
              style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
              onClick={() => setOpen(null)}
            />
            <ParticleField variant="dust" count={24} className="z-0" />
            <AnimatePresence mode="popLayout" custom={dir}>
              <motion.div
                key={open}
                className="relative w-full max-w-md cursor-grab touch-pan-y active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                initial={{ opacity: 0, scale: 0.6, x: dir * 120, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, x: dir * -120 }}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
              >
                <div className="relative rounded-lg p-[3px]" style={{ background: "linear-gradient(135deg,#fff4d8,#d6b47c 40%,#b98d4f 70%,#f3dca8)", boxShadow: "0 0 60px rgba(243,220,168,0.45), 0 30px 80px -20px rgba(0,0,0,0.8)" }}>
                  <SafeImage src={current.src} alt={current.alt} focus={current.focus} eager className="max-h-[62dvh] w-full rounded-md object-contain bg-[#120a16]" />
                </div>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }} className="mt-5 text-center font-serif text-[1.35rem] italic leading-snug text-ivory">
                  {current.caption}
                </motion.p>
              </motion.div>
            </AnimatePresence>
            <div className="relative mt-6 flex items-center gap-4">
              <button type="button" onClick={() => show(open - 1, -1)} className="btn-ghost !px-3" aria-label="Previous memory">
                <ChevronLeft size={18} />
              </button>
              <span className="min-w-[4rem] text-center text-xs tracking-[0.3em] text-gold">
                {open + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => show(open + 1, 1)} className="btn-ghost !px-3" aria-label="Next memory">
                <ChevronRight size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="focus-ring absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-plum/60 text-ivory"
              style={{ top: "calc(var(--safe-top) + 68px)" }}
              aria-label="Close memory"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
