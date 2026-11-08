"use client";

import { useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { getMusic } from "@/lib/audio";

function useMusicState() {
  const music = getMusic();
  return useSyncExternalStore(
    (cb) => music.subscribe(cb),
    () => `${music.started}|${music.playing}|${music.muted}`,
    () => "false|false|false",
  );
}

export default function MusicControls() {
  const state = useMusicState();
  const [started, playing, muted] = state.split("|").map((v) => v === "true");
  const music = getMusic();
  const btn =
    "focus-ring flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-plum/50 text-ivory/90 backdrop-blur-md transition hover:bg-gold/20 active:scale-95";

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Music controls">
      <button type="button" className={btn} onClick={() => void music.togglePlay()} aria-label={playing ? "Pause music" : "Play music"}>
        {playing ? <Pause size={17} /> : <Play size={17} className="translate-x-[1px]" />}
      </button>
      {started && (
        <>
          <button type="button" className={btn} onClick={() => music.toggleMute()} aria-label={muted ? "Unmute music" : "Mute music"} aria-pressed={muted}>
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
          <button type="button" className={`${btn} hidden min-[360px]:flex`} onClick={() => music.replay()} aria-label="Replay music from the start">
            <RotateCcw size={16} />
          </button>
        </>
      )}
    </div>
  );
}
