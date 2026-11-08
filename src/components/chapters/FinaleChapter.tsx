"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import CinematicFilm from "@/components/finale/CinematicFilm";
import FinaleConstellation from "@/components/finale/FinaleConstellation";
import GrandCelebration from "@/components/finale/GrandCelebration";
import ParticleField from "@/components/fx/ParticleField";
import GoldHeart from "@/components/ui/GoldHeart";
import { useStory } from "@/components/StoryProvider";
import { getMusic } from "@/lib/audio";

type Phase = "mystery" | "film" | "constellation" | "celebration";

function Mystery({ onReveal }: { onReveal: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    getMusic().setMood("hush");
    const ts = [setTimeout(() => setStep(1), 1800), setTimeout(() => setStep(2), 5200), setTimeout(() => setStep(3), 8200)];
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black px-6 text-center">
      <ParticleField variant="stars" count={50} intensity={0.6} />
      <div className="relative min-h-[8rem]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.p key="a" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 1.6 }} className="font-serif text-[1.8rem] italic text-ivory/90 sm:text-4xl">
              Before this magical journey ends...
            </motion.p>
          )}
          {step >= 2 && (
            <motion.p key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6 }} className="font-serif text-[1.8rem] italic text-ivory/90 sm:text-4xl">
              There is one last thing I want to show you.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="relative mt-8 flex flex-col items-center">
            <div className="absolute -inset-16 rounded-full bg-[radial-gradient(circle,rgba(243,220,168,0.35),transparent_70%)]" />
            <GoldHeart size={96} className="animate-pulse-glow relative" />
            <motion.button type="button" onClick={onReveal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="btn-magic relative mt-10">
              <Sparkles size={16} /> Reveal the magic
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FinaleChapter() {
  const { next } = useStory();
  const [phase, setPhase] = useState<Phase>("mystery");
  const toConstellation = useCallback(() => setPhase("constellation"), []);
  const toCelebration = useCallback(() => setPhase("celebration"), []);

  return (
    <section className="scene bg-black" aria-label="The grand finale">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === "film" ? 2 : 1.6 }}
        >
          {phase === "mystery" && <Mystery onReveal={() => setPhase("film")} />}
          {phase === "film" && <CinematicFilm onEnd={toConstellation} />}
          {phase === "constellation" && <FinaleConstellation onDone={toCelebration} />}
          {phase === "celebration" && <GrandCelebration onContinue={next} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
