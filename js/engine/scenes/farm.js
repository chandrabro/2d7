// Farm & Nature scenes
import {
  sky, ground, hills, mountains, lit, todOf, water, treeRound, treePine, bush, rock, fence, barn, haystack,
  dirtPath, grassTufts, flowerPatch, sunRays, fire, cloud, vignette, fog, stars,
  TAU, lerp, shade, rgba, rng, hash, mixColor, roundRect, ellipse, circle, curve, fillRect, fillRound, fillEllipse,
  fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow,
} from '../scenery.js';

const CAT = 'Farm & Nature';

function chicken(ctx, env, x, y, s = 1, phase = 0) {
  const peck = Math.max(0, Math.sin(env.t * 3 + phase)) * 4 * s;
  fillEllipse(ctx, x, y - 12 * s, 14 * s, 10 * s, lit(env, '#f7f3e9'));
  fillPoly(ctx, [[x - 12 * s, y - 16 * s], [x - 22 * s, y - 24 * s], [x - 10 * s, y - 10 * s]], lit(env, '#e8dfcf'));
  fillCircle(ctx, x + 12 * s, y - 20 * s + peck, 7 * s, lit(env, '#f7f3e9'));
  fillPoly(ctx, [[x + 17 * s, y - 20 * s + peck], [x + 25 * s, y - 18 * s + peck], [x + 17 * s, y - 16 * s + peck]], '#f39c12');
  fillCircle(ctx, x + 12 * s, y - 27 * s + peck, 3 * s, '#e74c3c'); fillCircle(ctx, x + 13 * s, y - 21 * s + peck, 1.2 * s, '#222');
  strokeLine(ctx, x - 3 * s, y - 3 * s, x - 3 * s, y, '#f39c12', 2); strokeLine(ctx, x + 4 * s, y - 3 * s, x + 4 * s, y, '#f39c12', 2);
}
function sunflower(ctx, env, x, y, s, phase) {
  const sw = Math.sin(env.t * 1.4 + phase) * 4 * s;
  strokeLine(ctx, x, y, x + sw, y - 70 * s, lit(env, '#3d7a2e'), 4 * s);
  fillEllipse(ctx, x - 10 * s, y - 30 * s, 12 * s, 6 * s, lit(env, '#3f8f3a'), -0.6); fillEllipse(ctx, x + 11 * s, y - 42 * s, 12 * s, 6 * s, lit(env, '#3f8f3a'), 0.6);
  const hx = x + sw, hy = y - 70 * s;
  for (let k = 0; k < 14; k++) { const a = (k / 14) * TAU; fillEllipse(ctx, hx + Math.cos(a) * 16 * s, hy + Math.sin(a) * 16 * s, 9 * s, 5 * s, lit(env, k % 2 ? '#f9c74f' : '#f8b53c'), a); }
  fillCircle(ctx, hx, hy, 11 * s, lit(env, '#6b3e1e')); fillCircle(ctx, hx, hy, 7 * s, lit(env, '#4a2a12'));
}
function mushroom(ctx, env, x, y, s, cap = '#d9483b') {
  fillRect(ctx, x - 3 * s, y - 10 * s, 6 * s, 10 * s, lit(env, '#f5efe0'));
  fillEllipse(ctx, x, y - 10 * s, 10 * s, 6 * s, lit(env, cap));
  fillCircle(ctx, x - 3 * s, y - 12 * s, 1.5 * s, '#fff'); fillCircle(ctx, x + 4 * s, y - 11 * s, 1.2 * s, '#fff');
}
function fern(ctx, env, x, y, s, color = '#2f7d3a') {
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.4 + Math.sin(env.t + i + x) * 0.03;
    const ex = x + Math.cos(a) * 40 * s, ey = y + Math.sin(a) * 40 * s;
    strokeLine(ctx, x, y, ex, ey, lit(env, color), 3 * s);
    for (let k = 1; k < 5; k++) { const px = lerp(x, ex, k / 5), py = lerp(y, ey, k / 5); const l = (5 - k) * 2.5 * s; strokeLine(ctx, px, py, px - l, py - l * 0.5, lit(env, color), 1.5 * s); strokeLine(ctx, px, py, px + l, py - l * 0.5, lit(env, color), 1.5 * s); }
  }
}
function log(ctx, env, x, y, w, h, color = '#6b4a2b') {
  fillRound(ctx, x, y - h, w, h, h / 2, lit(env, color));
  fillEllipse(ctx, x + w, y - h / 2, h * 0.35, h / 2, lit(env, '#c9a476')); fillEllipse(ctx, x + w, y - h / 2, h * 0.2, h * 0.3, lit(env, '#a67c4f'));
  ctx.strokeStyle = rgba('#000', 0.15); ctx.lineWidth = 2; for (let i = 1; i < 4; i++) strokeLine(ctx, x + 10, y - h + i * (h / 4), x + w - 10, y - h + i * (h / 4) - 2, ctx.strokeStyle, 2);
}

export default [
  {
    id: 'barn_yard', name: 'Farming House / Barn Yard', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.58, sunX: W * 0.15 });
      hills(ctx, env, H * 0.58, '#8dc26f', 3, 70, 3, 0.4);
      ground(ctx, env, H * 0.58, '#8fbf5e', '#4c8a34');
      // dirt yard
      ctx.fillStyle = linGrad(ctx, 0, H * 0.66, 0, H, [[0, lit(env, '#c69c6d')], [1, lit(env, '#8f6a42')]]);
      ctx.beginPath(); ctx.moveTo(-10, H * 0.72); ctx.quadraticCurveTo(W * 0.3, H * 0.64, W * 0.6, H * 0.68); ctx.quadraticCurveTo(W * 0.9, H * 0.7, W + 10, H * 0.66); ctx.lineTo(W + 10, H); ctx.lineTo(-10, H); ctx.closePath(); ctx.fill();
      // barn + silo
      barn(ctx, env, W * 0.56, H * 0.66, 340, 190, '#b5342a');
      fillRound(ctx, W * 0.86, H * 0.66 - 300, 90, 300, 10, lit(env, '#c9ccd2')); fillEllipse(ctx, W * 0.86 + 45, H * 0.66 - 300, 45, 30, lit(env, '#9aa0a8'));
      ctx.strokeStyle = rgba('#000', 0.12); for (let yy = H * 0.66 - 280; yy < H * 0.66; yy += 40) strokeLine(ctx, W * 0.86, yy, W * 0.86 + 90, yy, ctx.strokeStyle, 2);
      // trees, fence, haystacks
      treeRound(ctx, env, 60, H * 0.62, 150, 4);
      fence(ctx, env, 0, W * 0.42, H * 0.7, 46, '#d9c8a8');
      haystack(ctx, env, W * 0.17, H * 0.78, 70);
      haystack(ctx, env, W * 0.27, H * 0.75, 50);
      // hay bales
      for (let i = 0; i < 2; i++) { const bx = W * 0.95 + i * 10, by = H * 0.8 - i * 44; fillRound(ctx, bx - 40, by - 44, 80, 44, 8, lit(env, '#d9a441')); fillEllipse(ctx, bx + 40, by - 22, 10, 22, lit(env, '#c08a2a')); fillRect(ctx, bx - 40, by - 30, 80, 4, lit(env, '#8a5a2a')); fillRect(ctx, bx - 40, by - 16, 80, 4, lit(env, '#8a5a2a')); }
      // tractor (left back)
      const tx = W * 0.36, ty = H * 0.7;
      groundShadow(ctx, tx + 50, ty + 2, 70, 8, 0.25);
      fillCircle(ctx, tx + 90, ty - 30, 30, lit(env, '#2d2d2d')); fillCircle(ctx, tx + 90, ty - 30, 14, lit(env, '#777'));
      fillCircle(ctx, tx + 10, ty - 18, 18, lit(env, '#2d2d2d')); fillCircle(ctx, tx + 10, ty - 18, 8, lit(env, '#777'));
      fillRound(ctx, tx, ty - 70, 90, 36, 6, lit(env, '#2e8b57')); fillRound(ctx, tx + 50, ty - 110, 44, 44, 4, lit(env, '#276749'));
      fillRect(ctx, tx + 56, ty - 104, 32, 22, lit(env, '#bfe3f8')); fillRect(ctx, tx + 10, ty - 90, 8, 22, lit(env, '#333'));
      // chickens
      chicken(ctx, env, W * 0.5, H * 0.84, 1, 0);
      chicken(ctx, env, W * 0.58, H * 0.88, 0.8, 1.5);
      chicken(ctx, env, W * 0.2, H * 0.86, 0.9, 3);
      fillCircle(ctx, W * 0.53, H * 0.86, 2, '#e9c46a'); fillCircle(ctx, W * 0.55, H * 0.87, 2, '#e9c46a');
      grassTufts(ctx, env, H * 0.62, H * 0.7, 40, '#4f9a3a', 2);
      vignette(ctx, env, 0.22);
    },
  },
  {
    id: 'vegetable_farm', name: 'Vegetable Farm', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.56, sunX: W * 0.8 });
      mountains(ctx, env, H * 0.56, '#5b6b8c', 2, 160, true, 0.55);
      hills(ctx, env, H * 0.57, '#86b96a', 5, 50, 3, 0.35);
      ground(ctx, env, H * 0.58, '#9bc26b', '#5a8f3a');
      // tilled soil field in perspective
      ctx.fillStyle = linGrad(ctx, 0, H * 0.62, 0, H, [[0, lit(env, '#8b6240')], [1, lit(env, '#5a3d26')]]); ctx.fillRect(0, H * 0.62, W, H - H * 0.62);
      ctx.strokeStyle = rgba('#000', 0.25); ctx.lineWidth = 3;
      for (let i = -3; i <= 15; i++) { const x = (i / 12) * W; strokeLine(ctx, x, H * 0.62, W / 2 + (x - W / 2) * 2.2, H, ctx.strokeStyle, 3); }
      // crop rows (back rows small, front rows bigger) — leave the middle band free
      const rows = [[H * 0.64, 0.45, '#4fa64a'], [H * 0.665, 0.6, '#3f9a3a'], [H * 0.69, 0.75, '#5bb54a']];
      rows.forEach(([ry, s, c], ri) => {
        for (let x = 20; x < W; x += 34 * s + 12) {
          const sway = Math.sin(env.t * 1.5 + x * 0.05) * 2;
          bush(ctx, env, x + sway, ry, 26 * s, c);
          if (ri === 1 && x % 3 === 0) fillCircle(ctx, x + 4, ry - 14 * s, 4 * s, lit(env, '#e63946'));
        }
      });
      // front crop rows along the bottom edges (left and right only)
      for (let x = 10; x < W * 0.2; x += 60) { bush(ctx, env, x, H * 0.95, 44, '#3f9a3a'); fillCircle(ctx, x - 8, H * 0.95 - 24, 7, lit(env, '#e63946')); fillCircle(ctx, x + 10, H * 0.95 - 30, 6, lit(env, '#f4a261')); }
      for (let x = W * 0.82; x < W; x += 60) { bush(ctx, env, x, H * 0.95, 44, '#5bb54a'); fillEllipse(ctx, x, H * 0.95 - 20, 16, 12, lit(env, '#a7d46b')); }
      // scarecrow (right back)
      const sx = W * 0.78, sy = H * 0.66;
      fillRect(ctx, sx - 4, sy - 190, 8, 190, lit(env, '#8a5a2b')); fillRect(ctx, sx - 70, sy - 150, 140, 8, lit(env, '#8a5a2b'));
      fillRound(ctx, sx - 30, sy - 160, 60, 80, 8, lit(env, '#c0392b')); fillRect(ctx, sx - 24, sy - 158, 48, 4, lit(env, '#e9c46a'));
      fillRound(ctx, sx - 68, sy - 156, 46, 18, 6, lit(env, '#c0392b')); fillRound(ctx, sx + 22, sy - 156, 46, 18, 6, lit(env, '#c0392b'));
      ctx.strokeStyle = lit(env, '#e9c46a'); ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { strokeLine(ctx, sx - 68 + k * 4, sy - 148, sx - 76 + k * 6, sy - 134, ctx.strokeStyle, 2); strokeLine(ctx, sx + 68 - k * 4, sy - 148, sx + 76 - k * 6, sy - 134, ctx.strokeStyle, 2); }
      fillCircle(ctx, sx, sy - 180, 24, lit(env, '#e9c46a')); fillCircle(ctx, sx - 8, sy - 184, 3, '#222'); fillCircle(ctx, sx + 8, sy - 184, 3, '#222');
      ctx.strokeStyle = '#222'; strokeLine(ctx, sx - 8, sy - 172, sx + 8, sy - 172, '#222', 2);
      fillEllipse(ctx, sx, sy - 200, 36, 8, lit(env, '#d9a441')); fillPoly(ctx, [[sx - 22, sy - 200], [sx - 14, sy - 226], [sx + 14, sy - 226], [sx + 22, sy - 200]], lit(env, '#d9a441'));
      fillCircle(ctx, sx + 30, sy - 230, 6, '#222'); fillPoly(ctx, [[sx + 36, sy - 230], [sx + 46, sy - 234], [sx + 36, sy - 226]], '#222');
      // hand pump (left)
      const px = W * 0.14, py = H * 0.74;
      fillRect(ctx, px - 24, py - 10, 60, 10, lit(env, '#8d8d8d'));
      fillRect(ctx, px - 8, py - 90, 16, 80, lit(env, '#2c5f8a')); fillRound(ctx, px - 12, py - 98, 24, 12, 4, lit(env, '#2c5f8a'));
      fillRect(ctx, px + 8, py - 60, 26, 8, lit(env, '#2c5f8a')); fillRect(ctx, px + 30, py - 60, 6, 30, lit(env, '#2c5f8a'));
      const hA = Math.sin(env.t * 2) * 0.3; ctx.save(); ctx.translate(px, py - 94); ctx.rotate(-0.6 + hA); fillRound(ctx, -8, -4, 70, 8, 4, lit(env, '#444')); ctx.restore();
      strokeLine(ctx, px + 33, py - 30, px + 33 + Math.sin(env.t * 6) * 2, py - 8, rgba('#7fc8f8', 0.7), 3);
      fillEllipse(ctx, px + 34, py - 4, 22, 6, rgba('#7fc8f8', 0.6));
      // basket of harvest
      fillRound(ctx, W * 0.22, py - 2, 60, 30, 8, lit(env, '#b8863a')); fillCircle(ctx, W * 0.22 + 14, py - 8, 8, lit(env, '#e63946')); fillCircle(ctx, W * 0.22 + 32, py - 10, 8, lit(env, '#f4a261')); fillCircle(ctx, W * 0.22 + 48, py - 6, 8, lit(env, '#e63946'));
      vignette(ctx, env, 0.2);
    },
  },
  {
    id: 'flower_garden', name: 'Flower Garden', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.58, sunX: W * 0.22 });
      hills(ctx, env, H * 0.58, '#86c26f', 7, 60, 3, 0.4);
      ground(ctx, env, H * 0.58, '#8ccb5e', '#4c9a34');
      // hedge at the back
      for (let x = -10; x < W; x += 54) bush(ctx, env, x, H * 0.64, 54, '#2f7d3a');
      fillRect(ctx, 0, H * 0.635, W, 6, lit(env, '#2a6e33'));
      treeRound(ctx, env, W * 0.07, H * 0.6, 150, 5, '#4a9a3c');
      treeRound(ctx, env, W * 0.94, H * 0.6, 140, 6, '#3f8f3a');
      // rose archway in the center back
      const ax = W * 0.5, ay = H * 0.66, aw = 150, ah = 200;
      ctx.strokeStyle = lit(env, '#f5f1e8'); ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax - aw / 2, ay); ctx.lineTo(ax - aw / 2, ay - ah + 70); ctx.arc(ax, ay - ah + 70, aw / 2, Math.PI, 0); ctx.lineTo(ax + aw / 2, ay); ctx.stroke();
      ctx.lineWidth = 3; for (let k = 1; k < 6; k++) { strokeLine(ctx, ax - aw / 2 - 6, ay - k * 28, ax - aw / 2 + 6, ay - k * 28, ctx.strokeStyle, 3); strokeLine(ctx, ax + aw / 2 - 6, ay - k * 28, ax + aw / 2 + 6, ay - k * 28, ctx.strokeStyle, 3); }
      const rr = rng(hash('roses' + env.seed));
      for (let i = 0; i < 40; i++) {
        const a = Math.PI + rr() * Math.PI; const rad = aw / 2 + (rr() - 0.5) * 24;
        const fx = ax + Math.cos(a) * rad, fy = ay - ah + 70 + Math.sin(a) * rad;
        fillCircle(ctx, fx, fy, 6 + rr() * 5, lit(env, '#3f8f3a'));
        fillCircle(ctx, fx + 2, fy - 2, 4 + rr() * 3, lit(env, rr.pick(['#e63946', '#ff6b81', '#ff8fab'])));
      }
      for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1; const fy = ay - 10 - rr() * (ah - 90); fillCircle(ctx, ax + side * aw / 2 + (rr() - 0.5) * 20, fy, 7, lit(env, '#3f8f3a')); fillCircle(ctx, ax + side * aw / 2 + (rr() - 0.5) * 14, fy - 2, 5, lit(env, '#e63946')); }
      // stone path through the arch down to front
      dirtPath(ctx, env, ax, 110, ay - 4, ax, 320, H, '#c9bfae');
      for (let i = 0; i < 12; i++) { const tt = i / 12; fillEllipse(ctx, ax + (i % 2 ? 1 : -1) * 20 * (0.4 + tt), lerp(ay + 6, H - 8, tt), 20 + 26 * tt, 8 + 10 * tt, lit(env, i % 2 ? '#b5aa98' : '#a89d8b')); }
      // flower beds on both sides
      flowerPatch(ctx, env, H * 0.66, H * 0.74, 70, 11, ['#ff6b81', '#ffd93d', '#c56cf0', '#ff9f43', '#ffffff', '#4cc9f0']);
      flowerPatch(ctx, env, H * 0.75, H * 0.86, 40, 12, ['#e63946', '#f1c40f', '#9b5de5']);
      // birdbath (left)
      fillRect(ctx, W * 0.2 - 6, H * 0.7 - 60, 12, 60, lit(env, '#b9b2a6')); fillEllipse(ctx, W * 0.2, H * 0.7 - 60, 40, 12, lit(env, '#cfc8bc')); fillEllipse(ctx, W * 0.2, H * 0.7 - 62, 32, 7, lit(env, '#8ecae6'));
      // butterflies
      for (let i = 0; i < 4; i++) {
        const bx = W * 0.3 + i * W * 0.15 + Math.sin(env.t * 0.9 + i * 2) * 60, by = H * 0.45 + Math.cos(env.t * 1.3 + i) * 40;
        const flap = Math.abs(Math.sin(env.t * 12 + i)) * 0.8 + 0.2; const c = ['#f4a261', '#ffd166', '#f28482', '#8ecae6'][i];
        fillEllipse(ctx, bx - 6 * flap, by, 7 * flap, 5, c, -0.3); fillEllipse(ctx, bx + 6 * flap, by, 7 * flap, 5, c, 0.3); fillEllipse(ctx, bx, by, 1.5, 5, '#333');
      }
      grassTufts(ctx, env, H * 0.64, H * 0.9, 40, '#4f9a3a', 4);
      vignette(ctx, env, 0.2);
    },
    paintFront(ctx, env) {
      const { W, H } = env;
      flowerPatch(ctx, env, H * 0.94, H * 1.0, 24, 13, ['#ff6b81', '#ffd93d', '#c56cf0', '#ffffff']);
    },
  },
  {
    id: 'orchard', name: 'Fruit Orchard', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.56, sunX: W * 0.85 });
      hills(ctx, env, H * 0.56, '#8dc26f', 8, 50, 3, 0.4);
      ground(ctx, env, H * 0.57, '#8fc45c', '#4a8d32');
      const r = rng(hash('orchard' + env.seed));
      // rows of trees back to front (back row smaller/hazier)
      const rowsDef = [[H * 0.6, 90, 9, 0.35], [H * 0.66, 130, 6, 0.15]];
      rowsDef.forEach(([ty, size, n, hz], ri) => {
        for (let i = 0; i < n; i++) {
          const tx = (i + 0.5) * (W / n) + (ri ? 40 : 0);
          const fruit = ri ? '#e63946' : '#f4a261';
          treeRound(ctx, env, tx, ty, size, 20 + i + ri * 10, mixColor('#3f8f3a', todOf(env).haze, hz));
          const cy = ty - size * 0.55 - size * 0.35;
          for (let k = 0; k < 8; k++) fillCircle(ctx, tx + (r() - 0.5) * size * 0.9, cy + (r() - 0.5) * size * 0.7, size * 0.045, lit(env, fruit));
        }
      });
      // big trees at the sides in front
      treeRound(ctx, env, 90, H * 0.74, 210, 31, '#3f9a3a');
      for (let k = 0; k < 12; k++) fillCircle(ctx, 90 + (r() - 0.5) * 190, H * 0.74 - 115 - 70 + (r() - 0.5) * 150, 9, lit(env, '#e63946'));
      treeRound(ctx, env, W - 90, H * 0.74, 200, 32, '#4a9a3c');
      for (let k = 0; k < 12; k++) fillCircle(ctx, W - 90 + (r() - 0.5) * 180, H * 0.74 - 110 - 70 + (r() - 0.5) * 140, 9, lit(env, '#f4a261'));
      // wooden ladder leaning on the left tree
      ctx.save(); ctx.translate(170, H * 0.76); ctx.rotate(-0.28);
      fillRect(ctx, -22, -220, 8, 220, lit(env, '#b08049')); fillRect(ctx, 14, -220, 8, 220, lit(env, '#b08049'));
      for (let k = 1; k < 8; k++) fillRect(ctx, -22, -k * 28, 44, 6, lit(env, '#c9975c'));
      ctx.restore();
      // basket with fruit (right front)
      const bx = W * 0.82, by = H * 0.86;
      groundShadow(ctx, bx, by + 2, 44, 8, 0.25);
      fillRound(ctx, bx - 40, by - 36, 80, 36, 10, lit(env, '#b8863a'));
      ctx.strokeStyle = rgba('#000', 0.15); ctx.lineWidth = 2; for (let k = 0; k < 4; k++) strokeLine(ctx, bx - 38, by - 30 + k * 8, bx + 38, by - 30 + k * 8, ctx.strokeStyle, 2);
      ctx.strokeStyle = lit(env, '#8a5a2a'); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(bx, by - 36, 30, Math.PI, 0); ctx.stroke();
      for (let k = 0; k < 7; k++) fillCircle(ctx, bx - 28 + k * 9.5, by - 40 - (k % 2) * 7, 8, lit(env, k % 2 ? '#f4a261' : '#e63946'));
      // fallen apples on the grass
      for (let k = 0; k < 6; k++) fillCircle(ctx, r() * W, H * 0.78 + r() * 60, 6, lit(env, r() > 0.5 ? '#e63946' : '#f4a261'));
      grassTufts(ctx, env, H * 0.62, H * 0.95, 50, '#4f9a3a', 5);
      flowerPatch(ctx, env, H * 0.7, H * 0.8, 10, 6, ['#ffffff', '#ffd93d']);
      vignette(ctx, env, 0.2);
    },
  },
  {
    id: 'forest_clearing', name: 'Forest Clearing', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const p = todOf(env);
      sky(ctx, env, { horizon: H * 0.6, clouds: false, sun: false });
      // layered tree depth
      const layers = [[0.5, 0.55, 240, '#4e7a66'], [0.3, 0.6, 300, '#3b6b4a'], [0.1, 0.66, 360, '#2f5c3a']];
      layers.forEach(([hz, baseY, size, color], li) => {
        const c = mixColor(color, p.haze, hz);
        fillRect(ctx, 0, H * baseY - size * 0.9, W, size, c);
        const r = rng(hash('forest' + li + env.seed));
        for (let x = -40; x < W + 40; x += 70 + li * 20) {
          if (li === 2 && x > W * 0.3 && x < W * 0.7) continue; // keep the middle open
          const s = size * (0.8 + r() * 0.4);
          if (r() > 0.5) treePine(ctx, env, x, H * baseY, s, mixColor('#2f6b3a', p.haze, hz), mixColor('#5b3d22', p.haze, hz));
          else treeRound(ctx, env, x, H * baseY, s * 0.7, 40 + x, mixColor('#3f8f3a', p.haze, hz), mixColor('#6b4a2b', p.haze, hz));
        }
      });
      ground(ctx, env, H * 0.66, '#5f9a48', '#2f5f28');
      sunRays(ctx, env, W * 0.3, -40, 6, 1100, 0.1);
      // fallen logs
      log(ctx, env, W * 0.08, H * 0.8, 230, 42, '#6b4a2b');
      log(ctx, env, W * 0.7, H * 0.9, 260, 46, '#5a3b22');
      // mushrooms
      mushroom(ctx, env, W * 0.3, H * 0.84, 1.4, '#d9483b'); mushroom(ctx, env, W * 0.33, H * 0.85, 1, '#d9483b'); mushroom(ctx, env, W * 0.62, H * 0.8, 1.2, '#e9b949'); mushroom(ctx, env, W * 0.16, H * 0.73, 1, '#c76b3a');
      // ferns and rocks
      fern(ctx, env, W * 0.95, H * 0.86, 1.3); fern(ctx, env, W * 0.04, H * 0.92, 1.2, '#3a8a44'); fern(ctx, env, W * 0.42, H * 0.72, 0.8);
      rock(ctx, env, W * 0.88, H * 0.74, 90, 44, '#7d8a86'); rock(ctx, env, W * 0.2, H * 0.68, 50, 26, '#8a8a8a');
      grassTufts(ctx, env, H * 0.68, H * 0.98, 70, '#4f9a3a', 6);
      // fireflies at night
      if (env.tod === 'night') { const r = rng(hash('ff' + env.seed)); for (let i = 0; i < 20; i++) { const fx = r() * W + Math.sin(env.t + i) * 20, fy = H * 0.4 + r() * H * 0.4 + Math.cos(env.t * 1.3 + i) * 15; fillCircle(ctx, fx, fy, 2.5, `rgba(200,255,120,${0.4 + 0.6 * Math.abs(Math.sin(env.t * 2 + i))})`); } }
      vignette(ctx, env, 0.35);
    },
  },
  {
    id: 'riverbank', name: 'Riverbank', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.5, sunX: W * 0.7 });
      mountains(ctx, env, H * 0.5, '#5b6b8c', 4, 200, true, 0.5);
      hills(ctx, env, H * 0.52, '#6fae5a', 9, 50, 3, 0.3);
      treeRound(ctx, env, W * 0.1, H * 0.54, 110, 50); treePine(ctx, env, W * 0.22, H * 0.55, 120); treeRound(ctx, env, W * 0.88, H * 0.54, 120, 51); treePine(ctx, env, W * 0.96, H * 0.56, 130);
      ground(ctx, env, H * 0.54, '#86c45c', '#4a8d32');
      // river (horizontal band)
      water(ctx, env, H * 0.57, H * 0.12, '#3b8bd0', '#1f5f9e');
      ctx.fillStyle = linGrad(ctx, 0, H * 0.57, 0, H * 0.6, [[0, rgba('#000', 0.2)], [1, rgba('#000', 0)]]); ctx.fillRect(0, H * 0.57, W, H * 0.03);
      // stepping stones across the river
      for (let i = 0; i < 6; i++) { const sx = W * 0.4 + i * 40, sy = H * 0.6 + (i % 2) * 24 + 10; fillEllipse(ctx, sx, sy + 3, 20, 7, rgba('#000', 0.2)); fillEllipse(ctx, sx, sy, 20, 9, lit(env, i % 2 ? '#9a948a' : '#b0aa9e')); }
      // near bank
      ground(ctx, env, H * 0.69, '#8dc85e', '#3f7a2d');
      ctx.fillStyle = lit(env, '#c9b89a'); ctx.beginPath(); ctx.moveTo(0, H * 0.69); ctx.quadraticCurveTo(W * 0.5, H * 0.66, W, H * 0.69); ctx.lineTo(W, H * 0.72); ctx.quadraticCurveTo(W * 0.5, H * 0.7, 0, H * 0.72); ctx.closePath(); ctx.fill();
      // pebbles
      const r = rng(hash('pebbles' + env.seed));
      for (let i = 0; i < 40; i++) fillEllipse(ctx, r() * W, H * 0.685 + r() * 30, 3 + r() * 5, 2 + r() * 3, lit(env, r.pick(['#a39e94', '#8e8a82', '#bdb7ac'])));
      // reeds
      for (let i = 0; i < 14; i++) { const rx = (i < 7 ? W * 0.02 + i * 22 : W * 0.86 + (i - 7) * 22), ry = H * 0.7; const sw = Math.sin(env.t * 1.5 + i) * 4; strokeLine(ctx, rx, ry, rx + sw, ry - 70 - (i % 3) * 15, lit(env, '#3f7a2d'), 3); fillEllipse(ctx, rx + sw, ry - 72 - (i % 3) * 15, 4, 12, lit(env, '#6b4a2b')); }
      bush(ctx, env, W * 0.3, H * 0.74, 50, '#3f8f3a'); bush(ctx, env, W * 0.75, H * 0.76, 60, '#4a9a46');
      rock(ctx, env, W * 0.08, H * 0.8, 70, 34); rock(ctx, env, W * 0.92, H * 0.84, 80, 40, '#7a8686');
      grassTufts(ctx, env, H * 0.72, H * 0.98, 60, '#4f9a3a', 7);
      flowerPatch(ctx, env, H * 0.76, H * 0.9, 12, 8, ['#ffffff', '#ffd93d', '#c56cf0']);
      vignette(ctx, env, 0.2);
    },
  },
  {
    id: 'lakeside_camp', name: 'Lakeside Camp', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.46, sunX: W * 0.5, sunY: H * 0.24 });
      mountains(ctx, env, H * 0.47, '#4f5f85', 6, 240, true, 0.4);
      for (let x = -20; x < W; x += 48) treePine(ctx, env, x, H * 0.49, 70 + (x % 3) * 10, mixColor('#2f6b3a', todOf(env).haze, 0.3));
      water(ctx, env, H * 0.48, H * 0.18, '#3b8bd0', '#1c4f87');
      // reflection of the moon/sun
      ctx.fillStyle = rgba(todOf(env).sun, 0.25); for (let k = 0; k < 6; k++) fillEllipse(ctx, W * 0.5 + Math.sin(env.t + k) * 6, H * 0.5 + k * 18, 30 + k * 10, 4, ctx.fillStyle);
      // shore + grass
      ground(ctx, env, H * 0.66, '#7fb858', '#3f7a2d');
      ctx.fillStyle = lit(env, '#d2c3a5'); ctx.beginPath(); ctx.moveTo(0, H * 0.66); ctx.quadraticCurveTo(W * 0.5, H * 0.63, W, H * 0.66); ctx.lineTo(W, H * 0.69); ctx.quadraticCurveTo(W * 0.5, H * 0.68, 0, H * 0.69); ctx.closePath(); ctx.fill();
      treePine(ctx, env, W * 0.06, H * 0.78, 220); treePine(ctx, env, W * 0.95, H * 0.8, 240);
      // tent (left)
      const tx = W * 0.25, ty = H * 0.78;
      groundShadow(ctx, tx, ty + 2, 130, 14, 0.25);
      fillPoly(ctx, [[tx - 130, ty], [tx, ty - 150], [tx + 130, ty]], lit(env, '#e07b39'));
      fillPoly(ctx, [[tx, ty - 150], [tx + 130, ty], [tx + 20, ty]], lit(env, '#c4642a'));
      fillPoly(ctx, [[tx - 40, ty], [tx, ty - 100], [tx + 40, ty]], env.tod === 'night' ? '#ffe4a8' : lit(env, '#4a2c1a'));
      strokeLine(ctx, tx - 130, ty, tx - 160, ty + 12, '#555', 2); strokeLine(ctx, tx + 130, ty, tx + 160, ty + 12, '#555', 2);
      // campfire with stones, logs and smoke
      const fx = W * 0.6, fy = H * 0.86;
      for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU; fillEllipse(ctx, fx + Math.cos(a) * 46, fy + Math.sin(a) * 12, 10, 6, lit(env, '#7d7a72')); }
      fillRound(ctx, fx - 30, fy - 14, 60, 10, 5, lit(env, '#5a3b22')); ctx.save(); ctx.translate(fx, fy - 10); ctx.rotate(0.5); fillRound(ctx, -30, -5, 60, 10, 5, lit(env, '#6b4a2b')); ctx.restore();
      fire(ctx, env, fx, fy - 12, 46, 3);
      for (let k = 0; k < 5; k++) { const sy = fy - 70 - k * 40 - (env.t * 25 % 40); const sx = fx + Math.sin(env.t + k) * 12 + k * 6; fillCircle(ctx, sx, sy, 10 + k * 6, `rgba(200,200,210,${0.22 - k * 0.04})`); }
      // log seats
      log(ctx, env, W * 0.4, H * 0.92, 110, 34); log(ctx, env, W * 0.72, H * 0.93, 120, 34, '#5a3b22');
      // lantern + backpack
      fillRect(ctx, W * 0.86, H * 0.8 - 70, 4, 70, '#444'); fillRound(ctx, W * 0.85, H * 0.8 - 60, 28, 36, 5, env.tod === 'night' ? '#ffe9a8' : '#d9d2c0');
      if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, W * 0.86 + 14, H * 0.8 - 42, 0, 120, [[0, 'rgba(255,230,160,0.35)'], [1, 'rgba(255,230,160,0)']]); circle(ctx, W * 0.86 + 14, H * 0.8 - 42, 120); ctx.fill(); }
      fillRound(ctx, W * 0.9, H * 0.82 - 56, 50, 56, 10, lit(env, '#2d6a4f')); fillRound(ctx, W * 0.9 + 8, H * 0.82 - 30, 34, 22, 5, lit(env, '#40916c'));
      grassTufts(ctx, env, H * 0.7, H * 0.98, 50, '#4f9a3a', 8);
      vignette(ctx, env, 0.28);
    },
  },
  {
    id: 'mountain_peak', name: 'Mountain Peak', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const p = todOf(env);
      sky(ctx, env, { horizon: H * 0.55, clouds: false, sunX: W * 0.8, sunY: H * 0.2 });
      // far peaks, low in frame
      mountains(ctx, env, H * 0.62, '#5b6b8c', 8, 200, true, 0.5);
      // cloud sea below the summit
      ctx.fillStyle = linGrad(ctx, 0, H * 0.5, 0, H, [[0, rgba(p.skyBot, 0)], [1, env.tod === 'night' ? '#2a3458' : '#ffffff']]); ctx.fillRect(0, H * 0.5, W, H * 0.5);
      const r = rng(hash('cloudsea' + env.seed));
      const base = env.tod === 'night' ? '#2a3458' : env.tod === 'sunset' ? '#ffd9c0' : '#ffffff';
      const shadow = env.tod === 'night' ? '#1b2340' : env.tod === 'sunset' ? '#e6a07a' : '#d9e6f0';
      for (let i = 0; i < 12; i++) { const w = 220 + r() * 220; const x = ((r() * (W + w) + env.t * 5) % (W + w)) - w / 2; cloud(ctx, x, H * 0.55 + r() * H * 0.25, w, w * 0.3, base, shadow); }
      // summit rock mass
      const sc = lit(env, '#6f7686');
      ctx.fillStyle = sc; ctx.beginPath(); ctx.moveTo(-10, H); ctx.lineTo(-10, H * 0.8); ctx.lineTo(W * 0.12, H * 0.74); ctx.lineTo(W * 0.3, H * 0.69); ctx.lineTo(W * 0.5, H * 0.66); ctx.lineTo(W * 0.72, H * 0.69); ctx.lineTo(W * 0.9, H * 0.74); ctx.lineTo(W + 10, H * 0.8); ctx.lineTo(W + 10, H); ctx.closePath(); ctx.fill();
      // snow cap on summit
      ctx.fillStyle = lit(env, '#f4f8ff'); ctx.beginPath(); ctx.moveTo(W * 0.18, H * 0.73); ctx.lineTo(W * 0.3, H * 0.69); ctx.lineTo(W * 0.5, H * 0.66); ctx.lineTo(W * 0.72, H * 0.69); ctx.lineTo(W * 0.84, H * 0.73); ctx.quadraticCurveTo(W * 0.7, H * 0.8, W * 0.6, H * 0.76); ctx.quadraticCurveTo(W * 0.5, H * 0.84, W * 0.4, H * 0.76); ctx.quadraticCurveTo(W * 0.3, H * 0.8, W * 0.18, H * 0.73); ctx.closePath(); ctx.fill();
      ctx.fillStyle = linGrad(ctx, 0, H * 0.7, 0, H, [[0, rgba('#fff', 0)], [1, rgba('#000', 0.3)]]); ctx.fillRect(0, H * 0.7, W, H * 0.3);
      // rock cracks / facets
      ctx.strokeStyle = rgba('#000', 0.18); ctx.lineWidth = 3;
      [[0.05, 0.84, 0.16, 0.92], [0.2, 0.8, 0.34, 0.96], [0.62, 0.82, 0.74, 0.98], [0.82, 0.78, 0.96, 0.86]].forEach(([a, b, c, d]) => strokeLine(ctx, W * a, H * b, W * c, H * d, ctx.strokeStyle, 3));
      ctx.fillStyle = rgba('#fff', 0.08); fillPoly(ctx, [[0, H * 0.82], [W * 0.12, H * 0.74], [W * 0.3, H * 0.69], [W * 0.26, H * 0.8], [W * 0.1, H * 0.86]], ctx.fillStyle);
      rock(ctx, env, W * 0.1, H * 0.86, 120, 60, '#5f6675'); rock(ctx, env, W * 0.9, H * 0.9, 140, 70, '#596070'); rock(ctx, env, W * 0.78, H * 0.78, 60, 30, '#6f7686');
      // flag pole with waving flag
      const px = W * 0.3, py = H * 0.74;
      fillRect(ctx, px - 3, py - 170, 6, 170, lit(env, '#444'));
      ctx.fillStyle = lit(env, '#e63946'); ctx.beginPath(); ctx.moveTo(px + 3, py - 170);
      for (let k = 0; k <= 10; k++) ctx.lineTo(px + 3 + k * 9, py - 170 + Math.sin(env.t * 6 + k * 0.6) * 5 * (k / 10));
      for (let k = 10; k >= 0; k--) ctx.lineTo(px + 3 + k * 9, py - 120 + Math.sin(env.t * 6 + k * 0.6) * 5 * (k / 10));
      ctx.closePath(); ctx.fill();
      // cairn of stones
      for (let k = 0; k < 4; k++) fillEllipse(ctx, W * 0.68, H * 0.76 - k * 10, 18 - k * 3, 7, lit(env, k % 2 ? '#8a8f9c' : '#6f7686'));
      // wind particles / snow dust
      ctx.strokeStyle = rgba('#fff', 0.5); ctx.lineWidth = 1.5;
      for (let i = 0; i < 24; i++) { const wx = ((i * 97 + env.t * 260) % (W + 60)) - 30, wy = H * 0.3 + (i * 53 % 300) + Math.sin(env.t * 2 + i) * 10; strokeLine(ctx, wx, wy, wx + 26, wy - 3, ctx.strokeStyle, 1.5); }
      vignette(ctx, env, 0.25);
    },
  },
  {
    id: 'sunflower_field', name: 'Sunflower Field', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.6, sunX: W * 0.75, sunY: H * 0.16 });
      hills(ctx, env, H * 0.6, '#9cc96a', 14, 40, 3, 0.4);
      ground(ctx, env, H * 0.61, '#8ab54e', '#4a7a2a');
      // rows of sunflowers, back (small) to mid; leave the acting band (0.68–0.9) mostly open with a dirt track
      const rowsDef = [[H * 0.62, 0.35, 26], [H * 0.645, 0.5, 34], [H * 0.675, 0.65, 44]];
      rowsDef.forEach(([ry, s, step], ri) => { for (let x = (ri * 13) % step; x < W; x += step) sunflower(ctx, env, x, ry, s, x * 0.1 + ri); });
      // dirt track in the middle
      dirtPath(ctx, env, W * 0.5, 180, H * 0.68, W * 0.5, 520, H, '#b48a5c');
      ctx.strokeStyle = rgba('#000', 0.12); ctx.lineWidth = 6; strokeLine(ctx, W * 0.45, H * 0.7, W * 0.36, H, ctx.strokeStyle, 6); strokeLine(ctx, W * 0.55, H * 0.7, W * 0.64, H, ctx.strokeStyle, 6);
      // side sunflowers in the acting band (only at far left / right)
      for (let x = 20; x < W * 0.16; x += 50) sunflower(ctx, env, x, H * 0.82, 0.9, x);
      for (let x = W * 0.86; x < W; x += 50) sunflower(ctx, env, x, H * 0.82, 0.9, x);
      // bees
      for (let i = 0; i < 3; i++) { const bx = W * 0.2 + i * W * 0.3 + Math.sin(env.t * 2 + i) * 40, by = H * 0.5 + Math.cos(env.t * 3 + i * 2) * 20; fillEllipse(ctx, bx, by, 5, 3.5, '#f1c40f'); fillRect(ctx, bx - 1, by - 3, 2, 6, '#222'); fillEllipse(ctx, bx, by - 4, 3, 2, rgba('#fff', 0.7)); }
      grassTufts(ctx, env, H * 0.66, H * 0.9, 50, '#5fa63a', 9);
      vignette(ctx, env, 0.18);
    },
    paintFront(ctx, env) {
      const { W, H } = env;
      for (let x = -10; x < W + 20; x += 90) sunflower(ctx, env, x + ((x / 90) % 2) * 20, H * 1.02, 1.3, x * 0.2);
    },
  },
];
