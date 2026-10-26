// Daily Life & Residential scenes
import {
  sky, ground, hills, lit, todOf, wall, floor, rug, windowInterior, windowPane, sofa, table, chair, shelf, tv,
  lamp, plantPot, bed, pictureFrame, counter, fridge, stove, desk, monitor, fire, treeRound, bush, fence,
  house, door, dirtPath, skyline, vignette, grassTufts, flowerPatch, dustMotes, stars,
  TAU, lerp, shade, rgba, rng, hash, roundRect, ellipse, circle, fillRect, fillRound, fillEllipse, fillCircle,
  fillPoly, strokeLine, linGrad, radGrad, groundShadow, mixColor,
} from '../scenery.js';

const CAT = 'Daily Life & Residential';
const nightShade = (env) => (env.tod === 'night' ? -0.3 : 0);

function toy(ctx, x, y, kind, color) {
  if (kind === 'ball') { fillCircle(ctx, x, y - 10, 10, color); fillEllipse(ctx, x - 3, y - 13, 3, 5, rgba('#fff', 0.5), -0.6); }
  else if (kind === 'block') { fillRound(ctx, x - 10, y - 20, 20, 20, 3, color); fillRect(ctx, x - 4, y - 14, 8, 8, rgba('#fff', 0.5)); }
  else if (kind === 'car') { fillRound(ctx, x - 16, y - 14, 32, 10, 3, color); fillRound(ctx, x - 8, y - 20, 16, 8, 3, shade(color, -0.2)); fillCircle(ctx, x - 9, y - 3, 4, '#222'); fillCircle(ctx, x + 9, y - 3, 4, '#222'); }
  else if (kind === 'bear') { fillCircle(ctx, x, y - 10, 10, color); fillCircle(ctx, x, y - 24, 8, color); fillCircle(ctx, x - 6, y - 30, 3, color); fillCircle(ctx, x + 6, y - 30, 3, color); fillCircle(ctx, x - 3, y - 25, 1.2, '#222'); fillCircle(ctx, x + 3, y - 25, 1.2, '#222'); }
}

export default [
  {
    id: 'house_exterior', name: 'Bungalow / House Exterior', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.6, sunX: W * 0.2 });
      hills(ctx, env, H * 0.6, '#7fb86a', 2, 70, 3, 0.45);
      ground(ctx, env, H * 0.6, '#79b858', '#3f7a2d');
      // trees in the back
      treeRound(ctx, env, 90, H * 0.66, 170, 1);
      treeRound(ctx, env, W - 70, H * 0.65, 150, 2, '#4a9a3c');
      // the house (right side)
      const hx = W * 0.52, hy = H * 0.66, hw = 400, hh = 190;
      house(ctx, env, hx, hy, hw, hh, { wall: '#f6e9d2', roof: '#a8443a', roofH: 90 });
      // porch roof + posts
      const px = hx - 30, pw = hw * 0.6, py = hy - hh * 0.62;
      fillRect(ctx, px, py, pw, 14, lit(env, '#8a4a3c'));
      fillPoly(ctx, [[px - 10, py + 14], [px + pw + 10, py + 14], [px + pw, py + 2], [px, py + 2]], lit(env, '#7a3a2c'));
      fillRect(ctx, px + 10, py + 14, 10, hy - py - 14, lit(env, '#f5f1e8'));
      fillRect(ctx, px + pw - 20, py + 14, 10, hy - py - 14, lit(env, '#f5f1e8'));
      // railing
      fillRect(ctx, px + 10, hy - 60, pw - 20, 6, lit(env, '#f5f1e8'));
      for (let rx = px + 30; rx < px + pw - 24; rx += 22) fillRect(ctx, rx, hy - 56, 4, 44, lit(env, '#f5f1e8'));
      // porch floor + steps
      fillRect(ctx, px, hy - 12, pw, 12, lit(env, '#b48a5a'));
      fillRect(ctx, px + pw * 0.3, hy, pw * 0.4, 10, lit(env, '#a67c4f'));
      fillRect(ctx, px + pw * 0.27, hy + 10, pw * 0.46, 10, lit(env, '#97703f'));
      fillRect(ctx, px + pw * 0.24, hy + 20, pw * 0.52, 10, lit(env, '#8a6535'));
      // pathway
      dirtPath(ctx, env, hx + hw * 0.3, 120, hy + 30, W * 0.36, 260, H, '#c9b79a');
      const r = rng(hash('stones' + env.seed));
      for (let i = 0; i < 14; i++) {
        const tt = i / 14; const yy = lerp(hy + 36, H - 10, tt); const xx = lerp(hx + hw * 0.3, W * 0.36, tt) + (r() - 0.5) * 70 * (0.3 + tt);
        fillEllipse(ctx, xx, yy, 14 + 18 * tt, 6 + 9 * tt, lit(env, i % 2 ? '#b5a58b' : '#a99a80'));
      }
      // fence left and right
      fence(ctx, env, 0, W * 0.33, H * 0.72, 46);
      fence(ctx, env, W * 0.9, W, H * 0.72, 46);
      // bushes, flowers, mailbox
      bush(ctx, env, hx - 40, hy + 8, 60, '#3f8f3a');
      bush(ctx, env, hx + hw + 30, hy + 10, 70, '#4a9a46');
      bush(ctx, env, W * 0.12, H * 0.76, 56, '#3c8a3a');
      flowerPatch(ctx, env, H * 0.72, H * 0.78, 18, 2);
      // mailbox
      fillRect(ctx, W * 0.26, H * 0.72, 6, 60, lit(env, '#5a3b22'));
      fillRound(ctx, W * 0.24, H * 0.7, 44, 22, 8, lit(env, '#2c5aa0'));
      fillRect(ctx, W * 0.265, H * 0.66, 3, 10, lit(env, '#c0392b'));
      grassTufts(ctx, env, H * 0.72, H * 0.98, 60, '#4f9a3a', 3);
      vignette(ctx, env, 0.25);
    },
  },
  {
    id: 'living_room', name: 'Cozy Living Room', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const fy = H * 0.7;
      wall(ctx, env, '#e9d9c0', { floorY: fy, wainscot: true });
      floor(ctx, env, fy, 'wood', '#a9784c');
      // window
      windowInterior(ctx, env, W * 0.08, 70, 230, 200, { curtain: '#c0634f' });
      // fireplace (centre back wall)
      const fx = W * 0.42, fw = 220, fh = 190;
      fillRect(ctx, fx - 12, fy - fh - 14, fw + 24, fh + 14, shade('#9a7a62', nightShade(env)));
      ctx.fillStyle = shade('#7d5f4a', nightShade(env));
      for (let by = fy - fh; by < fy; by += 18) for (let bx = fx - 12 + ((by / 18) % 2) * 20; bx < fx + fw + 12; bx += 40) { roundRect(ctx, bx, by, 36, 14, 2); ctx.fill(); }
      fillRect(ctx, fx - 20, fy - fh - 24, fw + 40, 14, shade('#5a3b22', nightShade(env)));
      fillRect(ctx, fx + 30, fy - fh + 40, fw - 60, fh - 40, '#1d1410');
      fillRect(ctx, fx + 40, fy - 20, fw - 80, 10, '#3b2a20');
      fillEllipse(ctx, fx + fw / 2 - 20, fy - 22, 22, 8, '#5a3a24'); fillEllipse(ctx, fx + fw / 2 + 18, fy - 22, 22, 8, '#6a4530');
      fire(ctx, env, fx + fw / 2, fy - 24, 42, 1);
      // mantel decorations
      pictureFrame(ctx, env, fx + fw / 2 - 45, fy - fh - 110, 90, 70, 1);
      fillRect(ctx, fx + 20, fy - fh - 52, 14, 28, '#9ad1c9'); fillRect(ctx, fx + fw - 40, fy - fh - 44, 20, 20, '#e0b36c');
      if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, fx + fw / 2, fy - 40, 0, 320, [[0, 'rgba(255,160,70,0.28)'], [1, 'rgba(255,160,70,0)']]); circle(ctx, fx + fw / 2, fy - 40, 320); ctx.fill(); }
      // shelf + lamp + plant
      shelf(ctx, env, W * 0.87, fy, 150, 250, '#7a5230', 3);
      lamp(ctx, env, W * 0.34, fy, 160);
      plantPot(ctx, env, W * 0.05, fy, 90);
      // rug, sofa (left), tv on a stand (right)
      rug(ctx, env, W * 0.5, fy + 70, 620, 90, '#b8503c');
      sofa(ctx, env, W * 0.08, fy + 36, 300, 110, '#4f6d9a');
      fillRect(ctx, W * 0.66, fy - 2, 190, 48, shade('#5a3b22', nightShade(env)));
      fillRect(ctx, W * 0.66 + 10, fy + 10, 60, 24, shade('#4a2b12', nightShade(env))); fillRect(ctx, W * 0.66 + 120, fy + 10, 60, 24, shade('#4a2b12', nightShade(env)));
      tv(ctx, env, W * 0.66, fy - 2, 190, 115, true);
      // cushions and a cup
      fillRound(ctx, W * 0.08 + 30, fy - 48, 44, 34, 8, '#e9b949');
      fillRound(ctx, W * 0.08 + 220, fy - 48, 44, 34, 8, '#d94f4f');
      fillRound(ctx, W * 0.33, fy - 10, 12, 12, 3, '#fff');
      if (env.tod !== 'night') dustMotes(ctx, env, 16, 1);
      vignette(ctx, env, 0.28);
    },
  },
  {
    id: 'kitchen', name: 'Kitchen & Dining', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const fy = H * 0.7; const ns = nightShade(env);
      wall(ctx, env, '#e4ecef', { floorY: fy });
      // backsplash tiles
      ctx.fillStyle = shade('#cfe1ea', ns);
      for (let ty = fy - 190; ty < fy - 100; ty += 22) for (let tx = 0; tx < W * 0.62; tx += 22) { roundRect(ctx, tx + 1, ty + 1, 20, 20, 2); ctx.fill(); }
      floor(ctx, env, fy, 'tile', '#e2dbd0');
      // upper cabinets
      for (let cx = 0; cx < W * 0.44; cx += 90) {
        fillRound(ctx, cx + 4, 40, 84, 140, 3, shade('#c5a471', ns));
        fillRound(ctx, cx + 12, 48, 68, 124, 2, shade('#d4b480', ns));
        fillRect(ctx, cx + 70, 100, 4, 24, '#444');
      }
      // window over sink
      windowInterior(ctx, env, W * 0.46, 50, 180, 130, { curtain: '#9ab77a' });
      // counter with sink + stove + fridge
      counter(ctx, env, 0, fy, W * 0.42, 95, '#c9a874', '#5f6670');
      fillRound(ctx, W * 0.18, fy - 108, 110, 14, 4, '#9aa3ad'); fillRound(ctx, W * 0.2, fy - 106, 86, 8, 3, '#7c858f');
      fillRect(ctx, W * 0.235, fy - 150, 5, 44, '#8a949e'); fillRound(ctx, W * 0.235, fy - 152, 30, 6, 3, '#8a949e');
      stove(ctx, env, W * 0.43, fy, 130, 95, env.tod === 'night');
      fridge(ctx, env, W * 0.56, fy, 96, 220, '#dfe6ee');
      // hanging pans
      for (let i = 0; i < 3; i++) { const px = W * 0.1 + i * 50; strokeLine(ctx, px, 182, px, 200, '#555', 2); fillCircle(ctx, px, 212, 13, shade('#8d939b', ns)); fillCircle(ctx, px, 212, 9, shade('#6d737b', ns)); }
      // dining table + chairs (right)
      const tx = W * 0.72, tw = 300;
      chair(ctx, env, tx - 40, fy + 50, 50, 100, '#8b5a2b', 1);
      chair(ctx, env, tx + tw + 50, fy + 50, 50, 100, '#8b5a2b', -1);
      table(ctx, env, tx, fy + 60, tw, 76, '#8b5a2b', '#c7925a');
      fillEllipse(ctx, tx + 70, fy - 16, 26, 9, '#fff'); fillEllipse(ctx, tx + 70, fy - 17, 16, 5, '#f4d35e');
      fillEllipse(ctx, tx + tw - 70, fy - 16, 26, 9, '#fff'); fillEllipse(ctx, tx + tw - 70, fy - 17, 16, 5, '#e76f51');
      fillRect(ctx, tx + tw / 2 - 8, fy - 46, 16, 30, '#cfe8f3'); fillEllipse(ctx, tx + tw / 2, fy - 46, 8, 3, '#e8f4f8');
      fillRound(ctx, tx + tw / 2 - 40, fy - 36, 24, 20, 4, '#3a86ff');
      // fruit bowl
      fillEllipse(ctx, tx + tw / 2 + 50, fy - 18, 24, 8, '#8d5a3a'); fillCircle(ctx, tx + tw / 2 + 42, fy - 26, 7, '#e63946'); fillCircle(ctx, tx + tw / 2 + 58, fy - 26, 7, '#f4a261'); fillCircle(ctx, tx + tw / 2 + 50, fy - 32, 7, '#80b918');
      if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, W * 0.5, 40, 0, 340, [[0, 'rgba(255,230,170,0.35)'], [1, 'rgba(255,230,170,0)']]); circle(ctx, W * 0.5, 40, 340); ctx.fill(); }
      vignette(ctx, env, 0.25);
    },
  },
  {
    id: 'kids_bedroom', name: "Kid's Bedroom", category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const fy = H * 0.7; const ns = nightShade(env);
      wall(ctx, env, '#bfe3f1', { floorY: fy });
      // star stickers
      const r = rng(hash('stars_room' + env.seed));
      for (let i = 0; i < 28; i++) {
        const sx = r() * W, sy = r() * (fy - 200), s = 5 + r() * 7;
        ctx.fillStyle = env.tod === 'night' ? `rgba(255,245,160,${0.6 + 0.4 * Math.sin(env.t * 2 + i)})` : shade('#f7e27a', ns);
        ctx.beginPath();
        for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k / 10) * TAU; const rr = k % 2 ? s * 0.45 : s; ctx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
        ctx.closePath(); ctx.fill();
      }
      floor(ctx, env, fy, 'carpet', '#8fb7d9');
      // posters
      fillRound(ctx, W * 0.37, 70, 120, 150, 4, shade('#2d3561', ns)); fillCircle(ctx, W * 0.37 + 60, 130, 32, shade('#f6c343', ns)); fillPoly(ctx, [[W * 0.37 + 20, 200], [W * 0.37 + 60, 150], [W * 0.37 + 100, 200]], shade('#e05263', ns));
      fillRound(ctx, W * 0.52, 90, 110, 110, 4, shade('#f9f1e1', ns)); fillRound(ctx, W * 0.52 + 20, 120, 70, 50, 10, shade('#4fa3e0', ns)); fillCircle(ctx, W * 0.52 + 36, 140, 7, '#fff'); fillCircle(ctx, W * 0.52 + 74, 140, 7, '#fff'); fillCircle(ctx, W * 0.52 + 36, 140, 3, '#222'); fillCircle(ctx, W * 0.52 + 74, 140, 3, '#222');
      // window
      windowInterior(ctx, env, W * 0.74, 60, 200, 160, { curtain: '#f4a261' });
      // bed (left)
      bed(ctx, env, W * 0.03, fy + 30, 320, 90, '#e9573f');
      ctx.fillStyle = rgba('#fff', 0.35); for (let i = 0; i < 5; i++) fillCircle(ctx, W * 0.03 + 110 + i * 40, fy - 34, 9, ctx.fillStyle);
      // toy box
      fillRound(ctx, W * 0.33, fy - 10, 110, 60, 5, shade('#e76f51', ns)); fillRound(ctx, W * 0.33 - 6, fy - 20, 122, 16, 4, shade('#d1495b', ns));
      toy(ctx, W * 0.33 + 25, fy - 18, 'ball', '#2a9d8f'); toy(ctx, W * 0.33 + 60, fy - 18, 'bear', '#c99a6b'); toy(ctx, W * 0.33 + 90, fy - 18, 'block', '#ffb703');
      // desk + lamp + monitor (right)
      desk(ctx, env, W * 0.74, fy + 20, 190, 80, '#d8c3a0');
      monitor(ctx, env, W * 0.76, fy - 70, 70, 50, true);
      lamp(ctx, env, W * 0.87, fy - 70, 60, env.tod === 'night');
      chair(ctx, env, W * 0.735, fy + 70, 46, 95, '#3d5a80', -1);
      fillRect(ctx, W * 0.77, fy - 66, 30, 20, '#fff'); fillRect(ctx, W * 0.772, fy - 62, 26, 2, '#999'); fillRect(ctx, W * 0.772, fy - 56, 20, 2, '#999');
      // toys on the floor
      toy(ctx, W * 0.6, fy + 60, 'car', '#e63946');
      toy(ctx, W * 0.52, fy + 95, 'block', '#06d6a0');
      toy(ctx, W * 0.66, fy + 100, 'ball', '#ffd166');
      if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, W * 0.86, fy - 110, 0, 220, [[0, 'rgba(255,220,150,0.3)'], [1, 'rgba(255,220,150,0)']]); circle(ctx, W * 0.86, fy - 110, 220); ctx.fill(); }
      vignette(ctx, env, 0.22);
    },
  },
  {
    id: 'bathroom', name: 'Modern Bathroom', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H } = env; const fy = H * 0.7; const ns = nightShade(env); const p = todOf(env);
      wall(ctx, env, '#dbe9ee', { floorY: fy });
      ctx.fillStyle = rgba('#fff', 0.35); for (let ty = 0; ty < fy; ty += 40) for (let tx = ((ty / 40) % 2) * 40; tx < W; tx += 80) ctx.fillRect(tx, ty, 38, 38);
      fillRect(ctx, 0, fy - 150, W, 10, shade('#3a9ad9', ns));
      floor(ctx, env, fy, 'tile', '#f2f3f5');
      // shower (left) with glass panel
      fillRect(ctx, 20, fy - 10, 240, 10, shade('#cfd8dc', ns));
      fillRect(ctx, 130, 40, 8, 60, '#9aa5ad'); fillRound(ctx, 100, 96, 70, 14, 5, '#9aa5ad');
      ctx.strokeStyle = rgba('#8bc4e8', 0.6); ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) strokeLine(ctx, 108 + i * 8, 112, 104 + i * 8, fy - 20, rgba('#8bc4e8', 0.35), 1.5);
      ctx.fillStyle = rgba('#bfe4f6', 0.3); ctx.fillRect(250, 30, 14, fy - 40); fillRect(ctx, 262, 30, 4, fy - 40, '#aab7bf');
      fillRect(ctx, 20, fy - 30, 230, 20, shade('#e8eef0', ns));
      // bathtub (center back)
      const bx = W * 0.4, bw = 320;
      groundShadow(ctx, bx + bw / 2, fy + 2, bw * 0.55, 10, 0.2);
      fillRound(ctx, bx, fy - 110, bw, 110, 24, shade('#f4f6f7', ns));
      fillRound(ctx, bx + 12, fy - 100, bw - 24, 36, 12, shade('#9fd9f0', ns));
      fillRect(ctx, bx + 8, fy - 112, bw - 16, 10, shade('#dfe6ea', ns));
      fillRect(ctx, bx + bw - 40, fy - 150, 6, 40, '#9aa5ad'); fillRound(ctx, bx + bw - 60, fy - 152, 30, 8, 3, '#9aa5ad');
      const rb = rng(hash('bubbles' + env.seed));
      for (let i = 0; i < 18; i++) { const cx = bx + 30 + rb() * (bw - 60), cy = fy - 90 + Math.sin(env.t * 2 + i) * 3 - rb() * 10; fillCircle(ctx, cx, cy, 5 + rb() * 9, rgba('#fff', 0.8)); }
      // rubber duck
      fillEllipse(ctx, bx + 60, fy - 92 + Math.sin(env.t * 2) * 2, 14, 9, '#ffd60a'); fillCircle(ctx, bx + 70, fy - 104 + Math.sin(env.t * 2) * 2, 8, '#ffd60a'); fillPoly(ctx, [[bx + 76, fy - 104], [bx + 86, fy - 102], [bx + 76, fy - 99]], '#fb8500'); fillCircle(ctx, bx + 73, fy - 106, 1.5, '#222');
      // sink + mirror (right)
      const sx = W * 0.8;
      fillRound(ctx, sx - 70, 60, 140, 150, 8, '#cfd8dc');
      ctx.fillStyle = linGrad(ctx, sx - 60, 70, sx + 60, 200, [[0, mixColor(p.skyBot, '#ffffff', 0.4)], [1, mixColor('#b9d6e4', p.skyMid, 0.3)]]); roundRect(ctx, sx - 62, 68, 124, 134, 6); ctx.fill();
      fillPoly(ctx, [[sx - 50, 200], [sx + 10, 68], [sx + 30, 68], [sx - 30, 200]], rgba('#fff', 0.35));
      fillRound(ctx, sx - 80, fy - 100, 160, 100, 6, shade('#f4f6f7', ns));
      fillRound(ctx, sx - 60, fy - 118, 120, 24, 10, shade('#ffffff', ns)); fillEllipse(ctx, sx, fy - 106, 40, 8, shade('#d5e2e8', ns));
      fillRect(ctx, sx - 3, fy - 140, 6, 24, '#9aa5ad'); fillRound(ctx, sx - 3, fy - 146, 24, 6, 3, '#9aa5ad');
      fillRound(ctx, sx - 50, fy - 125, 16, 10, 3, '#fff'); fillRound(ctx, sx + 28, fy - 128, 10, 14, 3, '#3a9ad9');
      // towel rail + towel
      fillRect(ctx, W * 0.66, fy - 200, 70, 5, '#9aa5ad');
      fillRound(ctx, W * 0.67, fy - 198, 54, 90, 4, shade('#f4a261', ns)); fillRect(ctx, W * 0.67, fy - 150, 54, 4, shade('#e76f51', ns));
      // bath mat
      fillRound(ctx, bx + 60, fy + 50, 200, 40, 10, shade('#5fb0d9', ns));
      if (env.tod === 'night') { ctx.fillStyle = radGrad(ctx, W * 0.5, 30, 0, 300, [[0, 'rgba(255,255,230,0.3)'], [1, 'rgba(255,255,230,0)']]); circle(ctx, W * 0.5, 30, 300); ctx.fill(); }
      vignette(ctx, env, 0.2);
    },
  },
  {
    id: 'rooftop_terrace', name: 'Rooftop Terrace', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.56, sunX: W * 0.3, sunY: H * 0.18 });
      skyline(ctx, env, H * 0.56, 5, '#5b6680', 0.4, 280);
      skyline(ctx, env, H * 0.58, 6, '#4a536c', 0.15, 180);
      // parapet wall
      const py = H * 0.6;
      fillRect(ctx, 0, py - 40, W, 40, lit(env, '#b9a893'));
      fillRect(ctx, 0, py - 48, W, 10, lit(env, '#d4c6b2'));
      ctx.strokeStyle = rgba('#000', 0.12); ctx.lineWidth = 2; for (let x = 0; x < W; x += 60) strokeLine(ctx, x, py - 38, x, py, ctx.strokeStyle, 2);
      // concrete floor
      ctx.fillStyle = linGrad(ctx, 0, py, 0, H, [[0, lit(env, '#a7a39c')], [1, lit(env, '#6d6a66')]]); ctx.fillRect(0, py, W, H - py);
      ctx.strokeStyle = rgba('#000', 0.15); for (let i = 0; i <= 10; i++) { const x = (i / 10) * W; strokeLine(ctx, x, py, W / 2 + (x - W / 2) * 1.5, H, ctx.strokeStyle, 1.5); }
      for (let k = 1; k < 5; k++) { const yy = py + (H - py) * (k * k) / 25; strokeLine(ctx, 0, yy, W, yy, ctx.strokeStyle, 1.5); }
      ctx.fillStyle = linGrad(ctx, 0, py, 0, py + 30, [[0, rgba('#000', 0.22)], [1, rgba('#000', 0)]]); ctx.fillRect(0, py, W, 30);
      // water tank (left)
      fillRect(ctx, 70, py - 150, 16, 150, lit(env, '#4a4a55')); fillRect(ctx, 190, py - 150, 16, 150, lit(env, '#4a4a55'));
      fillRound(ctx, 50, py - 230, 180, 100, 20, lit(env, '#2c3e50')); fillEllipse(ctx, 140, py - 230, 90, 14, lit(env, '#34495e'));
      fillRect(ctx, 50, py - 190, 180, 6, lit(env, '#1f2d3a'));
      // satellite dish
      fillRect(ctx, W * 0.86, py - 90, 6, 90, lit(env, '#555'));
      fillEllipse(ctx, W * 0.86 + 10, py - 110, 42, 50, lit(env, '#dfe4ea'), -0.5); fillEllipse(ctx, W * 0.86 + 4, py - 106, 30, 38, lit(env, '#c2c9d1'), -0.5);
      strokeLine(ctx, W * 0.86 + 4, py - 106, W * 0.86 + 40, py - 140, '#555', 3); fillCircle(ctx, W * 0.86 + 40, py - 140, 5, '#333');
      // clothesline between two poles
      const lx1 = W * 0.3, lx2 = W * 0.72, ly = py - 150;
      fillRect(ctx, lx1 - 4, ly - 10, 8, 160, lit(env, '#6b6b70')); fillRect(ctx, lx2 - 4, ly - 10, 8, 160, lit(env, '#6b6b70'));
      ctx.strokeStyle = '#444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx1, ly); ctx.quadraticCurveTo((lx1 + lx2) / 2, ly + 24, lx2, ly); ctx.stroke();
      const cl = [['#e63946', 60, 70], ['#f1faee', 50, 80], ['#457b9d', 55, 60], ['#ffb703', 48, 75], ['#8ecae6', 56, 66]];
      cl.forEach(([c, w, h], i) => {
        const tt = (i + 0.5) / cl.length; const cx = lerp(lx1, lx2, tt), cy = ly + 24 * 4 * tt * (1 - tt);
        const sw = Math.sin(env.t * 1.6 + i) * 6;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(sw * 0.01);
        fillRound(ctx, -w / 2, 4, w, h, 6, lit(env, c));
        if (i % 2 === 0) { fillRect(ctx, -w / 2 - 10, 4, 14, 24, lit(env, c)); fillRect(ctx, w / 2 - 4, 4, 14, 24, lit(env, c)); }
        fillRect(ctx, -w / 2 + 6, 0, 4, 10, '#8a5a2b'); fillRect(ctx, w / 2 - 10, 0, 4, 10, '#8a5a2b');
        ctx.restore();
      });
      // potted plants
      plantPot(ctx, env, W * 0.12, py + 60, 80, '#c0632b', '#3b9a4a');
      plantPot(ctx, env, W * 0.9, py + 70, 70, '#8d5a3a', '#4fa64a');
      plantPot(ctx, env, W * 0.95, py + 30, 50, '#c0632b', '#6fbf4a');
      // small bench
      fillRect(ctx, W * 0.76, py + 20, 120, 10, lit(env, '#8b5a2b')); fillRect(ctx, W * 0.77, py + 30, 8, 30, lit(env, '#6b4a2b')); fillRect(ctx, W * 0.76 + 104, py + 30, 8, 30, lit(env, '#6b4a2b'));
      vignette(ctx, env, 0.22);
    },
  },
  {
    id: 'balcony', name: 'Apartment Balcony', category: CAT, groundY: 0.9, horizonY: 0.68, indoor: false,
    paint(ctx, env) {
      const { W, H } = env;
      sky(ctx, env, { horizon: H * 0.52, sunX: W * 0.75, sunY: H * 0.2 });
      skyline(ctx, env, H * 0.55, 11, '#4e5a78', 0.45, 320);
      skyline(ctx, env, H * 0.58, 12, '#3d4660', 0.2, 220);
      // side walls of the balcony (left wall with sliding door)
      const fy = H * 0.68;
      ctx.fillStyle = linGrad(ctx, 0, 0, 0, fy, [[0, lit(env, '#d9cdb8')], [1, lit(env, '#c9bca6')]]); ctx.fillRect(0, 0, W * 0.22, fy);
      // sliding glass door on the left wall
      fillRect(ctx, 30, 60, 190, fy - 60, lit(env, '#f5f1e8'));
      ctx.fillStyle = env.tod === 'night' ? 'rgba(255,215,140,0.75)' : rgba('#9fd3f5', 0.9); ctx.fillRect(40, 70, 170, fy - 80);
      fillRect(ctx, 122, 70, 6, fy - 80, lit(env, '#f5f1e8')); fillPoly(ctx, [[40, fy - 10], [120, 70], [150, 70], [70, fy - 10]], rgba('#fff', 0.3));
      // railing (behind the actors, at the back of the balcony)
      const ry = H * 0.6;
      fillRect(ctx, W * 0.22, ry - 4, W * 0.78, 8, lit(env, '#3b3f48'));
      for (let x = W * 0.24; x < W; x += 28) fillRect(ctx, x, ry, 4, fy - ry, lit(env, '#4a4f5a'));
      fillRect(ctx, W * 0.22, fy - 12, W * 0.78, 12, lit(env, '#3b3f48'));
      // string lights along the railing top
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(W * 0.22, ry - 10);
      for (let x = W * 0.22; x <= W; x += 120) ctx.quadraticCurveTo(x + 60, ry + 20, x + 120, ry - 10);
      ctx.stroke();
      for (let x = W * 0.22 + 20; x < W; x += 30) {
        const seg = (x - W * 0.22) % 120 / 120; const by = ry - 10 + 30 * 4 * seg * (1 - seg);
        const on = env.tod === 'night' || env.tod === 'sunset';
        if (on) { ctx.fillStyle = radGrad(ctx, x, by + 8, 0, 18, [[0, 'rgba(255,230,150,0.6)'], [1, 'rgba(255,230,150,0)']]); circle(ctx, x, by + 8, 18); ctx.fill(); }
        fillCircle(ctx, x, by + 8, 4, on ? '#fff3c4' : '#e6e2d6');
      }
      // balcony floor
      ctx.fillStyle = linGrad(ctx, 0, fy, 0, H, [[0, lit(env, '#b8ada0')], [1, lit(env, '#7a7268')]]); ctx.fillRect(0, fy, W, H - fy);
      ctx.strokeStyle = rgba('#000', 0.15); for (let i = 0; i <= 12; i++) { const x = (i / 12) * W; strokeLine(ctx, x, fy, W / 2 + (x - W / 2) * 1.5, H, ctx.strokeStyle, 1.5); }
      ctx.fillStyle = linGrad(ctx, 0, fy, 0, fy + 26, [[0, rgba('#000', 0.25)], [1, rgba('#000', 0)]]); ctx.fillRect(0, fy, W, 26);
      // small round table + two chairs (right)
      const tx = W * 0.8, ty = fy + 70;
      chair(ctx, env, tx - 90, ty + 6, 46, 92, '#2f3e46', 1);
      chair(ctx, env, tx + 90, ty + 6, 46, 92, '#2f3e46', -1);
      groundShadow(ctx, tx, ty + 4, 70, 10, 0.2);
      fillRect(ctx, tx - 4, ty - 70, 8, 70, lit(env, '#2f3e46')); fillEllipse(ctx, tx, ty, 26, 7, lit(env, '#2f3e46'));
      fillEllipse(ctx, tx, ty - 72, 64, 16, lit(env, '#e9e4d8')); fillEllipse(ctx, tx, ty - 76, 64, 16, lit(env, '#f7f3ea'));
      fillRect(ctx, tx - 20, ty - 100, 12, 24, '#fff'); fillRect(ctx, tx + 10, ty - 98, 12, 22, '#fff'); fillCircle(ctx, tx - 5, ty - 90, 5, '#e63946');
      // plants
      plantPot(ctx, env, W * 0.3, fy + 40, 90, '#8d5a3a', '#3b9a4a');
      plantPot(ctx, env, W * 0.96, fy + 30, 60, '#c0632b', '#6fbf4a');
      // hanging plant from the top
      fillRect(ctx, W * 0.5, 0, 3, 60, '#555'); fillEllipse(ctx, W * 0.5, 72, 26, 14, lit(env, '#c0632b'));
      for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI; strokeLine(ctx, W * 0.5 + Math.cos(a) * 22, 76, W * 0.5 + Math.cos(a) * 30 + Math.sin(env.t + i) * 3, 110 + i * 6, lit(env, '#4fa64a'), 3); }
      vignette(ctx, env, 0.25);
    },
  },
];
