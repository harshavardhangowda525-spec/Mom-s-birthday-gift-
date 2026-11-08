"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Starfield from "@/components/fx/Starfield";
import ParticleField from "@/components/fx/ParticleField";
import SafeImage from "@/components/ui/SafeImage";
import { birthday, portraitPhoto } from "@/config/birthday";
import { heartLayout, seeded } from "@/lib/random";
import { useSize } from "@/lib/useSize";
import { getMusic } from "@/lib/audio";

const MESSAGES = ["The magic was never in the stars...", "It was never in the flowers...", "It was never in this little world..."];
const HEART_POINTS = 26;

/**
 * Timeline (seconds): 0 photos drift in as stars · 3 lines connect · 6 heart forms ·
 * 9 portrait revealed · 10.5/14/17.5 messages · 21.5 final golden message · 29 done
 */
export default function FinaleConstellation({ onDone }: { onDone: () => void }) {
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const [step, setStep] = useState(0);
  const portrait = portraitPhoto();
  const photos = useMemo(() => birthday.photos.filter((p) => p.id !== portrait?.id), [portrait]);

  useEffect(() => {
    getMusic().setMood("tender");
    const at = [3, 6, 9, 10.5, 14, 17.5, 21.5, 29];
    const ts = at.map((s, i) => setTimeout(() => setStep(i + 1), s * 1000));
    return () => ts.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    if (step === 8) onDone();
  }, [step, onDone]);

  const heart = useMemo(() => heartLayout(HEART_POINTS), []);
  const scatter = useMemo(() => {
    const r = seeded(91);
    return Array.from({ length: HEART_POINTS }, () => ({ x: 0.08 + r() * 0.84, y: 0.14 + r() * 0.7 }));
  }, []);
  // which heart points carry photos (evenly spread)
  const photoSlots = useMemo(() => photos.map((_, i) => Math.round((i * HEART_POINTS) / photos.length)), [photos]);

  const formed = step >= 2;
  const R = Math.min(w * 0.42, h * 0.27);
  const cx = w / 2;
  const cy = h * 0.4;
  const pos = (i: number) => (formed ? { x: cx + heart[i].x * R, y: cy + heart[i].y * R } : { x: scatter[i].x * w, y: scatter[i].y * h });
  const node = Math.max(40, Math.min(64, w * 0.12));
  const portraitSize = Math.max(110, Math.min(190, w * 0.36));

  const msgIndex = step >= 4 && step <= 6 ? step - 4 : -1;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <Starfield dense={130} />

      {w > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {heart.map((_, i) => {
            const a = pos(i);
            const b = pos((i + 1) % HEART_POINTS);
            return (
              <motion.line
                key={i}
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y, opacity: step >= 1 ? (step >= 7 ? 1 : 0.7) : 0, pathLength: step >= 1 ? 1 : 0 }}
                transition={{ default: { duration: 2.6, ease: [0.22, 1, 0.36, 1] }, pathLength: { delay: i * 0.05, duration: 1.4 }, opacity: { duration: 1 } }}
                stroke="#f3dca8"
                strokeWidth={step >= 7 ? 2 : 1.2}
                style={{ filter: "drop-shadow(0 0 4px rgba(243,220,168,0.9))" }}
              />
            );
          })}
        </svg>
      )}

      {w > 0 &&
        heart.map((_, i) => {
          const pi = photoSlots.indexOf(i);
          const p = pos(i);
          if (pi >= 0) {
            const photo = photos[pi];
            return (
              <motion.div
                key={i}
                className="absolute left-0 top-0 overflow-hidden rounded-full border-2 border-gold-bright"
                style={{ width: node, height: node, boxShadow: "0 0 22px rgba(243,220,168,0.8)" }}
                initial={{ opacity: 0, scale: 0, x: p.x - node / 2, y: p.y - node / 2 }}
                animate={{ opacity: 1, scale: 1, x: p.x - node / 2, y: p.y - node / 2 }}
                transition={{ opacity: { delay: pi * 0.25, duration: 1.2 }, scale: { delay: pi * 0.25, duration: 1.2 }, default: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } }}
              >
                <SafeImage src={photo.src} alt={photo.alt} focus={photo.focus} className="h-full w-full" />
              </motion.div>
            );
          }
          return (
            <motion.span
              key={i}
              className="absolute left-0 top-0 h-2 w-2 rounded-full bg-gold-bright"
              style={{ boxShadow: "0 0 10px 3px rgba(243,220,168,0.8)" }}
              initial={{ opacity: 0, x: p.x - 4, y: p.y - 4 }}
              animate={{ opacity: [0.4, 1, 0.4], x: p.x - 4, y: p.y - 4 }}
              transition={{ opacity: { duration: 2.4, repeat: Infinity, delay: (i % 5) * 0.3 }, default: { duration: 2.6, ease: [0.22, 1, 0.36, 1] } }}
            />
          );
        })}

      {/* centre portrait */}
      <AnimatePresence>
        {step >= 3 && portrait && (
          <motion.div
            className="absolute rounded-full"
            style={{ left: cx - portraitSize / 2, top: cy - portraitSize / 2 + R * 0.05, width: portraitSize, height: portraitSize }}
            initial={{ opacity: 0, scale: 0.3, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute -inset-6 rounded-full" style={{ background: "radial-gradient(circle, rgba(243,220,168,0.7), transparent 70%)", animation: "pulse-glow 3s ease-in-out infinite" }} />
            <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-gold-bright shadow-[0_0_60px_rgba(243,220,168,0.8)]">
              <SafeImage src={portrait.src} alt={portrait.alt} focus={portrait.focus} eager className="h-full w-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* golden illumination for the final line */}
      <AnimatePresence>
        {step >= 7 && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(circle at 50% 40%, rgba(255,244,216,0.55) 0%, rgba(243,220,168,0.25) 30%, transparent 65%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7] }}
            transition={{ duration: 3 }}
          />
        )}
      </AnimatePresence>
      {step >= 7 && <ParticleField variant="dust" count={70} intensity={2} />}

      {/* words */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex min-h-[34%] flex-col items-center justify-center px-6 pb-[calc(var(--safe-bottom)+20px)] text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          {msgIndex >= 0 && (
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 1.4 }}
              className="font-serif text-[1.75rem] italic leading-snug text-ivory sm:text-4xl"
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          )}
          {step >= 7 && (
            <motion.h2
              key="final"
              initial={{ opacity: 0, scale: 0.85, letterSpacing: "0.3em", filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0.04em", filter: "blur(0px)" }}
              transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-[2.1rem] font-semibold leading-[1.1] sm:text-6xl"
            >
              <span className="gold-text glow-text">THE MAGIC HAS ALWAYS BEEN YOU, {birthday.momTitle.toUpperCase()}.</span> <span aria-label="love">❤️</span>
            </motion.h2>
          )}
        </AnimatePresence>
        {step >= 7 && (
          <motion.button
            type="button"
            onClick={onDone}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 1 }}
            className="btn-ghost mt-6"
          >
            Celebrate ✦
          </motion.button>
        )}
      </div>
    </div>
  );
}
