"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export const CHAPTERS = [
  "gift",
  "garden",
  "doors",
  "universe",
  "tree",
  "cake",
  "finale",
  "keepsake",
  "coupons",
] as const;

export type ChapterId = (typeof CHAPTERS)[number];
export type DoorId = "smile" | "memories" | "love";

type StoryState = {
  chapter: ChapterId;
  chapterIndex: number;
  visited: Set<ChapterId>;
  hearts: Set<DoorId>;
  /** Increments on restart so chapters fully remount. */
  runId: number;
  goTo: (c: ChapterId) => void;
  next: () => void;
  collectHeart: (d: DoorId) => void;
  restart: () => void;
};

const StoryContext = createContext<StoryState | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [chapter, setChapter] = useState<ChapterId>("gift");
  const [visited, setVisited] = useState<Set<ChapterId>>(() => new Set(["gift"]));
  const [hearts, setHearts] = useState<Set<DoorId>>(() => new Set());
  const [runId, setRunId] = useState(0);

  const goTo = useCallback((c: ChapterId) => {
    setChapter(c);
    setVisited((v) => (v.has(c) ? v : new Set(v).add(c)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const next = useCallback(() => {
    setChapter((cur) => {
      const i = CHAPTERS.indexOf(cur);
      const n = CHAPTERS[Math.min(i + 1, CHAPTERS.length - 1)];
      setVisited((v) => (v.has(n) ? v : new Set(v).add(n)));
      return n;
    });
  }, []);

  const collectHeart = useCallback((d: DoorId) => {
    setHearts((h) => (h.has(d) ? h : new Set(h).add(d)));
  }, []);

  const restart = useCallback(() => {
    setHearts(new Set());
    setVisited(new Set(["gift"]));
    setRunId((r) => r + 1);
    setChapter("gift");
  }, []);

  const value = useMemo(
    () => ({
      chapter,
      chapterIndex: CHAPTERS.indexOf(chapter),
      visited,
      hearts,
      runId,
      goTo,
      next,
      collectHeart,
      restart,
    }),
    [chapter, visited, hearts, runId, goTo, next, collectHeart, restart],
  );

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used inside <StoryProvider>");
  return ctx;
}
