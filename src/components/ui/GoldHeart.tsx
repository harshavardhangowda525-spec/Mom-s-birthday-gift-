export default function GoldHeart({ size = 28, glow = true, className = "", filled = true }: { size?: number; glow?: boolean; className?: string; filled?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
      style={glow ? { filter: "drop-shadow(0 0 8px rgba(243,220,168,0.8))" } : undefined}
    >
      <defs>
        <linearGradient id="gh-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4d8" />
          <stop offset="45%" stopColor="#f3dca8" />
          <stop offset="100%" stopColor="#b98d4f" />
        </linearGradient>
      </defs>
      <path
        d="M16 28 C 6 21, 1 15, 3 9 C 5 3, 12 2, 16 8 C 20 2, 27 3, 29 9 C 31 15, 26 21, 16 28 Z"
        fill={filled ? "url(#gh-grad)" : "none"}
        stroke={filled ? "rgba(255,244,216,0.6)" : "rgba(214,180,124,0.6)"}
        strokeWidth="1"
        strokeDasharray={filled ? undefined : "2 2"}
      />
    </svg>
  );
}
