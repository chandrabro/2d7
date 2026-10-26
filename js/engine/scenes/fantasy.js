// Fantasy, Adventure & Historical scenes
import {
  sky, stars, ground, hills, mountains, water, treeRound, treePalm, bush, rock, wall, floor,
  lit, todOf, candle, fire, sunRays, vignette, fog, dustMotes, bunting, signBoard, text,
  TAU, lerp, clamp, mixColor, shade, rgba, rng, hash, roundRect, ellipse, circle, poly, curve,
  fillRect, fillRound, fillEllipse, fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow, withAlpha,
} from '../scenery.js';

const CAT = 'Fantasy, Adventure & Historical';

// ---------- local helpers ----------
function column(ctx, x, top, bottom, w, color = '#d8d0c0') {
  ctx.fillStyle = linGrad(ctx, x - w / 2, 0, x + w / 2, 0, [[0, shade(color, -0.35)], [0.35, shade(color, 0.12)], [0.7, color], [1, shade(color, -0.3)]]);
  ctx.fillRect(x - w / 2, top, w, bottom - top);
  fillRect(ctx, x - w * 0.75, top, w * 1.5, w * 0.35, shade(color, -0.1));
  fillRect(ctx, x - w * 0.7, bottom - w * 0.3, w * 1.4, w * 0.3, shade(color, -0.15));
}
function chandelier(ctx, env, x, y, r = 60, chain = 90) {
  strokeLine(ctx, x, y - chain, x, y, '#b8912a', 3);
  ctx.strokeStyle = '#d4a93a'; ctx.lineWidth = 6; ellipse(ctx, x, y, r, r * 0.3); ctx.stroke();
  ctx.fillStyle = radGrad(ctx, x, y - 10, 0, r * 2.2, [[0, 'rgba(255,215,140,0.35)'], [1, 'rgba(255,215,140,0)']]); circle(ctx, x, y - 10, r * 2.2); ctx.fill();
  for (let i = 0; i < 7; i++) { const a = (i / 7) * TAU; candle(ctx, env, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.3 - 2, 16, true); }
  fillCircle(ctx, x, y - 2, 7, '#e6c15a');
}
function seagull(ctx, x, y, s = 1, color = '#fff') {
  ctx.strokeStyle = color; ctx.lineWidth = 2 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 12 * s, y); ctx.quadraticCurveTo(x - 6 * s, y - 7 * s, x, y); ctx.quadraticCurveTo(x + 6 * s, y - 7 * s, x + 12 * s, y); ctx.stroke();
}
function fish(ctx, x, y, len, color, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  fillEllipse(ctx, 0, 0, len / 2, len * 0.22, color);
  fillPoly(ctx, [[-len / 2 + 4, 0], [-len * 0.75, -len * 0.22], [-len * 0.75, len * 0.22]], shade(color, -0.15));
  fillCircle(ctx, len * 0.3, -len * 0.05, len * 0.05, '#fff'); fillCircle(ctx, len * 0.32, -len * 0.05, len * 0.025, '#111');
  strokeLine(ctx, len * 0.1, -len * 0.18, len * 0.05, len * 0.18, rgba('#000', 0.15), 1.5);
  ctx.restore();
}
function crystal(ctx, env, x, y, h, w, color, phase = 0, tilt = 0) {
  const pulse = 0.6 + 0.4 * Math.sin(env.t * 2 + phase);
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  ctx.fillStyle = radGrad(ctx, 0, -h * 0.5, 0, h * 1.4, [[0, rgba(color, 0.45 * pulse)], [1, rgba(color, 0)]]); circle(ctx, 0, -h * 0.5, h * 1.4); ctx.fill();
  fillPoly(ctx, [[-w / 2, 0], [-w / 2, -h * 0.65], [0, -h], [w / 2, -h * 0.65], [w / 2, 0]], shade(color, -0.1));
  fillPoly(ctx, [[-w / 2, 0], [-w / 2, -h * 0.65], [0, -h], [0, 0]], shade(color, 0.25 * pulse));
  fillPoly(ctx, [[-w * 0.3, -h * 0.55], [0, -h * 0.92], [-w * 0.1, -h * 0.5]], rgba('#fff', 0.5 * pulse));
  ctx.restore();
}
function cactus(ctx, env, x, y, h = 120) {
  const c = lit(env, '#3f8f45'), d = lit(env, '#2f6f35');
  fillRound(ctx, x - h * 0.1, y - h, h * 0.2, h, h * 0.1, c);
  fillRound(ctx, x - h * 0.42, y - h * 0.65, h * 0.14, h * 0.35, h * 0.07, c); fillRound(ctx, x - h * 0.42, y - h * 0.45, h * 0.38, h * 0.12, h * 0.06, c);
  fillRound(ctx, x + h * 0.28, y - h * 0.8, h * 0.14, h * 0.4, h * 0.07, c); fillRound(ctx, x + h * 0.04, y - h * 0.55, h * 0.38, h * 0.12, h * 0.06, c);
  ctx.strokeStyle = d; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) strokeLine(ctx, x - h * 0.06 + i * h * 0.04, y - h * 0.95, x - h * 0.06 + i * h * 0.04, y - 4, d, 1.5);
}

export default [
  // ---------------------------------------------------------------- THRONE ROOM
  {
    id: 'throne_room', name: 'Royal Palace Throne Room', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7; const p = todOf(env);
      wall(ctx, env, '#d8c8aa', { floorY });
      // stone block lines
      ctx.strokeStyle = rgba('#000', 0.06); ctx.lineWidth = 1.5;
      for (let y = 0; y < floorY; y += 48) strokeLine(ctx, 0, y, W, y, ctx.strokeStyle, 1.5);
      // arched windows
      [150, 1130].forEach((wx) => {
        ctx.save(); roundRect(ctx, wx - 60, 70, 120, 300, 60); ctx.clip();
        ctx.fillStyle = linGrad(ctx, 0, 70, 0, 370, [[0, p.skyTop], [0.6, p.skyMid], [1, p.skyBot]]); ctx.fillRect(wx - 60, 70, 120, 300);
        if (env.tod === 'night') stars(ctx, { ...env, W: wx + 60 }, 370);
        hills(ctx, { ...env, W: wx + 120, H: 370 }, 300, '#6fae5a', 2, 40, 3, 0.3);
        ctx.restore();
        ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 8; roundRect(ctx, wx - 60, 70, 120, 300, 60); ctx.stroke();
        strokeLine(ctx, wx, 70, wx, 370, '#8a7a5a', 5); strokeLine(ctx, wx - 60, 220, wx + 60, 220, '#8a7a5a', 5);
        if (env.tod !== 'night') { ctx.fillStyle = linGrad(ctx, wx, 100, wx + 60, floorY + 120, [[0, rgba('#fff', 0.16)], [1, rgba('#fff', 0)]]); fillPoly(ctx, [[wx - 60, 90], [wx + 60, 90], [wx + 160, floorY + 150], [wx - 10, floorY + 150]], ctx.fillStyle); }
      });
      // banners
      [[300, '#8e1b2a'], [980, '#1b3f8e']].forEach(([bx, bc]) => {
        fillPoly(ctx, [[bx - 45, 40], [bx + 45, 40], [bx + 45, 300], [bx, 340], [bx - 45, 300]], lit(env, bc, 0.5));
        fillRect(ctx, bx - 52, 36, 104, 10, '#c9a227');
        fillCircle(ctx, bx, 170, 28, '#e6c15a'); fillPoly(ctx, [[bx, 148], [bx + 8, 164], [bx + 24, 164], [bx + 12, 176], [bx + 16, 192], [bx, 182], [bx - 16, 192], [bx - 12, 176], [bx - 24, 164], [bx - 8, 164]], '#8e1b2a');
      });
      // columns
      [50, 420, 860, 1230].forEach((cx) => column(ctx, cx, 0, floorY + 6, 54, lit(env, '#d8d0c0', 0.5)));
      // marble floor
      floor(ctx, env, floorY, 'tile', '#ebe6dc');
      // dais at back centre
      for (let i = 0; i < 3; i++) {
        const sw = 230 + i * 60, sy = floorY - 42 + i * 14;
        fillRect(ctx, W / 2 - sw / 2, sy, sw, 14, shade('#cfc6b4', env.tod === 'night' ? -0.3 : 0));
        fillRect(ctx, W / 2 - sw / 2, sy, sw, 3, rgba('#fff', 0.5));
      }
      // red carpet in perspective (over dais)
      ctx.fillStyle = linGrad(ctx, 0, floorY - 42, 0, H, [[0, lit(env, '#8e1b2a', 0.6)], [1, lit(env, '#b4242f', 0.6)]]);
      fillPoly(ctx, [[W / 2 - 70, floorY - 42], [W / 2 + 70, floorY - 42], [W / 2 + 250, H], [W / 2 - 250, H]], ctx.fillStyle);
      ctx.strokeStyle = '#d4a93a'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(W / 2 - 62, floorY - 40); ctx.lineTo(W / 2 - 240, H); ctx.moveTo(W / 2 + 62, floorY - 40); ctx.lineTo(W / 2 + 240, H); ctx.stroke();
      // throne
      const tx = W / 2, ty = floorY - 42;
      groundShadow(ctx, tx, ty + 2, 90, 10, 0.3);
      fillRound(ctx, tx - 58, ty - 170, 116, 170, 30, '#c9a227');
      fillRound(ctx, tx - 48, ty - 160, 96, 110, 22, '#8e1b2a');
      fillPoly(ctx, [[tx - 30, ty - 170], [tx, ty - 200], [tx + 30, ty - 170]], '#e6c15a');
      fillCircle(ctx, tx, ty - 186, 7, '#e74c3c');
      fillRound(ctx, tx - 70, ty - 70, 24, 50, 8, '#c9a227'); fillRound(ctx, tx + 46, ty - 70, 24, 50, 8, '#c9a227');
      fillRound(ctx, tx - 50, ty - 50, 100, 24, 8, '#a92632');
      fillRect(ctx, tx - 50, ty - 26, 100, 26, '#b8912a');
      // chandeliers
      chandelier(ctx, env, 380, 150, 55, 150); chandelier(ctx, env, 900, 150, 55, 150);
      vignette(ctx, env, 0.3);
    },
  },
  // ---------------------------------------------------------------- TEMPLE RUINS
  {
    id: 'temple_ruins', name: 'Ancient Temple Ruins', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.66;
      sky(ctx, env, { horizon: gy, sunX: W * 0.5, sunY: H * 0.12, cloudCount: 3 });
      hills(ctx, env, gy - 60, '#4f8a4a', 3, 90, 3, 0.45);
      hills(ctx, env, gy - 10, '#3f7a3a', 4, 70, 3, 0.25);
      // jungle trees behind
      [[80, 190], [260, 150], [1020, 160], [1200, 200], [620, 130]].forEach(([x, s], i) => treeRound(ctx, env, x, gy + 10, s, i + 11, i % 2 ? '#2f7d3a' : '#3f9a46', '#5a3d22'));
      ground(ctx, env, gy, '#6f9a44', '#3f6a2c');
      // stone platform with cracked steps at the back
      const stone = lit(env, '#a8a394');
      for (let i = 0; i < 3; i++) { const sw = 560 + i * 90, sy = gy + 30 + i * 16; fillRect(ctx, W / 2 - sw / 2, sy, sw, 16, shade(stone, -i * 0.08)); fillRect(ctx, W / 2 - sw / 2, sy, sw, 3, rgba('#fff', 0.35)); }
      ctx.strokeStyle = rgba('#000', 0.35); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W / 2 + 80, gy + 32); ctx.lineTo(W / 2 + 95, gy + 50); ctx.lineTo(W / 2 + 88, gy + 76); ctx.moveTo(W / 2 - 180, gy + 46); ctx.lineTo(W / 2 - 165, gy + 60); ctx.stroke();
      // broken pillars
      const pillars = [[150, 0.95], [330, 0.55], [950, 0.7], [1130, 1.0], [560, 0.35], [720, 0.4]];
      pillars.forEach(([px, hf], i) => {
        const h = 260 * hf, base = gy + 30;
        for (let d = 0; d < h; d += 34) {
          const dh = Math.min(34, h - d);
          ctx.fillStyle = linGrad(ctx, px - 26, 0, px + 26, 0, [[0, shade(stone, -0.3)], [0.4, shade(stone, 0.1)], [1, shade(stone, -0.25)]]);
          ctx.fillRect(px - 26 + (d % 68 ? 2 : 0), base - d - dh, 52 - (d % 68 ? 4 : 0), dh);
          strokeLine(ctx, px - 26, base - d, px + 26, base - d, rgba('#000', 0.2), 1.5);
        }
        if (hf < 0.8) fillPoly(ctx, [[px - 28, base - h], [px - 10, base - h - 14], [px + 6, base - h - 4], [px + 20, base - h - 18], [px + 28, base - h]], shade(stone, -0.05));
        else { fillRect(ctx, px - 34, base - h - 14, 68, 14, shade(stone, -0.1)); }
        // moss
        fillEllipse(ctx, px - 14, base - 6, 18, 8, lit(env, '#5f9a3a')); fillEllipse(ctx, px + 16, base - h * 0.4, 10, 14, rgba('#4f8a3a', 0.7));
        // vines
        ctx.strokeStyle = lit(env, '#2f7d3a'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px + 20, base - h + 6);
        for (let k = 1; k < 6; k++) ctx.quadraticCurveTo(px + 20 + (k % 2 ? 16 : -16), base - h + k * h / 6 - h / 12, px + 18, base - h + k * h / 6);
        ctx.stroke();
        for (let k = 1; k < 6; k++) fillEllipse(ctx, px + 20 + (k % 2 ? 12 : -10), base - h + k * h / 6 - 6, 7, 4, lit(env, '#3f9a46'), k % 2 ? -0.6 : 0.6);
      });
      // statues on pedestals
      [[440, 1], [840, -1]].forEach(([sx, dir]) => {
        const sy = gy + 30; const c = lit(env, '#8f8a7c');
        fillRect(ctx, sx - 30, sy - 30, 60, 30, shade(stone, -0.15));
        ctx.save(); ctx.translate(sx, sy - 30); ctx.scale(dir, 1);
        fillRound(ctx, -22, -70, 44, 70, 12, c); fillCircle(ctx, 0, -84, 18, c);
        fillRound(ctx, -34, -60, 14, 40, 6, c); fillRound(ctx, 18, -66, 14, 46, 6, c);
        fillPoly(ctx, [[-18, -98], [0, -112], [18, -98]], shade(c, -0.1));
        ctx.restore();
        fillEllipse(ctx, sx - 12, sy - 8, 12, 6, lit(env, '#5f9a3a'));
      });
      // moss, bushes, rocks at the sides
      bush(ctx, env, 60, gy + 90, 70, '#2f7d3a'); bush(ctx, env, 1220, gy + 100, 80, '#3f8f3a');
      rock(ctx, env, 1080, gy + 150, 90, 40, '#8a8678'); rock(ctx, env, 230, gy + 160, 70, 30, '#8a8678');
      ctx.fillStyle = rgba('#5f9a3a', 0.5); for (let i = 0; i < 8; i++) fillEllipse(ctx, 100 + i * 150, gy + 60 + (i % 3) * 40, 40, 10, ctx.fillStyle);
      sunRays(ctx, env, W * 0.5, H * 0.12, 8, 1000, 0.07);
      fog(ctx, env, gy + 100, 0.18);
    },
  },
  // ---------------------------------------------------------------- HAUNTED HOUSE
  {
    id: 'haunted_house', name: 'Spooky / Haunted House', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const floorY = H * 0.7;
      // dim walls
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, floorY, [[0, '#1d1726'], [0.5, '#332a40'], [1, '#2a2235']]); ctx.fillRect(0, 0, W, floorY);
      ctx.fillStyle = rgba('#000', 0.08); for (let x = 0; x < W; x += 70) ctx.fillRect(x, 0, 30, floorY); // faded wallpaper stripes
      fillRect(ctx, 0, floorY - 12, W, 12, '#1a1420');
      // cracks
      ctx.strokeStyle = rgba('#000', 0.6); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(220, 60); ctx.lineTo(205, 120); ctx.lineTo(240, 190); ctx.moveTo(220, 60); ctx.lineTo(260, 80);
      ctx.moveTo(1100, 0); ctx.lineTo(1080, 70); ctx.lineTo(1110, 130); ctx.lineTo(1090, 210); ctx.moveTo(1080, 70); ctx.lineTo(1050, 100); ctx.stroke();
      // boarded window with moonlight
      const wx = 980, wy = 90, ww = 170, wh = 220;
      ctx.fillStyle = linGrad(ctx, wx, wy, wx, wy + wh, [[0, '#0c1230'], [1, '#1b2550']]); ctx.fillRect(wx, wy, ww, wh);
      stars(ctx, { ...env, W: wx + ww, t: env.t }, wy + wh);
      fillCircle(ctx, wx + 110, wy + 60, 30, '#f1ecd0'); fillCircle(ctx, wx + 122, wy + 52, 24, '#111a40');
      ctx.strokeStyle = '#3a2d40'; ctx.lineWidth = 10; ctx.strokeRect(wx, wy, ww, wh);
      [[wy + 40, -0.08], [wy + 130, 0.1]].forEach(([by, rot]) => { ctx.save(); ctx.translate(wx + ww / 2, by); ctx.rotate(rot); fillRect(ctx, -ww / 2 - 20, -10, ww + 40, 20, '#4a3828'); fillCircle(ctx, -ww / 2 - 8, 0, 2, '#222'); fillCircle(ctx, ww / 2 + 8, 0, 2, '#222'); ctx.restore(); });
      ctx.fillStyle = linGrad(ctx, wx, wy, wx - 200, floorY + 200, [[0, rgba('#b8c8ff', 0.14)], [1, rgba('#b8c8ff', 0)]]); fillPoly(ctx, [[wx, wy], [wx + ww, wy], [wx + ww - 150, floorY + 250], [wx - 300, floorY + 250]], ctx.fillStyle);
      // portrait with following eyes
      const px = 300, py = 110;
      fillRect(ctx, px - 70, py - 90, 140, 180, '#3a2a18'); fillRect(ctx, px - 60, py - 80, 120, 160, '#5a4a3a');
      fillRound(ctx, px - 28, py - 10, 56, 90, 20, '#2b2230'); fillCircle(ctx, px, py - 30, 26, '#c9b89a');
      const ex = Math.sin(env.t * 0.7) * 4;
      fillEllipse(ctx, px - 10, py - 34, 6, 4, '#fff'); fillEllipse(ctx, px + 10, py - 34, 6, 4, '#fff'); fillCircle(ctx, px - 10 + ex, py - 34, 2.5, '#111'); fillCircle(ctx, px + 10 + ex, py - 34, 2.5, '#111');
      strokeLine(ctx, px - 8, py - 18, px + 8, py - 20, '#5a3a2a', 2);
      // cobwebbed chandelier
      const cx = 640, cy = 120;
      strokeLine(ctx, cx, 0, cx, cy, '#444', 3); ctx.strokeStyle = '#555'; ctx.lineWidth = 5; ellipse(ctx, cx, cy, 70, 20); ctx.stroke();
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; candle(ctx, env, cx + Math.cos(a) * 70, cy + Math.sin(a) * 20 - 2, 14, i !== 2); }
      ctx.fillStyle = radGrad(ctx, cx, cy, 0, 260, [[0, 'rgba(255,190,110,0.22)'], [1, 'rgba(255,190,110,0)']]); circle(ctx, cx, cy, 260); ctx.fill();
      ctx.strokeStyle = rgba('#ddd', 0.35); ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) strokeLine(ctx, cx - 70 + i * 28, cy + 4, cx - 60 + i * 24, cy + 60 + (i % 2) * 20, ctx.strokeStyle, 1);
      // cobwebs in corners
      const web = (ox, oy, dir) => {
        ctx.strokeStyle = rgba('#e8e8f0', 0.45); ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); strokeLine(ctx, ox, oy, ox + Math.cos(a) * 150 * dir, oy + Math.sin(a) * 150, ctx.strokeStyle, 1); }
        for (let r = 30; r <= 150; r += 30) { ctx.beginPath(); for (let i = 0; i <= 5; i++) { const a = (i / 5) * (Math.PI / 2); const x = ox + Math.cos(a) * r * dir, y = oy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      };
      web(0, 0, 1); web(W, 0, -1);
      // floor
      floor(ctx, { ...env, tod: 'day' }, floorY, 'wood', '#5a4532');
      ctx.fillStyle = rgba('#1a1030', 0.3); ctx.fillRect(0, floorY, W, H - floorY);
      ctx.fillStyle = radGrad(ctx, 640, floorY + 40, 0, 520, [[0, 'rgba(255,200,140,0.14)'], [1, 'rgba(255,200,140,0)']]); ctx.fillRect(0, floorY, W, H - floorY);
      // side table with candles
      fillRect(ctx, 120, floorY + 10, 110, 8, '#3a2a1a'); fillRect(ctx, 128, floorY + 18, 8, 60, '#3a2a1a'); fillRect(ctx, 214, floorY + 18, 8, 60, '#3a2a1a');
      candle(ctx, env, 150, floorY + 10, 26, true); candle(ctx, env, 175, floorY + 10, 34, true); candle(ctx, env, 200, floorY + 10, 22, true);
      ctx.fillStyle = radGrad(ctx, 175, floorY - 30, 0, 160, [[0, 'rgba(255,180,100,0.25)'], [1, 'rgba(255,180,100,0)']]); circle(ctx, 175, floorY - 30, 160); ctx.fill();
      // ghost
      const gx = 860 + Math.sin(env.t * 0.6) * 40, gyy = 330 + Math.sin(env.t * 1.1) * 18, ga = 0.25 + 0.15 * Math.sin(env.t * 1.7);
      ctx.fillStyle = rgba('#dfe6ff', ga);
      ctx.beginPath(); ctx.arc(gx, gyy, 34, Math.PI, 0); ctx.lineTo(gx + 34, gyy + 70);
      for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(gx + 34 - i * 17 - 8, gyy + 56 + (i % 2) * 14, gx + 34 - (i + 1) * 17, gyy + 70);
      ctx.closePath(); ctx.fill();
      fillCircle(ctx, gx - 12, gyy - 4, 5, rgba('#223', ga + 0.3)); fillCircle(ctx, gx + 12, gyy - 4, 5, rgba('#223', ga + 0.3)); fillEllipse(ctx, gx, gyy + 16, 6, 9, rgba('#223', ga + 0.3));
      dustMotes(ctx, env, 24, 5);
      vignette(ctx, env, 0.6);
    },
  },
  // ---------------------------------------------------------------- PIRATE SHIP
  {
    id: 'pirate_ship', name: 'Pirate Ship Deck', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const railY = H * 0.6, seaY = H * 0.48;
      sky(ctx, env, { horizon: seaY, sunX: W * 0.2, sunY: H * 0.16, cloudCount: 4 });
      water(ctx, env, seaY, railY - seaY + 20, '#2f7fc4', '#1a4f8a');
      // distant island
      hills(ctx, { ...env, H: seaY + 1 }, seaY, '#4f7a5a', 8, 40, 2, 0.6);
      for (let i = 0; i < 4; i++) seagull(ctx, (200 + i * 260 + env.t * 25) % (W + 60) - 30, 90 + i * 30 + Math.sin(env.t * 2 + i) * 6, 1 + (i % 2) * 0.4, lit(env, '#f8f8ff'));
      // mast
      const mx = 920; const deckY = railY + 30;
      fillRect(ctx, mx - 11, 0, 22, deckY, lit(env, '#6b4a2b'));
      fillRect(ctx, mx - 11, 0, 8, deckY, rgba('#000', 0.2));
      // yard + sail
      fillRect(ctx, mx - 190, 130, 380, 10, lit(env, '#5a3d22'));
      const bulge = 24 + Math.sin(env.t * 1.5) * 5;
      ctx.fillStyle = lit(env, '#f3ead6');
      ctx.beginPath(); ctx.moveTo(mx - 170, 140); ctx.lineTo(mx + 170, 140); ctx.quadraticCurveTo(mx + 150 + bulge, 260, mx + 130, 380); ctx.quadraticCurveTo(mx, 400 + bulge, mx - 130, 380); ctx.quadraticCurveTo(mx - 150 - bulge, 260, mx - 170, 140); ctx.fill();
      ctx.fillStyle = rgba('#000', 0.08); for (let i = 1; i < 5; i++) { ctx.fillRect(mx - 160 + i * 4, 140 + i * 48, 320 - i * 8, 4); }
      // crow's nest + flag
      fillRect(ctx, mx - 40, 60, 80, 34, lit(env, '#5a3d22')); fillRect(ctx, mx - 44, 56, 88, 6, lit(env, '#7a5a32'));
      fillRect(ctx, mx - 2, 0, 4, 60, lit(env, '#5a3d22'));
      const fw = 70 + Math.sin(env.t * 3) * 6;
      fillPoly(ctx, [[mx + 2, 4], [mx + 2 + fw, 10 + Math.sin(env.t * 4) * 5], [mx + 2 + fw * 0.9, 44 + Math.sin(env.t * 4 + 1) * 5], [mx + 2, 48]], '#1a1a1e');
      fillCircle(ctx, mx + 2 + fw * 0.45, 22, 9, '#f5f5f5'); fillCircle(ctx, mx + 2 + fw * 0.45 - 3, 21, 2, '#111'); fillCircle(ctx, mx + 2 + fw * 0.45 + 3, 21, 2, '#111');
      strokeLine(ctx, mx + 2 + fw * 0.3, 36, mx + 2 + fw * 0.6, 42, '#f5f5f5', 3); strokeLine(ctx, mx + 2 + fw * 0.3, 42, mx + 2 + fw * 0.6, 36, '#f5f5f5', 3);
      // rigging
      ctx.strokeStyle = lit(env, '#3a2a1a'); ctx.lineWidth = 2;
      [[mx + 170, 140], [mx + 240, 140], [mx - 170, 140], [mx - 240, 140]].forEach(([tx], i) => { strokeLine(ctx, mx, 70, i < 2 ? W - 20 - i * 30 : 420 - i * 30, railY, ctx.strokeStyle, 2); });
      for (let i = 0; i < 6; i++) strokeLine(ctx, mx + 40 + i * 18, railY, mx + 2 + i * 10, 80, ctx.strokeStyle, 1.5);
      for (let i = 0; i < 5; i++) { const y = 130 + i * 60; strokeLine(ctx, mx + 2 + (i * 10) * 0.9, y, mx + 40 + i * 18 + 40, y + 20, ctx.strokeStyle, 1); }
      // rail at the back
      fillRect(ctx, 0, railY - 8, W, 10, lit(env, '#7a5a32'));
      for (let x = 20; x < W; x += 60) fillRect(ctx, x - 5, railY, 10, 32, lit(env, '#6b4a2b'));
      fillRect(ctx, 0, railY + 30, W, 8, lit(env, '#5a3d22'));
      // hull side wall below rail then deck
      fillRect(ctx, 0, railY + 36, W, 10, lit(env, '#4a2f18'));
      // deck planks in perspective
      const dy = railY + 44;
      ctx.fillStyle = linGrad(ctx, 0, dy, 0, H, [[0, lit(env, '#b07a45')], [1, lit(env, '#6f4a28')]]); ctx.fillRect(0, dy, W, H - dy);
      ctx.strokeStyle = rgba('#000', 0.3); ctx.lineWidth = 2;
      for (let k = 0; k < 7; k++) { const yy = dy + (H - dy) * (k * k) / 49 + 10; strokeLine(ctx, 0, yy, W, yy, ctx.strokeStyle, 2); }
      for (let i = 0; i <= 12; i++) { const x = (i / 12) * W; strokeLine(ctx, x, dy, W / 2 + (x - W / 2) * 1.5, H, rgba('#000', 0.18), 1.5); }
      ctx.fillStyle = linGrad(ctx, 0, dy, 0, dy + 40, [[0, rgba('#000', 0.3)], [1, rgba('#000', 0)]]); ctx.fillRect(0, dy, W, 40);
      // steering wheel on pedestal (left)
      const wx = 250, wy = dy + 40;
      fillRect(ctx, wx - 16, wy - 70, 32, 70, lit(env, '#5a3d22'));
      ctx.save(); ctx.translate(wx, wy - 90); ctx.rotate(Math.sin(env.t * 0.8) * 0.2);
      ctx.strokeStyle = lit(env, '#8b5a2b'); ctx.lineWidth = 9; circle(ctx, 0, 0, 44); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; strokeLine(ctx, 0, 0, Math.cos(a) * 62, Math.sin(a) * 62, lit(env, '#8b5a2b'), 6); fillCircle(ctx, Math.cos(a) * 62, Math.sin(a) * 62, 5, lit(env, '#6b4a2b')); }
      fillCircle(ctx, 0, 0, 10, lit(env, '#c9a227'));
      ctx.restore();
      // cannon (left back)
      fillCircle(ctx, 110, dy + 40, 16, '#3a2a1a'); fillCircle(ctx, 150, dy + 40, 16, '#3a2a1a');
      ctx.save(); ctx.translate(130, dy + 14); ctx.rotate(-0.3); fillRound(ctx, -20, -16, 110, 32, 14, '#2b2b30'); fillRect(ctx, 70, -18, 10, 36, '#3a3a40'); ctx.restore();
      // barrels (right)
      [[1130, 0], [1200, 0], [1165, -52]].forEach(([bx, boff]) => {
        const by = dy + 52 + boff;
        ctx.fillStyle = linGrad(ctx, bx - 28, 0, bx + 28, 0, [[0, lit(env, '#5a3d22')], [0.5, lit(env, '#9a6a3a')], [1, lit(env, '#5a3d22')]]);
        roundRect(ctx, bx - 28, by - 60, 56, 60, 8); ctx.fill();
        fillRect(ctx, bx - 29, by - 48, 58, 6, '#444'); fillRect(ctx, bx - 29, by - 18, 58, 6, '#444');
      });
    },
    paintFront(ctx, env) {
      const { W, H } = env;
      // coiled rope + front rail hint bottom-left
      ctx.strokeStyle = lit(env, '#c9a46a'); ctx.lineWidth = 7;
      for (let i = 0; i < 3; i++) { ellipse(ctx, 70, H - 30 - i * 7, 50 - i * 8, 16 - i * 3); ctx.stroke(); }
    },
  },
  // ---------------------------------------------------------------- BEACH
  {
    id: 'beach', name: 'Sandy Ocean Beach', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const seaY = H * 0.5, shoreY = H * 0.64;
      sky(ctx, env, { horizon: seaY, sunX: W * 0.7, sunY: H * 0.15, cloudCount: 4 });
      sunRays(ctx, env, W * 0.7, H * 0.15, 9, 900, 0.05);
      water(ctx, env, seaY, shoreY - seaY + 20, '#2fa3d6', '#1a6fa8');
      // sailboat far
      const sbx = (W * 0.3 + env.t * 6) % (W + 100) - 50;
      fillPoly(ctx, [[sbx - 22, seaY + 10], [sbx + 22, seaY + 10], [sbx + 16, seaY + 18], [sbx - 16, seaY + 18]], lit(env, '#8b4a2b'));
      fillPoly(ctx, [[sbx, seaY + 8], [sbx, seaY - 30], [sbx + 20, seaY + 8]], lit(env, '#fff')); fillPoly(ctx, [[sbx - 2, seaY + 8], [sbx - 2, seaY - 24], [sbx - 16, seaY + 8]], lit(env, '#f2f2f2'));
      // sand
      ctx.fillStyle = linGrad(ctx, 0, shoreY, 0, H, [[0, lit(env, '#f1dcae')], [1, lit(env, '#d9b878')]]); ctx.fillRect(0, shoreY, W, H - shoreY);
      // waves rolling to shore
      for (let k = 0; k < 3; k++) {
        const ph = env.t * 1.2 + k * 2.1; const off = (Math.sin(ph) * 0.5 + 0.5) * 26 - k * 8;
        ctx.fillStyle = rgba('#5fc3e8', 0.55 - k * 0.12);
        ctx.beginPath(); ctx.moveTo(0, shoreY - 10);
        for (let x = 0; x <= W; x += 40) ctx.quadraticCurveTo(x + 20, shoreY + off + Math.sin(x * 0.02 + ph) * 8 + 10, x + 40, shoreY + off + Math.sin((x + 40) * 0.02 + ph) * 6);
        ctx.lineTo(W, shoreY - 10); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = rgba('#fff', 0.8 - k * 0.2); ctx.lineWidth = 3; ctx.beginPath();
        for (let x = 0; x <= W; x += 40) { const y = shoreY + off + Math.sin(x * 0.02 + ph) * 6 + 2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      // wet sand sheen
      ctx.fillStyle = linGrad(ctx, 0, shoreY, 0, shoreY + 50, [[0, rgba('#8fb8c8', 0.4)], [1, rgba('#8fb8c8', 0)]]); ctx.fillRect(0, shoreY + 10, W, 50);
      // palms
      treePalm(ctx, env, 130, shoreY + 60, 190, 0.25); treePalm(ctx, env, 1180, shoreY + 70, 170, -0.3);
      // umbrella + towel (left)
      const ux = 300, uy = shoreY + 120;
      groundShadow(ctx, ux + 30, uy + 40, 70, 16, 0.2);
      fillRound(ctx, ux + 10, uy + 22, 150, 44, 6, lit(env, '#f06292')); ctx.strokeStyle = rgba('#fff', 0.6); ctx.lineWidth = 4; for (let i = 0; i < 4; i++) strokeLine(ctx, ux + 24 + i * 34, uy + 24, ux + 24 + i * 34, uy + 64, ctx.strokeStyle, 4);
      strokeLine(ctx, ux, uy + 30, ux + 20, uy - 150, '#e8e0d0', 5);
      ctx.save(); ctx.translate(ux + 20, uy - 150);
      for (let i = 0; i < 6; i++) { const a0 = Math.PI + (i / 6) * Math.PI, a1 = Math.PI + ((i + 1) / 6) * Math.PI; ctx.fillStyle = i % 2 ? '#e74c3c' : '#fdfdfd'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 120, a0, a1); ctx.closePath(); ctx.fill(); }
      ctx.restore();
      // sandcastle (right)
      const sx = 1010, sy = shoreY + 150; const sand = lit(env, '#d9b16a');
      groundShadow(ctx, sx, sy + 2, 90, 12, 0.2);
      fillRect(ctx, sx - 80, sy - 40, 160, 40, sand); fillRect(ctx, sx - 60, sy - 80, 120, 40, shade(sand, 0.06));
      [[-60, 0], [60, 0], [0, -40]].forEach(([ox, oy]) => { fillRect(ctx, sx + ox - 18, sy - 80 + oy - 40, 36, 40, shade(sand, 0.1)); for (let i = -1; i <= 1; i++) fillRect(ctx, sx + ox + i * 12 - 4, sy - 80 + oy - 50, 8, 10, shade(sand, 0.1)); fillPoly(ctx, [[sx + ox - 20, sy - 80 + oy - 48], [sx + ox, sy - 80 + oy - 76], [sx + ox + 20, sy - 80 + oy - 48]], lit(env, '#c0392b')); });
      strokeLine(ctx, sx, sy - 156, sx, sy - 190, '#555', 2); fillPoly(ctx, [[sx, sy - 190], [sx + 22, sy - 184], [sx, sy - 176]], '#3498db');
      fillRound(ctx, sx - 10, sy - 30, 20, 30, 10, shade(sand, -0.3));
      // shells & starfish
      fillCircle(ctx, 620, shoreY + 110, 7, lit(env, '#f8c8c0')); fillCircle(ctx, 760, shoreY + 140, 6, lit(env, '#fff'));
      ctx.fillStyle = lit(env, '#ff8c42'); ctx.save(); ctx.translate(520, shoreY + 200); ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 7 : 18, a = (i / 10) * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = rgba('#000', 0.06); for (let i = 0; i < 12; i++) fillEllipse(ctx, (i * 173) % W, shoreY + 60 + (i * 53) % 180, 30, 4, ctx.fillStyle);
    },
  },
  // ---------------------------------------------------------------- UNDERSEA
  {
    id: 'undersea', name: 'Undersea World', category: CAT, groundY: 0.9, horizonY: 0.72, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const bedY = H * 0.72;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, '#1aa0d6'], [0.35, '#0b6aa8'], [1, '#063a66']]); ctx.fillRect(0, 0, W, H);
      // light shafts
      for (let i = 0; i < 6; i++) {
        const x = 150 + i * 200 + Math.sin(env.t * 0.4 + i) * 30;
        ctx.fillStyle = linGrad(ctx, x, 0, x, H * 0.8, [[0, 'rgba(200,240,255,0.22)'], [1, 'rgba(200,240,255,0)']]);
        fillPoly(ctx, [[x - 20, 0], [x + 30, 0], [x + 110, H * 0.8], [x - 90, H * 0.8]], ctx.fillStyle);
      }
      // far fish silhouettes
      for (let i = 0; i < 8; i++) { const fx = ((i * 190 + env.t * (20 + i * 4)) % (W + 80)) - 40; fish(ctx, fx, 120 + (i * 61) % 220, 26, rgba('#0a4a80', 0.8), 1); }
      // sea bed
      ctx.fillStyle = linGrad(ctx, 0, bedY, 0, H, [[0, '#c9b27a'], [1, '#8a7a4a']]);
      ctx.beginPath(); ctx.moveTo(0, bedY + 20); for (let x = 0; x <= W; x += 80) ctx.quadraticCurveTo(x + 40, bedY - 10, x + 80, bedY + 20); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = rgba('#000', 0.1); ctx.lineWidth = 2; for (let k = 0; k < 5; k++) { const yy = bedY + 50 + k * 36; ctx.beginPath(); for (let x = 0; x <= W; x += 60) { const y = yy + Math.sin(x * 0.05 + k) * 4; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
      ctx.fillStyle = 'rgba(0,30,60,0.35)'; ctx.fillRect(0, bedY, W, H - bedY);
      // seaweed
      const weed = (x, h, c) => { ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, bedY + 20); for (let k = 1; k <= 5; k++) { const yy = bedY + 20 - (h / 5) * k; ctx.quadraticCurveTo(x + Math.sin(env.t * 1.5 + k + x * 0.01) * 18 * (k / 5), yy + h / 10, x + Math.sin(env.t * 1.5 + k + 0.5 + x * 0.01) * 14 * (k / 5), yy); } ctx.stroke(); };
      weed(80, 180, '#1f8a4f'); weed(130, 240, '#2fa35a'); weed(1180, 200, '#1f8a4f'); weed(1230, 150, '#2fa35a'); weed(700, 110, '#1f7a4a');
      // coral reefs
      const coral = (x, y, s, color) => {
        ctx.strokeStyle = color; ctx.lineWidth = s * 0.14; ctx.lineCap = 'round';
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + i * s * 0.3, y - s * 0.5, x + i * s * 0.45, y - s * (0.8 + Math.abs(i) * 0.05)); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + i * s * 0.3, y - s * 0.5); ctx.lineTo(x + i * s * 0.5 + (i < 0 ? -8 : 8), y - s * 0.7); ctx.stroke(); }
      };
      const brain = (x, y, r, color) => { fillCircle(ctx, x, y, r, color); ctx.strokeStyle = shade(color, -0.3); ctx.lineWidth = 2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x, y + 2, r * (0.2 + i * 0.16), Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } };
      brain(220, bedY + 40, 46, '#ff7aa8'); coral(300, bedY + 50, 120, '#ff8c42'); brain(1040, bedY + 50, 52, '#c56cf0'); coral(960, bedY + 40, 100, '#ff5e7e'); coral(1140, bedY + 60, 80, '#ffb142');
      [[160, bedY + 70, 14, '#ff6b81'], [1100, bedY + 95, 12, '#ffd93d'], [380, bedY + 90, 10, '#c56cf0']].forEach(([x, y, r, c]) => { for (let i = 0; i < 5; i++) fillCircle(ctx, x + i * r * 0.9, y - (i % 2) * r, r * 0.6, c); });
      // treasure chest
      const cx = 1100, cy = bedY + 140;
      groundShadow(ctx, cx, cy + 2, 60, 10, 0.3);
      fillRound(ctx, cx - 50, cy - 40, 100, 40, 4, '#6b3d1b'); fillRect(ctx, cx - 54, cy - 60, 108, 22, '#8b4a1b');
      ctx.fillStyle = '#5a3015'; ctx.beginPath(); ctx.arc(cx, cy - 60, 54, Math.PI, 0); ctx.fill();
      fillRect(ctx, cx - 54, cy - 36, 108, 6, '#c9a227'); fillRect(ctx, cx - 6, cy - 52, 12, 22, '#c9a227');
      for (let i = 0; i < 7; i++) fillCircle(ctx, cx - 36 + i * 12, cy - 60 + (i % 2) * 5, 6, '#ffd93d');
      ctx.fillStyle = radGrad(ctx, cx, cy - 60, 0, 90, [[0, 'rgba(255,220,100,0.35)'], [1, 'rgba(255,220,100,0)']]); circle(ctx, cx, cy - 60, 90); ctx.fill();
      // shells & starfish on sand
      fillCircle(ctx, 500, bedY + 120, 8, '#f8d8c8'); fillCircle(ctx, 820, bedY + 160, 7, '#fff5e0');
      ctx.fillStyle = '#ff8c42'; ctx.save(); ctx.translate(640, bedY + 170); ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 16, a = (i / 10) * TAU; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      // swimming fish mid-water
      const school = [['#ffb142', 48, 60, 260], ['#ff5e7e', 40, 48, 330], ['#48dbfb', 56, 70, 190], ['#f9ca24', 34, 55, 400]];
      school.forEach(([c, len, sp, y], i) => { const fx = ((i * 300 + env.t * sp) % (W + 160)) - 80; fish(ctx, fx, y + Math.sin(env.t * 2 + i) * 10, len, c, 1); });
      const fx2 = W - (((env.t * 45) + 200) % (W + 160)) + 80; fish(ctx, fx2, 480 + Math.sin(env.t * 1.5) * 8, 52, '#1dd1a1', -1);
      ctx.fillStyle = radGrad(ctx, W / 2, H, 0, H, [[0, 'rgba(0,20,50,0)'], [1, 'rgba(0,20,50,0.35)']]); ctx.fillRect(0, 0, W, H);
    },
    paintFront(ctx, env) {
      const r = rng(hash('bub' + env.seed));
      for (let i = 0; i < 16; i++) {
        const sp = 40 + r() * 50, x0 = r() * env.W, ph = r() * TAU, s = 2 + r() * 5;
        const y = env.H + 20 - ((env.t * sp + r() * 800) % (env.H + 60)); const x = x0 + Math.sin(env.t * 1.5 + ph) * 12;
        ctx.strokeStyle = 'rgba(220,245,255,0.7)'; ctx.lineWidth = 1.5; circle(ctx, x, y, s); ctx.stroke(); fillCircle(ctx, x - s * 0.3, y - s * 0.3, s * 0.3, 'rgba(255,255,255,0.6)');
      }
    },
  },
  // ---------------------------------------------------------------- OUTER SPACE
  {
    id: 'outer_space', name: 'Outer Space / Alien Planet', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.64;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, gy, [[0, '#02030c'], [0.6, '#0b1030'], [1, '#1a1f4a']]); ctx.fillRect(0, 0, W, gy + 2);
      // nebula
      ctx.fillStyle = radGrad(ctx, 300, 200, 0, 320, [[0, 'rgba(160,80,220,0.35)'], [1, 'rgba(160,80,220,0)']]); circle(ctx, 300, 200, 320); ctx.fill();
      ctx.fillStyle = radGrad(ctx, 950, 120, 0, 280, [[0, 'rgba(40,200,220,0.25)'], [1, 'rgba(40,200,220,0)']]); circle(ctx, 950, 120, 280); ctx.fill();
      stars(ctx, { ...env, tod: 'night' }, gy);
      // ringed planet
      const px = 1040, py = 150;
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35);
      ctx.strokeStyle = 'rgba(230,200,150,0.5)'; ctx.lineWidth = 14; ellipse(ctx, 0, 0, 150, 34); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = radGrad(ctx, px - 25, py - 25, 10, 90, [[0, '#f6c177'], [0.6, '#d9804a'], [1, '#6b2f3a']]); circle(ctx, px, py, 78); ctx.fill();
      ctx.fillStyle = rgba('#000', 0.15); for (let i = 0; i < 3; i++) fillEllipse(ctx, px, py - 30 + i * 28, 76 - Math.abs(i - 1) * 10, 6, ctx.fillStyle);
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35); ctx.beginPath(); ctx.ellipse(0, 0, 150, 34, 0, 0, Math.PI); ctx.strokeStyle = 'rgba(240,215,170,0.85)'; ctx.lineWidth = 14; ctx.stroke(); ctx.restore();
      // small moon
      fillCircle(ctx, 180, 90, 26, '#b8c0d0'); fillCircle(ctx, 172, 84, 6, '#99a2b4'); fillCircle(ctx, 190, 98, 4, '#99a2b4');
      // distant rocket
      const rx = 560 + Math.sin(env.t * 0.3) * 10, ry = 250 - env.t * 2 % 40;
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.6);
      fillRound(ctx, -8, -30, 16, 50, 8, '#e8e8f0'); fillPoly(ctx, [[-8, -24], [0, -40], [8, -24]], '#e74c3c'); fillPoly(ctx, [[-8, 10], [-16, 24], [-8, 20]], '#e74c3c'); fillPoly(ctx, [[8, 10], [16, 24], [8, 20]], '#e74c3c');
      fillEllipse(ctx, 0, 26 + Math.sin(env.t * 20) * 2, 5, 10 + Math.sin(env.t * 25) * 4, '#ffa21f'); ctx.restore();
      // alien ground
      ctx.fillStyle = linGrad(ctx, 0, gy, 0, H, [[0, '#6b4f8a'], [0.5, '#4a3566'], [1, '#2a1d3d']]);
      ctx.beginPath(); ctx.moveTo(0, gy + 10); for (let x = 0; x <= W; x += 120) ctx.quadraticCurveTo(x + 60, gy - 14, x + 120, gy + 10); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      // craters
      [[200, gy + 120, 80, 22], [1000, gy + 170, 110, 30], [620, gy + 60, 50, 12], [1180, gy + 80, 60, 16]].forEach(([cx, cy, rx, ry]) => { fillEllipse(ctx, cx, cy, rx, ry, '#2a1d3d'); fillEllipse(ctx, cx, cy - 4, rx, ry, '#8a6aa8'); fillEllipse(ctx, cx, cy, rx * 0.85, ry * 0.8, '#3a2a52'); });
      // alien structures
      const dome = (x, y, r) => { ctx.fillStyle = radGrad(ctx, x - r * 0.3, y - r * 0.4, 0, r, [[0, 'rgba(180,240,255,0.7)'], [1, 'rgba(60,140,200,0.4)']]); ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(200,240,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.stroke(); fillRect(ctx, x - r - 6, y - 6, r * 2 + 12, 12, '#8a90a8'); };
      dome(1080, gy + 20, 90); dome(1220, gy + 36, 50); dome(120, gy + 30, 70);
      fillRect(ctx, 1010, gy + 14, 60, 10, '#8a90a8'); fillRound(ctx, 940, gy - 20, 70, 46, 10, '#9aa0b8');
      const blink = Math.sin(env.t * 4) > 0;
      fillRect(ctx, 870, gy - 160, 6, 180, '#aab0c8'); strokeLine(ctx, 873, gy - 160, 850, gy - 120, '#aab0c8', 3); strokeLine(ctx, 873, gy - 160, 896, gy - 120, '#aab0c8', 3);
      fillCircle(ctx, 873, gy - 166, 6, blink ? '#ff3b3b' : '#5a1a1a'); if (blink) { ctx.fillStyle = radGrad(ctx, 873, gy - 166, 0, 30, [[0, 'rgba(255,60,60,0.5)'], [1, 'rgba(255,60,60,0)']]); circle(ctx, 873, gy - 166, 30); ctx.fill(); }
      // ground rocks
      rock(ctx, env, 420, gy + 150, 60, 30, '#5a4a7a'); rock(ctx, env, 900, gy + 190, 80, 34, '#4a3a6a');
      ctx.fillStyle = radGrad(ctx, W / 2, gy, 0, W * 0.6, [[0, 'rgba(120,200,255,0.08)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, gy, W, H - gy);
    },
  },
  // ---------------------------------------------------------------- WILD WEST
  {
    id: 'wild_west', name: 'Wild West Town Street', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.64;
      const e2 = { ...env };
      sky(ctx, e2, { horizon: gy, sunX: W * 0.5, sunY: H * 0.2, cloudCount: 3 });
      if (env.tod === 'day') { ctx.fillStyle = linGrad(ctx, 0, 0, 0, gy, [[0, 'rgba(255,200,120,0)'], [1, 'rgba(255,200,120,0.3)']]); ctx.fillRect(0, 0, W, gy); }
      // mesas far
      const mesa = lit(env, '#c47a4a');
      [[80, 120, 90], [420, 70, 60], [1100, 160, 110]].forEach(([x, w, h]) => { fillPoly(ctx, [[x - w * 0.9, gy], [x - w * 0.5, gy - h], [x + w * 0.5, gy - h], [x + w * 0.9, gy]], mixColor(mesa, todOf(env).haze, 0.45)); });
      // desert ground
      ctx.fillStyle = linGrad(ctx, 0, gy, 0, H, [[0, lit(env, '#e0b066')], [1, lit(env, '#b7853f')]]); ctx.fillRect(0, gy, W, H - gy);
      // dusty road through the middle
      ctx.fillStyle = lit(env, '#d1a05e'); fillPoly(ctx, [[W * 0.35, gy + 60], [W * 0.65, gy + 60], [W * 1.1, H], [-W * 0.1, H]], ctx.fillStyle);
      ctx.strokeStyle = rgba('#000', 0.1); ctx.lineWidth = 3; strokeLine(ctx, W * 0.45, gy + 70, W * 0.2, H, ctx.strokeStyle, 3); strokeLine(ctx, W * 0.55, gy + 70, W * 0.8, H, ctx.strokeStyle, 3);
      // water tower
      const wtx = 180, wty = gy + 10;
      ctx.strokeStyle = lit(env, '#5a3d22'); ctx.lineWidth = 6; strokeLine(ctx, wtx - 40, wty, wtx - 28, wty - 170, ctx.strokeStyle, 6); strokeLine(ctx, wtx + 40, wty, wtx + 28, wty - 170, ctx.strokeStyle, 6); strokeLine(ctx, wtx - 38, wty - 60, wtx + 38, wty - 110, ctx.strokeStyle, 3); strokeLine(ctx, wtx + 38, wty - 60, wtx - 38, wty - 110, ctx.strokeStyle, 3);
      fillRound(ctx, wtx - 46, wty - 270, 92, 100, 8, lit(env, '#8b5a2b')); fillRect(ctx, wtx - 48, wty - 240, 96, 5, '#444'); fillRect(ctx, wtx - 48, wty - 195, 96, 5, '#444');
      fillPoly(ctx, [[wtx - 54, wty - 270], [wtx, wty - 310], [wtx + 54, wty - 270]], lit(env, '#5a3d22'));
      // sheriff office (left)
      const sox = 290, sow = 230, soh = 150;
      fillRect(ctx, sox, gy + 20 - soh, sow, soh, lit(env, '#c8a06a')); fillRect(ctx, sox - 10, gy + 20 - soh - 40, sow + 20, 44, lit(env, '#8b5a2b'));
      fillRect(ctx, sox, gy + 20 - soh - 10, sow, 12, lit(env, '#6b4a2b'));
      text(ctx, sox + sow / 2, gy + 20 - soh - 18, 'SHERIFF', 'bold 24px Georgia, serif', '#f5e6c8');
      fillRect(ctx, sox + 30, gy + 20 - 100, 50, 60, lit(env, '#6ea8c8')); fillRect(ctx, sox + 140, gy + 20 - 110, 40, 110, lit(env, '#4a2f18'));
      ctx.fillStyle = '#e6c15a'; ctx.save(); ctx.translate(sox + 55, gy + 20 - 125); ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = (i / 10) * TAU - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
      // saloon (right)
      const sx = 820, sw = 360, sh = 210;
      groundShadow(ctx, sx + sw / 2, gy + 24, sw * 0.6, 14, 0.2);
      fillRect(ctx, sx, gy + 20 - sh, sw, sh, lit(env, '#b07a45'));
      ctx.strokeStyle = rgba('#000', 0.12); ctx.lineWidth = 2; for (let y = gy + 20 - sh; y < gy + 20; y += 18) strokeLine(ctx, sx, y, sx + sw, y, ctx.strokeStyle, 2);
      fillRect(ctx, sx - 12, gy + 20 - sh - 50, sw + 24, 54, lit(env, '#7a4a22')); // false front
      fillRect(ctx, sx - 12, gy + 20 - sh - 50, sw + 24, 8, lit(env, '#5a3d22'));
      signBoard(ctx, env, sx + 70, gy + 20 - sh - 42, sw - 140, 40, 'SALOON', '#3b2a1a', '#f5e6c8', 'bold 28px Georgia, serif');
      // balcony
      fillRect(ctx, sx + 10, gy + 20 - sh * 0.55, sw - 20, 8, lit(env, '#5a3d22'));
      for (let x = sx + 14; x < sx + sw - 10; x += 22) fillRect(ctx, x, gy + 20 - sh * 0.55 - 34, 4, 34, lit(env, '#5a3d22'));
      fillRect(ctx, sx + 10, gy + 20 - sh * 0.55 - 36, sw - 20, 4, lit(env, '#5a3d22'));
      [sx + 50, sx + 250].forEach((wx) => { fillRect(ctx, wx, gy + 20 - sh * 0.92, 60, 60, lit(env, '#6ea8c8')); strokeLine(ctx, wx + 30, gy + 20 - sh * 0.92, wx + 30, gy + 20 - sh * 0.92 + 60, '#5a3d22', 3); });
      // awning posts
      fillRect(ctx, sx + 20, gy + 20 - sh * 0.5, 8, sh * 0.5, lit(env, '#5a3d22')); fillRect(ctx, sx + sw - 28, gy + 20 - sh * 0.5, 8, sh * 0.5, lit(env, '#5a3d22'));
      // swing doors
      const dx = sx + sw / 2, dy = gy + 20; const sw2 = Math.sin(env.t * 2) * 6;
      fillRect(ctx, dx - 42, dy - 120, 84, 120, lit(env, '#3a2510'));
      [[-1, sw2], [1, -sw2]].forEach(([d, o]) => { ctx.fillStyle = lit(env, '#8b5a2b'); fillRect(ctx, dx + (d < 0 ? -40 + o : 2 - o), dy - 95, 38, 55, ctx.fillStyle); ctx.strokeStyle = rgba('#000', 0.25); ctx.lineWidth = 1.5; for (let i = 1; i < 4; i++) strokeLine(ctx, dx + (d < 0 ? -40 + o : 2 - o) + i * 9, dy - 95, dx + (d < 0 ? -40 + o : 2 - o) + i * 9, dy - 40, ctx.strokeStyle, 1.5); });
      // hitching post + horse silhouette
      fillRect(ctx, sx - 110, gy + 40, 6, 50, lit(env, '#5a3d22')); fillRect(ctx, sx - 30, gy + 40, 6, 50, lit(env, '#5a3d22')); fillRect(ctx, sx - 112, gy + 42, 90, 6, lit(env, '#5a3d22'));
      const hx = sx - 170, hy = gy + 40, hc = lit(env, '#5b3b2a');
      fillRound(ctx, hx - 60, hy - 80, 110, 46, 20, hc); fillRound(ctx, hx + 30, hy - 120, 26, 70, 10, hc); fillRound(ctx, hx + 36, hy - 128, 44, 22, 8, hc);
      [[-50, 0], [-30, 0], [20, 0], [38, 0]].forEach(([ox]) => fillRect(ctx, hx + ox, hy - 40, 9, 40, hc));
      ctx.strokeStyle = hc; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx - 58, hy - 70); ctx.quadraticCurveTo(hx - 80, hy - 50, hx - 72, hy - 20); ctx.stroke();
      // cactus
      cactus(ctx, env, 90, gy + 160, 130); cactus(ctx, env, 1230, gy + 120, 100);
      // tumbleweed
      const tx = ((env.t * 90) % (W + 200)) - 100, ty = gy + 150 + Math.abs(Math.sin(env.t * 5)) * -12;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(env.t * 3); ctx.strokeStyle = lit(env, '#a8824a'); ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.cos(a + 0.6) * 20, Math.sin(a + 0.6) * 20, Math.cos(a) * 26, Math.sin(a) * 26); ctx.stroke(); }
      circle(ctx, 0, 0, 24); ctx.stroke(); ctx.restore();
      // dust haze
      ctx.fillStyle = linGrad(ctx, 0, gy, 0, gy + 80, [[0, rgba('#e0b066', 0.35)], [1, rgba('#e0b066', 0)]]); ctx.fillRect(0, gy, W, 80);
    },
  },
  // ---------------------------------------------------------------- MEDIEVAL MARKET
  {
    id: 'medieval_market', name: 'Medieval Village Market', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env; const gy = H * 0.66;
      sky(ctx, env, { horizon: gy, sunX: W * 0.25, sunY: H * 0.14, cloudCount: 4 });
      hills(ctx, env, gy - 90, '#6a9a5a', 5, 80, 3, 0.45);
      // castle far on a hill
      const cx = 1050, cy = gy - 120; const castle = mixColor(lit(env, '#9a9aa8'), todOf(env).haze, 0.35);
      fillRect(ctx, cx - 90, cy - 60, 180, 60, castle);
      [[-90, 110], [90, 110], [0, 140]].forEach(([ox, h]) => { fillRect(ctx, cx + ox - 22, cy - h, 44, h, castle); for (let i = -2; i <= 2; i += 2) fillRect(ctx, cx + ox + i * 12 - 5, cy - h - 10, 10, 10, castle); fillPoly(ctx, [[cx + ox - 26, cy - h - 10], [cx + ox, cy - h - 44], [cx + ox + 26, cy - h - 10]], mixColor(lit(env, '#8e1b2a'), todOf(env).haze, 0.35)); });
      for (let i = -3; i <= 3; i += 2) fillRect(ctx, cx + i * 20 - 5, cy - 70, 10, 10, castle);
      hills(ctx, env, gy - 20, '#5f8f4f', 6, 50, 3, 0.2);
      // half-timbered houses row
      const houseT = (x, w, h, c) => {
        const base = gy + 12; const wc = lit(env, c), beam = lit(env, '#5a3a22');
        fillRect(ctx, x, base - h, w, h, wc);
        fillRect(ctx, x, base - h, w, h * 0.45, lit(env, shade(c, -0.08)));
        ctx.strokeStyle = beam; ctx.lineWidth = 6; ctx.strokeRect(x + 3, base - h + 3, w - 6, h - 6);
        strokeLine(ctx, x, base - h * 0.55, x + w, base - h * 0.55, beam, 6);
        strokeLine(ctx, x + 4, base - h * 0.55, x + w * 0.4, base - h + 4, beam, 5); strokeLine(ctx, x + w - 4, base - h * 0.55, x + w * 0.6, base - h + 4, beam, 5);
        fillPoly(ctx, [[x - 14, base - h], [x + w / 2, base - h - w * 0.45], [x + w + 14, base - h]], lit(env, '#7a4a2a'));
        fillRect(ctx, x + w * 0.2, base - h * 0.85, w * 0.2, h * 0.22, lit(env, '#8ec8f2')); fillRect(ctx, x + w * 0.6, base - h * 0.85, w * 0.2, h * 0.22, lit(env, '#8ec8f2'));
        fillRound(ctx, x + w * 0.42, base - h * 0.42, w * 0.18, h * 0.42, 6, beam);
      };
      houseT(40, 220, 230, '#f0e2c8'); houseT(290, 180, 200, '#e8d4b0'); houseT(500, 240, 250, '#f3e9d2'); houseT(780, 200, 210, '#ead9b8'); houseT(1010, 250, 240, '#f0e2c8');
      // cobblestone ground
      ctx.fillStyle = linGrad(ctx, 0, gy + 12, 0, H, [[0, lit(env, '#a89a88')], [1, lit(env, '#6f655a')]]); ctx.fillRect(0, gy + 12, W, H - gy - 12);
      const r = rng(hash('cobble' + env.seed));
      for (let row = 0; row < 9; row++) { const yy = gy + 24 + row * row * 5 + row * 10, s = 14 + row * 4; for (let x = -10 + (row % 2) * s; x < W; x += s * 1.9) { ctx.fillStyle = rgba(r() > 0.5 ? '#000' : '#fff', 0.08); ellipse(ctx, x, yy, s * 0.8, s * 0.35); ctx.fill(); } }
      // bunting + lanterns across
      bunting(ctx, env, 60, 150, 620, 170, ['#8e1b2a', '#c9a227', '#1b3f8e', '#2f7d3a']); bunting(ctx, env, 660, 170, 1220, 150, ['#8e1b2a', '#c9a227', '#1b3f8e', '#2f7d3a']);
      [330, 640, 950].forEach((lx, i) => { strokeLine(ctx, lx, 0, lx, 70, '#333', 2); fillRound(ctx, lx - 10, 70, 20, 28, 4, '#5a3a22'); fillRect(ctx, lx - 7, 74, 14, 20, env.tod === 'night' ? '#ffd27a' : '#f5e6a8'); if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, lx, 84, 0, 90, [[0, 'rgba(255,210,120,0.4)'], [1, 'rgba(255,210,120,0)']]); circle(ctx, lx, 84, 90); ctx.fill(); } });
      // market stalls
      const stall = (x, y, w, c1, c2, goods) => {
        groundShadow(ctx, x + w / 2, y + 4, w * 0.55, 12, 0.25);
        fillRect(ctx, x + 8, y - 70, 8, 70, lit(env, '#6b4a2b')); fillRect(ctx, x + w - 16, y - 70, 8, 70, lit(env, '#6b4a2b'));
        fillRect(ctx, x, y - 76, w, 12, lit(env, '#8b5a2b'));
        fillRect(ctx, x + 10, y - 64, w - 20, 50, lit(env, '#a0703a'));
        fillRect(ctx, x + 12, y - 150, 5, 80, lit(env, '#6b4a2b')); fillRect(ctx, x + w - 17, y - 150, 5, 80, lit(env, '#6b4a2b'));
        const stripes = Math.floor(w / 24);
        for (let i = 0; i < stripes; i++) { fillPoly(ctx, [[x - 10 + i * (w + 20) / stripes, y - 150], [x - 10 + (i + 1) * (w + 20) / stripes, y - 150], [x - 10 + (i + 1) * (w + 20) / stripes, y - 125 + (i % 2) * 6], [x - 10 + i * (w + 20) / stripes, y - 125 + ((i + 1) % 2) * 6]], lit(env, i % 2 ? c1 : c2)); }
        fillPoly(ctx, [[x - 14, y - 150], [x + w / 2, y - 175], [x + w + 14, y - 150]], lit(env, c1));
        goods.forEach(([gx, gc, kind], i) => {
          const bx = x + gx, by = y - 76;
          fillPoly(ctx, [[bx - 26, by - 22], [bx + 26, by - 22], [bx + 20, by], [bx - 20, by]], lit(env, '#c89a5a'));
          ctx.strokeStyle = rgba('#000', 0.2); ctx.lineWidth = 1.5; for (let k = -2; k <= 2; k++) strokeLine(ctx, bx + k * 9, by - 22, bx + k * 7, by, ctx.strokeStyle, 1.5);
          if (kind === 'bread') { for (let k = 0; k < 3; k++) fillEllipse(ctx, bx - 12 + k * 12, by - 26 - (k % 2) * 6, 13, 7, lit(env, '#d9a25a'), -0.4); }
          else { for (let k = 0; k < 7; k++) fillCircle(ctx, bx - 16 + (k % 4) * 11 + (k > 3 ? 5 : 0), by - 26 - (k > 3 ? 8 : 0), 6, lit(env, gc)); }
        });
      };
      stall(60, gy + 70, 260, '#c0392b', '#f5f1e8', [[60, '#e74c3c'], [140, '#f39c12'], [210, '#2ecc71']]);
      stall(960, gy + 76, 260, '#1b3f8e', '#f5f1e8', [[60, '#d9a25a', 'bread'], [140, '#8e44ad'], [210, '#d9a25a', 'bread']]);
      stall(510, gy + 40, 240, '#2f7d3a', '#f5f1e8', [[50, '#e74c3c'], [120, '#d9a25a', 'bread'], [190, '#f1c40f']]);
      // barrel + crate sides
      fillRound(ctx, 20, gy + 110, 50, 60, 8, lit(env, '#7a4a22')); fillRect(ctx, 18, gy + 124, 54, 5, '#444'); fillRect(ctx, 18, gy + 150, 54, 5, '#444');
      fillRect(ctx, 1210, gy + 120, 56, 46, lit(env, '#a0703a')); ctx.strokeStyle = lit(env, '#5a3a22'); ctx.lineWidth = 3; ctx.strokeRect(1210, gy + 120, 56, 46); strokeLine(ctx, 1210, gy + 120, 1266, gy + 166, ctx.strokeStyle, 2);
    },
  },
  // ---------------------------------------------------------------- CRYSTAL CAVE
  {
    id: 'crystal_cave', name: 'Mystical Cave', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const fy = H * 0.7;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, H, [[0, '#07050f'], [0.5, '#14102a'], [1, '#0c0a1a']]); ctx.fillRect(0, 0, W, H);
      // back glow
      ctx.fillStyle = radGrad(ctx, W * 0.55, fy - 60, 0, 420, [[0, 'rgba(90,200,255,0.22)'], [0.5, 'rgba(140,80,220,0.12)'], [1, 'rgba(0,0,0,0)']]); circle(ctx, W * 0.55, fy - 60, 420); ctx.fill();
      // rock walls left / right
      const rockC = '#2a2340';
      ctx.fillStyle = linGrad(ctx, 0, 0, 320, 0, [[0, '#1a1530'], [1, rockC]]);
      curve(ctx, [[-10, -10], [260, -10], [300, 120], [240, 260], [330, 400], [260, 560], [-10, H + 10]], true); ctx.fill();
      ctx.fillStyle = linGrad(ctx, W, 0, W - 320, 0, [[0, '#1a1530'], [1, rockC]]);
      curve(ctx, [[W + 10, -10], [W - 230, -10], [W - 300, 140], [W - 220, 300], [W - 320, 440], [W - 240, 580], [W + 10, H + 10]], true); ctx.fill();
      ctx.strokeStyle = rgba('#8a7ab8', 0.25); ctx.lineWidth = 2; curve(ctx, [[260, -10], [300, 120], [240, 260], [330, 400], [260, 560]], false); ctx.stroke(); curve(ctx, [[W - 230, -10], [W - 300, 140], [W - 220, 300], [W - 320, 440], [W - 240, 580]], false); ctx.stroke();
      // stalactites
      const r = rng(hash('stal' + env.seed));
      for (let i = 0; i < 14; i++) { const x = 200 + i * 70 + r() * 30, h = 40 + r() * 120, w = 16 + r() * 24; ctx.fillStyle = linGrad(ctx, x - w, 0, x + w, 0, [[0, '#1c1730'], [0.5, '#3a3058'], [1, '#1c1730']]); fillPoly(ctx, [[x - w, -2], [x + w, -2], [x, h]], ctx.fillStyle); if (r() > 0.6) fillCircle(ctx, x, h + 2 + ((env.t * 30 + i * 40) % 90), 2, 'rgba(160,220,255,0.7)'); }
      // floor
      ctx.fillStyle = linGrad(ctx, 0, fy, 0, H, [[0, '#2d2546'], [1, '#161226']]); ctx.beginPath(); ctx.moveTo(0, fy + 8); for (let x = 0; x <= W; x += 100) ctx.quadraticCurveTo(x + 50, fy - 6, x + 100, fy + 8); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      // underground pool (right)
      const px = 1020, py = fy + 150;
      fillEllipse(ctx, px, py, 220, 48, '#0d1a3a');
      ctx.fillStyle = radGrad(ctx, px, py, 0, 200, [[0, 'rgba(80,200,255,0.35)'], [1, 'rgba(80,200,255,0)']]); ellipse(ctx, px, py, 220, 48); ctx.fill();
      ctx.strokeStyle = rgba('#9ad8ff', 0.4); ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { const rr = 30 + ((env.t * 25 + i * 45) % 180); ellipse(ctx, px - 40, py + 6, rr, rr * 0.22); ctx.stroke(); }
      // stalagmites + crystal clusters
      const stalag = (x, h, w) => { ctx.fillStyle = linGrad(ctx, x - w, 0, x + w, 0, [[0, '#1c1730'], [0.45, '#403560'], [1, '#1c1730']]); fillPoly(ctx, [[x - w, fy + 10], [x, fy + 10 - h], [x + w, fy + 10]], ctx.fillStyle); };
      stalag(380, 110, 22); stalag(430, 60, 14); stalag(880, 90, 18); stalag(150, 150, 30); stalag(1150, 120, 26);
      crystal(ctx, env, 300, fy + 12, 130, 36, '#4ad8ff', 0, -0.25); crystal(ctx, env, 340, fy + 14, 90, 28, '#9b6bff', 1.2, 0.15); crystal(ctx, env, 270, fy + 16, 70, 22, '#ff6bd6', 2.3, -0.5);
      crystal(ctx, env, 960, fy + 10, 150, 40, '#9b6bff', 0.7, 0.2); crystal(ctx, env, 1010, fy + 12, 100, 30, '#4ad8ff', 1.9, -0.1); crystal(ctx, env, 920, fy + 16, 80, 24, '#ff6bd6', 3.1, 0.5);
      crystal(ctx, env, 600, fy - 10, 70, 22, '#4ad8ff', 2.6, 0.1); crystal(ctx, env, 700, fy - 6, 56, 18, '#ff6bd6', 0.4, -0.2);
      crystal(ctx, env, 140, fy + 120, 90, 28, '#9b6bff', 1.5, 0.3); crystal(ctx, env, 1200, fy + 160, 110, 32, '#4ad8ff', 2.2, -0.3);
      // wall crystals high up
      crystal(ctx, env, 120, 260, 70, 22, '#4ad8ff', 0.9, 1.6); crystal(ctx, env, W - 130, 300, 80, 24, '#ff6bd6', 1.7, -1.6);
      // floating sparkles
      for (let i = 0; i < 30; i++) { const x = (i * 97 + Math.sin(env.t * 0.7 + i) * 25) % W, y = (i * 61 + env.t * -12 + 1000) % H; ctx.fillStyle = `rgba(200,240,255,${0.3 + 0.5 * Math.abs(Math.sin(env.t * 3 + i))})`; circle(ctx, x, y, 1.5 + (i % 3) * 0.6); ctx.fill(); }
      ctx.fillStyle = radGrad(ctx, W / 2, fy, 0, W * 0.65, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.55)']]); ctx.fillRect(0, 0, W, H);
    },
  },
];
