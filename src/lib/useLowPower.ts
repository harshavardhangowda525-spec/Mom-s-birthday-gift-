"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** True on small / low-core devices or when the user prefers reduced motion. */
export function useLowPower() {
  const reduce = useReducedMotion();
  const [low, setLow] = useState(false);
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    setLow(cores <= 4 || window.innerWidth < 380);
  }, []);
  return { reduce: !!reduce, low: low || !!reduce };
}
