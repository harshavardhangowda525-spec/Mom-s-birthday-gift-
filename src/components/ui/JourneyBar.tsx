"use client";

import { AnimatePresence, motion } from "motion/react";
import { CHAPTERS, useStory, type ChapterId } from "@/components/StoryProvider";
import MusicControls from "./MusicControls";

export const CHAPTER_TITLES: Record<ChapterId, string> = {
  gift: "The Mysterious Gift",
  garden: "The Enchanted Garden",
  doors: "The Three Magical Doors",
  universe: "The Universe of Memories",
  tree: "The Magical Wishing Tree",
  cake: "Make a Wish, Mom",
  finale: "The Grand Finale",
  keepsake: "A Little Piece of Forever",
  coupons: "One Last Surprise",
};

export default function JourneyBar() {
  const { chapter, chapterIndex, visited, goTo } = useStory();
  const hideTitle = chapter === "gift" || chapter === "finale";

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-4 sm:px-6"
      style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}
    >
      <div className="pointer-events-auto min-w-0">
        <AnimatePresence mode="wait">
          {!hideTitle && (
            <motion.div
              key={chapter}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.6 }}
              className="min-w-0"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-gold/80">
                Chapter {String(chapterIndex + 1).padStart(2, "0")}
              </p>
              <p className="truncate font-serif text-base italic text-ivory/85 sm:text-lg">{CHAPTER_TITLES[chapter]}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <nav aria-label="Story chapters" className="mt-2 flex gap-1.5">
          {CHAPTERS.map((c, i) => {
            const can = visited.has(c) && c !== chapter;
            return (
              <button
                key={c}
                type="button"
                disabled={!can}
                onClick={() => goTo(c)}
                aria-label={`Chapter ${i + 1}: ${CHAPTER_TITLES[c]}${can ? "" : visited.has(c) ? " (current)" : " (locked)"}`}
                aria-current={c === chapter ? "step" : undefined}
                className="focus-ring group flex h-6 items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-500 ${
                    c === chapter ? "w-5 bg-gold" : visited.has(c) ? "w-1.5 bg-gold/60 group-hover:bg-gold" : "w-1.5 bg-ivory/15"
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>
      <div className="pointer-events-auto shrink-0">
        <MusicControls />
      </div>
    </header>
  );
}
