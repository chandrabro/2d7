// Reusable scenery drawing helpers used by all 50 scene painters.
// Every function draws in STAGE coordinates (1280 x 720). `env` is:
//   { W, H, t (seconds), tod ('day'|'dawn'|'sunset'|'night'), seed, weather }
// Helpers never call Math.random – use env.rng / rng(seed) for determinism.

import {
  STAGE_W, STAGE_H, TAU, DEG, clamp, lerp, mixColor, shade, rgba, rng, hash,
  roundRect, ellipse, circle, poly, curve, fillRect, fillRound, fillEllipse, fillCircle,
  fillPoly, strokeLine, linGrad, radGrad, groundShadow, withAlpha,
} from './util.js';

export { STAGE_W, STAGE_H };

// ---------- time of day palettes ----------
export const TOD = {
  day:    { skyTop: '#3f8fd6', skyMid: '#8ec8f2', skyBot: '#dff0fb', sun: '#fff4c2', haze: '#dbe9f4', light: 1.0, tint: null,            ambient: '#ffffff' },
  dawn:   { skyTop: '#5d6fb3', skyMid: '#e8a07a', skyBot: '#ffd9a8', sun: '#ffd27a', haze: '#f2c9b0', light: 0.85, tint: 'rgba(255,170,110,0.10)', ambient: '#ffe4cc' },
  sunset: { skyTop: '#3b3b7a', skyMid: '#e8694e', skyBot: '#ffc46b', sun: '#ffb347', haze: '#f0a978', light: 0.8,  tint: 'rgba(255,120,60,0.14)',  ambient: '#ffd0a0' },
  night:  { skyTop: '#060a1f', skyMid: '#111a3f', skyBot: '#243256', sun: '#f4f1d8', haze: '#1b2544', light: 0.45, tint: 'rgba(20,30,80,0.38)',   ambient: '#9aa8ff' },
};
export const todOf = (env) => TOD[env.tod] || TOD.day;

/** Returns a color darkened according to time of day (for outdoor objects). */
export function lit(env, color, amount = 1) {
  const p = todOf(env);
  if (env.tod === 'night') return mixColor(shade(color, -0.55 * amount), '#1a2a5a', 0.25 * amount);
  if (env.tod === 'sunset') return mixColor(color, '#ff9a4a', 0.12 * amount);
  if (env.tod === 'dawn') return mixColor(color, '#ffc9a0', 0.10 * amount);
  return color;
}

// ---------- sky ----------
export function sky(ctx, env, opts = {}) {
  const { W, H } = env; const p = todOf(env);
  const horizon = opts.horizon ?? H * 0.62;
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, horizon + 60, [[0, p.skyTop], [0.55, p.skyMid], [1, p.skyBot]]);
  ctx.fillRect(0, 0, W, horizon + 60);
  if (env.tod === 'night') stars(ctx, env, horizon);
  if (opts.sun !== false) sunMoon(ctx, env, opts.sunX ?? W * 0.78, opts.sunY ?? (env.tod === 'day' ? H * 0.17 : H * 0.42));
  if (opts.clouds !== false) clouds(ctx, env, horizon, opts.cloudCount ?? 5, opts.cloudSeed ?? 7);
}
export function stars(ctx, env, horizon) {
  const r = rng(hash('stars' + env.seed));
  const n = 140;
  for (let i = 0; i < n; i++) {
    const x = r() * env.W, y = r() * horizon * 0.9;
    const tw = 0.5 + 0.5 * Math.sin(env.t * (1 + r() * 3) + i);
    ctx.fillStyle = `rgba(255,255,240,${(0.35 + 0.65 * tw) * (0.5 + r() * 0.5)})`;
    circle(ctx, x, y, 0.6 + r() * 1.3); ctx.fill();
  }
}
export function sunMoon(ctx, env, x, y) {
  const p = todOf(env);
  if (env.tod === 'night') {
    ctx.fillStyle = radGrad(ctx, x, y, 0, 110, [[0, 'rgba(230,235,255,0.35)'], [1, 'rgba(230,235,255,0)']]);
    circle(ctx, x, y, 110); ctx.fill();
    fillCircle(ctx, x, y, 34, '#f4f1d8');
    fillCircle(ctx, x + 12, y - 6, 26, p.skyMid); // crescent
  } else {
    const r = env.tod === 'day' ? 42 : 56;
    ctx.fillStyle = radGrad(ctx, x, y, r * 0.8, r * 4.5, [[0, rgba(p.sun, 0.55)], [1, rgba(p.sun, 0)]]);
    circle(ctx, x, y, r * 4.5); ctx.fill();
    fillCircle(ctx, x, y, r, p.sun);
  }
}
export function clouds(ctx, env, horizon, count = 5, seed = 7) {
  const r = rng(hash('clouds' + seed + env.seed));
  const p = todOf(env);
  const base = env.tod === 'night' ? '#2a3458' : env.tod === 'sunset' ? '#ffd9c0' : env.tod === 'dawn' ? '#fff0e0' : '#ffffff';
  const shadow = env.tod === 'night' ? '#1b2340' : env.tod === 'sunset' ? '#e6a07a' : '#d9e6f0';
  for (let i = 0; i < count; i++) {
    const w = 140 + r() * 220, h = w * 0.32;
    const y = 40 + r() * (horizon * 0.5);
    const speed = 6 + r() * 10;
    const x = ((r() * (env.W + w) + env.t * speed) % (env.W + w * 1.4)) - w * 0.7;
    cloud(ctx, x, y, w, h, base, shadow);
  }
}
export function cloud(ctx, x, y, w, h, color = '#fff', shadowColor = '#d9e6f0') {
  const puffs = [[0.2, 0.55, 0.4], [0.45, 0.35, 0.6], [0.72, 0.5, 0.5], [0.9, 0.7, 0.3], [0.1, 0.8, 0.3], [0.5, 0.85, 0.35]];
  ctx.fillStyle = shadowColor;
  puffs.forEach(([px, py, pr]) => { circle(ctx, x + px * w, y + py * h + 6, pr * h); ctx.fill(); });
  ctx.fillStyle = color;
  puffs.forEach(([px, py, pr]) => { circle(ctx, x + px * w, y + py * h, pr * h); ctx.fill(); });
}

// ---------- land ----------
export function ground(ctx, env, y, top = '#6ab04c', bottom = '#3f7a2d') {
  const { W, H } = env;
  ctx.fillStyle = linGrad(ctx, 0, y, 0, H, [[0, lit(env, top)], [1, lit(env, bottom)]]);
  ctx.fillRect(0, y, W, H - y);
}
export function grassTufts(ctx, env, y1, y2, count = 60, color = '#4f9a3a', seed = 3) {
  const r = rng(hash('grass' + seed + env.seed));
  ctx.strokeStyle = lit(env, color); ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * env.W, y = lerp(y1, y2, r());
    const s = 4 + r() * 8 * ((y - y1) / (y2 - y1) + 0.4);
    ctx.beginPath();
    for (let k = -1; k <= 1; k++) { ctx.moveTo(x, y); ctx.lineTo(x + k * s * 0.5 + Math.sin(env.t * 2 + i) * 1.5, y - s); }
    ctx.stroke();
  }
}
export function flowerPatch(ctx, env, y1, y2, count = 30, seed = 5, colors = ['#ff6b81', '#ffd93d', '#ff9f43', '#c56cf0', '#ffffff']) {
  const r = rng(hash('flowers' + seed + env.seed));
  for (let i = 0; i < count; i++) {
    const x = r() * env.W, y = lerp(y1, y2, r());
    const s = 3 + r() * 4 * ((y - y1) / (y2 - y1) + 0.5);
    strokeLine(ctx, x, y, x, y - s * 2.2, lit(env, '#3d8a2e'), 1.5);
    const c = lit(env, r.pick(colors));
    for (let k = 0; k < 5; k++) { const a = (k / 5) * TAU; fillCircle(ctx, x + Math.cos(a) * s * 0.8, y - s * 2.2 + Math.sin(a) * s * 0.8, s * 0.55, c); }
    fillCircle(ctx, x, y - s * 2.2, s * 0.45, lit(env, '#ffe66d'));
  }
}
export function hills(ctx, env, baseY, color, seed = 1, amplitude = 60, count = 3, haze = 0) {
  const r = rng(hash('hills' + seed + env.seed));
  const p = todOf(env);
  const c = mixColor(lit(env, color), p.haze, haze);
  ctx.fillStyle = c;
  ctx.beginPath(); ctx.moveTo(-10, env.H);
  ctx.lineTo(-10, baseY);
  const segs = 8;
  for (let i = 0; i <= segs; i++) {
    const x = (i / segs) * (env.W + 20) - 10;
    const y = baseY - Math.abs(Math.sin(i * 1.3 + r() * 2)) * amplitude * (0.5 + r());
    const cx = x - (env.W / segs) / 2, cy = baseY - amplitude * (0.3 + r() * 0.7);
    ctx.quadraticCurveTo(cx, cy, x, y);
  }
  ctx.lineTo(env.W + 10, env.H); ctx.closePath(); ctx.fill();
}
export function mountains(ctx, env, baseY, color = '#5b6b8c', seed = 1, height = 220, snow = true, haze = 0.3) {
  const r = rng(hash('mtn' + seed + env.seed));
  const p = todOf(env);
  const c = mixColor(lit(env, color), p.haze, haze);
  const n = 6; const w = env.W / (n - 1.5);
  for (let i = -1; i < n; i++) {
    const x = i * w + r() * w * 0.4, h = height * (0.55 + r() * 0.6);
    const top = [x + w * 0.5, baseY - h];
    poly(ctx, [[x - w * 0.6, baseY + 2], top, [x + w * 1.6, baseY + 2]]);
    ctx.fillStyle = c; ctx.fill();
    // lit face
    poly(ctx, [[x - w * 0.6, baseY + 2], top, [x + w * 0.5, baseY + 2]]);
    ctx.fillStyle = rgba('#ffffff', env.tod === 'night' ? 0.03 : 0.08); ctx.fill();
    if (snow) {
      const sh = h * 0.28;
      poly(ctx, [top, [top[0] - sh * 0.7, top[1] + sh], [top[0] - sh * 0.3, top[1] + sh * 0.8], [top[0], top[1] + sh * 1.05], [top[0] + sh * 0.35, top[1] + sh * 0.75], [top[0] + sh * 0.75, top[1] + sh * 1.1]]);
      ctx.fillStyle = lit(env, '#f4f8ff'); ctx.fill();
    }
  }
}
export function dirtPath(ctx, env, xTop, wTop, yTop, xBot, wBot, yBot, color = '#b78a5c') {
  ctx.fillStyle = lit(env, color);
  ctx.beginPath();
  ctx.moveTo(xTop - wTop / 2, yTop);
  ctx.quadraticCurveTo((xTop + xBot) / 2 - 40, (yTop + yBot) / 2, xBot - wBot / 2, yBot);
  ctx.lineTo(xBot + wBot / 2, yBot);
  ctx.quadraticCurveTo((xTop + xBot) / 2 + 40, (yTop + yBot) / 2, xTop + wTop / 2, yTop);
  ctx.closePath(); ctx.fill();
}
export function road(ctx, env, y, h, color = '#3b3b45', dashes = true) {
  fillRect(ctx, 0, y, env.W, h, lit(env, color));
  fillRect(ctx, 0, y, env.W, 6, lit(env, '#8a8a95')); // curb
  if (dashes) {
    ctx.fillStyle = lit(env, '#f5e663');
    for (let x = 0; x < env.W; x += 90) fillRect(ctx, x, y + h / 2 - 3, 50, 6, ctx.fillStyle);
  }
}
export function water(ctx, env, y, h, color = '#3b8bd0', deep = '#1f5f9e') {
  const { W } = env;
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, lit(env, color)], [1, lit(env, deep)]]);
  ctx.fillRect(0, y, W, h);
  // reflection of sky light
  ctx.fillStyle = rgba(todOf(env).sun, env.tod === 'night' ? 0.15 : 0.25);
  ellipse(ctx, W * 0.72, y + h * 0.3, 120, h * 0.18); ctx.fill();
  // ripples
  ctx.strokeStyle = rgba('#ffffff', env.tod === 'night' ? 0.18 : 0.35); ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  const r = rng(hash('water' + env.seed));
  for (let i = 0; i < 26; i++) {
    const rx = r() * W, ry = y + 8 + r() * (h - 16); const len = 20 + r() * 60;
    const ox = Math.sin(env.t * 1.3 + i) * 8;
    ctx.beginPath(); ctx.moveTo(rx + ox - len / 2, ry); ctx.lineTo(rx + ox + len / 2, ry); ctx.stroke();
  }
}

// ---------- vegetation ----------
export function treeRound(ctx, env, x, y, size = 120, seed = 1, leaf = '#3f8f3a', trunk = '#6b4a2b') {
  const r = rng(hash('tree' + seed));
  const tw = size * 0.12, th = size * 0.55;
  groundShadow(ctx, x, y, size * 0.55, size * 0.1, 0.22);
  ctx.fillStyle = linGrad(ctx, x - tw, 0, x + tw, 0, [[0, lit(env, shade(trunk, -0.25))], [1, lit(env, trunk)]]);
  poly(ctx, [[x - tw, y], [x - tw * 0.6, y - th], [x + tw * 0.6, y - th], [x + tw, y]]); ctx.fill();
  const cy = y - th - size * 0.35;
  const dark = lit(env, shade(leaf, -0.3)), light = lit(env, shade(leaf, 0.15)), mid = lit(env, leaf);
  const blobs = [[0, 0, 0.5], [-0.35, 0.1, 0.38], [0.35, 0.12, 0.4], [-0.2, -0.3, 0.36], [0.22, -0.3, 0.36], [0, 0.3, 0.32]];
  ctx.fillStyle = dark; blobs.forEach(([bx, by, br]) => { circle(ctx, x + bx * size + 5, cy + by * size + 8, br * size); ctx.fill(); });
  ctx.fillStyle = mid; blobs.forEach(([bx, by, br]) => { circle(ctx, x + bx * size, cy + by * size, br * size); ctx.fill(); });
  ctx.fillStyle = light; blobs.slice(0, 5).forEach(([bx, by, br]) => { circle(ctx, x + bx * size - br * size * 0.25, cy + by * size - br * size * 0.3, br * size * 0.45); ctx.fill(); });
}
export function treePine(ctx, env, x, y, size = 140, leaf = '#2f6b3a', trunk = '#5b3d22') {
  groundShadow(ctx, x, y, size * 0.4, size * 0.08, 0.2);
  fillRect(ctx, x - size * 0.05, y - size * 0.25, size * 0.1, size * 0.25, lit(env, trunk));
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const w = size * (0.55 - i * 0.1), top = y - size * 0.2 - (i + 1) * size * 0.22, bot = y - size * 0.2 - i * size * 0.22 + size * 0.05;
    fillPoly(ctx, [[x - w, bot], [x, top], [x + w, bot]], lit(env, shade(leaf, -0.2 + i * 0.07)));
    fillPoly(ctx, [[x, top], [x + w, bot], [x + w * 0.2, bot]], rgba('#000', 0.1));
  }
}
export function treePalm(ctx, env, x, y, size = 160, lean = 0.2) {
  groundShadow(ctx, x, y, size * 0.3, size * 0.07, 0.2);
  const topX = x + lean * size, topY = y - size;
  ctx.strokeStyle = lit(env, '#8a6a3f'); ctx.lineWidth = size * 0.08; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * size * 0.3, y - size * 0.6, topX, topY); ctx.stroke();
  ctx.strokeStyle = lit(env, '#6b4f2b'); ctx.lineWidth = 2;
  for (let i = 1; i < 9; i++) { const py = lerp(y, topY, i / 9), px = lerp(x, topX, i / 9) + (lean * size * 0.3) * (1 - Math.abs(i / 9 - 0.5) * 2) * 0.5; strokeLine(ctx, px - size * 0.04, py, px + size * 0.04, py, ctx.strokeStyle, 2); }
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.15 - (i / 6) * Math.PI * 0.7 + Math.sin(env.t * 1.2 + i) * 0.03;
    const lx = topX + Math.cos(a) * size * 0.55, ly = topY + Math.sin(a) * size * 0.3 + size * 0.1;
    ctx.fillStyle = lit(env, i % 2 ? '#3f9a46' : '#2f7d3a');
    ctx.beginPath(); ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(topX + Math.cos(a) * size * 0.3, topY + Math.sin(a) * size * 0.1 - size * 0.12, lx, ly);
    ctx.quadraticCurveTo(topX + Math.cos(a) * size * 0.3, topY + Math.sin(a) * size * 0.15 + size * 0.08, topX, topY + 4);
    ctx.fill();
  }
  fillCircle(ctx, topX - 6, topY + 6, size * 0.05, lit(env, '#8b5a2b')); fillCircle(ctx, topX + 8, topY + 8, size * 0.05, lit(env, '#8b5a2b'));
}
export function bush(ctx, env, x, y, size = 60, color = '#3f8f3a') {
  const blobs = [[0, 0, 0.5], [-0.45, 0.15, 0.38], [0.45, 0.15, 0.38], [-0.2, -0.2, 0.35], [0.22, -0.22, 0.35]];
  ctx.fillStyle = lit(env, shade(color, -0.25)); blobs.forEach(([bx, by, br]) => { circle(ctx, x + bx * size, y + by * size * 0.6 - size * 0.3 + 4, br * size); ctx.fill(); });
  ctx.fillStyle = lit(env, color); blobs.forEach(([bx, by, br]) => { circle(ctx, x + bx * size, y + by * size * 0.6 - size * 0.3, br * size); ctx.fill(); });
  ctx.fillStyle = lit(env, shade(color, 0.2)); blobs.slice(0, 3).forEach(([bx, by, br]) => { circle(ctx, x + bx * size - size * 0.12, y + by * size * 0.6 - size * 0.42, br * size * 0.5); ctx.fill(); });
}
export function rock(ctx, env, x, y, w, h, color = '#8a8a8a') {
  curve(ctx, [[x - w / 2, y], [x - w * 0.4, y - h * 0.8], [x + w * 0.1, y - h], [x + w * 0.45, y - h * 0.6], [x + w / 2, y]], true);
  ctx.fillStyle = lit(env, color); ctx.fill();
  curve(ctx, [[x - w * 0.3, y - h * 0.5], [x - w * 0.1, y - h * 0.85], [x + w * 0.2, y - h * 0.8]], false);
  ctx.strokeStyle = rgba('#fff', 0.25); ctx.lineWidth = 2; ctx.stroke();
}

// ---------- buildings / exterior ----------
export function fence(ctx, env, x1, x2, y, h = 50, color = '#e8dcc8') {
  const c = lit(env, color), d = lit(env, shade(color, -0.3));
  for (let x = x1; x <= x2; x += 26) {
    fillRect(ctx, x, y - h, 10, h, c);
    fillPoly(ctx, [[x, y - h], [x + 5, y - h - 7], [x + 10, y - h]], c);
    fillRect(ctx, x + 8, y - h, 2, h, d);
  }
  fillRect(ctx, x1, y - h * 0.72, x2 - x1 + 10, 7, d);
  fillRect(ctx, x1, y - h * 0.32, x2 - x1 + 10, 7, d);
}
export function windowPane(ctx, env, x, y, w, h, opts = {}) {
  const night = env.tod === 'night';
  const isLit = opts.lit ?? night;
  fillRect(ctx, x - 4, y - 4, w + 8, h + 8, lit(env, opts.frame || '#f5f1e8'));
  ctx.fillStyle = night && isLit ? '#ffd98a' : lit(env, '#9fd3f5');
  ctx.fillRect(x, y, w, h);
  if (!night) { ctx.fillStyle = rgba('#fff', 0.35); fillPoly(ctx, [[x, y + h], [x + w * 0.6, y], [x + w * 0.85, y], [x + w * 0.25, y + h]], ctx.fillStyle); }
  fillRect(ctx, x + w / 2 - 2, y, 4, h, lit(env, opts.frame || '#f5f1e8'));
  fillRect(ctx, x, y + h / 2 - 2, w, 4, lit(env, opts.frame || '#f5f1e8'));
}
export function door(ctx, env, x, y, w, h, color = '#8b5a2b') {
  fillRound(ctx, x, y - h, w, h, 4, lit(env, shade(color, -0.3)));
  fillRound(ctx, x + 4, y - h + 4, w - 8, h - 4, 3, lit(env, color));
  fillCircle(ctx, x + w - 10, y - h / 2, 3, lit(env, '#f1c40f'));
}
export function house(ctx, env, x, y, w, h, opts = {}) {
  const wall = lit(env, opts.wall || '#f3e7cf'), roof = lit(env, opts.roof || '#b5473a');
  groundShadow(ctx, x + w / 2, y + 4, w * 0.6, 14, 0.2);
  fillRect(ctx, x, y - h, w, h, wall);
  fillRect(ctx, x, y - h, w, h, linGrad(ctx, x, 0, x + w, 0, [[0, rgba('#000', 0.12)], [0.5, rgba('#000', 0)], [1, rgba('#000', 0.08)]]));
  // roof
  const rh = opts.roofH || h * 0.5, ov = 18;
  fillPoly(ctx, [[x - ov, y - h], [x + w / 2, y - h - rh], [x + w + ov, y - h]], roof);
  fillPoly(ctx, [[x + w / 2, y - h - rh], [x + w + ov, y - h], [x + w / 2 + 10, y - h]], rgba('#000', 0.15));
  // chimney
  if (opts.chimney !== false) fillRect(ctx, x + w * 0.72, y - h - rh * 0.75, 22, rh * 0.5, lit(env, '#7a5a4a'));
  // door + windows
  door(ctx, env, x + w * 0.42, y, w * 0.16, h * 0.55, opts.door);
  windowPane(ctx, env, x + w * 0.1, y - h * 0.7, w * 0.2, h * 0.3);
  windowPane(ctx, env, x + w * 0.7, y - h * 0.7, w * 0.2, h * 0.3);
}
export function skyline(ctx, env, baseY, seed = 2, color = '#55607a', haze = 0.35, height = 260) {
  const r = rng(hash('sky' + seed + env.seed));
  const p = todOf(env);
  const c = mixColor(lit(env, color), p.haze, haze);
  let x = -20;
  while (x < env.W + 20) {
    const w = 40 + r() * 90, h = height * (0.3 + r() * 0.7);
    fillRect(ctx, x, baseY - h, w, h, c);
    if (r() > 0.6) fillRect(ctx, x + w * 0.3, baseY - h - 18, w * 0.4, 18, c);
    // windows
    const night = env.tod === 'night';
    for (let wy = baseY - h + 12; wy < baseY - 12; wy += 16) for (let wx = x + 8; wx < x + w - 10; wx += 14) {
      const on = r() > (night ? 0.45 : 0.75);
      ctx.fillStyle = night ? (on ? 'rgba(255,220,130,0.85)' : 'rgba(255,255,255,0.05)') : rgba(on ? '#dfe9f5' : '#aab6c8', 0.6 * (1 - haze));
      ctx.fillRect(wx, wy, 7, 9);
    }
    x += w + 6 + r() * 10;
  }
}
export function streetLamp(ctx, env, x, y, h = 220) {
  fillRect(ctx, x - 4, y - h, 8, h, lit(env, '#3a3a40'));
  fillRect(ctx, x - 14, y - h, 28, 8, lit(env, '#3a3a40'));
  fillRound(ctx, x - 12, y - h - 24, 24, 26, 5, env.tod === 'night' ? '#ffe9a8' : lit(env, '#e9eef5'));
  if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, x, y - h - 10, 0, h, [[0, 'rgba(255,230,160,0.35)'], [1, 'rgba(255,230,160,0)']]); poly(ctx, [[x - 20, y - h], [x + 20, y - h], [x + 140, y + 10], [x - 140, y + 10]]); ctx.fill(); }
}
export function car(ctx, env, x, y, w = 160, color = '#d63031', dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  groundShadow(ctx, 0, 2, w * 0.55, 8, 0.3);
  fillRound(ctx, -w / 2, -w * 0.28, w, w * 0.22, 10, lit(env, color));
  fillRound(ctx, -w * 0.3, -w * 0.45, w * 0.55, w * 0.22, 10, lit(env, shade(color, -0.1)));
  fillRound(ctx, -w * 0.26, -w * 0.43, w * 0.22, w * 0.16, 4, lit(env, '#bfe3f8'));
  fillRound(ctx, 0, -w * 0.43, w * 0.2, w * 0.16, 4, lit(env, '#bfe3f8'));
  fillCircle(ctx, -w * 0.3, -w * 0.05, w * 0.08, '#222'); fillCircle(ctx, -w * 0.3, -w * 0.05, w * 0.04, '#999');
  fillCircle(ctx, w * 0.3, -w * 0.05, w * 0.08, '#222'); fillCircle(ctx, w * 0.3, -w * 0.05, w * 0.04, '#999');
  fillRect(ctx, w / 2 - 8, -w * 0.22, 8, 8, env.tod === 'night' ? '#fff5b8' : '#f9e79f');
  ctx.restore();
}

// ---------- interiors ----------
export function wall(ctx, env, color = '#f1e4cf', opts = {}) {
  const { W, H } = env; const floorY = opts.floorY ?? H * 0.72;
  const c = env.tod === 'night' && !opts.ignoreTod ? shade(color, -0.35) : color;
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, floorY, [[0, shade(c, -0.08)], [0.5, c], [1, shade(c, -0.05)]]);
  ctx.fillRect(0, 0, W, floorY);
  if (opts.wainscot) { fillRect(ctx, 0, floorY - 110, W, 110, shade(c, -0.18)); fillRect(ctx, 0, floorY - 112, W, 6, shade(c, 0.2)); }
  if (opts.stripes) { ctx.fillStyle = rgba('#000', 0.04); for (let x = 0; x < W; x += 60) ctx.fillRect(x, 0, 28, floorY); }
  // baseboard
  fillRect(ctx, 0, floorY - 10, W, 10, shade(c, -0.3));
}
export function floor(ctx, env, y, type = 'wood', color) {
  const { W, H } = env;
  const dark = env.tod === 'night' ? -0.3 : 0;
  if (type === 'wood') {
    const c = shade(color || '#b98556', dark);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, H, [[0, shade(c, 0.05)], [1, shade(c, -0.25)]]); ctx.fillRect(0, y, W, H - y);
    ctx.strokeStyle = rgba('#000', 0.18); ctx.lineWidth = 1.5;
    for (let i = 0; i <= 14; i++) { const x = (i / 14) * W; const vx = W / 2 + (x - W / 2) * 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(vx, H); ctx.stroke(); }
    for (let k = 1; k < 5; k++) { const yy = y + (H - y) * (k * k) / 25; strokeLine(ctx, 0, yy, W, yy, rgba('#000', 0.12), 1.5); }
  } else if (type === 'tile') {
    const c = shade(color || '#e8ecef', dark);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, H, [[0, c], [1, shade(c, -0.2)]]); ctx.fillRect(0, y, W, H - y);
    ctx.strokeStyle = rgba('#000', 0.15); ctx.lineWidth = 2;
    for (let i = 0; i <= 10; i++) { const x = (i / 10) * W; const vx = W / 2 + (x - W / 2) * 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(vx, H); ctx.stroke(); }
    for (let k = 1; k < 6; k++) { const yy = y + (H - y) * (k * k) / 36; strokeLine(ctx, 0, yy, W, yy, rgba('#000', 0.15), 2); }
  } else if (type === 'carpet') {
    const c = shade(color || '#8e5b8a', dark);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, H, [[0, c], [1, shade(c, -0.25)]]); ctx.fillRect(0, y, W, H - y);
  } else if (type === 'concrete') {
    const c = shade(color || '#9a9ba0', dark);
    ctx.fillStyle = linGrad(ctx, 0, y, 0, H, [[0, c], [1, shade(c, -0.3)]]); ctx.fillRect(0, y, W, H - y);
  } else if (type === 'grass') { ground(ctx, env, y); }
  else { ctx.fillStyle = shade(color || '#999', dark); ctx.fillRect(0, y, W, H - y); }
  // contact shadow at wall/floor seam
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + 30, [[0, rgba('#000', 0.25)], [1, rgba('#000', 0)]]); ctx.fillRect(0, y, W, 30);
}
export function rug(ctx, env, x, y, w, h, color = '#c0392b') {
  ctx.fillStyle = shade(color, env.tod === 'night' ? -0.3 : 0);
  poly(ctx, [[x - w * 0.42, y - h / 2], [x + w * 0.42, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]]); ctx.fill();
  ctx.strokeStyle = rgba('#fff', 0.35); ctx.lineWidth = 3; poly(ctx, [[x - w * 0.37, y - h * 0.38], [x + w * 0.37, y - h * 0.38], [x + w * 0.44, y + h * 0.38], [x - w * 0.44, y + h * 0.38]]); ctx.stroke();
}
export function windowInterior(ctx, env, x, y, w, h, opts = {}) {
  // Window on a wall showing outside sky
  const p = todOf(env);
  fillRect(ctx, x - 8, y - 8, w + 16, h + 16, opts.frame || '#ffffff');
  ctx.fillStyle = linGrad(ctx, 0, y, 0, y + h, [[0, p.skyTop], [0.6, p.skyMid], [1, p.skyBot]]); ctx.fillRect(x, y, w, h);
  if (env.tod === 'night') { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); stars(ctx, { ...env, W: x + w, t: env.t }, y + h); ctx.restore(); }
  if (opts.view !== 'none') { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); hills(ctx, { ...env, W: x + w + 200, H: y + h }, y + h * 0.75, '#6fae5a', 4, h * 0.2, 3, 0.2); ctx.restore(); }
  fillRect(ctx, x + w / 2 - 4, y, 8, h, opts.frame || '#ffffff'); fillRect(ctx, x, y + h / 2 - 4, w, 8, opts.frame || '#ffffff');
  if (opts.curtains !== false) {
    const cc = opts.curtain || '#e07b5a';
    ctx.fillStyle = cc; fillPoly(ctx, [[x - 14, y - 12], [x + w * 0.22, y - 12], [x + w * 0.1, y + h + 10], [x - 14, y + h + 10]], cc);
    fillPoly(ctx, [[x + w + 14, y - 12], [x + w * 0.78, y - 12], [x + w * 0.9, y + h + 10], [x + w + 14, y + h + 10]], cc);
    fillRect(ctx, x - 20, y - 18, w + 40, 8, shade(cc, -0.3));
  }
  // light shaft
  if (env.tod !== 'night') { ctx.fillStyle = linGrad(ctx, x, y, x + w * 0.3, y + h * 1.5, [[0, rgba('#fff', 0.14)], [1, rgba('#fff', 0)]]); fillPoly(ctx, [[x, y], [x + w, y], [x + w * 1.25, y + h * 1.6], [x - w * 0.25, y + h * 1.6]], ctx.fillStyle); }
}
export function sofa(ctx, env, x, y, w = 320, h = 110, color = '#4f6d9a') {
  const c = shade(color, env.tod === 'night' ? -0.3 : 0);
  groundShadow(ctx, x + w / 2, y + 4, w * 0.55, 14, 0.25);
  fillRound(ctx, x, y - h, w, h * 0.55, 10, shade(c, -0.1)); // back
  fillRound(ctx, x + 6, y - h * 0.6, w - 12, h * 0.35, 8, c); // seat
  for (let i = 0; i < 3; i++) fillRound(ctx, x + 14 + i * ((w - 28) / 3), y - h * 0.95, (w - 28) / 3 - 6, h * 0.45, 8, shade(c, 0.08)); // cushions
  fillRound(ctx, x - 10, y - h * 0.75, 28, h * 0.6, 8, shade(c, -0.05)); fillRound(ctx, x + w - 18, y - h * 0.75, 28, h * 0.6, 8, shade(c, -0.05)); // arms
  fillRect(ctx, x + 10, y - 12, 14, 12, '#5a3b22'); fillRect(ctx, x + w - 24, y - 12, 14, 12, '#5a3b22');
}
export function table(ctx, env, x, y, w = 200, h = 70, color = '#8b5a2b', top = null) {
  const c = shade(color, env.tod === 'night' ? -0.3 : 0);
  groundShadow(ctx, x + w / 2, y + 4, w * 0.5, 10, 0.2);
  fillRect(ctx, x + 8, y - h, 10, h, shade(c, -0.2)); fillRect(ctx, x + w - 18, y - h, 10, h, shade(c, -0.2));
  fillRect(ctx, x + 24, y - h, 8, h, shade(c, -0.35)); fillRect(ctx, x + w - 32, y - h, 8, h, shade(c, -0.35));
  fillRound(ctx, x - 6, y - h - 10, w + 12, 14, 3, top ? shade(top, env.tod === 'night' ? -0.3 : 0) : shade(c, 0.1));
}
export function chair(ctx, env, x, y, w = 50, h = 95, color = '#8b5a2b', dir = 1) {
  const c = shade(color, env.tod === 'night' ? -0.3 : 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  fillRect(ctx, 2, -h * 0.5, 6, h * 0.5, shade(c, -0.25)); fillRect(ctx, w - 8, -h * 0.5, 6, h * 0.5, shade(c, -0.25));
  fillRound(ctx, 0, -h * 0.5, w, 10, 3, c);
  fillRound(ctx, w - 10, -h, 10, h * 0.55, 3, shade(c, -0.1));
  fillRound(ctx, w - 10, -h, 10, 8, 3, c);
  ctx.restore();
}
export function shelf(ctx, env, x, y, w = 160, h = 240, color = '#7a5230', seed = 1) {
  const c = shade(color, env.tod === 'night' ? -0.3 : 0);
  const r = rng(hash('shelf' + seed));
  fillRect(ctx, x, y - h, w, h, shade(c, -0.15));
  const rows = Math.max(2, Math.round(h / 60));
  for (let i = 0; i < rows; i++) {
    const ry = y - h + 8 + i * ((h - 10) / rows), rh = (h - 10) / rows - 8;
    fillRect(ctx, x + 6, ry, w - 12, rh, shade(c, -0.4));
    let bx = x + 10;
    while (bx < x + w - 18) {
      const bw = 10 + r() * 12, bh = rh * (0.6 + r() * 0.35);
      fillRect(ctx, bx, ry + rh - bh, bw, bh, r.pick(['#c0392b', '#2980b9', '#27ae60', '#f39c12', '#8e44ad', '#ecf0f1', '#34495e']));
      bx += bw + 2;
    }
    fillRect(ctx, x + 4, ry + rh, w - 8, 6, c);
  }
}
export function tv(ctx, env, x, y, w = 220, h = 130, on = true) {
  fillRound(ctx, x, y - h, w, h, 6, '#1c1c22');
  ctx.fillStyle = on ? linGrad(ctx, x, y - h, x + w, y, [[0, '#2f80ed'], [0.5, '#56ccf2'], [1, '#9b51e0']]) : '#2a2a33';
  roundRect(ctx, x + 8, y - h + 8, w - 16, h - 22, 3); ctx.fill();
  if (on) { ctx.fillStyle = rgba('#fff', 0.3 + 0.1 * Math.sin(env.t * 3)); fillPoly(ctx, [[x + 8, y - 14], [x + w * 0.5, y - h + 8], [x + w * 0.7, y - h + 8], [x + 8 + w * 0.3, y - 14]], ctx.fillStyle); }
  fillRect(ctx, x + w / 2 - 20, y - 6, 40, 6, '#3a3a44');
}
export function lamp(ctx, env, x, y, h = 170, on = null) {
  const lightOn = on ?? env.tod === 'night';
  fillRect(ctx, x - 3, y - h, 6, h, '#4a4a55'); fillEllipse(ctx, x, y, 22, 6, '#4a4a55');
  if (lightOn) { ctx.fillStyle = radGrad(ctx, x, y - h + 10, 0, 180, [[0, 'rgba(255,220,150,0.45)'], [1, 'rgba(255,220,150,0)']]); circle(ctx, x, y - h + 10, 180); ctx.fill(); }
  fillPoly(ctx, [[x - 24, y - h + 30], [x - 16, y - h - 20], [x + 16, y - h - 20], [x + 24, y - h + 30]], lightOn ? '#ffe6b0' : '#e8d9b8');
}
export function plantPot(ctx, env, x, y, size = 80, pot = '#c0632b', leaf = '#3b9a4a') {
  fillPoly(ctx, [[x - size * 0.25, y - size * 0.3], [x + size * 0.25, y - size * 0.3], [x + size * 0.18, y], [x - size * 0.18, y]], lit(env, pot));
  fillRect(ctx, x - size * 0.28, y - size * 0.36, size * 0.56, size * 0.08, lit(env, shade(pot, 0.15)));
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.35 + Math.sin(env.t * 1.5 + i) * 0.03;
    const lx = x + Math.cos(a) * size * 0.5, ly = y - size * 0.35 + Math.sin(a) * size * 0.55;
    ctx.fillStyle = lit(env, i % 2 ? leaf : shade(leaf, -0.15));
    ctx.beginPath(); ctx.moveTo(x, y - size * 0.3); ctx.quadraticCurveTo(lx + size * 0.12, ly - size * 0.1, lx, ly); ctx.quadraticCurveTo(lx - size * 0.1, ly + size * 0.05, x, y - size * 0.3); ctx.fill();
  }
}
export function bed(ctx, env, x, y, w = 300, h = 90, blanket = '#e74c3c') {
  const dark = env.tod === 'night' ? -0.3 : 0;
  groundShadow(ctx, x + w / 2, y + 4, w * 0.55, 14, 0.22);
  fillRound(ctx, x, y - h - 60, 18, h + 60, 5, shade('#8b5a2b', dark)); // headboard
  fillRect(ctx, x, y - h, w, h * 0.5, shade('#8b5a2b', dark)); // frame
  fillRound(ctx, x + 10, y - h - 10, w - 20, h * 0.45, 8, shade('#f5f1e8', dark)); // mattress
  fillRound(ctx, x + 70, y - h - 16, w - 90, h * 0.5, 10, shade(blanket, dark)); // blanket
  fillRound(ctx, x + 20, y - h - 28, 60, 26, 10, shade('#ffffff', dark)); // pillow
  fillRect(ctx, x + 8, y - 14, 12, 14, shade('#5a3b22', dark)); fillRect(ctx, x + w - 20, y - 14, 12, 14, shade('#5a3b22', dark));
}
export function pictureFrame(ctx, env, x, y, w = 90, h = 70, seed = 1) {
  const r = rng(hash('pic' + seed));
  fillRect(ctx, x - 5, y - 5, w + 10, h + 10, '#5a3b22');
  ctx.fillStyle = linGrad(ctx, x, y, x, y + h, [[0, '#8ec8f2'], [1, '#dff0fb']]); ctx.fillRect(x, y, w, h);
  fillPoly(ctx, [[x, y + h], [x + w * 0.35, y + h * 0.4], [x + w * 0.6, y + h * 0.75], [x + w * 0.8, y + h * 0.5], [x + w, y + h]], r.pick(['#5b8a5a', '#6c7fa8', '#b58a5a']));
  fillCircle(ctx, x + w * 0.75, y + h * 0.28, 8, '#ffe66d');
}
export function counter(ctx, env, x, y, w, h = 90, color = '#d8d2c4', top = '#555a66') {
  const dark = env.tod === 'night' ? -0.3 : 0;
  fillRect(ctx, x, y - h, w, h, shade(color, dark));
  for (let cx = x + 8; cx < x + w - 60; cx += 70) { fillRound(ctx, cx, y - h + 14, 60, h - 22, 3, shade(color, dark - 0.12)); fillRect(ctx, cx + 20, y - h / 2, 20, 4, shade(color, dark - 0.4)); }
  fillRect(ctx, x - 6, y - h - 10, w + 12, 12, shade(top, dark));
}
export function fridge(ctx, env, x, y, w = 90, h = 200, color = '#dfe6ee') {
  const dark = env.tod === 'night' ? -0.3 : 0;
  fillRound(ctx, x, y - h, w, h, 6, shade(color, dark));
  fillRect(ctx, x, y - h * 0.62, w, 3, shade(color, dark - 0.35));
  fillRound(ctx, x + w - 14, y - h * 0.9, 5, h * 0.2, 2, shade(color, dark - 0.4)); fillRound(ctx, x + w - 14, y - h * 0.55, 5, h * 0.3, 2, shade(color, dark - 0.4));
}
export function stove(ctx, env, x, y, w = 120, h = 90, flame = false) {
  const dark = env.tod === 'night' ? -0.3 : 0;
  fillRect(ctx, x, y - h, w, h, shade('#c9ced6', dark));
  fillRect(ctx, x - 4, y - h - 8, w + 8, 10, shade('#3a3f48', dark));
  fillRound(ctx, x + 12, y - h + 14, w - 24, h * 0.5, 4, shade('#2b2f36', dark));
  fillRect(ctx, x + 16, y - h + 18, w - 32, 4, shade('#555b66', dark));
  for (let i = 0; i < 4; i++) fillCircle(ctx, x + 18 + i * ((w - 36) / 3), y - h / 2 + 24, 4, '#777');
  for (let i = 0; i < 2; i++) { fillCircle(ctx, x + w * 0.3 + i * w * 0.4, y - h - 10, 12, '#222'); }
  if (flame) for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; fillEllipse(ctx, x + w * 0.3 + Math.cos(a) * 9, y - h - 12 + Math.sin(a) * 3, 3, 5 + Math.sin(env.t * 20 + i) * 1.5, '#3498db'); }
}
export function desk(ctx, env, x, y, w = 160, h = 75, color = '#c8b8a0') {
  const dark = env.tod === 'night' ? -0.3 : 0;
  groundShadow(ctx, x + w / 2, y + 4, w * 0.5, 10, 0.2);
  fillRect(ctx, x + 6, y - h, 10, h, shade('#7a7f88', dark)); fillRect(ctx, x + w - 16, y - h, 10, h, shade('#7a7f88', dark));
  fillRound(ctx, x - 4, y - h - 8, w + 8, 10, 3, shade(color, dark));
  fillRect(ctx, x + w - 60, y - h, 50, h * 0.6, shade(color, dark - 0.15)); fillRect(ctx, x + w - 40, y - h + 14, 12, 3, '#444'); fillRect(ctx, x + w - 40, y - h + 34, 12, 3, '#444');
}
export function monitor(ctx, env, x, y, w = 70, h = 50, on = true) {
  fillRound(ctx, x, y - h - 10, w, h, 3, '#22252b');
  ctx.fillStyle = on ? linGrad(ctx, x, y - h, x + w, y, [[0, '#4facfe'], [1, '#00f2fe']]) : '#333'; roundRect(ctx, x + 4, y - h - 6, w - 8, h - 8, 2); ctx.fill();
  if (on) { ctx.fillStyle = rgba('#fff', 0.5); for (let i = 0; i < 4; i++) ctx.fillRect(x + 10, y - h + 2 + i * 8, w * (0.3 + ((i * 7) % 5) / 10), 3); }
  fillRect(ctx, x + w / 2 - 4, y - 10, 8, 10, '#22252b'); fillRect(ctx, x + w / 2 - 16, y - 2, 32, 3, '#22252b');
}
export function balloon(ctx, env, x, y, color = '#e74c3c', size = 22, phase = 0) {
  const by = y + Math.sin(env.t * 1.5 + phase) * 4;
  strokeLine(ctx, x, by + size, x + Math.sin(env.t + phase) * 3, by + size + 60, rgba('#000', 0.35), 1);
  fillEllipse(ctx, x, by, size * 0.8, size, color);
  fillPoly(ctx, [[x - 4, by + size - 2], [x + 4, by + size - 2], [x, by + size + 5]], color);
  fillEllipse(ctx, x - size * 0.3, by - size * 0.35, size * 0.2, size * 0.32, rgba('#fff', 0.5), -0.5);
}
export function bunting(ctx, env, x1, y1, x2, y2, colors = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#9b59b6']) {
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 40, x2, y2); ctx.stroke();
  const n = Math.max(3, Math.floor(Math.abs(x2 - x1) / 36));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const px = lerp(lerp(x1, (x1 + x2) / 2, t), lerp((x1 + x2) / 2, x2, t), t);
    const py = lerp(lerp(y1, Math.max(y1, y2) + 40, t), lerp(Math.max(y1, y2) + 40, y2, t), t);
    fillPoly(ctx, [[px - 12, py], [px + 12, py], [px, py + 26]], colors[i % colors.length]);
  }
}
export function spotlight(ctx, env, x, y, targetX, targetY, color = 'rgba(255,240,200,0.25)', width = 160) {
  ctx.fillStyle = linGrad(ctx, x, y, targetX, targetY, [[0, color], [1, 'rgba(255,255,255,0)']]);
  poly(ctx, [[x - 8, y], [x + 8, y], [targetX + width / 2, targetY], [targetX - width / 2, targetY]]); ctx.fill();
}
export function fire(ctx, env, x, y, size = 40, seed = 0) {
  const r = rng(hash('fire' + seed));
  for (let i = 0; i < 7; i++) {
    const ph = r() * TAU, sp = 3 + r() * 4;
    const fx = x + Math.sin(env.t * sp + ph) * size * 0.2 * (i / 7), fh = size * (0.6 + 0.4 * Math.abs(Math.sin(env.t * sp * 1.3 + ph)));
    ctx.fillStyle = ['#ff3b1f', '#ff6a1f', '#ffa21f', '#ffd21f', '#fff2a0'][Math.min(4, Math.floor(i / 1.5))];
    ctx.beginPath(); ctx.moveTo(fx - size * 0.3 * (1 - i / 9), y); ctx.quadraticCurveTo(fx - size * 0.3, y - fh * 0.5, fx, y - fh * (1 - i / 10)); ctx.quadraticCurveTo(fx + size * 0.3, y - fh * 0.5, fx + size * 0.3 * (1 - i / 9), y); ctx.fill();
  }
  ctx.fillStyle = radGrad(ctx, x, y - size * 0.3, 0, size * 4, [[0, 'rgba(255,160,60,0.35)'], [1, 'rgba(255,160,60,0)']]); circle(ctx, x, y - size * 0.3, size * 4); ctx.fill();
}
export function candle(ctx, env, x, y, h = 30, lit = true) {
  fillRect(ctx, x - 4, y - h, 8, h, '#fff5d6');
  if (lit) { fillEllipse(ctx, x, y - h - 8, 4, 8 + Math.sin(env.t * 15 + x) * 1.5, '#ffb52e'); fillEllipse(ctx, x, y - h - 7, 2, 4, '#fff6c0'); }
}
export function signBoard(ctx, env, x, y, w, h, text, bg = '#2c3e50', fg = '#ecf0f1', font = 'bold 22px sans-serif') {
  fillRound(ctx, x, y, w, h, 6, lit(env, bg));
  ctx.fillStyle = fg; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x + w / 2, y + h / 2); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}
export function vignette(ctx, env, strength = 0.35) {
  const { W, H } = env;
  ctx.fillStyle = radGrad(ctx, W / 2, H / 2, H * 0.45, H * 0.95, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${strength})`]]);
  ctx.fillRect(0, 0, W, H);
}
export function sunRays(ctx, env, x, y, count = 7, length = 900, alpha = 0.08) {
  if (env.tod === 'night') return;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < count; i++) {
    const a = Math.PI * 0.25 + (i / count) * Math.PI * 0.6 + Math.sin(env.t * 0.3 + i) * 0.02;
    ctx.rotate(0); ctx.fillStyle = `rgba(255,250,210,${alpha})`;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - 0.025) * length, Math.sin(a - 0.025) * length); ctx.lineTo(Math.cos(a + 0.025) * length, Math.sin(a + 0.025) * length); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
export function haystack(ctx, env, x, y, size = 70) {
  ctx.fillStyle = lit(env, '#d9a441'); curve(ctx, [[x - size, y], [x - size * 0.8, y - size * 0.6], [x - size * 0.3, y - size], [x + size * 0.3, y - size * 1.05], [x + size * 0.8, y - size * 0.6], [x + size, y]], true); ctx.fill();
  ctx.strokeStyle = lit(env, '#b8862d'); ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI; strokeLine(ctx, x + Math.cos(a) * size * 0.6, y - Math.sin(a) * size * 0.65, x + Math.cos(a) * size * 0.85, y - Math.sin(a) * size * 0.85, ctx.strokeStyle, 2); }
}
export function barn(ctx, env, x, y, w = 320, h = 180, color = '#b5342a') {
  const c = lit(env, color), d = lit(env, shade(color, -0.25));
  groundShadow(ctx, x + w / 2, y + 4, w * 0.6, 14, 0.2);
  fillRect(ctx, x, y - h, w, h, c);
  ctx.strokeStyle = rgba('#000', 0.12); ctx.lineWidth = 2; for (let px = x; px < x + w; px += 22) strokeLine(ctx, px, y - h, px, y, ctx.strokeStyle, 2);
  // gambrel roof
  fillPoly(ctx, [[x - 16, y - h], [x + w * 0.12, y - h - h * 0.35], [x + w / 2, y - h - h * 0.6], [x + w * 0.88, y - h - h * 0.35], [x + w + 16, y - h]], lit(env, '#5a3a2a'));
  fillPoly(ctx, [[x + w / 2, y - h - h * 0.6], [x + w * 0.88, y - h - h * 0.35], [x + w + 16, y - h], [x + w / 2, y - h]], rgba('#000', 0.15));
  // big door
  fillRect(ctx, x + w * 0.35, y - h * 0.75, w * 0.3, h * 0.75, d);
  strokeLine(ctx, x + w * 0.35, y - h * 0.75, x + w * 0.65, y, lit(env, '#f3e7cf'), 6); strokeLine(ctx, x + w * 0.65, y - h * 0.75, x + w * 0.35, y, lit(env, '#f3e7cf'), 6);
  ctx.strokeStyle = lit(env, '#f3e7cf'); ctx.lineWidth = 6; ctx.strokeRect(x + w * 0.35, y - h * 0.75, w * 0.3, h * 0.75);
  // loft window
  fillRect(ctx, x + w / 2 - 18, y - h - h * 0.3, 36, 36, lit(env, '#3a2a20')); ctx.strokeRect(x + w / 2 - 18, y - h - h * 0.3, 36, 36);
}
export function crowd(ctx, env, y, count = 40, seed = 9, dark = false) {
  // silhouettes of people in the background (for concerts, stations etc.)
  const r = rng(hash('crowd' + seed));
  for (let i = 0; i < count; i++) {
    const x = r() * env.W, s = 0.6 + r() * 0.5, bob = Math.sin(env.t * 4 + i) * 3 * s;
    const c = dark ? rgba('#0b0b16', 0.85) : lit(env, r.pick(['#4b5a78', '#6a4b5a', '#5a6a4b', '#7a6a4b']));
    fillRound(ctx, x - 14 * s, y - 60 * s + bob, 28 * s, 60 * s, 10 * s, c);
    fillCircle(ctx, x, y - 70 * s + bob, 12 * s, c);
    if (r() > 0.5) { strokeLine(ctx, x + 10 * s, y - 50 * s + bob, x + 24 * s, y - 85 * s + bob - Math.abs(bob), c, 5 * s); }
  }
}
export function rain(ctx, env, intensity = 1) {
  const r = rng(hash('rain' + env.seed));
  ctx.strokeStyle = 'rgba(200,220,255,0.45)'; ctx.lineWidth = 1.5;
  const n = Math.floor(260 * intensity);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const x = (r() * env.W + env.t * 60) % env.W, y = (r() * env.H + env.t * (700 + r() * 300)) % (env.H + 40) - 20;
    ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 16);
  }
  ctx.stroke();
}
export function snow(ctx, env, intensity = 1) {
  const r = rng(hash('snow' + env.seed));
  const n = Math.floor(160 * intensity);
  for (let i = 0; i < n; i++) {
    const sp = 30 + r() * 50, ph = r() * TAU, s = 1.5 + r() * 2.5;
    const x = (r() * env.W + Math.sin(env.t * 0.8 + ph) * 30) % env.W, y = (r() * env.H + env.t * sp) % (env.H + 20) - 10;
    ctx.fillStyle = `rgba(255,255,255,${0.5 + r() * 0.5})`; circle(ctx, x < 0 ? x + env.W : x, y, s); ctx.fill();
  }
}
export function fog(ctx, env, y, alpha = 0.3) {
  const r = rng(hash('fog' + env.seed));
  for (let i = 0; i < 5; i++) {
    const w = 400 + r() * 400, h = 60 + r() * 60, x = ((r() * env.W + env.t * (8 + r() * 10)) % (env.W + w)) - w / 2;
    ctx.fillStyle = radGrad(ctx, x, y + r() * 60, 0, w / 2, [[0, `rgba(255,255,255,${alpha})`], [1, 'rgba(255,255,255,0)']]);
    ellipse(ctx, x, y + r() * 60, w / 2, h); ctx.fill();
  }
}
export function dustMotes(ctx, env, count = 20, seed = 3) {
  const r = rng(hash('dust' + seed));
  for (let i = 0; i < count; i++) {
    const x = (r() * env.W + Math.sin(env.t * 0.5 + i) * 20) % env.W, y = (r() * env.H + Math.cos(env.t * 0.3 + i) * 15) % env.H;
    ctx.fillStyle = `rgba(255,245,200,${0.2 + 0.2 * Math.sin(env.t * 2 + i)})`; circle(ctx, x, y, 1.5 + r() * 1.5); ctx.fill();
  }
}
export function text(ctx, x, y, str, font = 'bold 20px sans-serif', color = '#fff', align = 'center') {
  ctx.fillStyle = color; ctx.font = font; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// Re-export primitives for scene files so they import from one place
export { TAU, DEG, clamp, lerp, mixColor, shade, rgba, rng, hash, roundRect, ellipse, circle, poly, curve, fillRect, fillRound, fillEllipse, fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow, withAlpha };
