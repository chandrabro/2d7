// Urban & City Life scenes
import {
  sky, ground, skyline, streetLamp, car, road, wall, floor, lit, todOf, signBoard, counter, table, chair,
  plantPot, lamp, treeRound, bush, grassTufts, flowerPatch, water, vignette, crowd, dustMotes, text,
  TAU, lerp, shade, rgba, rng, hash, roundRect, ellipse, circle, poly, curve, fillRect, fillRound, fillEllipse,
  fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow, withAlpha, clamp, mixColor,
} from '../scenery.js';

const CAT = 'Urban & City Life';
const night = (env) => env.tod === 'night';
const dk = (env, c, amt = -0.3) => (night(env) ? shade(c, amt) : c);

// ---- local helpers ----
function ceilingLights(ctx, env, y, count = 5, w = 120, color = '#fff8dc') {
  for (let i = 0; i < count; i++) {
    const x = ((i + 0.5) / count) * env.W;
    fillRound(ctx, x - w / 2, y, w, 10, 4, '#e8e8ee');
    ctx.fillStyle = radGrad(ctx, x, y + 6, 0, w, [[0, rgba(color, 0.35)], [1, rgba(color, 0)]]);
    poly(ctx, [[x - w / 2, y + 8], [x + w / 2, y + 8], [x + w * 1.1, y + 220], [x - w * 1.1, y + 220]]); ctx.fill();
  }
}
function ceiling(ctx, env, y, color = '#eceff3') {
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, y, [[0, shade(color, -0.15)], [1, color]]);
  ctx.fillRect(0, 0, env.W, y);
  fillRect(ctx, 0, y - 4, env.W, 6, shade(color, -0.3));
}
function bench(ctx, env, x, y, w = 150, color = '#8b5a2b', metal = '#3a3f48') {
  const c = lit(env, color), m = lit(env, metal);
  groundShadow(ctx, x + w / 2, y + 3, w * 0.5, 8, 0.2);
  fillRect(ctx, x + 10, y - 44, 6, 44, m); fillRect(ctx, x + w - 16, y - 44, 6, 44, m);
  for (let i = 0; i < 3; i++) fillRound(ctx, x, y - 44 + i * 9, w, 7, 2, c);
  fillRect(ctx, x + 10, y - 80, 6, 36, m); fillRect(ctx, x + w - 16, y - 80, 6, 36, m);
  for (let i = 0; i < 2; i++) fillRound(ctx, x, y - 80 + i * 11, w, 8, 2, c);
}
function shopFront(ctx, env, x, y, w, h, opts = {}) {
  const wallC = lit(env, opts.wall || '#e8dcc8');
  fillRect(ctx, x, y - h, w, h, wallC);
  fillRect(ctx, x, y - h, w, h, linGrad(ctx, x, 0, x + w, 0, [[0, rgba('#000', 0.1)], [0.5, rgba('#000', 0)], [1, rgba('#000', 0.08)]]));
  // upper windows
  const cols = Math.max(2, Math.floor(w / 70));
  for (let i = 0; i < cols; i++) {
    const wx = x + 14 + i * ((w - 28) / cols), ww = (w - 28) / cols - 14;
    fillRect(ctx, wx - 3, y - h + 22, ww + 6, 52, lit(env, '#f7f3ea'));
    ctx.fillStyle = night(env) ? (i % 2 ? '#ffd98a' : '#4a5a7a') : lit(env, '#9fd3f5');
    ctx.fillRect(wx, y - h + 25, ww, 46);
  }
  // awning
  const aw = opts.awning || '#c0392b';
  const ay = y - h * 0.5;
  fillPoly(ctx, [[x - 6, ay], [x + w + 6, ay], [x + w + 2, ay + 26], [x - 2, ay + 26]], lit(env, aw));
  ctx.fillStyle = rgba('#fff', 0.35);
  for (let sx = x; sx < x + w; sx += 24) fillPoly(ctx, [[sx, ay], [sx + 12, ay], [sx + 11, ay + 26], [sx - 1, ay + 26]], ctx.fillStyle);
  for (let sx = x - 2; sx < x + w + 2; sx += 14) fillCircle(ctx, sx + 7, ay + 28, 6, lit(env, aw));
  // big shop window
  const gy = ay + 40, gh = y - gy - 10;
  fillRect(ctx, x + 10, gy, w - 20, gh, lit(env, '#3a3f48'));
  ctx.fillStyle = night(env) ? '#ffe4a8' : lit(env, '#bfe3f8');
  ctx.fillRect(x + 16, gy + 6, w - 32, gh - 12);
  if (!night(env)) { ctx.fillStyle = rgba('#fff', 0.25); fillPoly(ctx, [[x + 16, gy + gh - 6], [x + 16 + (w - 32) * 0.5, gy + 6], [x + 16 + (w - 32) * 0.7, gy + 6], [x + 16 + (w - 32) * 0.2, gy + gh - 6]], ctx.fillStyle); }
  // items in window
  const r = rng(hash('shop' + x));
  for (let k = 0; k < 3; k++) fillRound(ctx, x + 26 + k * ((w - 50) / 3), gy + gh * 0.45, (w - 50) / 3 - 10, gh * 0.45, 4, r.pick(['#e67e22', '#27ae60', '#8e44ad', '#2980b9', '#f1c40f']));
  // sign
  signBoard(ctx, env, x + 10, ay - 34, w - 20, 30, opts.sign || 'SHOP', opts.signBg || '#2c3e50', '#fdf6e3', 'bold 18px sans-serif');
  if (night(env)) { ctx.fillStyle = rgba('#ffe4a8', 0.18); ctx.fillRect(x, gy, w, y - gy + 30); }
}

export default [
  // ---------------------------------------------------------------- city street
  {
    id: 'city_street', name: 'City Street / Sidewalk', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H, t } = env;
      sky(ctx, env, { horizon: H * 0.5, sunX: W * 0.2, sunY: H * 0.15 });
      skyline(ctx, env, H * 0.52, 3, '#5d6a86', 0.45, 300);
      skyline(ctx, env, H * 0.56, 8, '#4a5570', 0.25, 200);
      // shops row
      const baseY = H * 0.62;
      shopFront(ctx, env, -20, baseY, 300, 330, { sign: 'BAKERY', awning: '#d35400', wall: '#f3e7cf' });
      shopFront(ctx, env, 290, baseY, 260, 300, { sign: 'BOOKS', awning: '#27ae60', wall: '#e6d5c3', signBg: '#1e3a2f' });
      shopFront(ctx, env, 560, baseY, 240, 320, { sign: 'CAFÉ', awning: '#8e44ad', wall: '#eadfd0', signBg: '#4a235a' });
      shopFront(ctx, env, 810, baseY, 280, 290, { sign: 'PHARMACY', awning: '#2980b9', wall: '#f0e8dc', signBg: '#1b4f72' });
      shopFront(ctx, env, 1100, baseY, 220, 330, { sign: 'MARKET', awning: '#c0392b', wall: '#e8dcc8' });
      // sidewalk
      const swY = H * 0.62, swH = H * 0.1;
      ctx.fillStyle = linGrad(ctx, 0, swY, 0, swY + swH, [[0, lit(env, '#c9c5bd')], [1, lit(env, '#a9a59d')]]);
      ctx.fillRect(0, swY, W, swH);
      ctx.strokeStyle = rgba('#000', 0.15); ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 80) strokeLine(ctx, x, swY, x - 10, swY + swH, ctx.strokeStyle, 2);
      strokeLine(ctx, 0, swY + swH * 0.5, W, swY + swH * 0.5, rgba('#000', 0.1), 2);
      fillRect(ctx, 0, swY + swH - 8, W, 8, lit(env, '#8a8a95'));
      // road with crossing
      road(ctx, env, swY + swH, H - swY - swH, '#3b3b45', true);
      ctx.fillStyle = rgba('#fff', 0.85);
      for (let i = 0; i < 7; i++) {
        const x0 = 480 + i * 48;
        fillPoly(ctx, [[x0, swY + swH + 10], [x0 + 28, swY + swH + 10], [x0 + 36, H], [x0 - 8, H]], ctx.fillStyle);
      }
      // traffic light
      const tx = 555, ty = swY + swH - 4;
      fillRect(ctx, tx - 4, ty - 230, 8, 230, lit(env, '#3a3a40'));
      fillRound(ctx, tx - 16, ty - 300, 32, 76, 6, '#1f1f24');
      const phase = Math.floor(t / 3) % 3; // 0 red 1 green 2 yellow
      const cols = ['#e74c3c', '#f1c40f', '#2ecc71'];
      [0, 1, 2].forEach((i) => {
        const on = (phase === 0 && i === 0) || (phase === 2 && i === 1) || (phase === 1 && i === 2);
        fillCircle(ctx, tx, ty - 288 + i * 24, 8, on ? cols[i] : shade(cols[i], -0.7));
        if (on) { ctx.fillStyle = radGrad(ctx, tx, ty - 288 + i * 24, 0, 22, [[0, rgba(cols[i], 0.5)], [1, rgba(cols[i], 0)]]); circle(ctx, tx, ty - 288 + i * 24, 22); ctx.fill(); }
      });
      streetLamp(ctx, env, 120, swY + swH - 2, 240);
      streetLamp(ctx, env, 1180, swY + swH - 2, 240);
      // parked car far right, and fire hydrant
      car(ctx, env, 1120, swY + swH + 48, 170, '#2980b9', -1);
      fillRound(ctx, 236, swY + swH - 40, 18, 40, 5, lit(env, '#c0392b')); fillRound(ctx, 230, swY + swH - 44, 30, 8, 3, lit(env, '#c0392b'));
      // trash bin
      fillRound(ctx, 1060, swY + swH - 46, 26, 46, 4, lit(env, '#2e7d32'));
      if (night(env)) vignette(ctx, env, 0.35);
    },
  },
  // ---------------------------------------------------------------- bus stop / station
  {
    id: 'bus_stop', name: 'Bus Stop / Train Station', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H, t } = env;
      sky(ctx, env, { horizon: H * 0.5, sunX: W * 0.82, sunY: H * 0.14 });
      skyline(ctx, env, H * 0.5, 5, '#60708c', 0.5, 220);
      // far ground & tracks
      ground(ctx, env, H * 0.5, '#7aa15a', '#5e8a44');
      const trY = H * 0.54;
      fillRect(ctx, 0, trY, W, 46, lit(env, '#6b6762'));
      ctx.fillStyle = lit(env, '#8b6b4a'); for (let x = 0; x < W; x += 34) ctx.fillRect(x, trY + 6, 20, 34);
      fillRect(ctx, 0, trY + 12, W, 5, lit(env, '#9aa0a8')); fillRect(ctx, 0, trY + 30, W, 5, lit(env, '#9aa0a8'));
      // passing train silhouette
      const trainX = ((t * 260) % (W + 1400)) - 900;
      ctx.save(); ctx.translate(trainX, trY - 2);
      for (let c = 0; c < 3; c++) {
        const cx = c * 230;
        fillRound(ctx, cx, -70, 220, 70, 10, lit(env, c === 0 ? '#c0392b' : '#2c3e50'));
        fillRect(ctx, cx, -36, 220, 10, lit(env, '#ecf0f1'));
        for (let w = 0; w < 5; w++) fillRound(ctx, cx + 16 + w * 42, -60, 30, 20, 3, night(env) ? '#ffd98a' : lit(env, '#9fd3f5'));
        fillCircle(ctx, cx + 30, 0, 9, '#222'); fillCircle(ctx, cx + 190, 0, 9, '#222');
      }
      ctx.restore();
      // platform
      const pY = H * 0.62;
      fillRect(ctx, 0, trY + 46, W, pY - trY - 46, lit(env, '#8c8a86'));
      ctx.fillStyle = linGrad(ctx, 0, pY, 0, H, [[0, lit(env, '#c4c0b8')], [1, lit(env, '#9a968e')]]); ctx.fillRect(0, pY, W, H - pY);
      fillRect(ctx, 0, pY, W, 10, lit(env, '#f1c40f'));
      ctx.strokeStyle = rgba('#000', 0.12); ctx.lineWidth = 2;
      for (let x = 0; x < W; x += 100) strokeLine(ctx, x, pY, x - 14, H, ctx.strokeStyle, 2);
      // shelter
      const sx = 160, sw = 520, roofY = H * 0.28;
      ctx.fillStyle = rgba('#9fd3f5', night(env) ? 0.12 : 0.25);
      fillRect(ctx, sx, roofY + 10, sw, pY - roofY - 10, ctx.fillStyle); // glass back
      fillRect(ctx, sx - 6, roofY + 10, 10, pY - roofY - 10, lit(env, '#2c3e50')); fillRect(ctx, sx + sw - 4, roofY + 10, 10, pY - roofY - 10, lit(env, '#2c3e50'));
      fillRect(ctx, sx + sw / 2 - 5, roofY + 10, 10, pY - roofY - 10, lit(env, '#2c3e50'));
      fillRound(ctx, sx - 30, roofY - 14, sw + 60, 26, 6, lit(env, '#34495e'));
      fillRect(ctx, sx - 30, roofY + 10, sw + 60, 6, lit(env, '#1f2a36'));
      if (night(env)) { ctx.fillStyle = radGrad(ctx, sx + sw / 2, roofY + 14, 0, 340, [[0, 'rgba(255,240,200,0.3)'], [1, 'rgba(255,240,200,0)']]); ctx.fillRect(sx - 60, roofY, sw + 120, pY - roofY + 60); fillRound(ctx, sx + sw / 2 - 60, roofY + 14, 120, 8, 3, '#fff6d0'); }
      // timetable board
      signBoard(ctx, env, sx + 20, roofY + 40, 190, 34, 'DEPARTURES', '#1b2631', '#f4d03f', 'bold 18px sans-serif');
      fillRound(ctx, sx + 20, roofY + 74, 190, 150, 4, lit(env, '#17202a'));
      ctx.font = '15px monospace'; ctx.fillStyle = '#f9e79f'; ctx.textAlign = 'left';
      [['08:15', 'DOWNTOWN', '1'], ['08:30', 'AIRPORT', '2'], ['08:42', 'HARBOUR', '1'], ['09:05', 'MUSEUM', '3'], ['09:20', 'STADIUM', '2']].forEach((row, i) => {
        ctx.fillStyle = i === Math.floor(t) % 5 ? '#fff' : '#f9e79f';
        ctx.fillText(`${row[0]}  ${row[1].padEnd(9)} ${row[2]}`, sx + 30, roofY + 100 + i * 26);
      });
      // bus stop sign
      fillRect(ctx, 820, pY - 220, 8, 220, lit(env, '#3a3a40'));
      fillRound(ctx, 790, pY - 290, 68, 72, 8, lit(env, '#f1c40f'));
      fillRound(ctx, 798, pY - 270, 52, 30, 5, '#1b2631'); fillRect(ctx, 802, pY - 262, 44, 14, '#9fd3f5');
      fillCircle(ctx, 812, pY - 238, 5, '#1b2631'); fillCircle(ctx, 836, pY - 238, 5, '#1b2631');
      text(ctx, 824, pY - 226, 'BUS', 'bold 12px sans-serif', '#1b2631');
      // clock
      fillCircle(ctx, 1000, roofY + 30, 34, lit(env, '#ecf0f1')); ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 4; circle(ctx, 1000, roofY + 30, 34); ctx.stroke();
      fillRect(ctx, 996, roofY - 10, 8, 40, lit(env, '#3a3a40'));
      strokeLine(ctx, 1000, roofY + 30, 1000 + Math.cos(t * 0.2 - Math.PI / 2) * 22, roofY + 30 + Math.sin(t * 0.2 - Math.PI / 2) * 22, '#2c3e50', 3);
      strokeLine(ctx, 1000, roofY + 30, 1000 + Math.cos(-Math.PI / 4) * 16, roofY + 30 + Math.sin(-Math.PI / 4) * 16, '#2c3e50', 3);
      bench(ctx, env, sx + 250, pY - 6, 200, '#8b5a2b');
      bench(ctx, env, 1060, pY - 6, 170, '#8b5a2b');
      fillRound(ctx, 1240, pY - 56, 30, 56, 5, lit(env, '#2e7d32'));
      if (night(env)) vignette(ctx, env, 0.3);
    },
  },
  // ---------------------------------------------------------------- supermarket
  {
    id: 'supermarket', name: 'Supermarket / Grocery Store', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#eef1f4', { floorY: H * 0.7, ignoreTod: true });
      ceiling(ctx, env, H * 0.16, '#e4e8ec');
      ceilingLights(ctx, env, H * 0.16, 5, 140);
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'tile', '#f0f2ef');
      const r = rng(hash('super' + env.seed));
      const cols = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#f1c40f', '#1abc9c', '#e67e22', '#ecf0f1', '#c0392b'];
      // back wall shelves (3 aisles)
      const shelfUnit = (x, y, w, h, label) => {
        fillRect(ctx, x, y - h, w, h, '#d5d9de');
        fillRect(ctx, x, y - h, 6, h, '#b8bec6'); fillRect(ctx, x + w - 6, y - h, 6, h, '#b8bec6');
        const rows = 4;
        for (let i = 0; i < rows; i++) {
          const ry = y - h + 24 + i * ((h - 30) / rows), rh = (h - 30) / rows;
          fillRect(ctx, x + 6, ry, w - 12, rh - 2, '#c3c9d1');
          let px = x + 12;
          while (px < x + w - 24) {
            const pw = 12 + r() * 14, ph = rh * (0.5 + r() * 0.4);
            const c = r.pick(cols);
            fillRound(ctx, px, ry + rh - ph - 4, pw, ph, 2, c);
            fillRect(ctx, px + 2, ry + rh - ph + 2, pw - 4, ph * 0.3, rgba('#fff', 0.5));
            px += pw + 3;
          }
          fillRect(ctx, x + 4, ry + rh - 4, w - 8, 5, '#9aa3ad');
        }
        signBoard(ctx, env, x + w / 2 - 60, y - h - 34, 120, 28, label, '#2e86c1', '#fff', 'bold 15px sans-serif');
      };
      shelfUnit(40, H * 0.7, 300, 300, 'CEREALS');
      shelfUnit(370, H * 0.7, 300, 280, 'SNACKS');
      shelfUnit(700, H * 0.7, 260, 290, 'DRINKS');
      // produce bins right
      const by = H * 0.7;
      fillRect(ctx, 1000, by - 110, 260, 110, '#6d4c2f'); fillRect(ctx, 1000, by - 118, 260, 10, '#8b5a2b');
      [['#e74c3c', 1030], ['#f39c12', 1100], ['#27ae60', 1170], ['#f1c40f', 1240]].forEach(([c, x]) => {
        for (let i = 0; i < 9; i++) fillCircle(ctx, x + (i % 3) * 16 - 14, by - 120 - Math.floor(i / 3) * 10, 9, shade(c, (i % 2) * 0.1));
      });
      signBoard(ctx, env, 1060, by - 190, 150, 30, 'FRESH FRUIT', '#27ae60', '#fff', 'bold 15px sans-serif');
      // price tags
      [[120, by - 150, '€1.99'], [470, by - 140, '€0.89'], [780, by - 160, '€2.49']].forEach(([x, y, p]) => { fillRound(ctx, x, y, 56, 24, 3, '#f1c40f'); text(ctx, x + 28, y + 12, p, 'bold 13px sans-serif', '#1b2631'); });
      // checkout counter far left
      counter(ctx, env, -20, by + 70, 170, 80, '#d8d2c4', '#3a4a5a');
      fillRound(ctx, 60, by - 60, 60, 50, 4, '#2c3e50'); fillRect(ctx, 66, by - 54, 48, 32, '#5dade2');
      // shopping cart (far right front)
      ctx.save(); ctx.translate(1120, by + 90);
      ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-50, -70); ctx.lineTo(-40, -20); ctx.lineTo(40, -20); ctx.lineTo(50, -70); ctx.closePath(); ctx.stroke();
      for (let i = -40; i <= 40; i += 10) strokeLine(ctx, i, -66, i + 2, -24, '#95a5a6', 2);
      strokeLine(ctx, 40, -20, 46, 0, '#7f8c8d', 4); strokeLine(ctx, -40, -20, -46, 0, '#7f8c8d', 4);
      fillCircle(ctx, -44, 2, 6, '#333'); fillCircle(ctx, 44, 2, 6, '#333');
      strokeLine(ctx, 50, -70, 66, -92, '#7f8c8d', 4); fillRound(ctx, 60, -98, 30, 8, 3, '#c0392b');
      fillCircle(ctx, -10, -40, 10, '#e74c3c'); fillRound(ctx, 5, -56, 18, 26, 3, '#2980b9');
      ctx.restore();
      ctx.fillStyle = linGrad(ctx, 0, H * 0.16, 0, H * 0.4, [[0, rgba('#fff', 0.15)], [1, rgba('#fff', 0)]]); ctx.fillRect(0, H * 0.16, W, H * 0.24);
    },
  },
  // ---------------------------------------------------------------- café
  {
    id: 'cafe', name: 'Coffee Shop / Café', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#c9a479', { floorY: H * 0.7, ignoreTod: true, wainscot: true });
      // brick texture band
      ctx.fillStyle = rgba('#7a3f2a', 0.18);
      for (let y = 0; y < H * 0.7 - 110; y += 18) for (let x = (y / 18) % 2 ? 0 : 22; x < W; x += 44) ctx.fillRect(x, y, 40, 14);
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'wood', '#8d5a33');
      // window with street
      const wx = 60, wy = 80, ww = 300, wh = 250;
      fillRect(ctx, wx - 10, wy - 10, ww + 20, wh + 20, '#3b2a1e');
      ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
      sky(ctx, { ...env, W: wx + ww + 400, H: wy + wh }, { horizon: wy + wh * 0.6, sun: false, clouds: true, cloudCount: 2 });
      skyline(ctx, { ...env, W: wx + ww + 300 }, wy + wh * 0.75, 4, '#5a6a88', 0.4, 120);
      fillRect(ctx, wx, wy + wh * 0.75, ww, wh * 0.25, lit(env, '#8a8a95'));
      ctx.restore();
      fillRect(ctx, wx + ww / 2 - 4, wy, 8, wh, '#3b2a1e'); fillRect(ctx, wx, wy + wh / 2 - 4, ww, 8, '#3b2a1e');
      ctx.save(); ctx.translate(wx + ww / 2, wy + 40); ctx.scale(-1, 1); text(ctx, 0, 0, 'CAFÉ', 'bold 34px serif', rgba('#fff', 0.7)); ctx.restore();
      // chalkboard menu
      fillRound(ctx, 440, 60, 260, 200, 6, '#5a3b22'); fillRound(ctx, 450, 70, 240, 180, 4, '#2d3b33');
      text(ctx, 570, 98, '~ MENU ~', 'bold 22px serif', '#f7f1e3');
      ['Espresso ....... 2.0', 'Latte .......... 3.5', 'Cappuccino ..... 3.2', 'Cake ........... 2.8'].forEach((l, i) => text(ctx, 570, 132 + i * 28, l, '16px monospace', '#e8e0cc'));
      // pendant lamps
      [300, 640, 980].forEach((x, i) => {
        strokeLine(ctx, x, 0, x, 80, '#2b2b2b', 2);
        fillPoly(ctx, [[x - 30, 110], [x - 12, 80], [x + 12, 80], [x + 30, 110]], '#2b2b2b');
        fillEllipse(ctx, x, 110, 30, 6, '#ffd98a');
        ctx.fillStyle = radGrad(ctx, x, 112, 0, 170, [[0, 'rgba(255,220,150,0.35)'], [1, 'rgba(255,220,150,0)']]); circle(ctx, x, 112, 170); ctx.fill();
      });
      // counter with espresso machine (right)
      const cy = H * 0.7;
      counter(ctx, env, 820, cy, 460, 110, '#6b4a2b', '#3a2a1e');
      fillRound(ctx, 960, cy - 200, 150, 90, 8, '#9aa0a8'); fillRound(ctx, 968, cy - 192, 134, 30, 4, '#7f8c8d');
      fillRect(ctx, 980, cy - 160, 20, 36, '#2c3e50'); fillRect(ctx, 1040, cy - 160, 20, 36, '#2c3e50');
      fillCircle(ctx, 1030, cy - 178, 8, '#e74c3c'); fillCircle(ctx, 1080, cy - 178, 6, '#2ecc71');
      fillRound(ctx, 1004, cy - 130, 12, 10, 2, '#fff'); fillRound(ctx, 1064, cy - 130, 12, 10, 2, '#fff');
      // steam
      for (let i = 0; i < 3; i++) { const sy = cy - 140 - ((t * 25 + i * 20) % 60); ctx.fillStyle = rgba('#fff', 0.35 * (1 - ((t * 25 + i * 20) % 60) / 60)); circle(ctx, 1010 + Math.sin(t * 3 + i) * 5, sy, 5); ctx.fill(); }
      // pastry display
      fillRound(ctx, 830, cy - 170, 110, 60, 4, rgba('#bfe3f8', 0.5)); ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 3; roundRect(ctx, 830, cy - 170, 110, 60, 4); ctx.stroke();
      [['#d35400', 846], ['#e67e22', 872], ['#c0392b', 898]].forEach(([c, x]) => { fillEllipse(ctx, x + 10, cy - 125, 12, 8, c); fillEllipse(ctx, x + 10, cy - 130, 9, 5, shade(c, 0.3)); });
      // cups on shelf
      for (let i = 0; i < 6; i++) fillRound(ctx, 1130 + (i % 3) * 36, cy - 230 + Math.floor(i / 3) * 34, 24, 22, 4, i % 2 ? '#ecf0f1' : '#e74c3c');
      fillRect(ctx, 1120, cy - 206, 120, 5, '#3b2a1e'); fillRect(ctx, 1120, cy - 172, 120, 5, '#3b2a1e');
      // small round tables left
      const roundTable = (x, y) => {
        groundShadow(ctx, x, y + 2, 50, 8, 0.2);
        fillRect(ctx, x - 5, y - 70, 10, 70, '#2b2b2b'); fillEllipse(ctx, x, y, 26, 7, '#2b2b2b');
        fillEllipse(ctx, x, y - 72, 60, 14, '#8d5a33'); fillEllipse(ctx, x, y - 75, 60, 12, '#a86f3f');
        fillRound(ctx, x - 20, y - 94, 16, 14, 3, '#fff'); strokeLine(ctx, x - 3, y - 90, x + 2, y - 86, '#fff', 3);
        fillCircle(ctx, x + 18, y - 84, 10, '#ecf0f1'); fillCircle(ctx, x + 18, y - 84, 6, '#6b4a2b');
      };
      roundTable(170, cy + 10); chair(ctx, env, 90, cy + 14, 44, 90, '#3b2a1e', 1);
      roundTable(430, cy + 6); chair(ctx, env, 500, cy + 10, 44, 90, '#3b2a1e', -1);
      plantPot(ctx, env, 760, cy + 4, 90, '#8d5a33');
      vignette(ctx, env, 0.25);
    },
  },
  // ---------------------------------------------------------------- fast food
  {
    id: 'fast_food', name: 'Fast Food Restaurant', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#fff3d6', { floorY: H * 0.7, ignoreTod: true });
      fillRect(ctx, 0, H * 0.7 - 120, W, 120, '#e74c3c'); fillRect(ctx, 0, H * 0.7 - 126, W, 8, '#f1c40f');
      // checker floor
      const fy = H * 0.7;
      ctx.fillStyle = '#f4f1ea'; ctx.fillRect(0, fy, W, H - fy);
      const rows = 7;
      for (let j = 0; j < rows; j++) {
        const y0 = fy + (H - fy) * (j / rows) ** 1.4, y1 = fy + (H - fy) * ((j + 1) / rows) ** 1.4;
        const cols = 16;
        for (let i = 0; i < cols; i++) {
          if ((i + j) % 2) continue;
          const x0 = i / cols, x1 = (i + 1) / cols;
          const px = (x, y) => W / 2 + (x - 0.5) * W * (1 + (y - fy) / (H - fy) * 0.6);
          fillPoly(ctx, [[px(x0, y0), y0], [px(x1, y0), y0], [px(x1, y1), y1], [px(x0, y1), y1]], '#2c3e50');
        }
      }
      ctx.fillStyle = linGrad(ctx, 0, fy, 0, fy + 30, [[0, rgba('#000', 0.25)], [1, rgba('#000', 0)]]); ctx.fillRect(0, fy, W, 30);
      // menu board
      fillRound(ctx, 360, 30, 560, 180, 8, '#1b2631');
      text(ctx, 640, 56, 'BURGER PALACE', 'bold 26px sans-serif', '#f1c40f');
      const item = (x, y, draw, label, price) => {
        fillRound(ctx, x - 50, y - 10, 100, 100, 6, '#2e4053'); draw(x, y + 30); text(ctx, x, y + 74, label, 'bold 13px sans-serif', '#fff'); text(ctx, x, y + 88, price, '12px sans-serif', '#f1c40f');
      };
      item(430, 90, (x, y) => { fillEllipse(ctx, x, y - 12, 26, 12, '#e0a040'); fillRect(ctx, x - 26, y - 6, 52, 8, '#27ae60'); fillRect(ctx, x - 26, y + 1, 52, 8, '#7b3f00'); fillRect(ctx, x - 26, y + 8, 52, 6, '#f1c40f'); fillEllipse(ctx, x, y + 16, 26, 8, '#e0a040'); }, 'BURGER', '€4.50');
      item(560, 90, (x, y) => { fillPoly(ctx, [[x - 18, y - 4], [x + 18, y - 4], [x + 14, y + 22], [x - 14, y + 22]], '#e74c3c'); for (let i = -2; i <= 2; i++) fillRect(ctx, x + i * 7 - 2, y - 24 + Math.abs(i) * 3, 5, 24, '#f1c40f'); }, 'FRIES', '€2.00');
      item(690, 90, (x, y) => { fillPoly(ctx, [[x - 16, y - 20], [x + 16, y - 20], [x + 12, y + 22], [x - 12, y + 22]], '#3498db'); fillRect(ctx, x - 18, y - 24, 36, 6, '#2c3e50'); strokeLine(ctx, x + 4, y - 24, x + 12, y - 40, '#fff', 3); }, 'SODA', '€1.50');
      item(820, 90, (x, y) => { fillEllipse(ctx, x, y + 10, 24, 10, '#f5cba7'); fillEllipse(ctx, x, y + 2, 20, 8, '#e74c3c'); fillEllipse(ctx, x, y - 4, 16, 6, '#f1c40f'); fillPoly(ctx, [[x - 10, y + 8], [x + 10, y + 8], [x, y - 14]], '#fff'); }, 'PIZZA', '€3.00');
      // counter
      counter(ctx, env, 300, fy, 680, 100, '#e74c3c', '#f4d03f');
      fillRect(ctx, 300, fy - 100, 680, 100, '#c0392b'); fillRect(ctx, 294, fy - 110, 692, 12, '#f1c40f');
      ctx.fillStyle = rgba('#fff', 0.1); for (let x = 320; x < 980; x += 40) ctx.fillRect(x, fy - 90, 20, 80);
      // register & tray
      fillRound(ctx, 640, fy - 170, 70, 60, 4, '#2c3e50'); fillRect(ctx, 648, fy - 164, 54, 34, '#5dade2'); fillRect(ctx, 652, fy - 124, 46, 8, '#95a5a6');
      fillRound(ctx, 420, fy - 122, 110, 12, 3, '#8b5a2b');
      // soda machine
      fillRound(ctx, 1040, fy - 230, 110, 230, 6, '#2874a6'); fillRound(ctx, 1050, fy - 220, 90, 60, 4, '#5dade2');
      text(ctx, 1095, fy - 190, 'COLA', 'bold 18px sans-serif', '#fff');
      for (let i = 0; i < 3; i++) { fillRect(ctx, 1060 + i * 30, fy - 140, 14, 50, '#1b4f72'); fillRect(ctx, 1062 + i * 30, fy - 94, 10, 10, '#95a5a6'); }
      fillRect(ctx, 1050, fy - 80, 90, 6, '#95a5a6');
      // booths left
      const booth = (x, dir) => {
        ctx.save(); ctx.translate(x, fy + 20); ctx.scale(dir, 1);
        fillRound(ctx, 0, -130, 24, 130, 6, '#c0392b'); fillRound(ctx, 0, -70, 90, 20, 4, '#e74c3c');
        fillRect(ctx, 8, -50, 76, 50, '#a93226');
        fillRound(ctx, 95, -78, 80, 12, 3, '#ecf0f1'); fillRect(ctx, 130, -66, 10, 66, '#7f8c8d'); fillEllipse(ctx, 135, 0, 22, 6, '#7f8c8d');
        ctx.restore();
      };
      booth(30, 1); booth(260, -1);
      // ceiling lights
      ceilingLights(ctx, env, 10, 4, 100, '#fff2cc');
      // posters
      fillRound(ctx, 100, 60, 130, 160, 4, '#f1c40f'); text(ctx, 165, 110, 'NEW!', 'bold 30px sans-serif', '#c0392b'); text(ctx, 165, 150, 'MEGA', 'bold 22px sans-serif', '#2c3e50'); text(ctx, 165, 178, 'MEAL', 'bold 22px sans-serif', '#2c3e50');
      fillRound(ctx, 1080, 60, 130, 140, 4, '#2ecc71'); text(ctx, 1145, 110, '-20%', 'bold 34px sans-serif', '#fff'); text(ctx, 1145, 150, 'COMBO', 'bold 18px sans-serif', '#1b2631');
    },
  },
  // ---------------------------------------------------------------- park & playground
  {
    id: 'park_playground', name: 'Park & Playground', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H, t } = env;
      sky(ctx, env, { horizon: H * 0.55, sunX: W * 0.15, sunY: H * 0.16 });
      skyline(ctx, env, H * 0.56, 11, '#6a7a98', 0.6, 150);
      ground(ctx, env, H * 0.55, '#74b65a', '#3f7a2d');
      // far tree line
      for (let i = 0; i < 7; i++) treeRound(ctx, env, 90 + i * 190, H * 0.6, 90 + (i % 3) * 20, i + 20);
      // path
      ctx.fillStyle = lit(env, '#c9b48a');
      poly(ctx, [[W * 0.42, H * 0.62], [W * 0.58, H * 0.62], [W * 0.95, H], [W * 0.05, H]]); ctx.fill();
      ctx.fillStyle = rgba('#000', 0.08); poly(ctx, [[W * 0.44, H * 0.62], [W * 0.47, H * 0.62], [W * 0.3, H], [W * 0.1, H]]); ctx.fill();
      grassTufts(ctx, env, H * 0.64, H * 0.95, 70, '#4f9a3a', 4);
      flowerPatch(ctx, env, H * 0.64, H * 0.8, 22, 6);
      // pond (left back)
      ctx.save(); ellipse(ctx, 180, H * 0.66, 170, 32); ctx.clip(); water(ctx, { ...env, W: 400 }, H * 0.62, 70, '#4aa3df', '#2a6fa8'); ctx.restore();
      ctx.strokeStyle = lit(env, '#5e8a44'); ctx.lineWidth = 4; ellipse(ctx, 180, H * 0.66, 170, 32); ctx.stroke();
      // duck
      const dx = 180 + Math.sin(t * 0.5) * 80;
      fillEllipse(ctx, dx, H * 0.66, 12, 7, '#ecf0f1'); fillCircle(ctx, dx + 10, H * 0.66 - 9, 6, '#ecf0f1'); fillPoly(ctx, [[dx + 15, H * 0.66 - 9], [dx + 24, H * 0.66 - 7], [dx + 15, H * 0.66 - 5]], '#f39c12');
      // swings
      const fx = 860, fy = H * 0.66;
      const metal = lit(env, '#c0392b');
      fillRound(ctx, fx - 120, fy - 230, 240, 14, 5, metal);
      strokeLine(ctx, fx - 110, fy - 220, fx - 150, fy, metal, 10); strokeLine(ctx, fx - 110, fy - 220, fx - 80, fy, metal, 10);
      strokeLine(ctx, fx + 110, fy - 220, fx + 150, fy, metal, 10); strokeLine(ctx, fx + 110, fy - 220, fx + 80, fy, metal, 10);
      for (let s = 0; s < 2; s++) {
        const px = fx - 45 + s * 90, ang = Math.sin(t * 2 + s * 1.5) * 0.35, len = 190;
        const bx = px + Math.sin(ang) * len, by = fy - 222 + Math.cos(ang) * len;
        strokeLine(ctx, px - 14, fy - 222, bx - 14, by, lit(env, '#7f8c8d'), 2); strokeLine(ctx, px + 14, fy - 222, bx + 14, by, lit(env, '#7f8c8d'), 2);
        fillRound(ctx, bx - 20, by - 3, 40, 8, 3, lit(env, '#2c3e50'));
      }
      // slide
      const sx = 1120, sy = H * 0.68;
      strokeLine(ctx, sx - 60, sy, sx - 60, sy - 150, lit(env, '#f1c40f'), 8);
      for (let i = 0; i < 6; i++) strokeLine(ctx, sx - 72, sy - 20 - i * 24, sx - 48, sy - 20 - i * 24, lit(env, '#f39c12'), 4);
      fillRound(ctx, sx - 80, sy - 160, 50, 12, 4, lit(env, '#e74c3c'));
      ctx.strokeStyle = lit(env, '#3498db'); ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx - 40, sy - 150); ctx.quadraticCurveTo(sx + 60, sy - 140, sx + 120, sy - 10); ctx.stroke();
      ctx.strokeStyle = lit(env, '#2980b9'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 40, sy - 160); ctx.quadraticCurveTo(sx + 66, sy - 150, sx + 126, sy - 20); ctx.stroke();
      strokeLine(ctx, sx + 100, sy - 40, sx + 100, sy, lit(env, '#3498db'), 6);
      // benches
      bench(ctx, env, 300, H * 0.72, 150, '#6b4a2b', '#2c3e50');
      bench(ctx, env, 560, H * 0.7, 150, '#6b4a2b', '#2c3e50');
      // kite
      const kx = 1050 + Math.sin(t * 0.7) * 30, ky = 110 + Math.cos(t * 0.9) * 20;
      ctx.strokeStyle = rgba('#000', 0.3); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(kx, ky + 30); ctx.quadraticCurveTo(kx - 100, ky + 200, 1180, H * 0.68); ctx.stroke();
      fillPoly(ctx, [[kx, ky - 30], [kx + 24, ky], [kx, ky + 30], [kx - 24, ky]], lit(env, '#e74c3c'));
      fillPoly(ctx, [[kx, ky - 30], [kx + 24, ky], [kx, ky]], lit(env, '#f1c40f'));
      for (let i = 1; i < 4; i++) fillPoly(ctx, [[kx - 8 * i - 6 + Math.sin(t * 4 + i) * 4, ky + 30 + i * 14], [kx - 8 * i + 6 + Math.sin(t * 4 + i) * 4, ky + 30 + i * 14], [kx - 8 * i + Math.sin(t * 4 + i) * 4, ky + 42 + i * 14]], ['#3498db', '#2ecc71', '#f1c40f'][i - 1]);
      // front trees
      treeRound(ctx, env, 60, H * 0.78, 150, 31);
      streetLamp(ctx, env, 700, H * 0.69, 150);
      if (night(env)) vignette(ctx, env, 0.3);
    },
  },
  // ---------------------------------------------------------------- nightclub
  {
    id: 'nightclub', name: 'Disco / Nightclub', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H * 0.7, [[0, '#07060f'], [1, '#1a1030']]); ctx.fillRect(0, 0, W, H * 0.7);
      // laser beams
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 2 + Math.sin(t * 1.3 + i * 1.1) * 0.9;
        const col = ['#ff2d95', '#2dffd8', '#ffe92d', '#8a2dff'][i % 4];
        ctx.strokeStyle = rgba(col, 0.35); ctx.lineWidth = 3;
        const ox = 200 + i * 180;
        strokeLine(ctx, ox, 0, ox + Math.cos(a) * 900, Math.sin(a) * 900, ctx.strokeStyle, 3);
      }
      // dance floor
      const fy = H * 0.7;
      const cols = 12, rows = 5;
      for (let j = 0; j < rows; j++) {
        const y0 = fy + (H - fy) * (j / rows) ** 1.3, y1 = fy + (H - fy) * ((j + 1) / rows) ** 1.3;
        for (let i = 0; i < cols; i++) {
          const px = (x, y) => W / 2 + (x - 0.5) * W * (1 + (y - fy) / (H - fy) * 0.5);
          const phase = Math.floor(t * 2 + i * 0.7 + j * 1.3) % 4;
          const c = ['#ff2d95', '#2dffd8', '#ffe92d', '#8a2dff'][phase];
          const pulse = 0.55 + 0.45 * Math.sin(t * 6 + i + j);
          ctx.fillStyle = rgba(c, 0.25 + 0.45 * pulse);
          fillPoly(ctx, [[px(i / cols, y0) + 2, y0 + 1], [px((i + 1) / cols, y0) - 2, y0 + 1], [px((i + 1) / cols, y1) - 2, y1 - 1], [px(i / cols, y1) + 2, y1 - 1]], ctx.fillStyle);
        }
      }
      // neon tubes
      const neon = (x1, y1, x2, y2, c) => {
        ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 24; strokeLine(ctx, x1, y1, x2, y2, c, 5); strokeLine(ctx, x1, y1, x2, y2, '#fff', 1.5); ctx.restore();
      };
      const nb = 0.7 + 0.3 * Math.sin(t * 8);
      neon(60, 80, 60, 380, rgba('#ff2d95', nb)); neon(1220, 80, 1220, 380, rgba('#2dffd8', nb));
      neon(120, 60, 1160, 60, rgba('#8a2dff', 0.9)); neon(120, 72, 1160, 72, rgba('#ff2d95', 0.6));
      ctx.save(); ctx.shadowColor = '#ff2d95'; ctx.shadowBlur = 30; text(ctx, 640, 130, 'CLUB  NEON', 'bold 52px sans-serif', '#ffb3dc'); ctx.restore();
      // disco ball
      strokeLine(ctx, 640, 60, 640, 190, '#999', 2);
      ctx.fillStyle = radGrad(ctx, 630, 220, 0, 46, [[0, '#ffffff'], [0.5, '#bfc9d6'], [1, '#5f6a78']]); circle(ctx, 640, 230, 44); ctx.fill();
      for (let i = 0; i < 40; i++) { const a = i * 2.4 + t * 0.6; const r2 = 44 * Math.cos((i % 7) * 0.4); fillRect(ctx, 640 + Math.cos(a) * r2 - 3, 230 + Math.sin(i * 0.9) * 36 - 3, 6, 6, rgba('#fff', 0.5 + 0.5 * Math.sin(a * 3))); }
      for (let i = 0; i < 14; i++) { const a = t * 0.6 + i * (TAU / 14); const dx = 640 + Math.cos(a) * 480, dy = 240 + Math.sin(a) * 220; ctx.fillStyle = rgba(['#fff', '#ff2d95', '#2dffd8'][i % 3], 0.35); ellipse(ctx, dx, dy, 14, 10); ctx.fill(); }
      // DJ booth (back centre)
      const bx = 640, by = fy - 10;
      fillRound(ctx, bx - 170, by - 110, 340, 110, 8, '#141225');
      ctx.fillStyle = linGrad(ctx, bx - 170, by - 110, bx + 170, by, [[0, rgba('#ff2d95', 0.5)], [1, rgba('#2dffd8', 0.5)]]); roundRect(ctx, bx - 164, by - 104, 328, 98, 6); ctx.fill();
      text(ctx, bx, by - 55, 'DJ', 'bold 48px sans-serif', rgba('#fff', 0.9));
      fillCircle(ctx, bx - 100, by - 125, 26, '#222'); fillCircle(ctx, bx - 100, by - 125, 8, '#ff2d95');
      fillCircle(ctx, bx + 100, by - 125, 26, '#222'); fillCircle(ctx, bx + 100, by - 125, 8, '#2dffd8');
      for (let i = 0; i < 8; i++) { const h = 10 + 24 * Math.abs(Math.sin(t * 5 + i)); fillRect(ctx, bx - 40 + i * 11, by - 120 - h, 7, h, ['#ff2d95', '#2dffd8', '#ffe92d'][i % 3]); }
      // speaker stacks
      const speaker = (x) => {
        for (let k = 0; k < 2; k++) {
          fillRound(ctx, x - 60, fy - 150 + k * 90, 120, 85, 6, '#0d0c18');
          const pump = 1 + 0.06 * Math.max(0, Math.sin(t * 9));
          fillCircle(ctx, x, fy - 108 + k * 90, 32 * pump, '#2b2840'); fillCircle(ctx, x, fy - 108 + k * 90, 24 * pump, '#1a1828'); fillCircle(ctx, x, fy - 108 + k * 90, 7, '#555');
        }
      };
      speaker(150); speaker(1130);
      crowd(ctx, env, fy + 10, 18, 7, true);
      fillRect(ctx, 0, fy - 20, W, 20, rgba('#000', 0.6));
      ctx.fillStyle = linGrad(ctx, 0, fy, 0, fy + 40, [[0, rgba('#000', 0.5)], [1, rgba('#000', 0)]]); ctx.fillRect(0, fy, W, 40);
      vignette(ctx, env, 0.5);
    },
  },
  // ---------------------------------------------------------------- cinema
  {
    id: 'cinema', name: 'Movie Theater / Cinema', category: CAT, groundY: 0.9, horizonY: 0.72, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H * 0.72, [[0, '#0b0710'], [1, '#2a1122']]); ctx.fillRect(0, 0, W, H * 0.72);
      // screen
      const sx = 190, sy = 50, sw = 900, sh = 400;
      fillRound(ctx, sx - 16, sy - 16, sw + 32, sh + 32, 6, '#1a1218');
      ctx.fillStyle = linGrad(ctx, sx, sy, sx + sw, sy + sh, [[0, '#1b5e8c'], [0.4, '#f4a261'], [1, '#6a0572']]); ctx.fillRect(sx, sy, sw, sh);
      // movie content: sunset over sea + hero silhouette
      fillCircle(ctx, sx + sw * 0.55, sy + sh * 0.45, 70, '#ffd166');
      ctx.fillStyle = linGrad(ctx, 0, sy + sh * 0.6, 0, sy + sh, [[0, '#2a6f97'], [1, '#013a63']]); ctx.fillRect(sx, sy + sh * 0.6, sw, sh * 0.4);
      ctx.fillStyle = rgba('#ffd166', 0.35); for (let i = 0; i < 8; i++) fillRect(ctx, sx + sw * 0.5 - 30 + Math.sin(t * 2 + i) * 10, sy + sh * 0.62 + i * 16, 60 + i * 8, 4, ctx.fillStyle);
      fillRound(ctx, sx + sw * 0.25 - 20, sy + sh * 0.5, 40, 110, 10, '#0a0a14'); fillCircle(ctx, sx + sw * 0.25, sy + sh * 0.46, 20, '#0a0a14');
      fillRound(ctx, sx + sw * 0.34 - 16, sy + sh * 0.55, 32, 90, 10, '#0a0a14'); fillCircle(ctx, sx + sw * 0.34, sy + sh * 0.52, 16, '#0a0a14');
      ctx.fillStyle = rgba('#fff', 0.06 + 0.04 * Math.sin(t * 17)); ctx.fillRect(sx, sy, sw, sh);
      // screen glow
      ctx.fillStyle = radGrad(ctx, W / 2, sy + sh / 2, 300, 900, [[0, rgba('#f4a261', 0.12)], [1, rgba('#f4a261', 0)]]); ctx.fillRect(0, 0, W, H);
      // projector beam
      ctx.fillStyle = linGrad(ctx, W / 2, H * 0.72, W / 2, 0, [[0, rgba('#fff', 0.12)], [1, rgba('#fff', 0)]]);
      poly(ctx, [[W / 2 - 20, H * 0.72], [W / 2 + 20, H * 0.72], [sx + sw, sy], [sx, sy]]); ctx.fill();
      dustMotes(ctx, env, 30, 2);
      // curtains
      const curt = (x, dir) => { for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#7b1e2b' : '#a3283a'; fillRect(ctx, x + dir * i * 26, 0, 26, H * 0.72, ctx.fillStyle); } };
      curt(0, 1); curt(W - 26, -1);
      fillRect(ctx, 0, 0, W, 30, '#5a1520');
      // floor (sloped aisle)
      ctx.fillStyle = linGrad(ctx, 0, H * 0.72, 0, H, [[0, '#2a1a22'], [1, '#160c12']]); ctx.fillRect(0, H * 0.72, W, H * 0.28);
      // back rows of seats
      const seatRow = (y, scale, dark) => {
        const n = Math.floor(W / (52 * scale));
        for (let i = 0; i < n; i++) {
          const x = i * 52 * scale + 10;
          if (x > W / 2 - 70 * scale && x < W / 2 + 40 * scale) continue; // aisle
          fillRound(ctx, x, y - 50 * scale, 44 * scale, 50 * scale, 8 * scale, dark ? '#5a1a26' : '#8e2a3c');
          fillRound(ctx, x + 3 * scale, y - 46 * scale, 38 * scale, 20 * scale, 6 * scale, dark ? '#6e2230' : '#a63446');
        }
      };
      seatRow(H * 0.72 - 20, 0.75, true);
      seatRow(H * 0.72 + 6, 0.9, false);
      // aisle lights
      for (let i = 0; i < 6; i++) { const y = H * 0.74 + i * 28; fillCircle(ctx, W / 2 - 60, y, 3, rgba('#ffd166', 0.9)); fillCircle(ctx, W / 2 + 40, y, 3, rgba('#ffd166', 0.9)); }
      // popcorn bucket on the side
      fillPoly(ctx, [[1150, H * 0.74], [1210, H * 0.74], [1200, H * 0.82], [1160, H * 0.82]], '#fff');
      for (let i = 0; i < 4; i++) fillRect(ctx, 1156 + i * 14, H * 0.74, 7, 52, '#e63946');
      for (let i = 0; i < 9; i++) fillCircle(ctx, 1158 + (i % 5) * 12, H * 0.73 - Math.floor(i / 5) * 9, 7, i % 2 ? '#fff3b0' : '#ffe08a');
      vignette(ctx, env, 0.45);
    },
    paintFront(ctx, env) {
      const { W, H } = env;
      const y = H + 10;
      for (let i = 0; i < 14; i++) {
        const x = i * 100 - 30;
        if (x > W / 2 - 120 && x < W / 2 + 40) continue;
        fillRound(ctx, x, y - 90, 90, 90, 14, '#7b1e2b');
        fillRound(ctx, x + 6, y - 84, 78, 34, 10, '#9a2a3c');
      }
      ctx.fillStyle = linGrad(ctx, 0, H - 95, 0, H, [[0, rgba('#000', 0)], [1, rgba('#000', 0.35)]]); ctx.fillRect(0, H - 95, W, 95);
    },
  },
  // ---------------------------------------------------------------- mall
  {
    id: 'mall', name: 'Shopping Mall Corridor', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      // glass ceiling
      const p = todOf(env);
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H * 0.3, [[0, p.skyTop], [1, p.skyMid]]); ctx.fillRect(0, 0, W, H * 0.3);
      ctx.strokeStyle = '#d6dbe0'; ctx.lineWidth = 6;
      for (let i = 0; i <= 8; i++) { const x = (i / 8) * W; strokeLine(ctx, x, 0, W / 2 + (x - W / 2) * 0.55, H * 0.3, '#d6dbe0', 6); }
      strokeLine(ctx, 0, H * 0.12, W, H * 0.12, '#d6dbe0', 5); strokeLine(ctx, 0, H * 0.22, W, H * 0.22, '#d6dbe0', 5);
      // upper gallery wall
      wall(ctx, env, '#f3efe8', { floorY: H * 0.7, ignoreTod: true });
      ctx.fillStyle = '#e7e1d8'; ctx.fillRect(0, H * 0.3, W, 10);
      // upper floor railing
      fillRect(ctx, 0, H * 0.3 + 10, W, 70, '#dcd6cc'); ctx.strokeStyle = '#9aa3ad'; ctx.lineWidth = 3;
      for (let x = 0; x < W; x += 24) strokeLine(ctx, x, H * 0.3 + 14, x, H * 0.3 + 76, '#9aa3ad', 3);
      fillRect(ctx, 0, H * 0.3 + 10, W, 6, '#6c757d');
      // storefronts on ground level
      const store = (x, w, name, c) => {
        const y = H * 0.7, h = 250;
        fillRect(ctx, x, y - h, w, h, c);
        fillRect(ctx, x + 10, y - h + 60, w - 20, h - 70, '#1b2631');
        ctx.fillStyle = rgba('#dff6ff', 0.55); ctx.fillRect(x + 16, y - h + 66, w - 32, h - 82);
        const r = rng(hash(name));
        for (let k = 0; k < 3; k++) { const mx = x + 40 + k * ((w - 80) / 3); fillRound(ctx, mx - 14, y - 120, 28, 80, 8, r.pick(['#e67e22', '#8e44ad', '#2980b9', '#27ae60'])); fillCircle(ctx, mx, y - 132, 12, '#f5cba7'); }
        signBoard(ctx, env, x + 20, y - h + 12, w - 40, 36, name, '#1b2631', '#fff', 'bold 20px sans-serif');
        ctx.fillStyle = linGrad(ctx, x, y - h + 60, x, y - 40, [[0, rgba('#fff', 0.2)], [1, rgba('#fff', 0)]]); ctx.fillRect(x + 16, y - h + 66, w - 32, h - 82);
      };
      store(0, 330, 'FASHION', '#e8d5d5'); store(340, 300, 'TECH', '#d5e0e8'); store(650, 300, 'TOYS', '#f6e6c3'); store(960, 330, 'SHOES', '#d9e8d5');
      // floor (polished tile)
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'tile', '#f5f3ee');
      ctx.fillStyle = rgba('#fff', 0.18); ctx.fillRect(0, H * 0.7, W, H * 0.3);
      // escalator (right)
      const ex = 1000, ey = H * 0.7 + 60;
      ctx.fillStyle = '#b8c0c8'; poly(ctx, [[ex, ey], [ex + 200, ey], [ex + 300, H * 0.36], [ex + 160, H * 0.36]]); ctx.fill();
      for (let i = 0; i < 12; i++) {
        const f = ((i / 12) + (t * 0.15) % (1 / 12));
        const y0 = lerp(ey, H * 0.36, f), xl = lerp(ex, ex + 160, f), xr = lerp(ex + 200, ex + 300, f);
        strokeLine(ctx, xl, y0, xr, y0, '#6c757d', 3);
      }
      ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex - 10, ey - 60); ctx.lineTo(ex + 150, H * 0.36 - 60); ctx.stroke();
      ctx.strokeStyle = rgba('#9fd3f5', 0.5); ctx.lineWidth = 50; ctx.beginPath(); ctx.moveTo(ex - 10, ey - 34); ctx.lineTo(ex + 150, H * 0.36 - 34); ctx.stroke();
      // fountain (centre back)
      const fx = 640, fy = H * 0.7 + 20;
      fillEllipse(ctx, fx, fy, 150, 34, '#9aa3ad'); fillEllipse(ctx, fx, fy - 4, 138, 26, '#4aa3df');
      ctx.strokeStyle = rgba('#fff', 0.5); ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ellipse(ctx, fx, fy - 4, 20 + ((t * 30 + i * 20) % 120), (20 + ((t * 30 + i * 20) % 120)) * 0.2); ctx.stroke(); }
      fillRect(ctx, fx - 6, fy - 90, 12, 86, '#9aa3ad'); fillEllipse(ctx, fx, fy - 90, 40, 10, '#9aa3ad');
      for (let i = -2; i <= 2; i++) { ctx.strokeStyle = rgba('#bfe3f8', 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx, fy - 96); ctx.quadraticCurveTo(fx + i * 40, fy - 150 - Math.abs(Math.sin(t * 3 + i)) * 20, fx + i * 80, fy - 10); ctx.stroke(); }
      for (let i = 0; i < 10; i++) { const a = t * 3 + i; fillCircle(ctx, fx + Math.cos(a) * 60 * (i / 10), fy - 100 - Math.abs(Math.sin(a * 1.3)) * 50, 3, rgba('#fff', 0.8)); }
      plantPot(ctx, env, 330, H * 0.76, 110, '#7f8c8d'); plantPot(ctx, env, 950, H * 0.76, 110, '#7f8c8d');
      bench(ctx, env, 110, H * 0.76, 170, '#6b4a2b', '#2c3e50');
      // ceiling lights glow
      ctx.fillStyle = linGrad(ctx, 0, H * 0.3, 0, H * 0.55, [[0, rgba('#fff', 0.14)], [1, rgba('#fff', 0)]]); ctx.fillRect(0, H * 0.3, W, H * 0.25);
    },
  },
];
