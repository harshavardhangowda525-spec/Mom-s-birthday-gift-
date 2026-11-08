"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  focus?: string;
  eager?: boolean;
  draggable?: boolean;
};

/** An <img> that degrades into a soft golden placeholder if the file is missing. */
export default function SafeImage({ src, alt, className = "", style, focus, eager, draggable = false }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-burgundy via-plum to-[#3a2140] ${className}`}
        style={style}
      >
        <Heart className="h-1/4 w-1/4 max-h-12 max-w-12 text-gold/60" fill="currentColor" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={draggable}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
      style={{ objectPosition: focus ?? "50% 35%", ...style }}
    />
  );
}
