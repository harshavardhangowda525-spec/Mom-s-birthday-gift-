"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FastForward, Pause, Play, RotateCcw } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import SafeImage from "@/components/ui/SafeImage";
import { birthday, photoById } from "@/config/birthday";
import { getMusic } from "@/lib/audio";

type KB = { from: [number, number, number]; to: [number, number, number] }; // scale, x%, y%
type Scene = { photo?: string; dur: number; lines: { text: string; at: number; style?: "big" | "hand" | "final" }[]; kb: KB };

/** ~84 second emotional timeline. Edit photo ids / timings freely. */
const SCENES: Scene[] = [
  { photo: "family", dur: 8, lines: [{ text: "Some people make our lives beautiful...", at: 1.2 }], kb: { from: [1.05, 0, 2], to: [1.22, -2, -2] } },
  { photo: "temple", dur: 7, lines: [], kb: { from: [1.25, 2, 0], to: [1.06, -1, 1] } },
  { photo: "tea", dur: 7.5, lines: [{ text: "Not through grand gestures...", at: 1 }], kb: { from: [1.08, 0, 3], to: [1.24, 0, -3] } },
  { photo: "cafe", dur: 7.5, lines: [{ text: "But through a thousand little moments.", at: 1 }], kb: { from: [1.22, -3, 0], to: [1.06, 2, 0] } },
  {
    photo: "family-2",
    dur: 8,
    lines: [
      { text: "The smiles.", at: 0.8 },
      { text: "The laughter.", at: 2.6 },
      { text: "The love.", at: 4.4, style: "big" },
    ],
    kb: { from: [1.05, 2, 2], to: [1.2, -2, -1] },
  },
  { photo: "together", dur: 7, lines: [], kb: { from: [1.2, 0, -3], to: [1.05, 0, 2] } },
  { photo: "temple", dur: 9, lines: [{ text: "Every memory reminds me how lucky I am...", at: 1 }], kb: { from: [1.06, -2, 1], to: [1.28, 3, -2] } },
  { photo: "cafe", dur: 8, lines: [{ text: "To call you my mom.", at: 1, style: "hand" }], kb: { from: [1.1, 0, 0], to: [1.26, -3, 1] } },
  { photo: "portrait", dur: 8, lines: [{ text: "If I could give you one thing...", at: 1.2 }], kb: { from: [1.3, 0, 6], to: [1.08, 0, 0] } },
  { photo: "portrait", dur: 7.5, lines: [{ text: "It would be a lifetime of happiness.", at: 0.8 }], kb: { from: [1.08, 0, 0], to: [1.18, 0, -3] } },
  { dur: 7.5, lines: [{ text: "HAPPY BIRTHDAY, MOM.", at: 0.6, style: "final" }, { text: "I LOVE YOU.", at: 2.4, style: "final" }], kb: { from: [1, 0, 0], to: [1, 0, 0] } },
];

const STARTS = SCENES.reduce<number[]>((acc, s, i) => (acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur), acc), []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur;

function cueAt(t: number) {
  let scene = SCENES.length - 1;
  for (let i = 0; i < SCENES.length; i++) {
    if (t < STARTS[i] + SCENES[i].dur) {
      scene = i;
      break;
    }
  }
  const local = t - STARTS[scene];
  const lines = SCENES[scene].lines.filter((l) => local >= l.at).length;
  return { scene, lines };
}

export default function CinematicFilm({ onEnd }: { onEnd: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [cue, setCue] = useState({ scene: 0, lines: 0 });
  const [take, setTake] = useState(0); // replay counter → remounts Ken Burns
  const t = useRef(0);
  const bar = useRef<HTMLDivElement>(null);
  const ended = useRef(false);
  const playingRef = useRef(true);
  playingRef.current = playing;

  useEffect(() => {
    getMusic().setMood("tender");
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current && !ended.current) {
        t.current = Math.min(TOTAL, t.current + dt);
        const c = cueAt(t.current);
        setCue((prev) => (prev.scene === c.scene && prev.lines === c.lines ? prev : c));
        if (bar.current) bar.current.style.transform = `scaleX(${t.current / TOTAL})`;
        if (t.current >= TOTAL) {
          ended.current = true;
          onEnd();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [onEnd]);

  const replay = useCallback(() => {
    t.current = 0;
    ended.current = false;
    setCue({ scene: 0, lines: 0 });
    setTake((k) => k + 1);
    setPlaying(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scene = SCENES[cue.scene];
  const photo = scene.photo ? photoById(scene.photo) : undefined;
  const state = playing ? "running" : "paused";

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" onClick={() => setPlaying((p) => !p)}>
      <AnimatePresence>
        <motion.div
          key={`${take}-${cue.scene}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          {photo ? (
            <>
              {/* blurred ambient backdrop fills any aspect ratio */}
              <SafeImage src={photo.src} alt="" focus={photo.focus} eager className="absolute inset-0 h-full w-full scale-125 opacity-60 blur-2xl" />
              <div className="absolute inset-0 bg-black/30" />
              {/* Ken Burns hero */}
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
                <div className="relative overflow-hidden rounded-sm shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-gold/30">
                  <div style={{ animation: `kb-${cue.scene} ${scene.dur + 1.6}s linear forwards`, animationPlayState: state }}>
                    <SafeImage
                      src={photo.src}
                      alt={photo.alt}
                      focus={photo.focus}
                      eager
                      className="block h-auto max-h-[70dvh] w-auto max-w-[92vw] sm:max-w-[720px]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(10,4,12,0.6)_100%)]" />
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,#3a1f3d_0%,#120812_70%,#000_100%)]" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ken Burns keyframes generated per scene */}
      <style>{SCENES.map((s, i) => `@keyframes kb-${i}{from{transform:scale(${s.kb.from[0]}) translate(${s.kb.from[1]}%,${s.kb.from[2]}%)}to{transform:scale(${s.kb.to[0]}) translate(${s.kb.to[1]}%,${s.kb.to[2]}%)}}`).join("")}</style>

      {/* light leaks */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen" aria-hidden>
        <div className="absolute -left-1/4 -top-1/4 h-[70%] w-[80%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,170,120,0.45), transparent 65%)", filter: "blur(30px)", animation: "leak 14s ease-in-out infinite", animationPlayState: state }} />
        <div className="absolute -bottom-1/4 -right-1/4 h-[70%] w-[80%] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,167,182,0.4), transparent 65%)", filter: "blur(30px)", animation: "leak 18s ease-in-out -6s infinite reverse", animationPlayState: state }} />
      </div>
      <ParticleField variant="dust" count={34} intensity={playing ? 1 : 0.0001} />
      {/* letterbox */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[7%] bg-gradient-to-b from-black to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/85 to-transparent" />

      {/* typography */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[17%] z-10 flex flex-col items-center px-6 text-center" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {scene.lines.slice(0, cue.lines).map((l, i) => (
            <motion.p
              key={`${take}-${cue.scene}-${i}`}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)", letterSpacing: l.style === "final" ? "0.4em" : "0.02em" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", letterSpacing: l.style === "final" ? "0.12em" : "0.01em" }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className={
                l.style === "final"
                  ? "gold-text font-serif text-[2.1rem] font-semibold leading-tight sm:text-6xl"
                  : l.style === "hand"
                    ? "font-hand text-[2.6rem] leading-tight text-[#fff4d8] drop-shadow-[0_0_20px_rgba(214,180,124,0.9)] sm:text-6xl"
                    : l.style === "big"
                      ? "gold-text font-serif text-[2.4rem] font-semibold italic leading-tight sm:text-6xl"
                      : "font-serif text-[1.65rem] italic leading-snug text-ivory drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-4xl"
              }
            >
              {l.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      {/* paused overlay */}
      <AnimatePresence>
        {!playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/60 bg-plum/60 backdrop-blur">
              <Play className="translate-x-0.5 text-gold-bright" size={30} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--safe-bottom)+14px)]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-[3px] w-full max-w-xl overflow-hidden rounded-full bg-ivory/15">
          <div ref={bar} className="h-full w-full origin-left bg-gradient-to-r from-gold to-gold-bright" style={{ transform: "scaleX(0)" }} />
        </div>
        <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
          <button type="button" className="btn-ghost !px-4" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause film" : "Play film"}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button type="button" className="btn-ghost !px-4" onClick={replay} aria-label="Replay film">
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              ended.current = true;
              onEnd();
            }}
            aria-label="Skip to the end of the film"
          >
            <FastForward size={15} /> Skip
          </button>
        </div>
      </div>
      <span className="sr-only">A memory film for {birthday.momName}.</span>
    </div>
  );
}
