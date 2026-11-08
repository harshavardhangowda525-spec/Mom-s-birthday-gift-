"use client";

import { birthday } from "@/config/birthday";
import { withBase } from "./basePath";

/**
 * Music engine.
 * 1. Tries the user-supplied track (config.music.src).
 * 2. If it is missing / fails, plays an original music-box + pad composition
 *    synthesised live with the Web Audio API (no files, no licences needed).
 * Audio only ever starts from a user gesture.
 */

export type Mood = "ambient" | "tender" | "celebration" | "hush";

type Listener = () => void;

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// Gentle progression: Cmaj7 – Am7 – Fmaj7 – G6sus (midi numbers)
const CHORDS: number[][] = [
  [48, 55, 59, 64, 67, 71],
  [45, 52, 57, 60, 64, 67],
  [41, 48, 57, 60, 64, 69],
  [43, 50, 59, 62, 64, 67],
];

// "Happy Birthday" (traditional, public domain) — [midi, beats]
const HAPPY_BIRTHDAY: [number, number][] = [
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
  [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
  [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
  [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 3],
];

class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private file: HTMLAudioElement | null = null;
  private useFile = false;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private mood: Mood = "ambient";
  private listeners = new Set<Listener>();

  started = false;
  playing = false;
  muted = false;

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() {
    this.listeners.forEach((l) => l());
  }

  private ensureCtx() {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext | undefined =
      typeof window !== "undefined"
        ? window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;
    if (!AC) return null;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);

    // Simple generated reverb impulse for a dreamy hall.
    const len = ctx.sampleRate * 2.6;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.4);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);

    this.ctx = ctx;
    this.master = master;
    this.reverb = reverb;
    return ctx;
  }

  private moodVolume() {
    if (this.muted) return 0;
    switch (this.mood) {
      case "hush":
        return 0.12;
      case "tender":
        return 0.32;
      case "celebration":
        return 0.42;
      default:
        return 0.34;
    }
  }

  /** Must be called synchronously from a user gesture (tap/click). */
  start() {
    if (this.started) return;
    this.started = true;
    this.playing = true;
    const cfg = birthday.music;
    // Create/resume the AudioContext inside the gesture so mobile browsers allow it.
    const ctx = cfg.generatedFallback ? this.ensureCtx() : null;
    if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => undefined);

    const startSynth = () => {
      this.useFile = false;
      if (ctx && this.playing) {
        this.nextTime = ctx.currentTime + 0.1;
        this.startScheduler();
        this.applyVolume(2.5);
      }
    };

    if (cfg.src) {
      const audio = new Audio(withBase(cfg.src));
      audio.loop = true;
      audio.volume = 0;
      audio.preload = "auto";
      audio
        .play()
        .then(() => {
          this.file = audio;
          this.useFile = true;
          if (!this.playing) audio.pause();
          this.applyVolume(2.5);
        })
        .catch(startSynth);
    } else {
      startSynth();
    }
    this.emit();
  }

  private applyVolume(fade = 1.2) {
    const v = this.playing ? this.moodVolume() : 0;
    if (this.useFile && this.file) {
      const audio = this.file;
      const from = audio.volume;
      const t0 = performance.now();
      const tick = () => {
        const k = Math.min(1, (performance.now() - t0) / (fade * 1000));
        audio.volume = Math.max(0, Math.min(1, from + (v * 1.6 - from) * k));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      return;
    }
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(this.master.gain.value, now);
      this.master.gain.linearRampToValueAtTime(v, now + fade);
    }
  }

  setMood(mood: Mood) {
    if (this.mood === mood) return;
    this.mood = mood;
    this.applyVolume(mood === "hush" ? 2.5 : 1.8);
  }

  toggleMute() {
    this.muted = !this.muted;
    this.applyVolume(0.4);
    this.emit();
  }

  async togglePlay() {
    if (!this.started) {
      this.start();
      return;
    }
    this.playing = !this.playing;
    if (this.useFile && this.file) {
      if (this.playing) await this.file.play().catch(() => undefined);
      else this.file.pause();
    } else if (this.ctx) {
      if (this.playing) {
        await this.ctx.resume().catch(() => undefined);
        this.nextTime = this.ctx.currentTime + 0.1;
        this.startScheduler();
      } else {
        this.stopScheduler();
      }
    }
    this.applyVolume(0.6);
    this.emit();
  }

  replay() {
    if (this.useFile && this.file) {
      this.file.currentTime = 0;
    } else {
      this.step = 0;
    }
    if (!this.playing) void this.togglePlay();
  }

  // ───────────── synthesis ─────────────
  private startScheduler() {
    this.stopScheduler();
    this.timer = window.setInterval(() => this.schedule(), 120);
  }
  private stopScheduler() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  private beat() {
    return this.mood === "celebration" ? 0.42 : this.mood === "hush" || this.mood === "tender" ? 0.62 : 0.52;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + 0.5) {
      const beat = this.beat();
      const bar = Math.floor(this.step / 8);
      const chord = CHORDS[bar % CHORDS.length];
      const inBar = this.step % 8;

      if (inBar === 0) this.pad(chord, this.nextTime, beat * 8);

      // Music-box arpeggio pattern with gentle rests.
      const pattern = [0, 2, 4, 5, 3, 4, 2, -1];
      const idx = pattern[inBar];
      if (idx >= 0 && !(this.mood === "hush" && inBar % 2 === 1)) {
        const note = chord[idx] + 12 + (bar % 8 >= 4 && inBar === 3 ? 12 : 0);
        this.bell(midiToHz(note), this.nextTime, inBar === 0 ? 0.16 : 0.1);
      }
      this.nextTime += beat;
      this.step++;
    }
  }

  private pad(chord: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    chord.slice(0, 4).forEach((m, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = midiToHz(m);
      osc.detune.value = (i % 2 ? 1 : -1) * 4;
      const g = ctx.createGain();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const peak = i === 0 ? 0.05 : 0.022;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + dur * 0.35);
      g.gain.linearRampToValueAtTime(0, t + dur + 0.6);
      osc.connect(lp).connect(g);
      g.connect(this.master!);
      g.connect(this.reverb!);
      osc.start(t);
      osc.stop(t + dur + 0.8);
    });
  }

  private bell(freq: number, t: number, vol: number) {
    const ctx = this.ctx!;
    [1, 2.01, 3.98].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      const v = vol / (i * 2.2 + 1);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (i === 0 ? 2.2 : 0.9));
      osc.connect(g);
      g.connect(this.master!);
      g.connect(this.reverb!);
      osc.start(t);
      osc.stop(t + 2.4);
    });
  }

  /** Plays the traditional birthday melody as a music box over the music. */
  playBirthdayTune() {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    if (!ctx || !this.master) return;
    void ctx.resume();
    // If a file is playing, make sure the synth output is audible for the tune.
    if (this.useFile) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setValueAtTime(0.4, ctx.currentTime);
    }
    let t = ctx.currentTime + 0.3;
    const beat = 0.5;
    for (const [m, b] of HAPPY_BIRTHDAY) {
      this.bell(midiToHz(m + 12), t, 0.2);
      this.bell(midiToHz(m), t, 0.08);
      t += b * beat;
    }
  }
}

let engine: MusicEngine | null = null;
export function getMusic(): MusicEngine {
  if (!engine) engine = new MusicEngine();
  return engine;
}
