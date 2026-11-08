"use client";

import { birthday, portraitPhoto } from "@/config/birthday";

const W = 1200;
const H = 1680;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fontStack(cls: string, fallback: string) {
  const el = document.createElement("span");
  el.className = cls;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  document.body.appendChild(el);
  const f = getComputedStyle(el).fontFamily || fallback;
  el.remove();
  return f;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function flower(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, -14, 9, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#d6b47c";
  ctx.fill();
  ctx.restore();
}

function leafSpray(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = "#b98d4f";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(60, -10, 120, 10);
  ctx.stroke();
  for (let i = 1; i <= 4; i++) {
    const px = i * 26;
    const py = -2 + i * 2;
    ctx.beginPath();
    ctx.ellipse(px, py - 12, 6, 13, -0.5, 0, Math.PI * 2);
    ctx.ellipse(px + 6, py + 12, 6, 13, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(185,141,79,0.55)";
    ctx.fill();
  }
  ctx.restore();
}

export async function renderKeepsake(): Promise<Blob | null> {
  if (document.fonts?.ready) await document.fonts.ready;
  const serif = fontStack("font-serif", "Georgia, serif");
  const hand = fontStack("font-hand", "cursive");
  const sans = fontStack("font-sans", "sans-serif");

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // paper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fffaf3");
  bg.addColorStop(1, "#f6e6d6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 520, 50, W / 2, 520, 700);
  glow.addColorStop(0, "rgba(232,167,182,0.25)");
  glow.addColorStop(1, "rgba(232,167,182,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // gold double border
  const gold = ctx.createLinearGradient(0, 0, W, H);
  gold.addColorStop(0, "#b98d4f");
  gold.addColorStop(0.5, "#f3dca8");
  gold.addColorStop(1, "#b98d4f");
  ctx.strokeStyle = gold;
  ctx.lineWidth = 6;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 2;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  // floral corners
  const corners: [number, number, number][] = [
    [62, 62, 0.4],
    [W - 62, 62, 2.7],
    [62, H - 62, -0.4],
    [W - 62, H - 62, 3.5],
  ];
  corners.forEach(([x, y, a]) => {
    leafSpray(ctx, x, y, a + 0.4);
    leafSpray(ctx, x, y, a - 0.2);
    flower(ctx, x, y, 1.6, "#E8A7B6");
    flower(ctx, x + Math.cos(a + 0.4) * 70, y + Math.sin(a + 0.4) * 70, 0.9, "#B9A5D1");
  });

  // arched photo
  const photo = portraitPhoto();
  const img = photo ? await loadImage(photo.src) : null;
  const pw = 640;
  const ph = 760;
  const px = (W - pw) / 2;
  const py = 150;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px, py + ph);
  ctx.lineTo(px, py + pw / 2);
  ctx.arc(px + pw / 2, py + pw / 2, pw / 2, Math.PI, 0);
  ctx.lineTo(px + pw, py + ph);
  ctx.closePath();
  ctx.shadowColor = "rgba(71,38,61,0.35)";
  ctx.shadowBlur = 40;
  ctx.fillStyle = "#47263D";
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.clip();
  if (img) {
    const scale = Math.max(pw / img.width, ph / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) * 0.2, dw, dh);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(px - 12, py + ph + 12);
  ctx.lineTo(px - 12, py + pw / 2);
  ctx.arc(px + pw / 2, py + pw / 2, pw / 2 + 12, Math.PI, 0);
  ctx.lineTo(px + pw + 12, py + ph + 12);
  ctx.closePath();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.stroke();

  // text
  ctx.textAlign = "center";
  ctx.fillStyle = "#a87d42";
  ctx.font = `600 26px ${sans}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("THE MAGIC OF YOU", W / 2, 1000);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#47263D";
  ctx.font = `600 96px ${serif}`;
  ctx.fillText("Happy Birthday", W / 2, 1110);

  ctx.font = `italic 500 78px ${serif}`;
  const nameGrad = ctx.createLinearGradient(W / 2 - 250, 0, W / 2 + 250, 0);
  nameGrad.addColorStop(0, "#a87d42");
  nameGrad.addColorStop(0.5, "#c99a55");
  nameGrad.addColorStop(1, "#a87d42");
  ctx.fillStyle = nameGrad;
  ctx.fillText(birthday.momName, W / 2, 1205);

  ctx.fillStyle = "#7a5a6b";
  ctx.font = `500 28px ${sans}`;
  ctx.letterSpacing = "6px";
  ctx.fillText(birthday.birthdayDateLabel.toUpperCase(), W / 2, 1260);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#4a2c3d";
  ctx.font = `italic 400 40px ${serif}`;
  wrap(ctx, birthday.keepsakeMessage, 880).forEach((l, i) => ctx.fillText(l, W / 2, 1345 + i * 52));

  ctx.fillStyle = "#47263D";
  ctx.font = `600 54px ${hand}`;
  ctx.fillText(`With love, ${birthday.senderSignature.toLowerCase()} ♥`, W / 2, 1540);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}
