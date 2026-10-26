// Entertainment & Special Events scenes
import {
  sky, ground, hills, skyline, wall, floor, table, chair, lamp, desk, monitor, counter, windowInterior, pictureFrame,
  lit, todOf, candle, balloon, bunting, spotlight, crowd, signBoard, text, vignette, dustMotes, fog, streetLamp,
  TAU, lerp, clamp, mixColor, shade, rgba, rng, hash, roundRect, ellipse, circle, poly, curve,
  fillRect, fillRound, fillEllipse, fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow, withAlpha,
} from '../scenery.js';

const CAT = 'Entertainment & Special Events';

function giftBox(ctx, x, y, w, h, color, ribbon = '#f1c40f') {
  groundShadow(ctx, x + w / 2, y + 2, w * 0.6, 8, 0.25);
  fillRect(ctx, x, y - h, w, h, color); fillRect(ctx, x - 4, y - h - 10, w + 8, 14, shade(color, 0.12));
  fillRect(ctx, x + w / 2 - 5, y - h - 10, 10, h + 10, ribbon); fillRect(ctx, x - 4, y - h / 2 - 3, w + 8, 6, ribbon);
  fillEllipse(ctx, x + w / 2 - 10, y - h - 18, 10, 6, ribbon, -0.5); fillEllipse(ctx, x + w / 2 + 10, y - h - 18, 10, 6, ribbon, 0.5);
}
function partyHat(ctx, x, y, h, color) {
  fillPoly(ctx, [[x - h * 0.45, y], [x, y - h], [x + h * 0.45, y]], color);
  ctx.fillStyle = rgba('#fff', 0.5); for (let i = 1; i < 4; i++) fillCircle(ctx, x + (i % 2 ? -1 : 1) * h * 0.1 * i, y - h * 0.25 * i, 3, ctx.fillStyle);
  fillCircle(ctx, x, y - h, 5, '#fff');
}
function speakerStack(ctx, x, y, w, h) {
  fillRound(ctx, x, y - h, w, h, 4, '#1b1b20');
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.strokeRect(x + 3, y - h + 3, w - 6, h - 6);
  const n = Math.floor(h / (w * 0.9));
  for (let i = 0; i < n; i++) { const cy = y - h + (i + 0.5) * (h / n); fillCircle(ctx, x + w / 2, cy, w * 0.36, '#2a2a30'); fillCircle(ctx, x + w / 2, cy, w * 0.3, '#111'); fillCircle(ctx, x + w / 2, cy, w * 0.12, '#444'); }
}
function micStand(ctx, x, y, h = 150) {
  fillEllipse(ctx, x, y, 18, 5, '#333');
  strokeLine(ctx, x, y, x, y - h * 0.75, '#777', 3); strokeLine(ctx, x, y - h * 0.75, x + 16, y - h, '#777', 3);
  fillRound(ctx, x + 10, y - h - 14, 16, 26, 8, '#333'); fillRound(ctx, x + 11, y - h - 13, 14, 12, 7, '#666');
}
function treadmill(ctx, x, y, w = 150) {
  groundShadow(ctx, x + w / 2, y + 2, w * 0.6, 10, 0.25);
  fillRound(ctx, x, y - 22, w, 22, 6, '#2b2f36'); fillRound(ctx, x + 6, y - 20, w - 12, 12, 4, '#44484f');
  fillRect(ctx, x + w - 24, y - 110, 10, 90, '#5a5f66'); fillRect(ctx, x + 14, y - 110, 10, 90, '#5a5f66');
  fillRound(ctx, x + 4, y - 122, w - 8, 16, 6, '#3a3f46'); fillRound(ctx, x + w / 2 - 22, y - 134, 44, 18, 3, '#1dd1a1');
}
function dumbbell(ctx, x, y, len = 50, color = '#2d3436') {
  strokeLine(ctx, x - len / 2 + 8, y, x + len / 2 - 8, y, '#777', 6);
  fillRound(ctx, x - len / 2, y - 12, 16, 24, 4, color); fillRound(ctx, x + len / 2 - 16, y - 12, 16, 24, 4, color);
}
function cone(ctx, x, y, h = 40) {
  fillEllipse(ctx, x, y, h * 0.5, h * 0.14, '#1a1a1a');
  fillPoly(ctx, [[x - h * 0.3, y], [x - h * 0.08, y - h], [x + h * 0.08, y - h], [x + h * 0.3, y]], '#ff6b1a');
  fillPoly(ctx, [[x - h * 0.22, y - h * 0.35], [x - h * 0.15, y - h * 0.6], [x + h * 0.15, y - h * 0.6], [x + h * 0.22, y - h * 0.35]], '#f5f5f5');
}
function airplane(ctx, x, y, s, color = '#f5f7fa') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  fillRound(ctx, -60, -8, 120, 18, 9, color); fillPoly(ctx, [[-60, -6], [-80, -30], [-66, -30], [-50, -6]], '#3498db');
  fillPoly(ctx, [[-10, 2], [20, 2], [50, 22], [10, 22]], shade(color, -0.1)); fillPoly(ctx, [[-10, -2], [20, -2], [40, -16], [10, -16]], shade(color, -0.15));
  fillRect(ctx, -60, -2, 120, 3, '#3498db'); for (let i = 0; i < 7; i++) fillCircle(ctx, -40 + i * 14, -3, 2, '#5aa8d8');
  ctx.restore();
}

export default [
  // ---------------------------------------------------------------- BIRTHDAY PARTY
  {
    id: 'birthday_party', name: 'Birthday Party Venue', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7;
      wall(ctx, env, '#f8e1ea', { floorY });
      ctx.fillStyle = rgba('#fff', 0.35); for (let i = 0; i < 40; i++) fillCircle(ctx, (i * 173) % W, (i * 97) % (floorY - 40), 4 + (i % 3) * 2, ctx.fillStyle); // polka
      windowInterior(ctx, env, 900, 90, 220, 180, { curtain: '#ff8fab' });
      // streamers from the ceiling
      ['#ff6b81', '#48dbfb', '#feca57', '#1dd1a1'].forEach((c, i) => { ctx.strokeStyle = c; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(150 + i * 300, 0); for (let k = 1; k <= 6; k++) ctx.quadraticCurveTo(150 + i * 300 + (k % 2 ? 22 : -22), k * 28 - 14 + Math.sin(env.t * 2 + i) * 4, 150 + i * 300, k * 28); ctx.stroke(); });
      // banner
      bunting(ctx, env, 180, 60, 1100, 60, ['#ff6b81', '#feca57', '#48dbfb', '#1dd1a1', '#c56cf0']);
      fillRound(ctx, 300, 100, 680, 56, 12, '#ff6b81'); fillRound(ctx, 306, 106, 668, 44, 10, '#fff0f3');
      text(ctx, 640, 128, 'HAPPY BIRTHDAY!', 'bold 36px "Comic Sans MS", "Chalkboard SE", sans-serif', '#e84a6a');
      // balloon bunches
      [[90, 300], [1180, 320], [250, 360], [1050, 380]].forEach(([bx, by], i) => {
        [['#ff6b81', -26, -20], ['#feca57', 0, -40], ['#48dbfb', 26, -16], ['#c56cf0', 6, 4]].forEach(([c, ox, oy], k) => balloon(ctx, env, bx + ox, by + oy, c, 24, i + k));
        fillRound(ctx, bx - 10, by + 86, 20, 14, 4, '#c9a227');
      });
      floor(ctx, env, floorY, 'wood', '#c99a6a');
      // cake table at the back centre
      const tx = 640, ty = floorY + 22;
      table(ctx, env, tx - 150, ty, 300, 64, '#f6f0f8', '#f6f0f8');
      fillRect(ctx, tx - 160, ty - 76, 320, 10, '#ff8fab');
      // tiered cake
      const cakeY = ty - 76;
      [[120, 34, '#fbe9f0', '#ff8fab'], [90, 30, '#fdf3e0', '#feca57'], [60, 26, '#e8f8f5', '#48dbfb']].forEach(([w, h, c, ice], i) => {
        const y = cakeY - [0, 34, 64][i];
        fillRound(ctx, tx - w / 2, y - h, w, h, 4, c);
        ctx.fillStyle = ice; ctx.beginPath(); ctx.moveTo(tx - w / 2, y - h); ctx.lineTo(tx + w / 2, y - h);
        for (let k = 0; k < 6; k++) ctx.quadraticCurveTo(tx + w / 2 - (k + 0.5) * w / 6, y - h + 16, tx + w / 2 - (k + 1) * w / 6, y - h + 6); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 4; k++) fillCircle(ctx, tx - w / 2 + 10 + k * (w - 20) / 3, y - 8, 3, ice);
      });
      for (let i = 0; i < 5; i++) candle(ctx, env, tx - 20 + i * 10, cakeY - 90, 16, true);
      ctx.fillStyle = radGrad(ctx, tx, cakeY - 110, 0, 70, [[0, 'rgba(255,220,120,0.35)'], [1, 'rgba(255,220,120,0)']]); circle(ctx, tx, cakeY - 110, 70); ctx.fill();
      partyHat(ctx, tx - 120, ty - 76, 40, '#48dbfb'); partyHat(ctx, tx + 120, ty - 76, 40, '#c56cf0');
      // gift boxes (left) and cups (right)
      giftBox(ctx, 90, floorY + 110, 70, 56, '#48dbfb', '#feca57'); giftBox(ctx, 160, floorY + 120, 56, 44, '#c56cf0', '#fff'); giftBox(ctx, 118, floorY + 54, 44, 36, '#1dd1a1', '#ff6b81');
      [[1120, 0], [1150, 0], [1180, 0]].forEach(([cx]) => fillPoly(ctx, [[cx - 10, floorY + 50], [cx + 10, floorY + 50], [cx + 7, floorY + 80], [cx - 7, floorY + 80]], '#ff6b81'));
      ctx.fillStyle = radGrad(ctx, W / 2, 0, 0, 700, [[0, 'rgba(255,240,230,0.25)'], [1, 'rgba(255,240,230,0)']]); ctx.fillRect(0, 0, W, H);
    },
    paintFront(ctx, env) {
      const r = rng(hash('confetti' + env.seed)); const cols = ['#ff6b81', '#feca57', '#48dbfb', '#1dd1a1', '#c56cf0'];
      for (let i = 0; i < 36; i++) {
        const sp = 40 + r() * 60, x0 = r() * env.W, ph = r() * TAU, c = cols[i % 5];
        const y = ((env.t * sp + r() * 900) % (env.H + 40)) - 20, x = x0 + Math.sin(env.t * 2 + ph) * 18;
        ctx.save(); ctx.translate(x, y); ctx.rotate(env.t * 3 + ph); ctx.fillStyle = c; ctx.fillRect(-5, -3, 10, 6); ctx.restore();
      }
    },
  },
  // ---------------------------------------------------------------- AMUSEMENT PARK
  {
    id: 'amusement_park', name: 'Amusement Park / Carnival', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.66; const night = env.tod === 'night';
      sky(ctx, env, { horizon: gy, sunX: W * 0.15, sunY: H * 0.15, cloudCount: 4 });
      hills(ctx, env, gy - 30, '#6fae5a', 7, 60, 3, 0.4);
      // ferris wheel (right back)
      const fx = 1010, fy = gy - 200, fr = 175, rot = env.t * 0.25;
      strokeLine(ctx, fx - 90, gy + 10, fx, fy, lit(env, '#6c7a89'), 10); strokeLine(ctx, fx + 90, gy + 10, fx, fy, lit(env, '#6c7a89'), 10);
      ctx.strokeStyle = lit(env, '#e74c3c'); ctx.lineWidth = 6; circle(ctx, fx, fy, fr); ctx.stroke(); ctx.lineWidth = 3; circle(ctx, fx, fy, fr * 0.6); ctx.stroke();
      const cab = ['#feca57', '#48dbfb', '#ff6b81', '#1dd1a1', '#c56cf0', '#ff9f43', '#54a0ff', '#f368e0'];
      for (let i = 0; i < 12; i++) {
        const a = rot + (i / 12) * TAU, ex = fx + Math.cos(a) * fr, ey = fy + Math.sin(a) * fr;
        strokeLine(ctx, fx, fy, ex, ey, lit(env, '#e74c3c'), 3);
        if (i % 1 === 0 && i < 12) { fillRound(ctx, ex - 14, ey + 4, 28, 24, 6, cab[i % 8]); fillRound(ctx, ex - 16, ey, 32, 8, 3, shade(cab[i % 8], -0.2)); }
        if (night) fillCircle(ctx, ex, ey, 3, '#fff6c0');
      }
      fillCircle(ctx, fx, fy, 14, '#c0392b'); fillCircle(ctx, fx, fy, 6, '#f1c40f');
      // carousel (left back)
      const cx = 230, cy = gy + 10;
      fillPoly(ctx, [[cx - 170, cy - 130], [cx, cy - 210], [cx + 170, cy - 130]], lit(env, '#e74c3c'));
      for (let i = 0; i < 8; i++) fillPoly(ctx, [[cx - 170 + i * 42.5, cy - 130], [cx - 170 + (i + 1) * 42.5, cy - 130], [cx, cy - 210]], i % 2 ? rgba('#fff', 0.5) : rgba('#fff', 0));
      fillRect(ctx, cx - 180, cy - 134, 360, 12, lit(env, '#f1c40f'));
      fillEllipse(ctx, cx, cy - 10, 180, 22, lit(env, '#c0392b')); fillEllipse(ctx, cx, cy - 16, 180, 20, lit(env, '#f39c12'));
      for (let i = 0; i < 6; i++) { const a = env.t * 0.6 + (i / 6) * TAU, hx = cx + Math.cos(a) * 150, hy = cy - 16 + Math.sin(a) * 14, s = 0.7 + 0.3 * (Math.sin(a) * 0.5 + 0.5), hz = Math.sin(env.t * 2 + i) * 8; strokeLine(ctx, hx, cy - 125, hx, hy - 20, '#c9a227', 3); fillRound(ctx, hx - 20 * s, hy - 46 * s + hz, 40 * s, 22 * s, 10 * s, lit(env, cab[i % 8])); fillRound(ctx, hx + 12 * s, hy - 64 * s + hz, 12 * s, 28 * s, 5 * s, lit(env, cab[i % 8])); fillRect(ctx, hx - 14 * s, hy - 26 * s + hz, 5, 14 * s, lit(env, cab[i % 8])); fillRect(ctx, hx + 8 * s, hy - 26 * s + hz, 5, 14 * s, lit(env, cab[i % 8])); }
      fillRect(ctx, cx - 6, cy - 210, 12, 200, lit(env, '#c9a227'));
      // crowd far
      crowd(ctx, env, gy + 18, 26, 4, false);
      ground(ctx, env, gy + 14, '#8fbf6a', '#5f8f45');
      ctx.fillStyle = linGrad(ctx, 0, gy + 60, 0, H, [[0, lit(env, '#b0a090')], [1, lit(env, '#7a6a5a')]]); fillPoly(ctx, [[W * 0.3, gy + 60], [W * 0.7, gy + 60], [W * 1.05, H], [-W * 0.05, H]], ctx.fillStyle);
      // game booths (centre back)
      const booth = (x, w, c1, c2, label) => {
        groundShadow(ctx, x + w / 2, gy + 44, w * 0.55, 12, 0.25);
        fillRect(ctx, x, gy - 50, w, 90, lit(env, '#f5e6c8')); fillRect(ctx, x + 8, gy - 40, w - 16, 50, lit(env, '#3b3f5c'));
        for (let k = 0; k < 4; k++) fillCircle(ctx, x + 24 + k * (w - 48) / 3, gy - 20, 9, cab[k + 1]);
        fillRect(ctx, x + 10, gy, w - 20, 6, '#999');
        const n = Math.floor(w / 26); for (let i = 0; i < n; i++) fillPoly(ctx, [[x - 8 + i * (w + 16) / n, gy - 100], [x - 8 + (i + 1) * (w + 16) / n, gy - 100], [x - 8 + (i + 1) * (w + 16) / n, gy - 60 + (i % 2) * 8], [x - 8 + i * (w + 16) / n, gy - 60 + ((i + 1) % 2) * 8]], lit(env, i % 2 ? c1 : c2));
        fillPoly(ctx, [[x - 12, gy - 100], [x + w / 2, gy - 124], [x + w + 12, gy - 100]], lit(env, c1));
        signBoard(ctx, env, x + w * 0.2, gy - 118, w * 0.6, 24, label, '#2c3e50', '#f1c40f', 'bold 14px sans-serif');
      };
      booth(470, 200, '#e74c3c', '#fff', 'RING TOSS'); booth(700, 180, '#3498db', '#fff', 'BALLOON POP');
      // cotton candy stand (right)
      const sx = 1130, sy = gy + 90;
      fillRect(ctx, sx - 50, sy - 70, 100, 70, lit(env, '#ff8fab')); fillRect(ctx, sx - 56, sy - 78, 112, 10, lit(env, '#fff'));
      fillRect(ctx, sx - 40, sy - 130, 4, 55, '#777'); fillRect(ctx, sx + 36, sy - 130, 4, 55, '#777'); fillPoly(ctx, [[sx - 58, sy - 130], [sx, sy - 150], [sx + 58, sy - 130]], lit(env, '#ff6b81'));
      [[-22, '#ffb3d9'], [0, '#bde0ff'], [22, '#ffd6a5']].forEach(([ox, c], i) => { strokeLine(ctx, sx + ox, sy - 76, sx + ox, sy - 104, '#fff', 3); fillCircle(ctx, sx + ox, sy - 112 + Math.sin(env.t + i) * 2, 14, c); });
      fillCircle(ctx, sx - 30, sy + 2, 10, '#333'); fillCircle(ctx, sx + 30, sy + 2, 10, '#333');
      // string lights across top
      ctx.strokeStyle = '#444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 40); ctx.quadraticCurveTo(320, 110, 640, 50); ctx.quadraticCurveTo(960, 110, W, 40); ctx.stroke();
      for (let i = 0; i < 26; i++) { const t = i / 25, x = t * W; const y = t < 0.5 ? lerp(lerp(40, 110, t * 2), lerp(110, 50, t * 2), t * 2) : lerp(lerp(50, 110, (t - 0.5) * 2), lerp(110, 40, (t - 0.5) * 2), (t - 0.5) * 2); const c = cab[i % 8]; if (night) { ctx.fillStyle = radGrad(ctx, x, y + 8, 0, 26, [[0, rgba(c, 0.5)], [1, rgba(c, 0)]]); circle(ctx, x, y + 8, 26); ctx.fill(); } fillCircle(ctx, x, y + 8, 5, night ? c : shade(c, -0.1)); }
      // lamp post
      streetLamp(ctx, env, 400, gy + 150, 180);
    },
  },
  // ---------------------------------------------------------------- CONCERT STAGE
  {
    id: 'concert_stage', name: 'Music Concert Stage', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const stageY = H * 0.7;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, '#07060f'], [0.6, '#15102a'], [1, '#0b0916']]); ctx.fillRect(0, 0, W, H);
      // haze glow behind
      ctx.fillStyle = radGrad(ctx, W / 2, stageY - 100, 0, 500, [[0, 'rgba(120,60,200,0.35)'], [1, 'rgba(0,0,0,0)']]); circle(ctx, W / 2, stageY - 100, 500); ctx.fill();
      // LED back wall
      fillRect(ctx, 200, 60, 880, stageY - 90, '#0d0a1c');
      for (let gx = 0; gx < 22; gx++) for (let gyy = 0; gyy < 10; gyy++) { const v = 0.5 + 0.5 * Math.sin(env.t * 2 + gx * 0.5 + gyy * 0.8); ctx.fillStyle = `rgba(${Math.floor(80 + 150 * v)},${Math.floor(40 + 60 * (1 - v))},${Math.floor(200)},${0.35 + 0.4 * v})`; ctx.fillRect(208 + gx * 40, 68 + gyy * 42, 34, 36); }
      // truss with lights
      fillRect(ctx, 100, 20, W - 200, 14, '#3a3a44'); ctx.strokeStyle = '#555'; ctx.lineWidth = 2; for (let x = 100; x < W - 100; x += 30) { strokeLine(ctx, x, 20, x + 15, 34, '#555', 2); strokeLine(ctx, x + 15, 34, x + 30, 20, '#555', 2); }
      const cols = ['#ff2d75', '#2dd4ff', '#ffd32d', '#7c3aed', '#22c55e', '#ff7a2d'];
      for (let i = 0; i < 9; i++) { const lx = 160 + i * 120; fillRound(ctx, lx - 14, 34, 28, 30, 5, '#222'); const c = cols[i % 6]; fillCircle(ctx, lx, 64, 9, c); ctx.fillStyle = radGrad(ctx, lx, 64, 0, 30, [[0, rgba(c, 0.6)], [1, rgba(c, 0)]]); circle(ctx, lx, 64, 30); ctx.fill(); }
      // sweeping spotlights
      for (let i = 0; i < 5; i++) { const lx = 220 + i * 210; const tx = W / 2 + Math.sin(env.t * 0.9 + i * 1.3) * 380; spotlight(ctx, env, lx, 66, tx, stageY + 40, rgba(cols[i % 6], 0.22), 220); }
      // drum kit (back centre)
      const dx = 640, dy = stageY - 10;
      fillRound(ctx, dx - 40, dy - 60, 80, 60, 10, '#c0392b'); fillEllipse(ctx, dx, dy - 30, 38, 30, '#f5f5f5'); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 4; ellipse(ctx, dx, dy - 30, 38, 30); ctx.stroke();
      fillEllipse(ctx, dx - 70, dy - 90, 26, 18, '#e67e22'); fillEllipse(ctx, dx + 70, dy - 90, 26, 18, '#e67e22'); fillEllipse(ctx, dx - 110, dy - 120, 34, 8, '#f1c40f'); fillEllipse(ctx, dx + 110, dy - 125, 34, 8, '#f1c40f');
      strokeLine(ctx, dx - 110, dy - 118, dx - 110, dy, '#888', 3); strokeLine(ctx, dx + 110, dy - 123, dx + 110, dy, '#888', 3);
      // stage floor
      ctx.fillStyle = linGrad(ctx, 0, stageY, 0, H, [[0, '#2a2438'], [1, '#120f1c']]); ctx.fillRect(0, stageY, W, H - stageY);
      ctx.strokeStyle = rgba('#fff', 0.06); ctx.lineWidth = 2; for (let k = 1; k < 6; k++) { const yy = stageY + (H - stageY) * (k * k) / 36; strokeLine(ctx, 0, yy, W, yy, ctx.strokeStyle, 2); }
      ctx.fillStyle = radGrad(ctx, W / 2, stageY + 60, 0, 400, [[0, 'rgba(255,255,255,0.12)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(0, stageY, W, H - stageY);
      fillRect(ctx, 0, stageY - 4, W, 6, '#3a3448');
      // speaker stacks + amps at the sides
      speakerStack(ctx, 30, stageY + 120, 90, 230); speakerStack(ctx, W - 120, stageY + 120, 90, 230);
      fillRound(ctx, 150, stageY + 60, 90, 60, 4, '#2a2a2e'); fillRect(ctx, 160, stageY + 10, 70, 50, '#1b1b20'); for (let i = 0; i < 4; i++) fillCircle(ctx, 172 + i * 16, stageY + 24, 3, '#f1c40f');
      fillRound(ctx, W - 240, stageY + 60, 90, 60, 4, '#2a2a2e');
      // mic stands left/right of centre
      micStand(ctx, 330, stageY + 120, 150); micStand(ctx, 950, stageY + 120, 150);
      // strip of floor lights at the front edge
      for (let i = 0; i < 14; i++) { const lx = 60 + i * 90, c = cols[i % 6]; fillRound(ctx, lx - 12, H - 22, 24, 10, 3, '#222'); ctx.fillStyle = radGrad(ctx, lx, H - 20, 0, 60, [[0, rgba(c, 0.45)], [1, rgba(c, 0)]]); circle(ctx, lx, H - 20, 60); ctx.fill(); }
      fog(ctx, env, stageY + 80, 0.12);
    },
    paintFront(ctx, env) {
      crowd(ctx, env, env.H + 30, 34, 12, true);
      const r = rng(hash('hands' + env.seed));
      for (let i = 0; i < 20; i++) { const x = r() * env.W, bob = Math.abs(Math.sin(env.t * 5 + i)) * 10; strokeLine(ctx, x, env.H + 4, x + 6, env.H - 50 - bob, 'rgba(8,8,18,0.9)', 6); fillCircle(ctx, x + 6, env.H - 54 - bob, 6, 'rgba(8,8,18,0.9)'); }
    },
  },
  // ---------------------------------------------------------------- AIRPORT GATE
  {
    id: 'airport_gate', name: 'Airport Terminal / Gate', category: CAT, groundY: 0.9, horizonY: 0.72, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.72; const p = todOf(env);
      wall(ctx, env, '#dfe6ec', { floorY });
      // ceiling panels
      ctx.fillStyle = rgba('#fff', 0.5); for (let i = 0; i < 4; i++) ctx.fillRect(80 + i * 320, 14, 240, 10);
      // big windows showing the runway
      const wx = 150, wy = 70, ww = 980, wh = 330;
      ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [[0, p.skyTop], [0.55, p.skyMid], [1, p.skyBot]]); ctx.fillRect(wx, wy, ww, wh);
      hills(ctx, { ...env, W: wx + ww + 300, H: wy + wh }, wy + wh * 0.62, '#6fae5a', 9, 24, 3, 0.5);
      fillRect(ctx, wx, wy + wh * 0.66, ww, wh * 0.34, lit(env, '#8d9aa5')); // apron
      fillRect(ctx, wx, wy + wh * 0.68, ww, 14, lit(env, '#4a525c')); ctx.fillStyle = '#f5e663'; for (let x = wx; x < wx + ww; x += 50) ctx.fillRect(x, wy + wh * 0.68 + 5, 24, 3); // runway
      // control tower
      fillRect(ctx, wx + 820, wy + wh * 0.3, 26, wh * 0.38, lit(env, '#b8c0c8')); fillRound(ctx, wx + 800, wy + wh * 0.22, 66, 36, 8, lit(env, '#55606c')); fillRect(ctx, wx + 806, wy + wh * 0.26, 54, 14, lit(env, '#9fd3f5'));
      // plane at the gate
      airplane(ctx, wx + 400 + Math.sin(env.t * 0.5) * 2, wy + wh * 0.72, 2.2);
      const far = ((env.t * 40) % (ww + 300)) - 150; airplane(ctx, wx + far, wy + 60, 0.5, '#dde');
      ctx.restore();
      ctx.strokeStyle = '#2f3b47'; ctx.lineWidth = 10; ctx.strokeRect(wx, wy, ww, wh); for (let i = 1; i < 4; i++) strokeLine(ctx, wx + i * ww / 4, wy, wx + i * ww / 4, wy + wh, '#2f3b47', 8);
      // flight board (left)
      fillRound(ctx, 20, 40, 220, 230, 6, '#111827'); text(ctx, 130, 62, 'DEPARTURES', 'bold 16px monospace', '#fbbf24');
      [['KTM 09:40', 'ON TIME'], ['DEL 10:15', 'BOARDING'], ['DXB 10:50', 'DELAYED'], ['LHR 11:20', 'ON TIME'], ['FRA 12:05', 'GATE 12'], ['SIN 12:30', 'ON TIME']].forEach(([a, b], i) => { text(ctx, 32, 92 + i * 28, a, '13px monospace', '#e5e7eb', 'left'); text(ctx, 228, 92 + i * 28, b, '12px monospace', b === 'DELAYED' ? '#ef4444' : b === 'BOARDING' ? '#22c55e' : '#fbbf24', 'right'); });
      // gate sign
      signBoard(ctx, env, 1150, 60, 110, 50, 'GATE 12', '#1d4ed8', '#fff', 'bold 20px sans-serif'); strokeLine(ctx, 1205, 0, 1205, 60, '#555', 3);
      // floor
      floor(ctx, env, floorY, 'tile', '#e4e9ee');
      ctx.fillStyle = linGrad(ctx, 0, floorY, 0, floorY + 140, [[0, rgba('#fff', 0.35)], [1, rgba('#fff', 0)]]); ctx.fillRect(wx, floorY, ww, 140); // reflection
      // seats row at the back
      for (let i = 0; i < 7; i++) { const sx = 260 + i * 110; fillRound(ctx, sx, floorY - 40, 90, 20, 6, '#2563eb'); fillRound(ctx, sx + 4, floorY - 74, 82, 36, 8, '#3b82f6'); fillRect(ctx, sx + 12, floorY - 20, 6, 40, '#6b7280'); fillRect(ctx, sx + 72, floorY - 20, 6, 40, '#6b7280'); }
      fillRect(ctx, 250, floorY - 24, 780, 6, '#4b5563');
      // luggage trolley (right)
      const lx = 1150, ly = floorY + 120;
      fillRect(ctx, lx - 50, ly - 20, 100, 8, '#6b7280'); fillCircle(ctx, lx - 38, ly, 8, '#222'); fillCircle(ctx, lx + 38, ly, 8, '#222'); strokeLine(ctx, lx + 46, ly - 20, lx + 60, ly - 90, '#6b7280', 5); strokeLine(ctx, lx + 60, ly - 90, lx + 30, ly - 96, '#6b7280', 5);
      fillRound(ctx, lx - 44, ly - 66, 70, 46, 5, '#b91c1c'); fillRound(ctx, lx - 34, ly - 100, 54, 34, 5, '#1f2937'); fillRect(ctx, lx - 16, ly - 108, 20, 8, '#1f2937');
      // potted plant left
      fillPoly(ctx, [[60, floorY + 60], [120, floorY + 60], [112, floorY + 130], [68, floorY + 130]], '#6b7280'); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; fillEllipse(ctx, 90 + Math.cos(a) * 40, floorY + 50 + Math.sin(a) * 50, 10, 28, i % 2 ? '#15803d' : '#22c55e', a + Math.PI / 2); }
      vignette(ctx, env, 0.15);
    },
  },
  // ---------------------------------------------------------------- GYM
  {
    id: 'gym', name: 'Gym / Fitness Center', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7;
      wall(ctx, env, '#2f3540', { floorY });
      fillRect(ctx, 0, floorY - 150, W, 30, '#e63946'); // accent stripe
      // ceiling lights
      for (let i = 0; i < 4; i++) { const lx = 160 + i * 320; fillRound(ctx, lx - 90, 18, 180, 12, 4, '#f8fafc'); ctx.fillStyle = radGrad(ctx, lx, 30, 0, 200, [[0, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']]); fillPoly(ctx, [[lx - 90, 30], [lx + 90, 30], [lx + 190, floorY], [lx - 190, floorY]], ctx.fillStyle); }
      // mirror wall panel (centre back)
      const mx = 330, my = 60, mw = 620, mh = floorY - 100 - my;
      ctx.fillStyle = linGrad(ctx, mx, my, mx + mw, my + mh, [[0, '#8fa3b8'], [0.5, '#c7d4e0'], [1, '#8fa3b8']]); ctx.fillRect(mx, my, mw, mh);
      ctx.fillStyle = rgba('#fff', 0.25); fillPoly(ctx, [[mx + 40, my], [mx + 160, my], [mx + 60, my + mh], [mx - 20, my + mh]], ctx.fillStyle); fillPoly(ctx, [[mx + 420, my], [mx + 470, my], [mx + 380, my + mh], [mx + 330, my + mh]], ctx.fillStyle);
      ctx.strokeStyle = '#1f242b'; ctx.lineWidth = 8; ctx.strokeRect(mx, my, mw, mh);
      // posters
      fillRound(ctx, 90, 70, 180, 120, 4, '#111'); text(ctx, 180, 110, 'NO PAIN', 'bold 26px Impact, sans-serif', '#e63946'); text(ctx, 180, 150, 'NO GAIN', 'bold 26px Impact, sans-serif', '#f8fafc');
      fillRound(ctx, 1010, 70, 180, 120, 4, '#1d3557'); text(ctx, 1100, 118, 'TRAIN', 'bold 30px Impact, sans-serif', '#a8dadc'); text(ctx, 1100, 156, 'HARD', 'bold 30px Impact, sans-serif', '#f1faee');
      // clock
      fillCircle(ctx, 640, 40, 22, '#f8fafc'); fillCircle(ctx, 640, 40, 19, '#fff'); strokeLine(ctx, 640, 40, 640, 26, '#111', 2); strokeLine(ctx, 640, 40, 650, 44, '#111', 2);
      // rubber floor
      floor(ctx, env, floorY, 'concrete', '#3b4048');
      ctx.strokeStyle = rgba('#000', 0.2); ctx.lineWidth = 2; for (let x = 0; x < W; x += 160) strokeLine(ctx, x, floorY, W / 2 + (x - W / 2) * 1.5, H, ctx.strokeStyle, 2);
      // treadmills (left back)
      treadmill(ctx, 60, floorY + 30, 160); treadmill(ctx, 240, floorY + 40, 160);
      // dumbbell rack (right back)
      const rx = 1000, ry = floorY + 36;
      fillRect(ctx, rx, ry - 120, 10, 120, '#1f242b'); fillRect(ctx, rx + 230, ry - 120, 10, 120, '#1f242b');
      for (let row = 0; row < 3; row++) { const yy = ry - 20 - row * 40; fillRect(ctx, rx, yy - 6, 240, 8, '#2b3139'); for (let k = 0; k < 4; k++) dumbbell(ctx, rx + 36 + k * 56, yy - 14, 40 + row * 4, ['#e63946', '#1d3557', '#2a9d8f'][row]); }
      // exercise mats (sides, on the floor)
      fillPoly(ctx, [[60, floorY + 150], [230, floorY + 150], [250, floorY + 190], [50, floorY + 190]], '#7c3aed'); fillPoly(ctx, [[60, floorY + 150], [230, floorY + 150], [232, floorY + 156], [58, floorY + 156]], rgba('#fff', 0.3));
      fillPoly(ctx, [[1040, floorY + 160], [1210, floorY + 160], [1230, floorY + 200], [1030, floorY + 200]], '#2a9d8f'); fillPoly(ctx, [[1040, floorY + 160], [1210, floorY + 160], [1212, floorY + 166], [1038, floorY + 166]], rgba('#fff', 0.3));
      // weight plates + water bottle
      [[300, 0], [330, 0], [360, 0]].forEach(([px, o], i) => { fillCircle(ctx, px, floorY + 120 + o, 26 - i * 2, '#1f242b'); fillCircle(ctx, px, floorY + 120 + o, 22 - i * 2, i % 2 ? '#e63946' : '#2b3139'); fillCircle(ctx, px, floorY + 120 + o, 5, '#777'); });
      fillRound(ctx, 1200, floorY + 90, 16, 40, 5, '#48dbfb'); fillRect(ctx, 1202, floorY + 84, 12, 8, '#1d3557');
      vignette(ctx, env, 0.25);
    },
  },
  // ---------------------------------------------------------------- CONSTRUCTION SITE
  {
    id: 'construction_site', name: 'Construction Site', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.64;
      sky(ctx, env, { horizon: gy, sunX: W * 0.2, sunY: H * 0.15, cloudCount: 4 });
      skyline(ctx, env, gy, 3, '#6b7a90', 0.5, 200);
      // crane far right
      const kx = 1080; const steel = lit(env, '#f2b230');
      fillRect(ctx, kx - 8, gy - 420, 16, 420, steel); ctx.strokeStyle = rgba('#000', 0.3); ctx.lineWidth = 2; for (let y = gy - 410; y < gy; y += 24) { strokeLine(ctx, kx - 8, y, kx + 8, y + 12, ctx.strokeStyle, 2); strokeLine(ctx, kx + 8, y, kx - 8, y + 12, ctx.strokeStyle, 2); }
      fillRect(ctx, kx - 300, gy - 430, 420, 12, steel); fillRect(ctx, kx + 100, gy - 440, 60, 30, lit(env, '#444')); strokeLine(ctx, kx - 290, gy - 430, kx, gy - 480, steel, 3); strokeLine(ctx, kx + 110, gy - 430, kx, gy - 480, steel, 3);
      const hookX = kx - 180 + Math.sin(env.t * 0.4) * 40; strokeLine(ctx, hookX, gy - 418, hookX, gy - 250, '#333', 2); fillRound(ctx, hookX - 24, gy - 250, 48, 30, 3, lit(env, '#8d6e63'));
      // unfinished building with scaffolding (centre back)
      const bx = 380, bw = 520, floors = 3;
      const conc = lit(env, '#b8b8b0');
      for (let f = 0; f < floors; f++) { const fy = gy + 10 - f * 100; fillRect(ctx, bx, fy - 14, bw, 14, conc); for (let c = 0; c <= 5; c++) fillRect(ctx, bx + 10 + c * (bw - 30) / 5, fy - 100, 12, 86, shade(conc, -0.15)); }
      fillRect(ctx, bx, gy + 10 - floors * 100 - 14, bw, 14, conc);
      for (let c = 0; c <= 5; c++) fillRect(ctx, bx + 10 + c * (bw - 30) / 5, gy - floors * 100 - 60, 12, 56, lit(env, '#777')); // rebar
      // scaffold poles + planks
      const sc = lit(env, '#f2b230');
      for (let c = 0; c < 8; c++) { const px = bx - 30 + c * 82; fillRect(ctx, px, gy - 330, 6, 345, sc); }
      for (let lvl = 0; lvl < 4; lvl++) { const ly = gy - 20 - lvl * 85; fillRect(ctx, bx - 34, ly, 590, 6, sc); fillRect(ctx, bx - 34, ly - 10, 590, 10, lit(env, '#a0703a')); }
      for (let lvl = 0; lvl < 3; lvl++) for (let c = 0; c < 7; c++) { const px = bx - 30 + c * 82, ly = gy - 20 - lvl * 85; strokeLine(ctx, px + 3, ly, px + 85, ly - 85, rgba('#000', 0.25), 2); }
      // warning tape / net
      ctx.fillStyle = rgba('#2a9d8f', 0.35); ctx.fillRect(bx + 180, gy - 300, 300, 150);
      // dirt ground
      ground(ctx, env, gy + 12, '#b08a5a', '#7a5a38');
      ctx.fillStyle = rgba('#000', 0.08); for (let i = 0; i < 14; i++) fillEllipse(ctx, (i * 211) % W, gy + 60 + (i * 47) % 180, 50, 8, ctx.fillStyle);
      // dump truck silhouette far left
      const tx = 120, ty = gy + 14; const tc = mixColor(lit(env, '#c0392b'), todOf(env).haze, 0.3);
      fillRect(ctx, tx - 70, ty - 50, 110, 34, tc); fillPoly(ctx, [[tx - 70, ty - 50], [tx - 70, ty - 16], [tx + 40, ty - 16], [tx + 40, ty - 50]], tc); fillRound(ctx, tx + 40, ty - 60, 40, 44, 4, lit(env, '#f1c40f')); fillRect(ctx, tx + 46, ty - 54, 20, 16, '#9fd3f5');
      [tx - 50, tx - 20, tx + 60].forEach((wx) => { fillCircle(ctx, wx, ty - 12, 12, '#222'); fillCircle(ctx, wx, ty - 12, 5, '#777'); });
      // cement mixer (right)
      const mx = 1130, my = gy + 110;
      groundShadow(ctx, mx, my + 2, 60, 10, 0.3);
      fillRect(ctx, mx - 40, my - 40, 80, 12, lit(env, '#555')); fillCircle(ctx, mx - 32, my - 10, 14, '#222'); fillCircle(ctx, mx + 32, my - 10, 14, '#222'); fillRect(ctx, mx - 44, my - 30, 10, 24, '#555'); fillRect(ctx, mx + 34, my - 30, 10, 24, '#555');
      ctx.save(); ctx.translate(mx, my - 80); ctx.rotate(-0.5); fillRound(ctx, -34, -40, 68, 90, 24, lit(env, '#f39c12')); fillEllipse(ctx, 0, -40, 24, 10, '#333'); ctx.fillStyle = rgba('#000', 0.15); for (let i = 0; i < 3; i++) fillRect(ctx, -34 + i * 24, -30, 8, 70, ctx.fillStyle); ctx.restore();
      // brick pile (left)
      const brick = lit(env, '#b5412f');
      for (let row = 0; row < 4; row++) for (let c = 0; c < 6 - row; c++) { const x = 180 + c * 34 + row * 17, y = gy + 160 - row * 18; fillRect(ctx, x, y - 16, 32, 16, brick); fillRect(ctx, x, y - 16, 32, 3, rgba('#fff', 0.2)); }
      // safety barriers
      const barrier = (x) => { fillRect(ctx, x, gy + 60, 8, 60, '#333'); fillRect(ctx, x + 132, gy + 60, 8, 60, '#333'); fillRect(ctx, x, gy + 70, 140, 20, '#fff'); for (let i = 0; i < 4; i++) fillPoly(ctx, [[x + 8 + i * 36, gy + 70], [x + 26 + i * 36, gy + 70], [x + 18 + i * 36, gy + 90], [x + i * 36, gy + 90]], '#e63946'); };
      barrier(40); barrier(1080);
      // cones
      cone(ctx, 330, gy + 200, 44); cone(ctx, 960, gy + 215, 44); cone(ctx, 1230, gy + 180, 40);
      // sign
      signBoard(ctx, env, 40, gy - 90, 150, 46, 'HARD HATS', '#f2b230', '#111', 'bold 18px sans-serif');
      fillRect(ctx, 110, gy - 44, 8, 104, '#555');
    },
  },
  // ---------------------------------------------------------------- POLICE STATION
  {
    id: 'police_station', name: 'Police Station / Interrogation Room', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7;
      wall(ctx, env, '#9fb0a8', { floorY, wainscot: true });
      // blinds window (centre-left)
      const bx = 330, by = 70, bw = 220, bh = 200;
      fillRect(ctx, bx - 6, by - 6, bw + 12, bh + 12, '#5a6a64'); ctx.fillStyle = env.tod === 'night' ? '#111a30' : '#bcd8ee'; ctx.fillRect(bx, by, bw, bh);
      for (let y = by + 4; y < by + bh; y += 14) fillRect(ctx, bx, y, bw, 8, env.tod === 'night' ? '#2a3440' : '#e8ecee');
      strokeLine(ctx, bx + 20, by, bx + 20, by + bh, '#555', 1); strokeLine(ctx, bx + bw - 20, by, bx + bw - 20, by + bh, '#555', 1);
      if (env.tod !== 'night') { ctx.fillStyle = linGrad(ctx, bx, by, bx + 100, floorY + 200, [[0, rgba('#fff', 0.12)], [1, rgba('#fff', 0)]]); fillPoly(ctx, [[bx, by], [bx + bw, by], [bx + bw + 200, floorY + 240], [bx - 60, floorY + 240]], ctx.fillStyle); }
      // one-way mirror (left)
      fillRect(ctx, 50, 80, 220, 190, '#2b2f33'); ctx.fillStyle = linGrad(ctx, 60, 90, 260, 260, [[0, '#4a5560'], [0.5, '#2b333a'], [1, '#4a5560']]); ctx.fillRect(60, 90, 200, 170); fillPoly(ctx, [[80, 90], [130, 90], [70, 260], [60, 260]], rgba('#fff', 0.1));
      // notice board with wanted poster (right)
      fillRect(ctx, 960, 70, 260, 200, '#7a5230'); fillRect(ctx, 970, 80, 240, 180, '#b5885a');
      fillRect(ctx, 1000, 95, 90, 120, '#f5efe0'); text(ctx, 1045, 112, 'WANTED', 'bold 15px Georgia, serif', '#8b1a1a'); fillCircle(ctx, 1045, 150, 20, '#d9b89a'); fillRound(ctx, 1025, 136, 40, 12, 4, '#3a2a1a'); fillRect(ctx, 1030, 148, 30, 6, '#222'); text(ctx, 1045, 200, '$5000', 'bold 13px Georgia, serif', '#333');
      fillRect(ctx, 1110, 100, 80, 50, '#fff'); fillRect(ctx, 1110, 160, 80, 60, '#fff3b0'); ctx.strokeStyle = rgba('#000', 0.3); ctx.lineWidth = 1; for (let i = 0; i < 4; i++) strokeLine(ctx, 1118, 112 + i * 10, 1182, 112 + i * 10, ctx.strokeStyle, 1);
      fillCircle(ctx, 1045, 97, 4, '#e63946'); fillCircle(ctx, 1150, 102, 4, '#1d4ed8'); fillCircle(ctx, 1150, 162, 4, '#22c55e');
      // height chart (far right wall)
      fillRect(ctx, 1235, 40, 40, floorY - 40, '#f3f1ea');
      for (let i = 0; i <= 10; i++) { const y = floorY - i * 42; strokeLine(ctx, 1235, y, i % 2 ? 1250 : 1262, y, '#333', 2); if (i % 2 === 0) text(ctx, 1268, y - 8, `${i * 20}`, '10px monospace', '#333', 'right'); }
      // clock
      fillCircle(ctx, 640, 50, 22, '#333'); fillCircle(ctx, 640, 50, 19, '#fff'); strokeLine(ctx, 640, 50, 640, 36, '#111', 2); strokeLine(ctx, 640, 50, 648, 56, '#111', 2);
      floor(ctx, env, floorY, 'tile', '#aeb6b2');
      // desk at the back centre with lamp + files
      desk(ctx, env, 520, floorY + 30, 260, 80, '#6b6f74');
      lamp(ctx, env, 740, floorY - 58, 70, true);
      fillRect(ctx, 560, floorY - 64, 60, 8, '#d7c49e'); fillRect(ctx, 566, floorY - 70, 60, 6, '#e2d3b0');
      fillRound(ctx, 640, floorY - 66, 36, 10, 2, '#2b2f33'); // recorder
      ctx.fillStyle = radGrad(ctx, 720, floorY - 20, 0, 150, [[0, 'rgba(255,230,170,0.3)'], [1, 'rgba(255,230,170,0)']]); circle(ctx, 720, floorY - 20, 150); ctx.fill();
      // metal chair (left of desk) + filing cabinet (right)
      chair(ctx, env, 440, floorY + 40, 46, 90, '#6b7280', 1);
      fillRect(ctx, 1080, floorY - 70, 100, 150, '#7a8188'); for (let i = 0; i < 3; i++) { fillRect(ctx, 1086, floorY - 62 + i * 48, 88, 40, '#8f969c'); fillRect(ctx, 1118, floorY - 46 + i * 48, 24, 5, '#333'); }
      // door at far left
      fillRect(ctx, 30, floorY - 180, 80, 182, '#5a6a64'); fillRect(ctx, 36, floorY - 174, 68, 170, '#7a8a84'); fillCircle(ctx, 92, floorY - 90, 4, '#ddd');
      vignette(ctx, env, 0.35);
    },
  },
  // ---------------------------------------------------------------- BAKERY
  {
    id: 'bakery', name: 'Bakery Shop', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7;
      wall(ctx, env, '#f6e7cf', { floorY });
      // tiles band
      ctx.fillStyle = '#e7c9a0'; ctx.fillRect(0, floorY - 150, W, 140); ctx.strokeStyle = rgba('#fff', 0.5); ctx.lineWidth = 2; for (let x = 0; x < W; x += 50) strokeLine(ctx, x, floorY - 150, x, floorY - 10, ctx.strokeStyle, 2); for (let y = floorY - 150; y < floorY; y += 35) strokeLine(ctx, 0, y, W, y, ctx.strokeStyle, 2);
      // pendant lamps
      [260, 640, 1020].forEach((lx) => { strokeLine(ctx, lx, 0, lx, 60, '#444', 2); fillPoly(ctx, [[lx - 34, 100], [lx - 16, 60], [lx + 16, 60], [lx + 34, 100]], '#c0632b'); ctx.fillStyle = radGrad(ctx, lx, 100, 0, 200, [[0, 'rgba(255,210,140,0.3)'], [1, 'rgba(255,210,140,0)']]); circle(ctx, lx, 100, 200); ctx.fill(); fillEllipse(ctx, lx, 100, 30, 6, '#ffe4b0'); });
      // hanging sign
      fillRound(ctx, 480, 110, 320, 70, 10, '#6b3d1b'); fillRound(ctx, 488, 118, 304, 54, 8, '#f8ead6'); text(ctx, 640, 146, 'BAKERY', 'bold 36px Georgia, serif', '#6b3d1b');
      strokeLine(ctx, 500, 60, 500, 110, '#444', 3); strokeLine(ctx, 780, 60, 780, 110, '#444', 3);
      fillCircle(ctx, 640, 118, 0, '#000');
      // chalk menu board (left)
      fillRound(ctx, 60, 90, 220, 190, 6, '#7a5230'); fillRound(ctx, 70, 100, 200, 170, 4, '#2f3b36');
      text(ctx, 170, 124, 'TODAY', 'bold 18px "Chalkboard SE", cursive', '#fff');
      [['Croissant', '2'], ['Baguette', '3'], ['Choc Cake', '18'], ['Donut', '1.5'], ['Muffin', '2.5']].forEach(([n, p], i) => { text(ctx, 86, 152 + i * 22, n, '14px "Chalkboard SE", cursive', '#f8f3e0', 'left'); text(ctx, 254, 152 + i * 22, '€' + p, '14px "Chalkboard SE", cursive', '#ffd166', 'right'); });
      // bread shelves (left-back wall)
      for (let s = 0; s < 3; s++) { const sy = 300 + s * 60; fillRect(ctx, 20, sy, 280, 8, '#8b5a2b'); for (let k = 0; k < 6; k++) { const bxx = 40 + k * 44; if (s === 0) fillEllipse(ctx, bxx, sy - 12, 22, 9, '#d9a25a', -0.6); else if (s === 1) { fillEllipse(ctx, bxx, sy - 10, 16, 10, '#c98a4a'); ctx.strokeStyle = rgba('#fff', 0.4); ctx.lineWidth = 1.5; strokeLine(ctx, bxx - 8, sy - 14, bxx - 2, sy - 8, ctx.strokeStyle, 1.5); strokeLine(ctx, bxx, sy - 14, bxx + 6, sy - 8, ctx.strokeStyle, 1.5); } else { fillCircle(ctx, bxx, sy - 10, 10, '#e5a85a'); fillCircle(ctx, bxx, sy - 10, 3, '#f6e7cf'); } } }
      // oven (right-back)
      const ox = 1000, oy = floorY - 10;
      fillRect(ctx, ox, oy - 230, 230, 230, '#4a4e55'); fillRect(ctx, ox + 10, oy - 220, 210, 10, '#6b6f74');
      fillRound(ctx, ox + 20, oy - 190, 190, 80, 6, '#2b2f33'); ctx.fillStyle = radGrad(ctx, ox + 115, oy - 150, 0, 110, [[0, 'rgba(255,150,40,0.9)'], [0.6, 'rgba(255,90,20,0.5)'], [1, 'rgba(255,90,20,0)']]); roundRect(ctx, ox + 30, oy - 180, 170, 60, 4); ctx.fill();
      for (let k = 0; k < 3; k++) fillEllipse(ctx, ox + 70 + k * 45, oy - 140, 18, 8, '#d9a25a', -0.3);
      fillRect(ctx, ox + 20, oy - 150, 190, 5, '#777'); fillRound(ctx, ox + 20, oy - 100, 190, 80, 6, '#2b2f33'); fillRect(ctx, ox + 20, oy - 60, 190, 5, '#777');
      [0, 1, 2].forEach((k) => fillCircle(ctx, ox + 60 + k * 55, oy - 205, 6, '#ddd'));
      ctx.fillStyle = radGrad(ctx, ox + 115, oy - 150, 0, 260, [[0, 'rgba(255,140,50,0.22)'], [1, 'rgba(255,140,50,0)']]); circle(ctx, ox + 115, oy - 150, 260); ctx.fill();
      // floor
      floor(ctx, env, floorY, 'tile', '#e9dcc4');
      // display counter at the back centre
      const cx = 400, cy = floorY + 36, cw = 520;
      groundShadow(ctx, cx + cw / 2, cy + 4, cw * 0.55, 12, 0.25);
      fillRect(ctx, cx, cy - 100, cw, 100, '#8b5a2b'); fillRect(ctx, cx, cy - 100, cw, 8, '#6b3d1b');
      fillRect(ctx, cx + 10, cy - 92, cw - 20, 60, '#dff3f8'); ctx.fillStyle = rgba('#fff', 0.35); fillPoly(ctx, [[cx + 40, cy - 92], [cx + 90, cy - 92], [cx + 60, cy - 32], [cx + 10, cy - 32]], ctx.fillStyle);
      fillRect(ctx, cx + 10, cy - 62, cw - 20, 3, rgba('#000', 0.15));
      // cakes top shelf
      [[60, '#ff8fab', '#fff0f3'], [150, '#8b5a2b', '#d9a25a'], [240, '#feca57', '#fff']].forEach(([ox2, c, ice], i) => { const x = cx + ox2 + 30, y = cy - 66; fillRound(ctx, x - 28, y - 22, 56, 22, 4, c); fillRound(ctx, x - 28, y - 26, 56, 8, 4, ice); fillCircle(ctx, x, y - 30, 5, '#e63946'); });
      for (let k = 0; k < 4; k++) fillCircle(ctx, cx + 360 + k * 32, cy - 76, 11, ['#e5a85a', '#8b5a2b', '#ff8fab', '#e5a85a'][k]);
      for (let k = 0; k < 4; k++) fillCircle(ctx, cx + 360 + k * 32, cy - 76, 4, '#dff3f8');
      // bottom shelf breads
      for (let k = 0; k < 8; k++) fillEllipse(ctx, cx + 50 + k * 60, cy - 44, 22, 10, k % 2 ? '#d9a25a' : '#c98a4a', -0.4);
      fillRect(ctx, cx - 6, cy - 108, cw + 12, 12, '#d8c2a2'); // counter top
      fillRound(ctx, cx + cw - 70, cy - 150, 50, 42, 4, '#2b2f33'); fillRect(ctx, cx + cw - 64, cy - 144, 38, 22, '#9ae6b4'); // register
      // plants + stool
      fillPoly(ctx, [[40, floorY + 60], [100, floorY + 60], [92, floorY + 130], [48, floorY + 130]], '#c0632b'); for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.35; fillEllipse(ctx, 70 + Math.cos(a) * 36, floorY + 50 + Math.sin(a) * 46, 9, 26, i % 2 ? '#15803d' : '#22c55e', a + Math.PI / 2); }
      ctx.fillStyle = radGrad(ctx, W / 2, 120, 0, 800, [[0, 'rgba(255,220,160,0.18)'], [1, 'rgba(255,220,160,0)']]); ctx.fillRect(0, 0, W, H);
      vignette(ctx, env, 0.2);
    },
  },
];
