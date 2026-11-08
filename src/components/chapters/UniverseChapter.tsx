"use client";

import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Starfield from "@/components/fx/Starfield";
import ParticleField from "@/components/fx/ParticleField";
import Confetti from "@/components/fx/Confetti";
import SafeImage from "@/components/ui/SafeImage";
import { useStory } from "@/components/StoryProvider";
import { birthday, type FamilyPhoto } from "@/config/birthday";
import { heartPoint } from "@/lib/random";
import { useSize } from "@/lib/useSize";
import { getMusic } from "@/lib/audio";

/**
 * The Universe of Memories: a constellation puzzle.
 * A dotted heart with empty star-spots glows in the sky; Mom drags (or taps)
 * each photo-star into a spot. When the pattern is complete, it bursts into
 * a giant glowing heart.
 */

const DENSE = 240;
const FILLERS = 28;

/** Heart outline sampled densely, with cumulative arc length (unit space). */
const OUTLINE = (() => {
  const pts = Array.from({ length: DENSE }, (_, i) => heartPoint((i / DENSE) * Math.PI * 2));
  const cum = [0];
  for (let i = 1; i <= DENSE; i++) {
    const a = pts[i - 1];
    const b = pts[i % DENSE];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[DENSE];
  /** dense index at a fraction of the total arc length (0 = top dip) */
  const at = (f: number) => {
    const target = (((f % 1) + 1) % 1) * total;
    let i = 0;
    while (i < DENSE && cum[i + 1] < target) i++;
    return i % DENSE;
  };
  return { pts, at };
})();
const SPRING = { type: "spring" as const, stiffness: 220, damping: 24 };
const HEART_PATH = "M0 22 C -26 4, -32 -16, -18 -24 C -9 -29, -2 -24, 0 -16 C 2 -24, 9 -29, 18 -24 C 32 -16, 26 4, 0 22 Z";

type Pt = { x: number; y: number };

function PhotoStar({
  photo,
  index,
  pos,
  size,
  placed,
  selected,
  locked,
  onDrop,
  onTap,
}: {
  photo: FamilyPhoto;
  index: number;
  pos: Pt;
  size: number;
  placed: boolean;
  selected: boolean;
  locked: boolean;
  onDrop: (i: number, center: Pt) => boolean;
  onTap: (i: number) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prev = useRef(pos);

  // When the resting position changes (snapped into a slot), keep the star
  // visually where it was dropped, then glide it into place.
  useLayoutEffect(() => {
    const dx = prev.current.x - pos.x;
    const dy = prev.current.y - pos.y;
    if (dx || dy) {
      x.set(x.get() + dx);
      y.set(y.get() + dy);
      animate(x, 0, SPRING);
      animate(y, 0, SPRING);
    }
    prev.current = pos;
  }, [pos, x, y]);

  return (
    <motion.button
      type="button"
      className="focus-ring absolute rounded-full"
      style={{ left: pos.x - size / 2, top: pos.y - size / 2, width: size, height: size, x, y, zIndex: selected ? 30 : placed ? 10 : 20, touchAction: "none" }}
      drag={!placed && !locked}
      dragMomentum={false}
      dragElastic={0.2}
      whileDrag={{ scale: 1.18 }}
      onDragEnd={() => {
        const ok = onDrop(index, { x: pos.x + x.get(), y: pos.y + y.get() });
        if (!ok) {
          animate(x, 0, SPRING);
          animate(y, 0, SPRING);
        }
      }}
      onTap={() => !placed && !locked && onTap(index)}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !placed && !locked) {
          e.preventDefault();
          onTap(index);
        }
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: selected ? 1.15 : 1 }}
      transition={{ opacity: { delay: 0.6 + index * 0.15, duration: 0.8 }, scale: { type: "spring", stiffness: 260, damping: 18 } }}
      aria-label={placed ? `${photo.alt}, placed in the heart` : `${photo.alt}. Drag it onto an empty star, or select it and then choose a star.`}
      aria-pressed={selected}
    >
      <span
        className="pointer-events-none absolute inset-[-10px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(243,220,168,0.6) 0%, transparent 70%)", animation: `twinkle ${3 + (index % 3)}s ease-in-out ${index * 0.3}s infinite` }}
      />
      <span className={`pointer-events-none absolute inset-0 overflow-hidden rounded-full border-2 ${selected ? "border-white" : "border-gold-bright"} shadow-[0_0_24px_rgba(243,220,168,0.7)]`}>
        <SafeImage src={photo.src} alt="" focus={photo.focus} className="h-full w-full" />
      </span>
      {selected && <span className="pointer-events-none absolute inset-[-6px] animate-ping rounded-full border-2 border-gold-bright/80" />}
    </motion.button>
  );
}

export default function UniverseChapter() {
  const { next } = useStory();
  const photos = birthday.photos.slice(0, 12);
  const n = photos.length;
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  /** slotOf[photoIndex] = slot index or -1 */
  const [slotOf, setSlotOf] = useState<number[]>(() => photos.map(() => -1));
  const [selected, setSelected] = useState<number | null>(null);
  const [stage, setStage] = useState<"puzzle" | "connect" | "boom">("puzzle");

  const size = Math.max(50, Math.min(76, w * 0.15));
  const R = Math.min(w * 0.4, h * 0.25);
  const cx = w / 2;
  const cy = h * 0.4;
  const heartXY = useCallback((k: number): Pt => ({ x: cx + OUTLINE.pts[k].x * R, y: cy + OUTLINE.pts[k].y * R }), [R, cx, cy]);
  // Spots evenly spaced along the heart (symmetric, with one at the bottom tip for odd counts).
  const slotPoints = useMemo(() => photos.map((_, i) => OUTLINE.at((i + 0.5) / n)), [photos, n]);
  const fillerPoints = useMemo(
    () =>
      Array.from({ length: FILLERS }, (_, j) => OUTLINE.at(j / FILLERS)).filter((k) =>
        slotPoints.every((sk) => Math.min(Math.abs(sk - k), DENSE - Math.abs(sk - k)) > 6),
      ),
    [slotPoints],
  );
  const slots = useMemo(() => slotPoints.map(heartXY), [slotPoints, heartXY]);

  // Photos wait in a softly curved "tray" of stars at the bottom of the sky.
  const homes = useMemo(() => {
    const perRow = Math.ceil(n / 2);
    return photos.map((_, i) => {
      const row = i < perRow ? 0 : 1;
      const inRow = row === 0 ? perRow : n - perRow;
      const col = row === 0 ? i : i - perRow;
      const span = Math.min(w - size - 24, (inRow - 1) * (size + 18));
      const x = inRow === 1 ? w / 2 : w / 2 - span / 2 + (col / (inRow - 1)) * span;
      const y = h * (row === 0 ? 0.735 : 0.835) + Math.sin(col * 1.3) * 6;
      return { x, y };
    });
  }, [photos, n, w, h, size]);

  const placedCount = slotOf.filter((s) => s >= 0).length;
  const freeSlot = (k: number) => !slotOf.includes(k);

  const place = useCallback((i: number, k: number) => {
    setSlotOf((prev) => {
      if (prev.includes(k) || prev[i] >= 0) return prev;
      const nextS = [...prev];
      nextS[i] = k;
      if (nextS.every((s) => s >= 0)) {
        setTimeout(() => setStage("connect"), 500);
        setTimeout(() => {
          setStage("boom");
          getMusic().playBirthdayTune();
        }, 2600);
      }
      return nextS;
    });
    setSelected(null);
    getMusic().chime();
  }, []);

  const onDrop = (i: number, c: Pt) => {
    let best = -1;
    let bestD = Infinity;
    slots.forEach((s, k) => {
      if (!freeSlot(k)) return;
      const d = Math.hypot(s.x - c.x, s.y - c.y);
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    });
    if (best >= 0 && bestD < size * 1.1) {
      place(i, best);
      return true;
    }
    return false;
  };

  const onTap = (i: number) => setSelected((s) => (s === i ? null : i));
  const done = stage !== "puzzle";
  const outline = OUTLINE.pts.map((_, k) => heartXY(k));
  const outlineD = w ? `M${outline.map((p) => `${p.x} ${p.y}`).join(" L")} Z` : "";

  return (
    <section className="scene" aria-label="The universe of memories">
      <Starfield />
      <div ref={ref} className="absolute inset-0">
        {w > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <filter id="u-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="u-heart-fill" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#fff4d8" />
                <stop offset="45%" stopColor="#f3dca8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#E8A7B6" stopOpacity="0.55" />
              </radialGradient>
            </defs>
            {/* the pattern to match: a faint dotted heart */}
            <motion.path
              d={outlineD}
              fill="none"
              stroke="#f3dca8"
              strokeWidth={done ? 2 : 1.2}
              strokeDasharray={done ? "0" : "2 7"}
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: done ? 1 : 0.55 }}
              transition={{ duration: 1.2 }}
              filter={done ? "url(#u-glow)" : undefined}
            />
            {/* golden lines drawing between the stars */}
            {stage !== "puzzle" && (
              <motion.path
                d={outlineD}
                fill="none"
                stroke="#fff4d8"
                strokeWidth="2.5"
                filter="url(#u-glow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            )}
            {/* small filler stars along the outline */}
            {fillerPoints.map((k) => (
              <circle key={k} cx={outline[k].x} cy={outline[k].y} r={done ? 2.6 : 1.6} fill="#fff4d8" opacity={done ? 1 : 0.6} filter="url(#u-glow)" />
            ))}
            {/* the heart blowing up */}
            {stage === "boom" && (
              <g transform={`translate(${cx} ${cy + R * 0.06})`}>
                <motion.path
                  d={HEART_PATH}
                  fill="url(#u-heart-fill)"
                  initial={{ scale: 0.05, opacity: 0 }}
                  animate={{ scale: [0.05, (R / 26) * 1.12, R / 26], opacity: [0, 1, 0.92] }}
                  transition={{ duration: 1.4, times: [0, 0.6, 1], ease: "easeOut" }}
                  filter="url(#u-glow)"
                />
                {[0, 1, 2].map((k) => (
                  <motion.path
                    key={k}
                    d={HEART_PATH}
                    fill="none"
                    stroke="#f3dca8"
                    strokeWidth={1.2}
                    initial={{ scale: R / 26, opacity: 0.9 }}
                    animate={{ scale: (R / 26) * (2.4 + k * 0.5), opacity: 0 }}
                    transition={{ duration: 2.2, delay: 0.5 + k * 0.35, repeat: Infinity, repeatDelay: 1.2 }}
                  />
                ))}
              </g>
            )}
          </svg>
        )}

        {/* empty star spots (tap targets when a photo is selected) */}
        {w > 0 &&
          !done &&
          slots.map((s, k) =>
            freeSlot(k) ? (
              <button
                key={k}
                type="button"
                onClick={() => selected !== null && place(selected, k)}
                className={`focus-ring absolute rounded-full border-2 border-dashed transition-colors ${selected !== null ? "border-gold-bright bg-gold/15" : "border-gold/50 bg-gold/5"}`}
                style={{ left: s.x - size / 2, top: s.y - size / 2, width: size, height: size, animation: "twinkle 2.6s ease-in-out infinite" }}
                aria-label={`Empty star ${k + 1} in the heart${selected !== null ? ": place the selected photo here" : ""}`}
              />
            ) : null,
          )}

        {/* photo stars */}
        {w > 0 &&
          photos.map((p, i) => (
            <PhotoStar
              key={p.id}
              photo={p}
              index={i}
              pos={slotOf[i] >= 0 ? slots[slotOf[i]] : homes[i]}
              size={size}
              placed={slotOf[i] >= 0}
              selected={selected === i}
              locked={done}
              onDrop={onDrop}
              onTap={onTap}
            />
          ))}

        {/* flash when it blows up */}
        <AnimatePresence>
          {stage === "boom" && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-40"
              style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,249,242,0.95) 0%, rgba(243,220,168,0.5) 25%, transparent 60%)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.3, times: [0, 0.3, 1] }}
            />
          )}
        </AnimatePresence>
      </div>

      {stage === "boom" && <Confetti count={50} seed={17} />}
      {stage === "boom" && <ParticleField variant="dust" count={60} intensity={2} />}

      {/* instructions + result */}
      <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--safe-top)+84px)] z-30 px-6 text-center">
        <AnimatePresence mode="wait">
          {!done && (
            <motion.div key="hint" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.8, duration: 1 }}>
              <p className="font-serif text-[1.15rem] italic leading-snug text-ivory/90 sm:text-2xl">Place every memory on the stars to complete the pattern.</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-gold/80">
                Drag a photo onto a star · {placedCount} / {n}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center px-6 pb-[calc(var(--safe-bottom)+28px)] text-center">
        <AnimatePresence>
          {stage === "boom" && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 1.4 }} className="flex flex-col items-center">
              <p className="glow-text font-serif text-[1.9rem] italic leading-tight text-ivory [text-shadow:0_2px_16px_rgba(7,4,11,0.95)] sm:text-4xl">Every beautiful memory leads back to you.</p>
              <motion.button type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3 }} onClick={next} className="btn-magic pointer-events-auto mt-6">
                Visit the wishing tree
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
