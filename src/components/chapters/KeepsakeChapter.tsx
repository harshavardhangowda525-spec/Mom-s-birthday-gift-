"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Download, Mail, Printer, RotateCcw, X } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import Petals from "@/components/fx/Petals";
import SafeImage from "@/components/ui/SafeImage";
import GoldHeart from "@/components/ui/GoldHeart";
import { useStory } from "@/components/StoryProvider";
import { birthday, portraitPhoto } from "@/config/birthday";
import { renderKeepsake } from "@/lib/renderKeepsake";

function Corner({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 60 60" className={`pointer-events-none absolute h-14 w-14 ${className}`} aria-hidden>
      <path d="M4 4 C 20 6, 34 14, 44 30" stroke="#b98d4f" strokeWidth="1.2" fill="none" />
      <path d="M4 4 C 6 20, 14 34, 30 44" stroke="#b98d4f" strokeWidth="1.2" fill="none" />
      {[0, 72, 144, 216, 288].map((r) => (
        <ellipse key={r} cx="10" cy="4" rx="3.5" ry="6" fill="#E8A7B6" transform={`rotate(${r} 10 10)`} />
      ))}
      <circle cx="10" cy="10" r="3" fill="#d6b47c" />
      <circle cx="30" cy="20" r="3" fill="#B9A5D1" />
      <circle cx="20" cy="30" r="3" fill="#B9A5D1" />
    </svg>
  );
}

export default function KeepsakeChapter() {
  const { restart } = useStory();
  const portrait = portraitPhoto();
  const [letter, setLetter] = useState(false);
  const [secret, setSecret] = useState(false);
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "error">("idle");

  useEffect(() => {
    if (!letter && !secret) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLetter(false);
        setSecret(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [letter, secret]);

  const save = async () => {
    setSaving("busy");
    try {
      const blob = await renderKeepsake();
      if (!blob) throw new Error("render failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `happy-birthday-${birthday.momName.toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setSaving("done");
    } catch {
      setSaving("error");
    }
  };

  return (
    <section className="scene" aria-label="A little piece of forever">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_20%,#5b3352_0%,#2c1530_50%,#120812_100%)]" />
      <ParticleField variant="fireflies" count={26} />
      <Petals count={10} seed={202} />

      {/* the hidden heart */}
      <button
        type="button"
        onClick={() => setSecret(true)}
        className="focus-ring absolute left-[7%] top-[46%] z-20 rounded-full p-2 opacity-50 transition hover:opacity-100"
        aria-label="A hidden glowing heart"
        style={{ animation: "twinkle 3.5s ease-in-out infinite" }}
      >
        <GoldHeart size={18} />
      </button>

      <div className="relative z-10 flex min-h-dvh flex-col items-center px-5 pb-[calc(var(--safe-bottom)+28px)] pt-28 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} className="font-serif text-[1.4rem] italic text-ivory/90 sm:text-3xl">
          Something to keep, forever.
        </motion.p>

        {/* the card */}
        <motion.div
          id="keepsake-card"
          initial={{ opacity: 0, y: 40, rotateX: 25 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="paper relative mt-6 w-full max-w-[360px] rounded-md px-6 pb-7 pt-6"
          style={{ transformPerspective: 1000 }}
        >
          <div className="pointer-events-none absolute inset-2 rounded-sm border-2 border-gold/80" />
          <div className="pointer-events-none absolute inset-[13px] rounded-sm border border-gold/50" />
          <Corner className="left-1 top-1" />
          <Corner className="right-1 top-1 rotate-90" />
          <Corner className="bottom-1 left-1 -rotate-90" />
          <Corner className="bottom-1 right-1 rotate-180" />

          <div className="relative mx-auto mt-3 aspect-[4/5] w-[70%] overflow-hidden rounded-t-full border-[3px] border-gold shadow-[0_10px_30px_-10px_rgba(71,38,61,0.6)]">
            {portrait && <SafeImage src={portrait.src} alt={portrait.alt} focus={portrait.focus} className="h-full w-full" />}
          </div>
          <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.4em] text-[#a87d42]">The Magic of You</p>
          <h2 className="mt-1 font-serif text-[2.1rem] font-semibold leading-none text-burgundy">Happy Birthday</h2>
          <p className="gold-text mt-1 font-serif text-[1.9rem] italic font-medium">{birthday.momName}</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#7a5a6b]">{birthday.birthdayDateLabel}</p>
          <p className="mx-auto mt-3 max-w-[16rem] font-serif text-[1.02rem] italic leading-snug text-[#4a2c3d]">{birthday.keepsakeMessage}</p>
          <p className="mt-3 font-hand text-[1.6rem] leading-none text-burgundy">With love, {birthday.senderSignature.toLowerCase()} ♥</p>
        </motion.div>

        {/* actions */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 1 }} className="mt-8 flex w-full max-w-[360px] flex-col gap-3">
          <button type="button" onClick={save} disabled={saving === "busy"} className="btn-magic w-full">
            <Download size={16} /> {saving === "busy" ? "Preparing…" : saving === "done" ? "Saved ✓ — save again" : "Save this memory"}
          </button>
          {saving === "error" && <p className="text-xs text-rose">Couldn’t create the image — try “Print / PDF” instead.</p>}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setLetter(true)} className="btn-ghost">
              <Mail size={15} /> Read my letter
            </button>
            <button type="button" onClick={() => window.print()} className="btn-ghost">
              <Printer size={15} /> Print / PDF
            </button>
          </div>
          <button type="button" onClick={restart} className="btn-ghost w-full">
            <RotateCcw size={15} /> Relive the magic
          </button>
        </motion.div>
      </div>

      {/* the letter */}
      <AnimatePresence>
        {letter && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto px-5 py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="A letter for Mom">
            <div className="fixed inset-0 bg-[#0c0612]/80 backdrop-blur-sm" onClick={() => setLetter(false)} />
            <motion.article
              className="paper relative w-full max-w-md rounded-md px-7 pb-8 pt-9 text-left"
              style={{ transformOrigin: "top center" }}
              initial={{ rotateX: -70, y: 40, opacity: 0 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <button type="button" onClick={() => setLetter(false)} className="focus-ring absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-burgundy hover:bg-burgundy/10" aria-label="Close letter">
                <X size={18} />
              </button>
              <p className="font-hand text-[2rem] text-burgundy">{birthday.letter.greeting}</p>
              <div className="mt-3 space-y-3">
                {birthday.letter.paragraphs.map((p, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 + i * 0.6, duration: 0.9 }} className="font-serif text-[1.12rem] leading-relaxed text-[#4a2c3d]">
                    {p}
                  </motion.p>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + birthday.letter.paragraphs.length * 0.6 }} className="mt-6 text-right">
                <p className="font-serif italic text-[#7a5a6b]">{birthday.letter.signoff}</p>
                <p className="font-hand text-[2rem] leading-tight text-burgundy">{birthday.senderSignature} ♥</p>
              </motion.div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the secret */}
      <AnimatePresence>
        {secret && (
          <motion.div className="fixed inset-0 z-[70] flex flex-col items-center justify-center px-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="A secret message" onClick={() => setSecret(false)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(243,220,168,0.35)_0%,#120812_60%)] backdrop-blur-sm" />
            <ParticleField variant="dust" count={40} intensity={1.6} />
            <motion.div initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 90, damping: 12 }} className="relative">
              <GoldHeart size={90} className="animate-pulse-glow" />
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 1.4 }} className="relative mt-8 max-w-sm font-hand text-[2.3rem] leading-tight text-[#fff4d8] drop-shadow-[0_0_18px_rgba(214,180,124,0.9)] sm:text-5xl">
              {birthday.hiddenMessage}
            </motion.p>
            <p className="relative mt-8 text-[10px] uppercase tracking-[0.3em] text-ivory/50">Tap anywhere to close</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
