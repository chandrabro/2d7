// School & Work scenes
import {
  sky, ground, skyline, wall, floor, lit, todOf, signBoard, desk, monitor, chair, shelf, lamp, plantPot,
  windowInterior, fence, treeRound, grassTufts, vignette, dustMotes, text, bed, house,
  TAU, lerp, shade, rgba, rng, hash, roundRect, ellipse, circle, poly, curve, fillRect, fillRound, fillEllipse,
  fillCircle, fillPoly, strokeLine, linGrad, radGrad, groundShadow, mixColor,
} from '../scenery.js';

const CAT = 'School & Work';
const night = (env) => env.tod === 'night';

function ceilingLights(ctx, env, y, count = 4, w = 140, color = '#fff8dc') {
  for (let i = 0; i < count; i++) {
    const x = ((i + 0.5) / count) * env.W;
    fillRound(ctx, x - w / 2, y, w, 10, 4, '#e8e8ee');
    ctx.fillStyle = radGrad(ctx, x, y + 6, 0, w, [[0, rgba(color, 0.3)], [1, rgba(color, 0)]]);
    poly(ctx, [[x - w / 2, y + 8], [x + w / 2, y + 8], [x + w * 1.1, y + 220], [x - w * 1.1, y + 220]]); ctx.fill();
  }
}
function clock(ctx, env, x, y, r = 26) {
  fillCircle(ctx, x, y, r, '#f8f9fa'); ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 3; circle(ctx, x, y, r); ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; fillCircle(ctx, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, 1.5, '#2c3e50'); }
  strokeLine(ctx, x, y, x + Math.cos(env.t * 0.1 - 1.2) * r * 0.5, y + Math.sin(env.t * 0.1 - 1.2) * r * 0.5, '#2c3e50', 3);
  strokeLine(ctx, x, y, x + Math.cos(env.t * 0.6 - 0.3) * r * 0.75, y + Math.sin(env.t * 0.6 - 0.3) * r * 0.75, '#2c3e50', 2);
  strokeLine(ctx, x, y, x + Math.cos(env.t * (TAU / 60) - Math.PI / 2) * r * 0.8, y + Math.sin(env.t * (TAU / 60) - Math.PI / 2) * r * 0.8, '#e74c3c', 1);
}
function swivelChair(ctx, env, x, y, color = '#2c3e50', dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  groundShadow(ctx, 0, 2, 30, 6, 0.2);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; strokeLine(ctx, 0, -8, Math.cos(a) * 26, -8 + Math.sin(a) * 6, '#7f8c8d', 4); fillCircle(ctx, Math.cos(a) * 26, -6 + Math.sin(a) * 6, 4, '#333'); }
  fillRect(ctx, -3, -50, 6, 44, '#7f8c8d');
  fillRound(ctx, -24, -60, 48, 14, 5, color);
  fillRound(ctx, 12, -120, 14, 66, 5, shade(color, -0.1)); fillRound(ctx, 8, -120, 22, 10, 4, shade(color, 0.05));
  ctx.restore();
}
function studentDesk(ctx, env, x, y, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  groundShadow(ctx, 30, 2, 45, 7, 0.18);
  fillRect(ctx, 4, -62, 5, 62, '#7f8c8d'); fillRect(ctx, 56, -62, 5, 62, '#7f8c8d');
  fillRound(ctx, -4, -70, 74, 10, 2, '#c8a97e');
  fillRect(ctx, 2, -60, 60, 14, '#b08d5d');
  // chair behind desk
  fillRect(ctx, 76, -46, 4, 46, '#7f8c8d'); fillRect(ctx, 96, -46, 4, 46, '#7f8c8d');
  fillRound(ctx, 72, -50, 32, 7, 2, '#2e86c1'); fillRound(ctx, 96, -90, 7, 44, 2, '#2e86c1');
  // notebook
  fillRound(ctx, 14, -76, 30, 8, 1, '#ecf0f1'); fillRect(ctx, 16, -76, 26, 2, '#e74c3c');
  ctx.restore();
}

export default [
  // ---------------------------------------------------------------- classroom
  {
    id: 'classroom', name: 'Classroom', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#e9e2c9', { floorY: H * 0.7, wainscot: true });
      floor(ctx, env, H * 0.7, 'wood', '#b98556');
      // alphabet frieze
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let i = 0; i < 26; i++) { fillRound(ctx, 20 + i * 48, 14, 40, 34, 4, ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'][i % 4]); text(ctx, 40 + i * 48, 32, letters[i] + letters[i].toLowerCase(), 'bold 17px sans-serif', '#fff'); }
      // blackboard
      const bx = 240, by = 80, bw = 640, bh = 260;
      fillRound(ctx, bx - 14, by - 14, bw + 28, bh + 28, 6, '#8b5a2b');
      fillRect(ctx, bx, by, bw, bh, night(env) ? '#1f3a2f' : '#2e5a45');
      ctx.fillStyle = rgba('#fff', 0.05); ctx.fillRect(bx + 20, by + 10, bw * 0.4, bh - 20);
      ctx.font = '30px "Comic Sans MS", cursive, sans-serif'; ctx.fillStyle = '#f7f1e3'; ctx.textAlign = 'left';
      ctx.fillText('2 + 2 = 4', bx + 40, by + 60); ctx.fillText('5 x 3 = 15', bx + 40, by + 110);
      ctx.fillText('Today: Story Time!', bx + 300, by + 60);
      ctx.font = '26px "Comic Sans MS", cursive, sans-serif'; ctx.fillText('a b c d e f g', bx + 40, by + 170); ctx.fillText('Sun  Moon  Star', bx + 300, by + 120);
      // simple sun doodle
      ctx.strokeStyle = '#f7f1e3'; ctx.lineWidth = 2; circle(ctx, bx + 520, by + 190, 24); ctx.stroke();
      for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; strokeLine(ctx, bx + 520 + Math.cos(a) * 30, by + 190 + Math.sin(a) * 30, bx + 520 + Math.cos(a) * 42, by + 190 + Math.sin(a) * 42, '#f7f1e3', 2); }
      fillRect(ctx, bx - 14, by + bh + 14, bw + 28, 10, '#6b4a2b'); // chalk tray
      fillRect(ctx, bx + 40, by + bh + 8, 24, 6, '#fff'); fillRect(ctx, bx + 80, by + bh + 8, 24, 6, '#f1c40f');
      // window right
      windowInterior(ctx, env, 960, 70, 260, 240, { curtain: '#5dade2' });
      // teacher desk left
      desk(ctx, env, 40, H * 0.7 + 30, 220, 80, '#8b5a2b');
      fillRound(ctx, 70, H * 0.7 - 70, 50, 14, 2, '#e74c3c'); fillRound(ctx, 74, H * 0.7 - 82, 42, 12, 2, '#2980b9');
      fillCircle(ctx, 200, H * 0.7 - 68, 18, '#2e86c1'); ctx.strokeStyle = '#27ae60'; ctx.lineWidth = 2; ellipse(ctx, 200, H * 0.7 - 68, 18, 7); ctx.stroke(); // globe
      strokeLine(ctx, 200, H * 0.7 - 86, 200, H * 0.7 - 50, '#7f8c8d', 3); fillRect(ctx, 190, H * 0.7 - 52, 20, 4, '#7f8c8d');
      // student desks (back rows, small)
      for (let i = 0; i < 4; i++) studentDesk(ctx, env, 300 + i * 190, H * 0.7 + 4, 0.75);
      studentDesk(ctx, env, 1060, H * 0.7 + 60, 0.95);
      clock(ctx, env, 130, 120, 30);
      // poster
      fillRound(ctx, 60, 180, 110, 130, 4, '#fff'); fillRect(ctx, 66, 186, 98, 70, '#8ec8f2'); fillCircle(ctx, 140, 206, 12, '#f1c40f'); fillPoly(ctx, [[66, 256], [100, 220], [130, 256]], '#27ae60'); text(ctx, 115, 290, 'READ!', 'bold 16px sans-serif', '#2c3e50');
      plantPot(ctx, env, 1240, H * 0.7 + 10, 80);
      ceilingLights(ctx, env, 52, 3, 130);
    },
  },
  // ---------------------------------------------------------------- school hallway
  {
    id: 'school_hallway', name: 'School Hallway / Lockers', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#f1efe6', { floorY: H * 0.7 });
      fillRect(ctx, 0, H * 0.7 - 140, W, 120, night(env) ? '#5c6f8c' : '#8fb7d6'); // painted band
      fillRect(ctx, 0, H * 0.7 - 146, W, 8, '#2c3e50');
      floor(ctx, env, H * 0.7, 'tile', '#e2e8ea');
      // tile color accents
      ctx.fillStyle = rgba('#2e86c1', 0.15); for (let i = 0; i < 10; i += 2) { const x = (i / 10) * W; fillPoly(ctx, [[x, H * 0.7], [x + W / 10, H * 0.7], [W / 2 + (x + W / 10 - W / 2) * 1.5, H], [W / 2 + (x - W / 2) * 1.5, H]], ctx.fillStyle); }
      // lockers
      const colors = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad'];
      for (let i = 0; i < 12; i++) {
        const x = 70 + i * 60, y = H * 0.7, h = 230, c = shade(colors[i % 5], night(env) ? -0.3 : 0);
        fillRect(ctx, x, y - h, 56, h, c);
        fillRect(ctx, x + 4, y - h + 4, 48, h - 8, shade(c, 0.08));
        for (let v = 0; v < 3; v++) fillRect(ctx, x + 14, y - h + 16 + v * 6, 28, 2, shade(c, -0.4));
        fillRect(ctx, x + 44, y - h / 2 - 10, 5, 20, '#333');
        fillRect(ctx, x + 14, y - h + 40, 28, 12, rgba('#fff', 0.5));
        if (i === 7) fillRect(ctx, x + 12, y - h + 60, 32, 20, '#f1c40f');
      }
      fillRect(ctx, 66, H * 0.7 - 234, 724, 6, '#2c3e50');
      // bulletin board
      fillRound(ctx, 830, 90, 300, 190, 6, '#8b5a2b'); fillRect(ctx, 840, 100, 280, 170, '#c8a05a');
      const r = rng(hash('notes' + env.seed));
      for (let i = 0; i < 7; i++) { const nx = 850 + r() * 220, ny = 110 + r() * 110; ctx.save(); ctx.translate(nx, ny); ctx.rotate((r() - 0.5) * 0.3); fillRect(ctx, 0, 0, 48, 40, r.pick(['#fff', '#f9e79f', '#aed6f1', '#f5b7b1'])); for (let l = 0; l < 3; l++) fillRect(ctx, 6, 8 + l * 9, 30 - l * 6, 2, '#7f8c8d'); fillCircle(ctx, 24, 3, 3, '#e74c3c'); ctx.restore(); }
      text(ctx, 980, 290, 'NOTICE BOARD', 'bold 14px sans-serif', '#2c3e50');
      // door at right end
      fillRect(ctx, 1160, H * 0.7 - 240, 100, 240, '#6b4a2b'); fillRect(ctx, 1168, H * 0.7 - 232, 84, 224, '#8b5a2b'); fillRect(ctx, 1186, H * 0.7 - 210, 48, 60, '#bfe3f8'); fillCircle(ctx, 1244, H * 0.7 - 120, 4, '#f1c40f');
      // exit sign
      fillRound(ctx, 1170, 40, 80, 30, 4, '#1e8449'); text(ctx, 1210, 55, 'EXIT', 'bold 16px sans-serif', '#fff');
      ctx.fillStyle = radGrad(ctx, 1210, 55, 0, 60, [[0, rgba('#2ecc71', 0.3)], [1, rgba('#2ecc71', 0)]]); circle(ctx, 1210, 55, 60); ctx.fill();
      // trash can & fire extinguisher
      fillRound(ctx, 20, H * 0.7 - 60, 40, 60, 5, '#7f8c8d'); fillRound(ctx, 16, H * 0.7 - 66, 48, 10, 3, '#95a5a6');
      fillRound(ctx, 1140, H * 0.7 - 190, 16, 50, 5, '#e74c3c'); fillRect(ctx, 1144, H * 0.7 - 198, 8, 10, '#333');
      clock(ctx, env, 40, 120, 26);
      ceilingLights(ctx, env, 30, 4, 140);
    },
  },
  // ---------------------------------------------------------------- sports ground
  {
    id: 'sports_ground', name: 'School Playground / Sports Ground', category: CAT, groundY: 0.9, horizonY: 0.66, indoor: false,
    paint(ctx, env) {
      const { W, H, t } = env;
      sky(ctx, env, { horizon: H * 0.5, sunX: W * 0.85, sunY: H * 0.14 });
      // school building far
      const sb = H * 0.55;
      fillRect(ctx, 160, sb - 170, 960, 170, lit(env, '#d8b48a'));
      fillRect(ctx, 150, sb - 180, 980, 14, lit(env, '#8b5a2b'));
      for (let i = 0; i < 9; i++) for (let j = 0; j < 2; j++) { fillRect(ctx, 190 + i * 104, sb - 150 + j * 70, 60, 46, '#fff'); ctx.fillStyle = night(env) ? (i + j) % 3 ? '#ffd98a' : '#3a4a6a' : lit(env, '#9fd3f5'); ctx.fillRect(194 + i * 104, sb - 146 + j * 70, 52, 38); }
      fillRect(ctx, 600, sb - 70, 80, 70, lit(env, '#6b4a2b'));
      signBoard(ctx, env, 500, sb - 220, 280, 36, 'SUNSHINE SCHOOL', '#2e86c1', '#fff', 'bold 20px sans-serif');
      for (let i = 0; i < 5; i++) treeRound(ctx, env, 40 + i * 300, sb + 4, 70, 40 + i);
      // fence
      fence(ctx, env, 0, W, sb + 30, 44, '#dfe6e9');
      // field
      ground(ctx, env, sb + 30, '#5fb04a', '#3f8a2d');
      ctx.strokeStyle = rgba('#fff', 0.85); ctx.lineWidth = 4;
      strokeLine(ctx, 0, H * 0.72, W, H * 0.72, ctx.strokeStyle, 4);
      ctx.beginPath(); ctx.ellipse(W / 2, H * 0.72, 120, 26, 0, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W * 0.1, H * 0.66); ctx.lineTo(W * 0.02, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.9, H * 0.66); ctx.lineTo(W * 0.98, H); ctx.stroke();
      strokeLine(ctx, W * 0.1, H * 0.66, W * 0.9, H * 0.66, ctx.strokeStyle, 4);
      grassTufts(ctx, env, H * 0.68, H * 0.95, 50, '#4f9a3a', 8);
      // goal post (left)
      const gx = 130, gy = H * 0.72;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - 90); ctx.lineTo(gx + 160, gy - 90); ctx.lineTo(gx + 160, gy); ctx.stroke();
      ctx.strokeStyle = rgba('#fff', 0.5); ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) strokeLine(ctx, gx + i * 20, gy - 90, gx + i * 20 - 20, gy, ctx.strokeStyle, 1);
      for (let i = 0; i <= 6; i++) strokeLine(ctx, gx - 20 + (i / 6) * 20, gy - (i / 6) * 90, gx + 160 - 20 + (i / 6) * 20, gy - (i / 6) * 90, ctx.strokeStyle, 1);
      // basketball hoop (right)
      const hx = 1130, hy = H * 0.7;
      fillRect(ctx, hx - 6, hy - 260, 12, 260, lit(env, '#7f8c8d'));
      fillRect(ctx, hx - 70, hy - 320, 110, 80, '#fff'); ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 4; ctx.strokeRect(hx - 40, hy - 300, 50, 40);
      fillEllipse(ctx, hx - 44, hy - 258, 26, 7, '#e67e22');
      ctx.strokeStyle = rgba('#fff', 0.8); ctx.lineWidth = 1.5; for (let i = 0; i < 7; i++) strokeLine(ctx, hx - 68 + i * 8, hy - 256, hx - 56 + i * 4, hy - 220 + Math.sin(t * 2 + i) * 2, ctx.strokeStyle, 1.5);
      // ball
      const bbx = 980 + Math.sin(t * 1.5) * 10, bby = H * 0.86 - Math.abs(Math.sin(t * 4)) * 60;
      groundShadow(ctx, bbx, H * 0.86, 18, 6, 0.25);
      fillCircle(ctx, bbx, bby, 16, '#e67e22'); ctx.strokeStyle = '#7b3f00'; ctx.lineWidth = 2; circle(ctx, bbx, bby, 16); ctx.stroke(); strokeLine(ctx, bbx - 16, bby, bbx + 16, bby, '#7b3f00', 2); strokeLine(ctx, bbx, bby - 16, bbx, bby + 16, '#7b3f00', 2);
      // bleachers (left far)
      for (let i = 0; i < 3; i++) { fillRect(ctx, 0, sb + 34 - i * 14, 150 - i * 20, 14, lit(env, i % 2 ? '#2e86c1' : '#2874a6')); }
      if (night(env)) { for (const lx of [60, 1220]) { fillRect(ctx, lx - 4, H * 0.3, 8, H * 0.4, '#555'); fillRect(ctx, lx - 30, H * 0.28, 60, 16, '#fff6d0'); ctx.fillStyle = radGrad(ctx, lx, H * 0.3, 0, 400, [[0, 'rgba(255,245,210,0.3)'], [1, 'rgba(255,245,210,0)']]); circle(ctx, lx, H * 0.3, 400); ctx.fill(); } vignette(ctx, env, 0.3); }
    },
  },
  // ---------------------------------------------------------------- office
  {
    id: 'office', name: 'Modern Office Space', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#eef0f3', { floorY: H * 0.7, ignoreTod: true });
      // large windows with skyline
      const p = todOf(env);
      for (let i = 0; i < 3; i++) {
        const wx = 90 + i * 400, wy = 60, ww = 330, wh = 300;
        fillRect(ctx, wx - 8, wy - 8, ww + 16, wh + 16, '#9aa3ad');
        ctx.save(); ctx.beginPath(); ctx.rect(wx, wy, ww, wh); ctx.clip();
        ctx.fillStyle = linGrad(ctx, 0, wy, 0, wy + wh, [[0, p.skyTop], [0.7, p.skyMid], [1, p.skyBot]]); ctx.fillRect(wx, wy, ww, wh);
        skyline(ctx, { ...env, W: W }, wy + wh, 20 + i, '#5d6a86', 0.35, 230);
        ctx.restore();
        fillRect(ctx, wx + ww / 2 - 3, wy, 6, wh, '#9aa3ad'); fillRect(ctx, wx, wy + wh / 2 - 3, ww, 6, '#9aa3ad');
        ctx.fillStyle = rgba('#fff', 0.12); fillPoly(ctx, [[wx, wy + wh], [wx + ww * 0.55, wy], [wx + ww * 0.8, wy], [wx + ww * 0.25, wy + wh]], ctx.fillStyle);
      }
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'carpet', '#8a9bb0');
      // cubicles (back row)
      const cubicle = (x, y, w) => {
        fillRect(ctx, x, y - 120, w, 120, '#c9d2dc'); fillRect(ctx, x, y - 124, w, 6, '#7f8c8d'); fillRect(ctx, x, y - 120, 6, 120, '#aab4bf');
        desk(ctx, env, x + 10, y + 10, w - 20, 60, '#dfe4ea');
        monitor(ctx, env, x + w / 2 - 35, y - 50, 70, 50, true);
        fillRound(ctx, x + 16, y - 56, 24, 8, 2, '#2c3e50'); // keyboard
        fillCircle(ctx, x + w - 30, y - 60, 5, '#2c3e50');
      };
      cubicle(40, H * 0.7, 220); cubicle(270, H * 0.7, 220); cubicle(790, H * 0.7, 220); cubicle(1020, H * 0.7, 220);
      swivelChair(ctx, env, 150, H * 0.7 + 40, '#2c3e50', 1); swivelChair(ctx, env, 1130, H * 0.7 + 40, '#2c3e50', -1);
      // whiteboard
      fillRound(ctx, 520, 90, 240, 160, 4, '#9aa3ad'); fillRect(ctx, 528, 98, 224, 144, '#fff');
      ctx.strokeStyle = '#2e86c1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(548, 220); ctx.lineTo(590, 180); ctx.lineTo(630, 200); ctx.lineTo(680, 140); ctx.lineTo(730, 150); ctx.stroke();
      strokeLine(ctx, 548, 220, 740, 220, '#2c3e50', 2); strokeLine(ctx, 548, 110, 548, 220, '#2c3e50', 2);
      text(ctx, 640, 118, 'Q4 GROWTH', 'bold 14px sans-serif', '#e74c3c');
      fillRect(ctx, 528, 242, 224, 6, '#7f8c8d'); fillRect(ctx, 560, 236, 20, 6, '#e74c3c'); fillRect(ctx, 590, 236, 20, 6, '#2e86c1');
      // water cooler
      fillRound(ctx, 700, H * 0.7 - 150, 50, 150, 6, '#dfe4ea'); fillRound(ctx, 704, H * 0.7 - 200, 42, 60, 10, rgba('#5dade2', 0.6));
      fillRect(ctx, 708, H * 0.7 - 190 + Math.sin(t) * 2, 34, 40, rgba('#2e86c1', 0.5)); fillRect(ctx, 720, H * 0.7 - 110, 10, 12, '#2e86c1');
      plantPot(ctx, env, 500, H * 0.7 + 50, 110, '#7f8c8d');
      ceilingLights(ctx, env, 20, 4, 160, '#ffffff');
      if (night(env)) { ctx.fillStyle = rgba('#1a2238', 0.12); ctx.fillRect(0, 0, W, H); }
    },
  },
  // ---------------------------------------------------------------- laboratory
  {
    id: 'laboratory', name: 'Science Laboratory', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#dfe8ec', { floorY: H * 0.7, ignoreTod: true });
      fillRect(ctx, 0, H * 0.7 - 100, W, 90, '#cfd8dc');
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'tile', '#e8eef0');
      // periodic table poster
      fillRound(ctx, 60, 60, 300, 190, 4, '#fff');
      text(ctx, 210, 80, 'PERIODIC TABLE', 'bold 14px sans-serif', '#2c3e50');
      const cols = ['#e74c3c', '#f39c12', '#27ae60', '#2980b9', '#8e44ad', '#1abc9c'];
      for (let j = 0; j < 7; j++) for (let i = 0; i < 18; i++) { if (j < 2 && i > 1 && i < 12) continue; if (j === 0 && i > 0 && i < 17) continue; fillRect(ctx, 72 + i * 16, 94 + j * 21, 14, 19, cols[(i + j) % 6]); }
      // hazard signs
      const hazard = (x, y) => { fillPoly(ctx, [[x, y - 36], [x + 40, y + 30], [x - 40, y + 30]], '#f1c40f'); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; poly(ctx, [[x, y - 36], [x + 40, y + 30], [x - 40, y + 30]]); ctx.stroke(); text(ctx, x, y + 10, '!', 'bold 34px sans-serif', '#111'); };
      hazard(460, 110); hazard(560, 110);
      fillRound(ctx, 410, 160, 200, 28, 4, '#e74c3c'); text(ctx, 510, 174, 'DANGER  CHEMICALS', 'bold 13px sans-serif', '#fff');
      // fume hood right
      fillRect(ctx, 960, 50, 280, 310, '#b0bec5'); fillRect(ctx, 972, 62, 256, 230, rgba('#bfe3f8', 0.55)); fillRect(ctx, 972, 280, 256, 80, '#90a4ae');
      ctx.fillStyle = rgba('#fff', 0.25); fillPoly(ctx, [[972, 292], [1100, 62], [1140, 62], [1012, 292]], ctx.fillStyle);
      for (let i = 0; i < 3; i++) fillRound(ctx, 1010 + i * 60, 240, 30, 50, 4, ['#8e44ad', '#2ecc71', '#e67e22'][i]);
      // wall cabinets
      for (let i = 0; i < 3; i++) { fillRound(ctx, 660 + i * 95, 70, 85, 110, 3, '#eceff1'); fillRect(ctx, 700 + i * 95, 115, 4, 20, '#7f8c8d'); }
      // lab bench (back wall)
      const by = H * 0.7;
      fillRect(ctx, 40, by - 110, 1200, 110, '#607d8b'); fillRect(ctx, 30, by - 118, 1220, 12, '#263238');
      for (let x = 60; x < 1220; x += 120) { fillRound(ctx, x, by - 100, 100, 90, 3, '#546e7a'); fillRect(ctx, x + 40, by - 60, 20, 4, '#b0bec5'); }
      // test tube rack with bubbling liquids
      const rack = (x) => {
        fillRect(ctx, x, by - 150, 150, 10, '#8b5a2b'); fillRect(ctx, x, by - 124, 150, 8, '#8b5a2b'); fillRect(ctx, x + 4, by - 150, 6, 34, '#8b5a2b'); fillRect(ctx, x + 140, by - 150, 6, 34, '#8b5a2b');
        const liq = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#9b59b6'];
        for (let i = 0; i < 5; i++) {
          const tx = x + 22 + i * 27;
          fillRound(ctx, tx - 7, by - 190, 14, 70, 7, rgba('#dff6ff', 0.6));
          fillRound(ctx, tx - 6, by - 160, 12, 38, 6, liq[i]);
          for (let b = 0; b < 3; b++) { const bb = ((t * 30 + b * 15 + i * 7) % 36); fillCircle(ctx, tx + Math.sin(t * 5 + b + i) * 2, by - 126 - bb, 1.5 + (b % 2), rgba('#fff', 0.7)); }
          ctx.strokeStyle = rgba('#fff', 0.8); ctx.lineWidth = 1.5; roundRect(ctx, tx - 7, by - 190, 14, 70, 7); ctx.stroke();
        }
      };
      rack(80); rack(1040);
      // flasks
      const flask = (x, c) => { fillPoly(ctx, [[x - 8, by - 180], [x + 8, by - 180], [x + 8, by - 160], [x + 30, by - 122], [x - 30, by - 122]], rgba('#dff6ff', 0.6)); fillPoly(ctx, [[x + 14, by - 150], [x + 30, by - 122], [x - 30, by - 122], [x - 14, by - 150]], c); ctx.strokeStyle = rgba('#fff', 0.9); ctx.lineWidth = 1.5; poly(ctx, [[x - 8, by - 180], [x + 8, by - 180], [x + 8, by - 160], [x + 30, by - 122], [x - 30, by - 122]]); ctx.stroke(); for (let b = 0; b < 3; b++) { fillCircle(ctx, x - 10 + b * 10, by - 190 - ((t * 25 + b * 12) % 40), 2, rgba('#fff', 0.5)); } };
      flask(300, '#2ecc71'); flask(380, '#e67e22');
      // bunsen burner with flame
      fillRect(ctx, 460, by - 170, 10, 50, '#7f8c8d'); fillRect(ctx, 448, by - 124, 34, 6, '#555'); fillEllipse(ctx, 465, by - 172 - 8, 5, 10 + Math.sin(t * 16) * 2, '#3498db'); fillEllipse(ctx, 465, by - 174, 3, 6, '#aed6f1');
      // microscope
      const mx = 820;
      fillRound(ctx, mx - 36, by - 130, 72, 12, 3, '#2c3e50');
      ctx.strokeStyle = '#2c3e50'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 20, by - 130); ctx.quadraticCurveTo(mx + 36, by - 190, mx, by - 206); ctx.stroke();
      ctx.save(); ctx.translate(mx - 4, by - 196); ctx.rotate(0.4); fillRound(ctx, -8, -16, 16, 46, 4, '#34495e'); fillRound(ctx, -10, -24, 20, 10, 3, '#111'); ctx.restore();
      fillRect(ctx, mx - 22, by - 166, 44, 6, '#7f8c8d'); fillCircle(ctx, mx + 2, by - 160, 5, '#5dade2'); fillCircle(ctx, mx + 28, by - 150, 6, '#7f8c8d');
      // beaker with ticks
      fillRound(ctx, 640, by - 180, 44, 62, 3, rgba('#dff6ff', 0.6)); fillRect(ctx, 642, by - 150, 40, 30, '#9b59b6'); for (let i = 0; i < 5; i++) fillRect(ctx, 676, by - 172 + i * 10, 6, 2, '#fff');
      ceilingLights(ctx, env, 14, 4, 150, '#e8f7ff');
    },
  },
  // ---------------------------------------------------------------- hospital room
  {
    id: 'hospital_room', name: 'Hospital Room', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#e4f0ee', { floorY: H * 0.7, ignoreTod: true });
      fillRect(ctx, 0, H * 0.7 - 130, W, 120, '#cfe4e0'); fillRect(ctx, 0, H * 0.7 - 136, W, 8, '#7fb3a8');
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'tile', '#eef3f3');
      windowInterior(ctx, env, 80, 70, 240, 220, { curtain: '#a9cce3' });
      // curtain rail with curtain (right)
      fillRect(ctx, 760, 50, 500, 6, '#7f8c8d');
      ctx.fillStyle = '#a9cce3';
      for (let i = 0; i < 6; i++) { const x = 1040 + i * 36; fillPoly(ctx, [[x, 56], [x + 36, 56], [x + 40, H * 0.7 - 20], [x - 4, H * 0.7 - 20]], i % 2 ? '#a9cce3' : '#8fb9d6'); }
      // hospital bed with rails
      const bx = 760, by = H * 0.7 + 10;
      groundShadow(ctx, bx + 150, by + 4, 170, 14, 0.2);
      fillRound(ctx, bx, by - 150, 16, 150, 4, '#90a4ae'); fillRound(ctx, bx + 270, by - 120, 16, 120, 4, '#90a4ae');
      fillRect(ctx, bx + 8, by - 70, 270, 30, '#b0bec5');
      fillRound(ctx, bx + 12, by - 90, 262, 28, 6, '#fff');
      fillRound(ctx, bx + 70, by - 94, 210, 30, 8, '#7fb3d5');
      fillRound(ctx, bx + 24, by - 108, 60, 24, 8, '#fff');
      ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(bx + 60, by - 60); ctx.lineTo(bx + 60, by - 120); ctx.lineTo(bx + 200, by - 120); ctx.lineTo(bx + 200, by - 60); ctx.stroke();
      strokeLine(ctx, bx + 100, by - 120, bx + 100, by - 64, '#90a4ae', 3); strokeLine(ctx, bx + 150, by - 120, bx + 150, by - 64, '#90a4ae', 3);
      fillCircle(ctx, bx + 30, by, 8, '#333'); fillCircle(ctx, bx + 260, by, 8, '#333');
      // heart monitor
      const mx = 560, my = H * 0.7;
      fillRect(ctx, mx + 36, my - 150, 8, 150, '#90a4ae'); fillEllipse(ctx, mx + 40, my, 30, 8, '#90a4ae');
      fillRound(ctx, mx - 20, my - 240, 120, 95, 6, '#263238'); fillRect(ctx, mx - 12, my - 232, 104, 70, '#0b1a12');
      ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const ph = ((i + t * 60) % 50) / 50; let yv = 0;
        if (ph > 0.3 && ph < 0.36) yv = -28; else if (ph > 0.36 && ph < 0.42) yv = 16; else if (ph > 0.5 && ph < 0.6) yv = -6 * Math.sin((ph - 0.5) * 31);
        const x = mx - 8 + i, y = my - 196 + yv;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      fillCircle(ctx, mx + 92 - ((t * 60) % 100) * 0 + 0, my - 196, 3, rgba('#2ecc71', 0.5 + 0.5 * Math.sin(t * 8)));
      text(ctx, mx + 70, my - 220, '72', 'bold 16px monospace', '#2ecc71'); text(ctx, mx - 2, my - 220, '♥', 'bold 16px sans-serif', '#e74c3c');
      text(ctx, mx + 40, my - 154, '98% SpO2', '11px monospace', '#5dade2');
      // IV stand
      const ix = 1010;
      fillRect(ctx, ix - 3, my - 300, 6, 300, '#90a4ae'); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; strokeLine(ctx, ix, my, ix + Math.cos(a) * 28, my + Math.sin(a) * 8, '#90a4ae', 5); }
      fillRect(ctx, ix - 30, my - 300, 60, 4, '#90a4ae');
      fillRound(ctx, ix - 40, my - 296, 24, 60, 6, rgba('#dff6ff', 0.85)); fillRect(ctx, ix - 38, my - 270 + Math.sin(t) * 1, 20, 32, rgba('#5dade2', 0.6));
      ctx.strokeStyle = rgba('#bfe3f8', 0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix - 28, my - 236); ctx.quadraticCurveTo(ix - 60, my - 150, bx + 120, by - 100); ctx.stroke();
      // cabinet with supplies
      fillRound(ctx, 360, my - 120, 150, 120, 4, '#eceff1'); fillRect(ctx, 364, my - 116, 142, 50, '#cfd8dc'); fillRect(ctx, 430, my - 96, 10, 4, '#7f8c8d'); fillRect(ctx, 430, my - 40, 10, 4, '#7f8c8d');
      fillRound(ctx, 380, my - 150, 24, 30, 3, '#fff'); fillRect(ctx, 384, my - 146, 16, 8, '#e74c3c'); fillRound(ctx, 420, my - 146, 30, 26, 3, '#5dade2');
      // red cross sign
      fillRound(ctx, 480, 80, 90, 90, 8, '#fff'); fillRect(ctx, 515, 95, 20, 60, '#e74c3c'); fillRect(ctx, 495, 115, 60, 20, '#e74c3c');
      clock(ctx, env, 660, 120, 28);
      ceilingLights(ctx, env, 14, 4, 150, '#f0fbff');
    },
  },
  // ---------------------------------------------------------------- library
  {
    id: 'library', name: 'Library / Study Room', category: CAT, groundY: 0.9, horizonY: 0.7, indoor: true,
    paint(ctx, env) {
      const { W, H, t } = env;
      wall(ctx, env, '#d8c3a0', { floorY: H * 0.7, ignoreTod: true });
      // tall windows
      for (const wx of [500, 700]) {
        const p = todOf(env);
        fillRound(ctx, wx - 8, 32, 96, 300, 44, '#5a3b22');
        ctx.save(); roundRect(ctx, wx, 40, 80, 285, 40); ctx.clip();
        ctx.fillStyle = linGrad(ctx, 0, 40, 0, 325, [[0, p.skyTop], [1, p.skyBot]]); ctx.fillRect(wx, 40, 80, 285);
        ctx.restore();
        fillRect(ctx, wx + 37, 40, 6, 285, '#5a3b22'); for (let y = 100; y < 320; y += 60) fillRect(ctx, wx, y, 80, 5, '#5a3b22');
        if (!night(env)) { ctx.fillStyle = linGrad(ctx, wx, 60, wx + 60, 500, [[0, rgba('#fff3c4', 0.22)], [1, rgba('#fff3c4', 0)]]); fillPoly(ctx, [[wx, 60], [wx + 80, 60], [wx + 220, H * 0.7], [wx - 60, H * 0.7]], ctx.fillStyle); }
      }
      // shelves floor-to-ceiling
      shelf(ctx, env, 20, H * 0.7, 220, 480, '#6b4a2b', 1);
      shelf(ctx, env, 250, H * 0.7, 220, 480, '#6b4a2b', 2);
      shelf(ctx, env, 810, H * 0.7, 220, 480, '#6b4a2b', 3);
      shelf(ctx, env, 1040, H * 0.7, 220, 480, '#6b4a2b', 4);
      // rolling ladder
      ctx.save(); ctx.translate(300, H * 0.7); ctx.rotate(-0.12);
      fillRect(ctx, -6, -440, 10, 440, '#8b5a2b'); fillRect(ctx, 44, -440, 10, 440, '#8b5a2b');
      for (let i = 1; i < 11; i++) fillRect(ctx, -6, -i * 40, 60, 7, '#a0673a');
      ctx.restore();
      fillRect(ctx, 20, H * 0.7 - 470, 450, 6, '#3a2a1e');
      floor(ctx, { ...env, tod: 'day' }, H * 0.7, 'wood', '#8d5a33');
      // reading desks with banker lamps
      const bankerLamp = (x, y) => {
        fillEllipse(ctx, x, y, 16, 5, '#b8860b'); fillRect(ctx, x - 2, y - 40, 4, 40, '#b8860b');
        fillRound(ctx, x - 30, y - 56, 60, 18, 6, '#1e8449'); fillRound(ctx, x - 26, y - 44, 52, 5, 2, '#ffe8a0');
        ctx.fillStyle = radGrad(ctx, x, y - 36, 0, 110, [[0, rgba('#ffe8a0', 0.45)], [1, rgba('#ffe8a0', 0)]]); poly(ctx, [[x - 30, y - 44], [x + 30, y - 44], [x + 120, y + 60], [x - 120, y + 60]]); ctx.fill();
      };
      desk(ctx, env, 480, H * 0.7 + 40, 280, 70, '#5a3b22');
      bankerLamp(560, H * 0.7 - 38); bankerLamp(680, H * 0.7 - 38);
      fillRound(ctx, 600, H * 0.7 - 46, 40, 12, 2, '#c0392b'); fillRound(ctx, 606, H * 0.7 - 56, 40, 12, 2, '#2980b9');
      chair(ctx, env, 430, H * 0.7 + 44, 44, 92, '#5a3b22', 1);
      chair(ctx, env, 790, H * 0.7 + 44, 44, 92, '#5a3b22', -1);
      // globe & bust
      fillRect(ctx, 600, 300, 60, 6, '#3a2a1e');
      // quiet sign
      signBoard(ctx, env, 560, 350, 160, 30, 'QUIET PLEASE', '#5a3b22', '#f7f1e3', 'bold 15px serif');
      // chandelier
      strokeLine(ctx, 640, 0, 640, 40, '#5a3b22', 3); fillEllipse(ctx, 640, 40, 50, 12, '#b8860b');
      for (let i = -2; i <= 2; i++) { fillRect(ctx, 636 + i * 22, 10, 6, 24, '#fff3c4'); fillEllipse(ctx, 639 + i * 22, 8, 4, 7 + Math.sin(t * 12 + i) * 1.5, '#ffb52e'); }
      ctx.fillStyle = radGrad(ctx, 640, 30, 0, 260, [[0, rgba('#ffd98a', 0.25)], [1, rgba('#ffd98a', 0)]]); circle(ctx, 640, 30, 260); ctx.fill();
      dustMotes(ctx, env, 40, 5);
      ctx.fillStyle = rgba('#5a3b22', 0.08); ctx.fillRect(0, 0, W, H);
      vignette(ctx, env, 0.35);
    },
  },
];
