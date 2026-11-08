/** Deterministic PRNG so server and client render identical decorative layouts. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Points on a heart curve, normalised to roughly [-1, 1]. */
export function heartPoint(t: number) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return { x: x / 17, y: -y / 17 };
}

/** n evenly spaced points around the heart outline. */
export function heartLayout(n: number) {
  return Array.from({ length: n }, (_, i) => heartPoint((i / n) * Math.PI * 2 + Math.PI / n));
}
