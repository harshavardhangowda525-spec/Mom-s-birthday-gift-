"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { StoryProvider, useStory, type ChapterId } from "./StoryProvider";
import JourneyBar from "./ui/JourneyBar";
import { getMusic, type Mood } from "@/lib/audio";
import GiftChapter from "./chapters/GiftChapter";
import GardenChapter from "./chapters/GardenChapter";
import DoorsChapter from "./chapters/DoorsChapter";
import UniverseChapter from "./chapters/UniverseChapter";
import TreeChapter from "./chapters/TreeChapter";
import CakeChapter from "./chapters/CakeChapter";
import LockedGiftChapter from "./chapters/LockedGiftChapter";
import FinaleChapter from "./chapters/FinaleChapter";
import KeepsakeChapter from "./chapters/KeepsakeChapter";
import CouponsChapter from "./chapters/CouponsChapter";

const VIEWS: Record<ChapterId, React.ComponentType> = {
  gift: GiftChapter,
  garden: GardenChapter,
  doors: DoorsChapter,
  universe: UniverseChapter,
  tree: TreeChapter,
  lockedgift: LockedGiftChapter,
  cake: CakeChapter,
  finale: FinaleChapter,
  keepsake: KeepsakeChapter,
  coupons: CouponsChapter,
};

const MOODS: Partial<Record<ChapterId, Mood>> = {
  gift: "ambient",
  garden: "ambient",
  doors: "tender",
  universe: "tender",
  tree: "ambient",
  lockedgift: "tender",
  cake: "ambient",
  keepsake: "tender",
  coupons: "ambient",
};

function Stage() {
  const { chapter, runId } = useStory();
  const View = VIEWS[chapter];

  useEffect(() => {
    const mood = MOODS[chapter];
    if (mood) getMusic().setMood(mood);
  }, [chapter]);

  return (
    <main className="relative min-h-dvh w-full overflow-hidden bg-plum-deep">
      <JourneyBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={`${chapter}-${runId}`}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-dvh w-full"
        >
          <View />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function Experience() {
  return (
    <StoryProvider>
      <Stage />
    </StoryProvider>
  );
}
