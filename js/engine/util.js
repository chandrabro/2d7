// Shared math / color / drawing utilities for the engine.
// Everything here is pure and deterministic (no Date.now, no Math.random) so that
// preview and export render identical frames for the same time value.

export const STAGE_W = 1280;
export const STAGE_H = 720;

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = lerp;
export const smoothstep = (t) => t * t * (3 - 2 * t);
export const fract = (v) => v - Math.floor(v);

export const ease = {
  linear: (t) => t,
  inOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  in: (t) => t * t,
  out: (t) => t * (2 - t),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  bounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  elastic: (t) => (t === 0 || t === 1 ? t : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * (TAU / 3)) + (t === 1 ? 1 : 0)),
};

/** Deterministic pseudo random generator (mulberry32). */
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + (hi - lo) * next();
  next.int = (lo, hi) => Math.floor(next.range(lo, hi + 1));
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  return next;
}

/** Hash a string to a 32 bit int (for seeds). */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// ---------- colors ----------
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const v = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
/** Lighten (amt>0) or darken (amt<0) a hex color. amt in -1..1 */
export function shade(hex, amt) {
  const [r, g, b] = hexToRgb(hex);
  const f = (c) => (amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  return rgbToHex([f(r), f(g), f(b)]);
}
/** Mix two hex colors. */
export function mixColor(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]);
}
export function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---------- canvas helpers ----------
export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, TAU);
  ctx.closePath();
}
export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, Math.abs(r), 0, TAU);
  ctx.closePath();
}
export function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.closePath();
}
/** Smooth closed/open curve through points using quadratic midpoints. */
export function curve(ctx, pts, closed = false) {
  ctx.beginPath();
  if (pts.length < 2) return;
  if (closed) {
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const p0 = pts[i], p1 = pts[(i + 1) % n];
      const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
      if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
    }
    const p0 = pts[0], p1 = pts[1];
    ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    ctx.closePath();
  } else {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const l = pts[pts.length - 1];
    ctx.lineTo(l[0], l[1]);
  }
}
export function fillRect(ctx, x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
export function fillRound(ctx, x, y, w, h, r, color) { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = color; ctx.fill(); }
export function fillEllipse(ctx, x, y, rx, ry, color, rot = 0) { ellipse(ctx, x, y, rx, ry, rot); ctx.fillStyle = color; ctx.fill(); }
export function fillCircle(ctx, x, y, r, color) { circle(ctx, x, y, r); ctx.fillStyle = color; ctx.fill(); }
export function fillPoly(ctx, pts, color) { poly(ctx, pts); ctx.fillStyle = color; ctx.fill(); }
export function strokeLine(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke();
}
export function linGrad(ctx, x1, y1, x2, y2, stops) {
  const g = ctx.createLinearGradient(x1, y1, x2, y2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
export function radGrad(ctx, x, y, r0, r1, stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
/** Soft drop shadow ellipse on the ground. */
export function groundShadow(ctx, x, y, rx, ry, alpha = 0.28) {
  ctx.fillStyle = radGrad(ctx, x, y, 0, rx, [[0, `rgba(0,0,0,${alpha})`], [0.7, `rgba(0,0,0,${alpha * 0.5})`], [1, 'rgba(0,0,0,0)']]);
  ellipse(ctx, x, y, rx, ry); ctx.fill();
}
export function withAlpha(ctx, alpha, fn) {
  const old = ctx.globalAlpha; ctx.globalAlpha = old * alpha; fn(); ctx.globalAlpha = old;
}
export function withShadow(ctx, color, blur, ox, oy, fn) {
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = blur; ctx.shadowOffsetX = ox; ctx.shadowOffsetY = oy; fn(); ctx.restore();
}

/** Text with word wrap. Returns the lines. */
export function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function uid(prefix = 'id') {
  return prefix + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
