"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FastForward, Pause, Play, RotateCcw } from "lucide-react";
import ParticleField from "@/components/fx/ParticleField";
import { birthday } from "@/config/birthday";
import { getMusic } from "@/lib/audio";

/**
 * "A Thousand Little Moments": a photo-free motion-graphics film.
 * Every frame is a pure function of the film clock `t`, so pause, replay and
 * skip are exact. All artwork is original SVG and typography.
 */

// ───────────── easing helpers ─────────────
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** progress 0→1 between times a and b */
const seg = (t: number, a: number, b: number, e: (x: number) => number = easeOut) => e(clamp((t - a) / (b - a)));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mixColor = (c1: string, c2: string, p: number) => {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = h(c1);
  const b = h(c2);
  return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], p))).join(",")})`;
};
/** dash props that draw a path from 0 → p (needs pathLength=1) */
const draw = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p });

const HEART = "M0 22 C -26 4, -32 -16, -18 -24 C -9 -29, -2 -24, 0 -16 C 2 -24, 9 -29, 18 -24 C 32 -16, 26 4, 0 22 Z";

function Art({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-[30%] top-[9%] flex items-center justify-center">
      <svg viewBox="0 0 400 400" className="h-full w-full max-w-[640px] overflow-visible" aria-hidden>
        {children}
      </svg>
    </div>
  );
}

function Bg({ from, to }: { from: string; to: string }) {
  return <div className="absolute inset-0" style={{ background: `radial-gradient(120% 90% at 50% 35%, ${from} 0%, ${to} 75%)` }} />;
}

// ───────────── Scene 1: seed → bloom ─────────────
function SceneBloom({ t }: { t: number }) {
  const fall = seg(t, 0.2, 1.6, (x) => x * x);
  const stem = seg(t, 1.6, 3.2);
  const leaf = seg(t, 2.6, 3.6, easeBack);
  const spin = t * 4;
  const glow = seg(t, 5, 6.5);
  return (
    <>
      <Bg from="#3b1f45" to="#120812" />
      <Art>
        <ellipse cx="200" cy="318" rx={lerp(20, 110, stem)} ry="10" fill="#d6b47c" opacity={0.18 * stem} />
        {/* seed */}
        {t < 1.9 && <circle cx="200" cy={lerp(-30, 305, fall)} r="6" fill="#f3dca8" filter="url(#fg-glow)" opacity={1 - seg(t, 1.6, 1.9)} />}
        {/* stem + leaves */}
        <path d="M200 310 C 180 270, 222 240, 200 200 C 190 182, 202 172, 200 160" stroke="#8fb58a" strokeWidth="5" fill="none" strokeLinecap="round" {...draw(stem)} />
        <path d="M201 262 C 230 240, 255 250, 262 236 C 240 228, 214 238, 201 262 Z" fill="#7aa07a" transform={`translate(201 262) scale(${leaf}) translate(-201 -262)`} />
        <path d="M197 236 C 168 216, 146 226, 138 212 C 160 204, 186 214, 197 236 Z" fill="#7aa07a" transform={`translate(197 236) scale(${leaf}) translate(-197 -236)`} />
        {/* bloom */}
        <g transform={`translate(200 158) rotate(${spin})`}>
          <circle r={lerp(0, 95, glow)} fill="url(#fg-radial)" opacity={0.55 * glow} />
          {Array.from({ length: 10 }).map((_, i) => {
            const p = seg(t, 3.2 + i * 0.12, 4.4 + i * 0.12, easeBack);
            return <ellipse key={`o${i}`} cx="0" cy="-34" rx="15" ry="34" fill="#E8A7B6" opacity="0.9" transform={`rotate(${i * 36}) scale(${p})`} />;
          })}
          {Array.from({ length: 8 }).map((_, i) => {
            const p = seg(t, 4.1 + i * 0.1, 5.1 + i * 0.1, easeBack);
            return <ellipse key={`i${i}`} cx="0" cy="-20" rx="10" ry="21" fill="#f6cdd7" transform={`rotate(${i * 45 + 22}) scale(${p})`} />;
          })}
          <circle r={14 * seg(t, 4.8, 5.6, easeBack)} fill="#f3dca8" filter="url(#fg-glow)" />
        </g>
        {/* pollen sparkles drifting upward */}
        {Array.from({ length: 14 }).map((_, i) => {
          const life = (t - 5 - i * 0.22) % 3;
          if (t < 5 + i * 0.22) return null;
          const a = (i * 137) % 360;
          return (
            <circle
              key={i}
              cx={200 + Math.cos(a) * (20 + life * 40)}
              cy={158 - life * 45 + Math.sin(a) * 18}
              r={2.2}
              fill="#fff4d8"
              opacity={1 - life / 3}
              filter="url(#fg-glow)"
            />
          );
        })}
      </Art>
    </>
  );
}

// ───────────── Scene 2: morning chai ─────────────
function SceneChai({ t }: { t: number }) {
  const sun = seg(t, 0, 6, easeInOut);
  const sky = mixColor("#2a1a3e", "#f2b48f", sun);
  return (
    <>
      <Bg from={mixColor("#3d2346", "#7a4256", sun)} to="#160a14" />
      <Art>
        {/* window */}
        <clipPath id="win-clip">
          <rect x="110" y="40" width="180" height="200" rx="90" />
        </clipPath>
        <g clipPath="url(#win-clip)">
          <rect x="110" y="40" width="180" height="200" fill={sky} />
          <circle cx="200" cy={lerp(260, 140, sun)} r="34" fill="#fff1cf" filter="url(#fg-glow)" />
          <path d="M110 215 C 150 195, 190 220, 230 200 C 260 188, 280 205, 290 198 V 240 H 110 Z" fill="#5b3352" opacity="0.9" />
        </g>
        <rect x="110" y="40" width="180" height="200" rx="90" fill="none" stroke="#d6b47c" strokeWidth="5" />
        <line x1="200" y1="40" x2="200" y2="240" stroke="#d6b47c" strokeWidth="3" />
        <line x1="110" y1="150" x2="290" y2="150" stroke="#d6b47c" strokeWidth="3" />
        {/* sun beam across the room */}
        <path d="M150 240 L 90 400 L 320 400 L 250 240 Z" fill="#f3dca8" opacity={0.12 * sun} />
        {/* cup */}
        <g transform={`translate(0 ${lerp(30, 0, seg(t, 0.3, 1.6))})`} opacity={seg(t, 0.3, 1.2)}>
          <ellipse cx="200" cy="352" rx="80" ry="12" fill="#d6b47c" opacity="0.8" />
          <path d="M150 290 H 250 C 250 330, 232 350, 200 350 C 168 350, 150 330, 150 290 Z" fill="#fff9f2" />
          <path d="M250 300 C 280 300, 280 330, 246 332" stroke="#fff9f2" strokeWidth="8" fill="none" />
          <ellipse cx="200" cy="290" rx="50" ry="8" fill="#b9814f" />
          <path d="M160 312 C 180 320, 220 320, 240 312" stroke="#E8A7B6" strokeWidth="3" fill="none" />
          <path transform="translate(200 330) scale(0.32)" d={HEART} fill="#E8A7B6" />
        </g>
        {/* steam */}
        {[0, 1, 2].map((k) => {
          const cycle = ((t - 1.5 - k * 0.6) % 2.6) / 2.6;
          if (t < 1.5 + k * 0.6) return null;
          const x = 180 + k * 20;
          return (
            <path
              key={k}
              d={`M${x} 280 C ${x - 12} 260, ${x + 12} 245, ${x} 225 C ${x - 12} 205, ${x + 12} 190, ${x} 170`}
              stroke="#fff9f2"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity={0.6 * Math.sin(cycle * Math.PI)}
              transform={`translate(0 ${-cycle * 30})`}
              {...draw(clamp(cycle * 1.6))}
            />
          );
        })}
      </Art>
    </>
  );
}

// ───────────── Scene 3: a thousand little moments ─────────────
const ICONS = [
  HEART,
  "M0 -12 L 3.5 -4 L 12 -3.7 L 5.5 2 L 7.4 10.5 L 0 6 L -7.4 10.5 L -5.5 2 L -12 -3.7 L -3.5 -4 Z",
  "M4 -11 A 11 11 0 1 0 4 11 A 8.5 8.5 0 1 1 4 -11 Z",
];
const ICON_COLORS = ["#E8A7B6", "#f3dca8", "#B9A5D1", "#fff9f2", "#d6b47c"];

function SceneMoments({ t }: { t: number }) {
  const count = Math.round(1000 * seg(t, 0.6, 6.4, (x) => x * x));
  const cells: { c: number; r: number; i: number }[] = [];
  let n = 0;
  for (let r = 0; r < 7; r++)
    for (let c = 0; c < 7; c++) {
      if (Math.abs(c - 3) <= 1 && Math.abs(r - 3) <= 1) continue;
      cells.push({ c, r, i: n++ });
    }
  const order = (i: number) => (i * 23) % cells.length;
  const gold = seg(t, 6.6, 7.6);
  return (
    <>
      <Bg from="#3a2150" to="#0f0814" />
      <Art>
        {cells.map(({ c, r, i }) => {
          const p = seg(t, 0.6 + order(i) * 0.13, 1.1 + order(i) * 0.13, easeBack);
          const x = 44 + c * 52;
          const y = 44 + r * 52;
          const kind = i % 4;
          const pulse = 1 + 0.12 * Math.sin(t * 4 + i) * gold;
          const color = gold > 0 ? mixColor(ICON_COLORS[i % 5].length === 7 ? ICON_COLORS[i % 5] : "#f3dca8", "#f3dca8", gold) : ICON_COLORS[i % 5];
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${p * pulse}) rotate(${(1 - p) * 90})`} opacity={p}>
              {kind === 3 ? (
                <g fill={color}>
                  {[0, 72, 144, 216, 288].map((a) => (
                    <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 6} cy={Math.sin((a * Math.PI) / 180) * 6} r="5" />
                  ))}
                  <circle r="4" fill="#d6b47c" />
                </g>
              ) : (
                <path d={ICONS[kind]} fill={color} transform={kind === 0 ? "scale(0.5)" : undefined} />
              )}
            </g>
          );
        })}
        <circle cx="200" cy="200" r="70" fill="url(#fg-radial)" opacity={0.5 + 0.3 * gold} />
        <text x="200" y="210" textAnchor="middle" fill="url(#fg-gold)" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600, fontSize: 54 }} filter="url(#fg-glow)">
          {count}
        </text>
        <text x="200" y="238" textAnchor="middle" fill="#fff9f2" opacity={seg(t, 1, 2)} style={{ fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: 4 }}>
          LITTLE MOMENTS
        </text>
      </Art>
    </>
  );
}

// ───────────── Scene 4: kinetic words ─────────────
function SceneWords({ t }: { t: number }) {
  const a = seg(t, 0.4, 1.4);
  const smile = seg(t, 1.2, 2.2);
  const love = seg(t, 5.4, 6.6, easeBack);
  const beat = t > 6.6 ? 1 + 0.06 * Math.max(0, Math.sin((t - 6.6) * 7)) : 1;
  const laughter = "The laughter.".split("");
  return (
    <>
      <Bg from="#4a2346" to="#120812" />
      <div className="absolute inset-x-0 top-[12%] bottom-[24%] flex flex-col items-center justify-center gap-9 overflow-hidden px-4 text-center">
        <div style={{ transform: `translateX(${(1 - a) * -110}vw)`, opacity: a }} className="relative">
          <p className="font-serif text-[3rem] italic leading-none text-ivory sm:text-7xl">The smiles.</p>
          <svg viewBox="0 0 200 30" className="mx-auto mt-1 w-40" aria-hidden>
            <path d="M10 6 C 60 34, 140 34, 190 6" stroke="#E8A7B6" strokeWidth="5" fill="none" strokeLinecap="round" {...draw(smile)} />
          </svg>
        </div>
        <p className="font-serif text-[3rem] italic leading-none text-rose sm:text-7xl" aria-label="The laughter.">
          {laughter.map((ch, i) => {
            const p = seg(t, 2.8 + i * 0.07, 3.5 + i * 0.07, easeBack);
            const wobble = t > 3.6 ? Math.sin((t - 3.6) * 6 + i * 0.8) * 4 * Math.max(0, 1 - (t - 3.6) / 2.5) : 0;
            return (
              <span key={i} aria-hidden className="inline-block" style={{ transform: `translateY(${(1 - p) * 60 + wobble}px) rotate(${(1 - p) * -25}deg)`, opacity: clamp(p * 1.5) }}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            );
          })}
        </p>
        <div className="relative flex items-center justify-center" style={{ transform: `scale(${lerp(3, 1, love) * beat})`, opacity: clamp(love * 1.3) }}>
          <svg viewBox="-60 -60 120 120" className="absolute h-36 w-36 translate-y-3 opacity-80" aria-hidden>
            <path d={HEART} fill="#E8A7B6" opacity="0.25" transform="scale(1.7)" />
            {[0, 1, 2].map((k) => {
              const ring = ((t - 6.6 + k * 0.5) % 1.5) / 1.5;
              return t > 6.6 ? <path key={k} d={HEART} fill="none" stroke="#f3dca8" strokeWidth="1.2" opacity={1 - ring} transform={`scale(${1.4 + ring * 1.6})`} /> : null;
            })}
          </svg>
          <p className="gold-text relative font-serif text-[3.6rem] font-semibold italic leading-none sm:text-8xl">The love.</p>
        </div>
      </div>
    </>
  );
}

// ───────────── Scene 5: two hearts, four seasons ─────────────
const bez = (p: number[][], u: number) => {
  const m = 1 - u;
  return [0, 1].map((k) => m * m * m * p[0][k] + 3 * m * m * u * p[1][k] + 3 * m * u * u * p[2][k] + u * u * u * p[3][k]);
};
const ROAD = [
  [
    [70, 400],
    [130, 330],
    [310, 320],
    [245, 250],
  ],
  [
    [245, 250],
    [190, 195],
    [200, 185],
    [205, 160],
  ],
];
const roadAt = (u: number) => (u < 0.6 ? bez(ROAD[0], u / 0.6) : bez(ROAD[1], (u - 0.6) / 0.4));
const SEASONS = [
  { sky: "#f2b6c6", ground: "#7a4f7a", fall: "#ffd1dc" },
  { sky: "#f6d48f", ground: "#6a5a3a", fall: "#fff1cf" },
  { sky: "#e8956a", ground: "#5a3326", fall: "#d9773f" },
  { sky: "#a99bc9", ground: "#3d3456", fall: "#ffffff" },
];

function SceneJourney({ t }: { t: number }) {
  const s = clamp(t / 2.4, 0, 3);
  const i0 = Math.floor(Math.min(s, 2.999));
  const f = easeInOut(s - i0);
  const a = SEASONS[i0];
  const b = SEASONS[Math.min(3, i0 + 1)];
  const sky = mixColor(a.sky, b.sky, f);
  const ground = mixColor(a.ground, b.ground, f);
  const fallColor = f < 0.5 ? a.fall : b.fall;
  const u = seg(t, 0.6, 9, easeInOut) * 0.92;
  const big = roadAt(u);
  const small = roadAt(Math.max(0, u - 0.06));
  const depth = (y: number) => lerp(0.75, 1.35, clamp((y - 160) / 240));
  const grow = lerp(0.45, 0.85, seg(t, 0.6, 9));
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, #1c1030 0%, ${sky} 30%, ${ground} 34%, ${ground} 100%)` }} />
      <Art>
        <circle cx="200" cy="140" r="40" fill="#fff4d8" opacity="0.8" filter="url(#fg-glow)" />
        <path d="M-60 175 C 40 150, 120 170, 200 158 C 290 145, 360 165, 460 150 L 460 420 L -60 420 Z" fill={ground} />
        <path d="M70 400 C 130 330, 310 320, 245 250 C 190 195, 200 185, 205 160" stroke="#f3dca8" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M70 400 C 130 330, 310 320, 245 250 C 190 195, 200 185, 205 160" stroke="#fff4d8" strokeWidth="2" strokeDasharray="6 8" fill="none" opacity="0.8" />
        {/* season particles */}
        {Array.from({ length: 22 }).map((_, k) => {
          const x = (k * 53 + Math.sin(t + k) * 14) % 420;
          const y = ((t * 38 + k * 41) % 440) - 30;
          return i0 === 3 || (i0 === 2 && f > 0.5) ? (
            <circle key={k} cx={x} cy={y} r={2 + (k % 3)} fill={fallColor} opacity="0.85" />
          ) : (
            <ellipse key={k} cx={x} cy={y} rx="3" ry="5.5" fill={fallColor} opacity="0.85" transform={`rotate(${t * 90 + k * 30} ${x} ${y})`} />
          );
        })}
        {/* the two hearts */}
        <g transform={`translate(${small[0] - 14} ${small[1] - 18}) scale(${depth(small[1]) * grow})`}>
          <path d={HEART} fill="#E8A7B6" filter="url(#fg-glow)" transform={`translate(0 ${Math.abs(Math.sin(t * 6)) * -5})`} />
        </g>
        <g transform={`translate(${big[0] + 12} ${big[1] - 24}) scale(${depth(big[1])})`}>
          <path d={HEART} fill="url(#fg-gold)" filter="url(#fg-glow)" transform={`translate(0 ${Math.abs(Math.sin(t * 6 + 1.2)) * -5})`} />
        </g>
      </Art>
    </>
  );
}

// ───────────── Scene 6: "MOM" written in light ─────────────
const MOM = [
  { d: "M40 262 L40 140 L85 212 L130 140 L130 262", a: 0.5, b: 2 },
  { d: "M200 142 A58 58 0 1 1 199.9 142", a: 1.9, b: 3.3 },
  { d: "M270 262 L270 140 L315 212 L360 140 L360 262", a: 3.2, b: 4.6 },
];

function SceneMom({ t }: { t: number }) {
  const burst = seg(t, 4.6, 6);
  return (
    <>
      <Bg from="#3a1f3d" to="#07040b" />
      <Art>
        <g transform="translate(200 200)" opacity={burst}>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="-1.5" y={-200 * burst} width="3" height={110 * burst} fill="url(#fg-gold)" opacity="0.35" transform={`rotate(${i * 22.5 + t * 8})`} />
          ))}
          <circle r={150 * burst} fill="url(#fg-radial)" opacity="0.45" />
        </g>
        {MOM.map((l, i) => (
          <g key={i}>
            <path d={l.d} stroke="#f3dca8" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.25" filter="url(#fg-glow)" {...draw(seg(t, l.a, l.b, easeInOut))} />
            <path d={l.d} stroke="url(#fg-gold)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" {...draw(seg(t, l.a, l.b, easeInOut))} />
          </g>
        ))}
        {/* the pen spark */}
        {MOM.map((l, i) => {
          const p = seg(t, l.a, l.b, easeInOut);
          return p > 0 && p < 1 ? <circle key={i} cx={i === 1 ? 200 + 58 * Math.sin(p * Math.PI * 2) : 0} cy={i === 1 ? 200 - 58 * Math.cos(p * Math.PI * 2) : 0} r="7" fill="#fff" filter="url(#fg-glow)" opacity={i === 1 ? 1 : 0} /> : null;
        })}
        {/* orbiting hearts */}
        {Array.from({ length: 8 }).map((_, i) => {
          const ang = (i / 8) * Math.PI * 2 + t * 0.7;
          return (
            <path
              key={i}
              d={HEART}
              fill={i % 2 ? "#E8A7B6" : "#f3dca8"}
              opacity={burst}
              transform={`translate(${200 + Math.cos(ang) * 175 * burst} ${200 + Math.sin(ang) * 90 * burst}) scale(${0.32 * burst})`}
            />
          );
        })}
      </Art>
    </>
  );
}

// ───────────── Scene 7: a shooting-star wish ─────────────
function SceneWish({ t }: { t: number }) {
  const fly = seg(t, 0.3, 2.2, easeInOut);
  const x = lerp(-40, 200, fly);
  const y = lerp(-60, 190, fly);
  const settle = seg(t, 2.1, 3.4, easeBack);
  const STAR = "M0 -30 L 8.8 -9.7 L 30 -9.3 L 13.6 4.6 L 18.5 26 L 0 14.6 L -18.5 26 L -13.6 4.6 L -30 -9.3 L -8.8 -9.7 Z";
  return (
    <>
      <Bg from="#21183d" to="#05030a" />
      <Art>
        {Array.from({ length: 40 }).map((_, i) => (
          <circle key={i} cx={(i * 97) % 400} cy={(i * 61) % 400} r={(i % 3) * 0.6 + 0.6} fill="#fff9f2" opacity={0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i))} />
        ))}
        {fly < 1 && <line x1={x - 140 * (1 - fly * 0.6)} y1={y - 145 * (1 - fly * 0.6)} x2={x} y2={y} stroke="url(#fg-trail)" strokeWidth="4" strokeLinecap="round" />}
        <g transform={`translate(${x} ${y}) rotate(${t * 40}) scale(${0.35 + settle * 0.9})`}>
          <circle r={45 + 10 * Math.sin(t * 3)} fill="url(#fg-radial)" opacity={0.4 + 0.5 * settle} />
          {settle > 0 &&
            Array.from({ length: 12 }).map((_, i) => <rect key={i} x="-1" y={-95 * settle} width="2" height={40 * settle} fill="#fff4d8" opacity="0.5" transform={`rotate(${i * 30})`} />)}
          <path d={STAR} fill="url(#fg-gold)" filter="url(#fg-glow)" />
        </g>
        {/* wish sparkles rising from the star */}
        {Array.from({ length: 10 }).map((_, i) => {
          const life = (t - 3.4 - i * 0.3) % 2.4;
          if (t < 3.4 + i * 0.3) return null;
          return <circle key={i} cx={200 + Math.sin(i * 2.4) * (30 + life * 30)} cy={190 - life * 60} r="2.5" fill="#E8A7B6" opacity={1 - life / 2.4} filter="url(#fg-glow)" />;
        })}
      </Art>
    </>
  );
}

// ───────────── Scene 8: sunrise garden ─────────────
function SceneSunrise({ t }: { t: number }) {
  const sun = seg(t, 0, 4.5, easeInOut);
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${mixColor("#2b1a40", "#f6b98f", sun)} 0%, ${mixColor("#5b3352", "#fde3c4", sun)} 50%, #47263D 52%, #47263D 100%)` }} />
      <Art>
        <g transform={`translate(200 ${lerp(330, 190, sun)})`}>
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={i} x="-2" y="-230" width="4" height="150" fill="#fff4d8" opacity={0.25 * sun} transform={`rotate(${i * 20 + t * 6})`} />
          ))}
          <circle r="60" fill="#fff4d8" filter="url(#fg-glow)" />
          <circle r="90" fill="url(#fg-radial)" opacity="0.6" />
        </g>
        <path d="M-60 300 C 60 270, 140 290, 200 282 C 280 272, 340 290, 460 278 L 460 420 L -60 420 Z" fill="#47263D" />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 30 + i * 42.5;
          const stem = seg(t, 1.2 + i * 0.28, 2.2 + i * 0.28);
          const head = seg(t, 2 + i * 0.28, 2.9 + i * 0.28, easeBack);
          const h = 50 + (i % 3) * 18;
          const sway = Math.sin(t * 1.6 + i) * 3;
          const color = ["#E8A7B6", "#B9A5D1", "#f3dca8"][i % 3];
          return (
            <g key={i} transform={`rotate(${sway} ${x} 300)`}>
              <path d={`M${x} 300 C ${x - 6} ${300 - h / 2}, ${x + 6} ${300 - h / 2}, ${x} ${300 - h}`} stroke="#7aa07a" strokeWidth="3" fill="none" {...draw(stem)} />
              <g transform={`translate(${x} ${300 - h}) scale(${head})`}>
                {[0, 60, 120, 180, 240, 300].map((r) => (
                  <ellipse key={r} cx="0" cy="-9" rx="6" ry="10" fill={color} transform={`rotate(${r})`} />
                ))}
                <circle r="5" fill="#fff4d8" />
              </g>
            </g>
          );
        })}
        {[0, 1, 2].map((k) => {
          const bx = -50 + (t - 2 - k * 0.5) * 55;
          const by = 120 + k * 22 + Math.sin(t * 2 + k) * 6;
          const flap = Math.sin(t * 10 + k) * 5;
          return t > 2 ? <path key={k} d={`M${bx - 10} ${by - flap} Q ${bx - 4} ${by - 4} ${bx} ${by} Q ${bx + 4} ${by - 4} ${bx + 10} ${by - flap}`} stroke="#47263D" strokeWidth="2" fill="none" /> : null;
        })}
      </Art>
    </>
  );
}

// ───────────── Scene 9: the golden heart ─────────────
function SceneHeart({ t }: { t: number }) {
  const d = seg(t, 0.2, 2.2, easeInOut);
  const fill = seg(t, 1.9, 3);
  const beat = t > 3 ? 1 + 0.05 * Math.max(0, Math.sin((t - 3) * 6)) : 1;
  return (
    <>
      <Bg from="#4a2346" to="#05020a" />
      <Art>
        {[0, 1, 2, 3].map((k) => {
          const r = ((t - 2.5 + k * 0.6) % 2.4) / 2.4;
          return t > 2.5 ? <path key={k} d={HEART} fill="none" stroke="#f3dca8" strokeWidth="0.8" opacity={(1 - r) * 0.8} transform={`translate(200 190) scale(${3.6 + r * 4})`} /> : null;
        })}
        <g transform={`translate(200 190) scale(${3.6 * beat})`}>
          <circle r="34" fill="url(#fg-radial)" opacity={0.6 * fill} />
          <path d={HEART} fill="url(#fg-gold)" opacity={fill} />
          <path d={HEART} fill="none" stroke="#fff4d8" strokeWidth="1.4" filter="url(#fg-glow)" {...draw(d)} />
        </g>
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2 + t * 0.4;
          const rr = 150 + Math.sin(t * 2 + i) * 10;
          return <circle key={i} cx={200 + Math.cos(a) * rr} cy={190 + Math.sin(a) * rr * 0.8} r="2.4" fill="#fff4d8" opacity={fill * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))} filter="url(#fg-glow)" />;
        })}
      </Art>
    </>
  );
}

// ───────────── timeline ─────────────
type Line = { text: string; at: number; style?: "hand" | "final" };
type Scene = { dur: number; View: (p: { t: number }) => ReactNode; lines: Line[] };

const SCENES: Scene[] = [
  { dur: 9, View: SceneBloom, lines: [{ text: "Some people make our lives beautiful...", at: 3.4 }] },
  { dur: 8, View: SceneChai, lines: [{ text: "Not through grand gestures...", at: 1.6 }] },
  { dur: 9, View: SceneMoments, lines: [{ text: "But through a thousand little moments.", at: 1.4 }] },
  { dur: 9.5, View: SceneWords, lines: [] },
  { dur: 10, View: SceneJourney, lines: [{ text: "Every memory reminds me how lucky I am...", at: 1.4 }] },
  { dur: 8.5, View: SceneMom, lines: [{ text: "To call you my mom.", at: 4.8, style: "hand" }] },
  { dur: 8, View: SceneWish, lines: [{ text: "If I could give you one thing...", at: 2.6 }] },
  { dur: 9, View: SceneSunrise, lines: [{ text: "It would be a lifetime of happiness.", at: 2.2 }] },
  {
    dur: 8.5,
    View: SceneHeart,
    lines: [
      { text: "HAPPY BIRTHDAY, MOM.", at: 2.8, style: "final" },
      { text: "I LOVE YOU.", at: 4.4, style: "final" },
    ],
  },
];
const STARTS = SCENES.reduce<number[]>((acc, _s, i) => (acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur), acc), []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur;
const XFADE = 1.3;

const sceneAt = (t: number) => {
  for (let i = 0; i < SCENES.length; i++) if (t < STARTS[i] + SCENES[i].dur) return i;
  return SCENES.length - 1;
};

function Lines({ scene, local, fade }: { scene: Scene; local: number; fade: number }) {
  return (
    <>
      {scene.lines.map((l, i) => {
        const p = seg(local, l.at, l.at + 1.4);
        if (p <= 0) return null;
        const cls =
          l.style === "final"
            ? "gold-text font-serif text-[2.1rem] font-semibold leading-tight sm:text-6xl"
            : l.style === "hand"
              ? "font-hand text-[2.6rem] leading-tight text-[#fff4d8] drop-shadow-[0_0_20px_rgba(214,180,124,0.9)] sm:text-6xl"
              : "font-serif text-[1.65rem] italic leading-snug text-ivory drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] sm:text-4xl";
        return (
          <p
            key={i}
            className={cls}
            style={{
              opacity: p * fade,
              transform: `translateY(${(1 - p) * 14}px)`,
              filter: p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
              letterSpacing: l.style === "final" ? `${lerp(0.4, 0.12, p)}em` : undefined,
            }}
          >
            {l.text}
          </p>
        );
      })}
    </>
  );
}

export default function CinematicFilm({ onEnd }: { onEnd: () => void }) {
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0);
  const time = useRef(0);
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
        time.current = Math.min(TOTAL, time.current + dt);
        setT(time.current);
        if (time.current >= TOTAL) {
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
    time.current = 0;
    ended.current = false;
    setT(0);
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

  const i = sceneAt(t);
  const local = t - STARTS[i];
  const cur = SCENES[i];
  const prev = i > 0 && local < XFADE ? SCENES[i - 1] : null;
  const fadeIn = prev ? easeInOut(local / XFADE) : 1;
  const fadeOutEnd = i === SCENES.length - 1 ? 1 : 1 - seg(local, cur.dur - 0.6, cur.dur);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black" onClick={() => setPlaying((p) => !p)}>
      {/* shared gradients & glow */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <linearGradient id="fg-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4d8" />
            <stop offset="45%" stopColor="#f3dca8" />
            <stop offset="100%" stopColor="#b98d4f" />
          </linearGradient>
          <linearGradient id="fg-trail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3dca8" stopOpacity="0" />
            <stop offset="100%" stopColor="#fff9f2" />
          </linearGradient>
          <radialGradient id="fg-radial">
            <stop offset="0%" stopColor="#fff4d8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f3dca8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f3dca8" stopOpacity="0" />
          </radialGradient>
          <filter id="fg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {prev && (
        <div className="absolute inset-0">
          <prev.View t={prev.dur + local} />
        </div>
      )}
      <div className="absolute inset-0" style={{ opacity: fadeIn }}>
        <cur.View t={local} />
      </div>

      {/* light leaks */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen" aria-hidden>
        <div className="absolute -left-1/4 -top-1/4 h-[70%] w-[80%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,170,120,0.35), transparent 65%)", filter: "blur(30px)", animation: "leak 14s ease-in-out infinite", animationPlayState: playing ? "running" : "paused" }} />
        <div className="absolute -bottom-1/4 -right-1/4 h-[70%] w-[80%] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,167,182,0.3), transparent 65%)", filter: "blur(30px)", animation: "leak 18s ease-in-out -6s infinite reverse", animationPlayState: playing ? "running" : "paused" }} />
      </div>
      <ParticleField variant="dust" count={30} intensity={playing ? 1 : 0.0001} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-black/80 to-transparent" />

      {/* words */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[16%] z-10 flex flex-col items-center gap-1 px-6 text-center" aria-live="polite">
        <Lines scene={cur} local={local} fade={fadeOutEnd} />
      </div>

      {/* paused overlay */}
      {!playing && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gold/60 bg-plum/60 backdrop-blur">
            <Play className="translate-x-0.5 text-gold-bright" size={30} />
          </div>
        </div>
      )}

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--safe-bottom)+14px)]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-[3px] w-full max-w-xl overflow-hidden rounded-full bg-ivory/15">
          <div className="h-full w-full origin-left bg-gradient-to-r from-gold to-gold-bright" style={{ transform: `scaleX(${t / TOTAL})` }} />
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
      <span className="sr-only">An animated birthday film for {birthday.momName}.</span>
    </div>
  );
}
