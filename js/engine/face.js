// Head: face, expressions, hair styles, hats and facial accessories.
// Drawn in character units with the body origin; head centre is (0, P.headCY).

import { DEG, TAU, clamp, lerp, shade, rgba, roundRect, ellipse, circle, poly, curve, fillRect, fillEllipse, fillCircle, fillPoly, fillRound, strokeLine, linGrad, radGrad } from './util.js';

export const EXPRESSIONS = {
  neutral:   { brow: 0,    browH: 0,   eyes: 'open',   mouth: 'neutral' },
  happy:     { brow: 0.2,  browH: 0.3, eyes: 'open',   mouth: 'smile' },
  bigsmile:  { brow: 0.3,  browH: 0.5, eyes: 'happy',  mouth: 'grin' },
  laugh:     { brow: 0.3,  browH: 0.6, eyes: 'happy',  mouth: 'laugh' },
  sad:       { brow: -0.5, browH: 0.2, eyes: 'sad',    mouth: 'frown' },
  cry:       { brow: -0.6, browH: 0.3, eyes: 'closed', mouth: 'wail', tears: true },
  angry:     { brow: 1,    browH: -0.4, eyes: 'squint', mouth: 'grit' },
  scared:    { brow: -0.7, browH: 0.8, eyes: 'wide',   mouth: 'wobble', sweat: true },
  surprised: { brow: 0,    browH: 1,   eyes: 'wide',   mouth: 'o' },
  thinking:  { brow: 0.4,  browH: 0.2, eyes: 'up',     mouth: 'hmm' },
  sleepy:    { brow: 0,    browH: 0.2, eyes: 'closed', mouth: 'o_small' },
  yawn:      { brow: -0.2, browH: 0.4, eyes: 'closed', mouth: 'yawn' },
  wink:      { brow: 0.2,  browH: 0.3, eyes: 'wink',   mouth: 'smile' },
  confused:  { brow: 0.6,  browH: 0.4, eyes: 'open',   mouth: 'hmm' },
  excited:   { brow: 0.1,  browH: 0.8, eyes: 'wide',   mouth: 'grin' },
  love:      { brow: 0.2,  browH: 0.4, eyes: 'hearts', mouth: 'smile', blush: true },
  shy:       { brow: 0.1,  browH: 0.2, eyes: 'down',   mouth: 'smile_small', blush: true },
  determined:{ brow: 0.8,  browH: -0.2, eyes: 'open',  mouth: 'grit' },
  pain:      { brow: 0.6,  browH: 0.1, eyes: 'closed', mouth: 'grit', sweat: true },
  dizzy:     { brow: 0,    browH: 0.5, eyes: 'dizzy',  mouth: 'wobble' },
};
export const EXPRESSION_NAMES = Object.keys(EXPRESSIONS);

export const HAIR_STYLES = ['short', 'buzz', 'spiky', 'side_part', 'curly', 'wavy', 'long', 'ponytail', 'bun', 'bob', 'braid', 'afro', 'mohawk', 'bald', 'receding', 'pigtails'];
export const HATS = ['none', 'cap', 'police_cap', 'topi', 'turban', 'straw_hat', 'pilot_cap', 'crown', 'helmet', 'chef_hat', 'wizard_hat', 'cowboy_hat', 'bandana', 'nurse_cap', 'beanie', 'hijab', 'party_hat', 'grad_cap', 'sun_hat', 'beret', 'headband', 'santa_hat', 'astronaut_helmet'];
export const FACIAL = ['none', 'mustache', 'beard', 'goatee', 'full_beard', 'stubble'];
export const GLASSES = ['none', 'glasses', 'round_glasses', 'sunglasses'];

function blinkState(t, seed) {
  const ph = ((t * 0.5 + seed * 0.37) % 1 + 1) % 1; // ~every 2 s
  return ph < 0.06 ? 1 - Math.abs(ph - 0.03) / 0.03 : 0;
}

export function drawHead(ctx, app, pose, P, o) {
  const cx = 0, cy = P.headCY, rx = P.headRX, ry = P.headRY;
  const fo = o.front ? 0 : rx * 0.28; // feature offset toward facing direction (3/4 view)
  const skin = app.skin;
  const female = app.gender === 'female';
  const hair = app.hair || { style: 'short', color: '#2b1b0e' };
  const hat = app.outfit.hat || 'none';
  const expr = EXPRESSIONS[pose.face] || EXPRESSIONS.neutral;
  const blink = pose.blink === false ? 0 : blinkState(o.t, o.blinkSeed);

  ctx.save();
  ctx.translate(cx, cy);
  // --- back hair ---
  if (hat === 'hijab') {
    const c = app.outfit.hatColor || '#6a1b9a';
    ctx.fillStyle = linGrad(ctx, -rx, 0, rx, 0, [[0, shade(c, -0.25)], [0.6, c], [1, shade(c, 0.05)]]);
    ctx.beginPath(); ctx.moveTo(-rx - 1.5, -ry * 0.2); ctx.bezierCurveTo(-rx - 2, -ry * 1.6, rx + 2, -ry * 1.6, rx + 1.5, -ry * 0.2); ctx.lineTo(rx + 2.5, ry * 1.4); ctx.quadraticCurveTo(rx, ry * 2.1, 0, ry * 2.2); ctx.quadraticCurveTo(-rx, ry * 2.1, -rx - 2.5, ry * 1.4); ctx.closePath(); ctx.fill();
  } else drawHairBack(ctx, hair, rx, ry, female, o);
  // --- ear(s) ---
  const earY = 0.8;
  const earC = shade(skin, -0.06);
  fillEllipse(ctx, -rx + 0.6, earY, 1.6, 2.3, earC);
  fillEllipse(ctx, -rx + 0.8, earY + 0.2, 0.8, 1.3, shade(skin, -0.2));
  if (o.front) { fillEllipse(ctx, rx - 0.6, earY, 1.6, 2.3, earC); fillEllipse(ctx, rx - 0.8, earY + 0.2, 0.8, 1.3, shade(skin, -0.2)); }
  if (app.outfit.accessories?.includes('earrings')) { fillCircle(ctx, -rx + 0.6, earY + 2.6, 0.7, '#f1c40f'); if (o.front) fillCircle(ctx, rx - 0.6, earY + 2.6, 0.7, '#f1c40f'); }
  // --- head shape ---
  ctx.beginPath();
  const jaw = female ? 0.86 : 0.92;
  ctx.moveTo(-rx, -ry * 0.1);
  ctx.bezierCurveTo(-rx, -ry * 1.35, rx, -ry * 1.35, rx, -ry * 0.1);
  ctx.bezierCurveTo(rx, ry * 0.6, rx * jaw * 0.55 + fo * 0.3, ry * 1.08, fo * 0.35, ry * 1.05);
  ctx.bezierCurveTo(-rx * jaw * 0.55 + fo * 0.3, ry * 1.08, -rx, ry * 0.6, -rx, -ry * 0.1);
  ctx.closePath();
  ctx.fillStyle = linGrad(ctx, -rx, -ry, rx, ry, [[0, shade(skin, -0.1)], [0.5, skin], [1, shade(skin, 0.05)]]); ctx.fill();
  ctx.strokeStyle = rgba(shade(skin, -0.5), 0.55); ctx.lineWidth = 0.5; ctx.stroke();
  // subtle shading under hair line / chin
  ctx.fillStyle = rgba('#000', 0.06); ellipse(ctx, fo * 0.3, ry * 0.75, rx * 0.5, ry * 0.25); ctx.fill();
  // blush
  if (expr.blush || pose.blush) { ctx.fillStyle = rgba('#ff6b81', 0.35); ellipse(ctx, fo - 4.2, 3.2, 2, 1.1); ctx.fill(); ellipse(ctx, fo + 4.2, 3.2, 2, 1.1); ctx.fill(); }
  // --- eyes ---
  const eyeY = -1.2, eyeDX = 3.5, eyeRX = female ? 2.1 : 1.95, eyeRY = female ? 2.4 : 2.2;
  const eyesMode = pose.eyes || expr.eyes;
  drawEye(ctx, fo - eyeDX * (o.front ? 1 : 0.95), eyeY, eyeRX, eyeRY, eyesMode, blink, app, 'far', female, fo, o);
  drawEye(ctx, fo + eyeDX, eyeY, eyeRX, eyeRY, eyesMode, blink, app, 'near', female, fo, o);
  // brows
  const browC = shade(hair.color, -0.1);
  const bh = -4.9 - expr.browH * 1.2, ba = expr.brow;
  ctx.strokeStyle = browC; ctx.lineWidth = female ? 0.75 : 1.05;
  [-1, 1].forEach((s) => {
    const bx = fo + s * eyeDX; const inner = -s * 2.2, outer = s * 2.2;
    ctx.beginPath(); ctx.moveTo(bx + inner, bh + ba * 1.3 * (s > 0 ? 1 : 1)); ctx.quadraticCurveTo(bx, bh - 0.8 - Math.abs(ba) * 0.4 + (ba > 0 ? 0 : 0), bx + outer, bh - ba * 0.9); ctx.stroke();
  });
  // nose
  ctx.strokeStyle = rgba(shade(skin, -0.5), 0.7); ctx.lineWidth = 0.55;
  if (o.front) { ctx.beginPath(); ctx.moveTo(-0.8, 1.4); ctx.quadraticCurveTo(0, 3.2, 1.2, 1.6); ctx.stroke(); }
  else { ctx.beginPath(); ctx.moveTo(fo + 2.6, -0.2); ctx.quadraticCurveTo(fo + 5.2, 1.6, fo + 3.1, 3); ctx.stroke(); }
  // mouth
  const mouthMode = pose.mouth || expr.mouth;
  drawMouth(ctx, fo + (o.front ? 0 : 0.8), 5.6, mouthMode, o.mouthOpen || 0, female, skin);
  // facial hair
  drawFacialHair(ctx, app.facialHair, hair.color, fo, rx, ry, o);
  // marks
  if (app.outfit.accessories?.includes('bindi')) fillCircle(ctx, fo, -4.2, 0.6, '#c62828');
  if (app.outfit.accessories?.includes('tilak')) fillRect(ctx, fo - 0.35, -6.5, 0.7, 3, '#e65100');
  if (app.outfit.accessories?.includes('mole')) fillCircle(ctx, fo + 4.5, 4.2, 0.35, shade(skin, -0.5));
  // glasses
  drawGlasses(ctx, app.glasses, fo, eyeDX, eyeY, o);
  // tears / sweat
  if (expr.tears) { ctx.fillStyle = '#4fc3f7'; for (let i = 0; i < 2; i++) { const ph = (o.t * 1.5 + i * 0.5) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, fo + (i ? 3.8 : -3.4), 1.5 + ph * 9, 0.7, '#4fc3f7'); } ctx.globalAlpha = 1; }
  if (expr.sweat) { const ph = (o.t * 1.2) % 1; ctx.globalAlpha = 0.9 - ph * 0.5; ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.moveTo(-rx + 1, -6 + ph * 5); ctx.quadraticCurveTo(-rx + 2.4, -4 + ph * 5, -rx + 1, -2.8 + ph * 5); ctx.quadraticCurveTo(-rx - 0.4, -4 + ph * 5, -rx + 1, -6 + ph * 5); ctx.fill(); ctx.globalAlpha = 1; }
  // --- front hair + hat ---
  drawHairFront(ctx, hair, rx, ry, female, fo, hat, o);
  drawHat(ctx, hat, app, rx, ry, fo, o);
  ctx.restore();
}

function drawEye(ctx, x, y, rx, ry, mode, blink, app, side, female, fo, o) {
  const iris = app.eyeColor || '#3e2723';
  const closed = blink > 0.5 || mode === 'closed' || (mode === 'wink' && side === 'near');
  if (mode === 'happy' || (closed && mode === 'happy')) { ctx.strokeStyle = shade(app.skin, -0.55); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - rx, y + 0.5); ctx.quadraticCurveTo(x, y - ry * 1.1, x + rx, y + 0.5); ctx.stroke(); return; }
  if (closed) { ctx.strokeStyle = shade(app.skin, -0.55); ctx.lineWidth = 0.75; ctx.beginPath(); ctx.moveTo(x - rx, y + 0.3); ctx.quadraticCurveTo(x, y + ry * 0.75, x + rx, y + 0.3); ctx.stroke(); if (female) lashes(ctx, x, y + 0.9, rx, 1); return; }
  const scaleY = mode === 'wide' ? 1.3 : mode === 'squint' ? 0.55 : mode === 'sad' ? 0.85 : 1;
  const RY = ry * scaleY;
  // white
  ctx.beginPath(); ctx.ellipse(x, y, rx, RY, 0, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.strokeStyle = shade(app.skin, -0.55); ctx.lineWidth = 0.45; ctx.stroke();
  // iris + pupil
  let ix = x + fo * 0.1, iy = y;
  if (mode === 'up') { iy -= RY * 0.45; ix += 0.4; }
  if (mode === 'down') { iy += RY * 0.4; }
  if (mode === 'side') { ix += rx * 0.45; }
  if (mode === 'dizzy') { ctx.strokeStyle = '#333'; ctx.lineWidth = 0.5; ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) ctx.lineTo(x + Math.cos(a + o.t * 4) * a * 0.12, y + Math.sin(a + o.t * 4) * a * 0.12); ctx.stroke(); return; }
  if (mode === 'hearts') { ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); const s = 1.3; ctx.moveTo(x, y + s); ctx.bezierCurveTo(x - s * 1.6, y - s * 0.4, x - s * 0.6, y - s * 1.4, x, y - s * 0.4); ctx.bezierCurveTo(x + s * 0.6, y - s * 1.4, x + s * 1.6, y - s * 0.4, x, y + s); ctx.fill(); return; }
  const irisR = rx * 0.68 * (mode === 'wide' ? 0.8 : 1);
  ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, RY, 0, 0, TAU); ctx.clip();
  fillCircle(ctx, ix, iy, irisR, iris);
  fillCircle(ctx, ix, iy, irisR * 0.55, '#111');
  fillCircle(ctx, ix - irisR * 0.35, iy - irisR * 0.4, irisR * 0.28, '#fff');
  if (mode === 'squint') { fillRect(ctx, x - rx, y - RY - 1, rx * 2, RY * 0.9, app.skin); }
  if (mode === 'sad') { ctx.fillStyle = app.skin; ctx.beginPath(); ctx.moveTo(x - rx, y - RY); ctx.lineTo(x + rx, y - RY); ctx.lineTo(x + rx, y - RY * 0.2); ctx.lineTo(x - rx, y - RY * 0.6); ctx.fill(); }
  ctx.restore();
  // upper lid line
  ctx.strokeStyle = shade(app.skin, -0.6); ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(x, y, rx, RY, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  if (female) lashes(ctx, x, y, rx, RY);
}
function lashes(ctx, x, y, rx, ry) {
  ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 0.45;
  for (let i = 0; i < 3; i++) { const a = Math.PI * 1.2 + i * 0.28; const px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a) * 0.9, py + Math.sin(a) * 0.9); ctx.stroke(); }
}

function drawMouth(ctx, x, y, mode, open, female, skin) {
  const lip = female ? '#c0392b' : shade(skin, -0.45);
  const inner = '#5c1a1a', teeth = '#fff', tongue = '#e57373';
  ctx.lineCap = 'round';
  open = clamp(open, 0, 1);
  if (open > 0.08) {
    // talking: open mouth of variable height, blended with the base mood
    const w = 2.6 + open * 1.2, h = 0.6 + open * 2.8;
    const smile = mode === 'smile' || mode === 'grin' || mode === 'laugh' ? 0.8 : mode === 'frown' || mode === 'wail' ? -0.8 : 0;
    ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + h * 2 + smile, x + w, y); ctx.quadraticCurveTo(x, y - h * 0.5 + smile * 0.2, x - w, y); ctx.fill();
    if (h > 1.6) { ctx.fillStyle = teeth; ctx.beginPath(); ctx.moveTo(x - w * 0.8, y + 0.2); ctx.quadraticCurveTo(x, y + 1.0, x + w * 0.8, y + 0.2); ctx.quadraticCurveTo(x, y - 0.2, x - w * 0.8, y + 0.2); ctx.fill(); fillEllipse(ctx, x, y + h * 1.3, w * 0.5, h * 0.4, tongue); }
    ctx.strokeStyle = lip; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + h * 2 + smile, x + w, y); ctx.quadraticCurveTo(x, y - h * 0.5 + smile * 0.2, x - w, y); ctx.stroke();
    return;
  }
  ctx.strokeStyle = lip; ctx.lineWidth = female ? 0.9 : 0.7;
  switch (mode) {
    case 'smile': ctx.beginPath(); ctx.moveTo(x - 2.6, y - 0.3); ctx.quadraticCurveTo(x, y + 2.2, x + 2.6, y - 0.3); ctx.stroke(); break;
    case 'smile_small': ctx.beginPath(); ctx.moveTo(x - 1.6, y); ctx.quadraticCurveTo(x, y + 1.3, x + 1.6, y); ctx.stroke(); break;
    case 'grin': ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(x - 3.2, y - 0.6); ctx.quadraticCurveTo(x, y + 3.6, x + 3.2, y - 0.6); ctx.quadraticCurveTo(x, y + 0.4, x - 3.2, y - 0.6); ctx.fill(); ctx.fillStyle = teeth; ctx.beginPath(); ctx.moveTo(x - 2.8, y - 0.3); ctx.quadraticCurveTo(x, y + 1.6, x + 2.8, y - 0.3); ctx.quadraticCurveTo(x, y + 0.3, x - 2.8, y - 0.3); ctx.fill(); ctx.stroke(); break;
    case 'laugh': ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(x - 3.2, y - 0.8); ctx.quadraticCurveTo(x, y + 5, x + 3.2, y - 0.8); ctx.quadraticCurveTo(x, y + 0.2, x - 3.2, y - 0.8); ctx.fill(); ctx.fillStyle = teeth; ctx.beginPath(); ctx.moveTo(x - 2.8, y - 0.5); ctx.quadraticCurveTo(x, y + 1.2, x + 2.8, y - 0.5); ctx.quadraticCurveTo(x, y, x - 2.8, y - 0.5); ctx.fill(); fillEllipse(ctx, x, y + 2.6, 1.6, 1, tongue); break;
    case 'frown': ctx.beginPath(); ctx.moveTo(x - 2.4, y + 1); ctx.quadraticCurveTo(x, y - 1.2, x + 2.4, y + 1); ctx.stroke(); break;
    case 'wail': ctx.fillStyle = inner; ctx.beginPath(); ctx.moveTo(x - 2.6, y - 0.5); ctx.quadraticCurveTo(x, y + 0.5, x + 2.6, y - 0.5); ctx.quadraticCurveTo(x, y + 4.5, x - 2.6, y - 0.5); ctx.fill(); ctx.stroke(); break;
    case 'o': ctx.fillStyle = inner; ellipse(ctx, x, y + 0.6, 1.6, 2.1); ctx.fill(); ctx.stroke(); break;
    case 'o_small': ctx.fillStyle = inner; ellipse(ctx, x, y + 0.4, 0.9, 1.1); ctx.fill(); break;
    case 'yawn': ctx.fillStyle = inner; ellipse(ctx, x, y + 1.2, 2.2, 3); ctx.fill(); ctx.stroke(); fillEllipse(ctx, x, y + 3, 1.3, 1, tongue); break;
    case 'grit': ctx.fillStyle = teeth; fillRound(ctx, x - 2.6, y - 0.6, 5.2, 1.6, 0.5, teeth); ctx.strokeRect(x - 2.6, y - 0.6, 5.2, 1.6); for (let i = -1.5; i <= 1.5; i += 1) strokeLine(ctx, x + i, y - 0.6, x + i, y + 1, lip, 0.35); break;
    case 'wobble': ctx.beginPath(); ctx.moveTo(x - 2.6, y + 0.4); for (let i = 1; i <= 6; i++) ctx.lineTo(x - 2.6 + i * 0.87, y + 0.4 + (i % 2 ? -0.7 : 0.7)); ctx.stroke(); break;
    case 'hmm': ctx.beginPath(); ctx.moveTo(x - 1.8, y + 0.6); ctx.quadraticCurveTo(x, y - 0.2, x + 2, y + 0.9); ctx.stroke(); break;
    default: ctx.beginPath(); ctx.moveTo(x - 2, y + 0.2); ctx.quadraticCurveTo(x, y + 0.9, x + 2, y + 0.2); ctx.stroke();
  }
}

function drawFacialHair(ctx, type, color, fo, rx, ry, o) {
  if (!type || type === 'none') return;
  const c = color;
  ctx.fillStyle = c;
  if (type === 'mustache' || type === 'full_beard') {
    ctx.beginPath(); ctx.moveTo(fo, 3.9); ctx.quadraticCurveTo(fo + 2.5, 2.4, fo + 4.6, 4.2); ctx.quadraticCurveTo(fo + 2.5, 4.3, fo, 4.6); ctx.quadraticCurveTo(fo - 2.5, 4.3, fo - 4.3, 4.2); ctx.quadraticCurveTo(fo - 2.5, 2.4, fo, 3.9); ctx.fill();
  }
  if (type === 'goatee') { ctx.beginPath(); ctx.moveTo(fo - 1.8, 7); ctx.quadraticCurveTo(fo, ry * 1.25, fo + 2, 7); ctx.quadraticCurveTo(fo, 8, fo - 1.8, 7); ctx.fill(); }
  if (type === 'beard' || type === 'full_beard') {
    ctx.beginPath(); ctx.moveTo(-rx + 0.5, 1); ctx.quadraticCurveTo(-rx + 0.5, ry * 1.2, fo * 0.3, ry * 1.35); ctx.quadraticCurveTo(rx * 0.9, ry * 1.2, rx - 0.5, 2); ctx.quadraticCurveTo(rx * 0.7, ry * 0.95, fo * 0.3, ry * 0.95); ctx.quadraticCurveTo(-rx * 0.6, ry * 0.95, -rx + 0.5, 1); ctx.fill();
  }
  if (type === 'stubble') { ctx.fillStyle = rgba(c, 0.18); ctx.beginPath(); ctx.moveTo(-rx + 1, 2); ctx.quadraticCurveTo(-rx + 1, ry, fo * 0.3, ry * 1.02); ctx.quadraticCurveTo(rx * 0.8, ry, rx - 1, 3); ctx.quadraticCurveTo(rx * 0.5, ry * 0.75, fo * 0.3, ry * 0.7); ctx.quadraticCurveTo(-rx * 0.5, ry * 0.75, -rx + 1, 2); ctx.fill(); }
}

function drawGlasses(ctx, type, fo, dx, y, o) {
  if (!type || type === 'none') return;
  const r = 2.5;
  ctx.lineWidth = 0.6; ctx.strokeStyle = '#263238';
  const lx = fo - dx * (o.front ? 1 : 0.95), rxp = fo + dx;
  if (type === 'sunglasses') { ctx.fillStyle = rgba('#111', 0.9); fillRound(ctx, lx - r, y - r * 0.7, r * 2, r * 1.5, 1, ctx.fillStyle); fillRound(ctx, rxp - r, y - r * 0.7, r * 2, r * 1.5, 1, ctx.fillStyle); ctx.fillStyle = rgba('#fff', 0.25); fillRect(ctx, lx - r + 0.6, y - r * 0.5, 1.2, 1.5, ctx.fillStyle); fillRect(ctx, rxp - r + 0.6, y - r * 0.5, 1.2, 1.5, ctx.fillStyle); }
  else if (type === 'round_glasses') { ctx.beginPath(); ctx.arc(lx, y, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(rxp, y, r, 0, TAU); ctx.stroke(); ctx.fillStyle = rgba('#9ad6ff', 0.2); ctx.beginPath(); ctx.arc(lx, y, r, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(rxp, y, r, 0, TAU); ctx.fill(); }
  else { roundRect(ctx, lx - r, y - r * 0.8, r * 2, r * 1.6, 0.8); ctx.stroke(); ctx.fillStyle = rgba('#9ad6ff', 0.22); ctx.fill(); roundRect(ctx, rxp - r, y - r * 0.8, r * 2, r * 1.6, 0.8); ctx.stroke(); ctx.fill(); }
  strokeLine(ctx, lx + r, y, rxp - r, y, '#263238', 0.6);
  strokeLine(ctx, lx - r, y, lx - r - 2.2, y - 0.6, '#263238', 0.6);
}

// ---------- hair ----------
function hairFill(ctx, color, rx) { return linGrad(ctx, -rx, 0, rx, 0, [[0, shade(color, -0.25)], [0.55, color], [1, shade(color, 0.12)]]); }
function drawHairBack(ctx, hair, rx, ry, female, o) {
  const c = hair.color; const s = hair.style;
  ctx.fillStyle = hairFill(ctx, c, rx);
  const sway = Math.sin(o.t * 2) * 0.4;
  if (s === 'long') { ctx.beginPath(); ctx.moveTo(-rx - 1.2, -ry * 0.4); ctx.quadraticCurveTo(-rx - 2.5, ry * 1.2, -rx + 0.5 + sway, ry * 2.3); ctx.lineTo(rx - 0.5 + sway, ry * 2.3); ctx.quadraticCurveTo(rx + 2.5, ry * 1.2, rx + 1.2, -ry * 0.4); ctx.quadraticCurveTo(0, -ry * 1.5, -rx - 1.2, -ry * 0.4); ctx.fill(); }
  else if (s === 'wavy') { ctx.beginPath(); ctx.moveTo(-rx - 1.4, -ry * 0.4); for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(-rx - 3 + (i % 2) * 2.5, ry * (-0.1 + i * 0.5), -rx - 1.5 + sway, ry * (0.2 + i * 0.5)); ctx.lineTo(rx + 1.5 + sway, ry * 1.9); for (let i = 3; i >= 0; i--) ctx.quadraticCurveTo(rx + 3 - (i % 2) * 2.5, ry * (-0.1 + i * 0.5), rx + 1.4, ry * (-0.4 + i * 0.5)); ctx.quadraticCurveTo(0, -ry * 1.5, -rx - 1.4, -ry * 0.4); ctx.fill(); }
  else if (s === 'bob') { ctx.beginPath(); ctx.moveTo(-rx - 1.3, -ry * 0.5); ctx.quadraticCurveTo(-rx - 2.2, ry * 0.9, -rx - 0.5, ry * 1.15); ctx.lineTo(rx + 0.5, ry * 1.15); ctx.quadraticCurveTo(rx + 2.2, ry * 0.9, rx + 1.3, -ry * 0.5); ctx.quadraticCurveTo(0, -ry * 1.5, -rx - 1.3, -ry * 0.5); ctx.fill(); }
  else if (s === 'ponytail') { ctx.beginPath(); ctx.moveTo(-rx + 1, -ry * 0.3); ctx.quadraticCurveTo(-rx - 5 + sway * 2, ry * 0.3, -rx - 3 + sway * 3, ry * 1.6); ctx.quadraticCurveTo(-rx - 1, ry * 1.2, -rx - 0.5, ry * 0.3); ctx.fill(); fillCircle(ctx, -rx + 0.8, -ry * 0.25, 1.1, '#e53935'); }
  else if (s === 'pigtails') { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * (rx - 0.5), ry * 0.1); ctx.quadraticCurveTo(sx * (rx + 4) + sway, ry * 0.7, sx * (rx + 2.5) + sway, ry * 1.8); ctx.quadraticCurveTo(sx * (rx + 0.5), ry * 1.3, sx * (rx - 0.5), ry * 0.5); ctx.fill(); fillCircle(ctx, sx * (rx + 0.2), ry * 0.15, 1, '#e91e63'); } }
  else if (s === 'braid') { ctx.beginPath(); ctx.moveTo(-rx + 1, -ry * 0.2); ctx.lineTo(-rx - 1.5, ry * 2.2); ctx.lineTo(-rx + 1.5, ry * 2.2); ctx.lineTo(-rx + 2.5, ry * 0.2); ctx.fill(); for (let i = 0; i < 5; i++) fillEllipse(ctx, -rx + 0.4 - i * 0.2, ry * 0.3 + i * ry * 0.4, 1.7, 1.1, shade(c, i % 2 ? 0.1 : -0.15)); }
  else if (s === 'afro') { fillCircle(ctx, 0, -ry * 0.15, rx * 1.75, shade(c, -0.1)); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; fillCircle(ctx, Math.cos(a) * rx * 1.5, -ry * 0.15 + Math.sin(a) * rx * 1.5, rx * 0.55, i % 2 ? c : shade(c, -0.15)); } }
  else if (s === 'bun') { fillCircle(ctx, -rx * 0.35, -ry * 1.15, rx * 0.45, shade(c, -0.08)); fillCircle(ctx, -rx * 0.35, -ry * 1.15, rx * 0.3, c); }
  else if (s === 'curly' && female) { for (let i = 0; i < 8; i++) { const a = Math.PI * 0.1 + (i / 7) * Math.PI * 0.8; fillCircle(ctx, -Math.cos(a) * rx * 1.25 * (i < 4 ? 1 : -1), ry * 0.3 + Math.sin(a) * ry * 0.9, rx * 0.42, i % 2 ? c : shade(c, -0.15)); } }
}
function drawHairFront(ctx, hair, rx, ry, female, fo, hat, o) {
  const c = hair.color; const s = hair.style;
  if (s === 'bald' || hat === 'hijab' || hat === 'astronaut_helmet') return;
  ctx.fillStyle = hairFill(ctx, c, rx);
  const top = -ry * 1.02;
  if (s === 'receding') { ctx.beginPath(); ctx.moveTo(-rx - 0.5, -ry * 0.3); ctx.quadraticCurveTo(-rx - 0.5, -ry * 0.95, -rx * 0.5, -ry * 0.98); ctx.quadraticCurveTo(-rx * 0.2, -ry * 0.55, -rx * 0.7, -ry * 0.45); ctx.quadraticCurveTo(-rx - 0.3, -ry * 0.1, -rx - 0.5, ry * 0.3); ctx.lineTo(-rx + 1, ry * 0.3); ctx.lineTo(-rx + 1, -ry * 0.3); ctx.fill(); fillPoly(ctx, [[rx - 1, -ry * 0.3], [rx + 0.5, -ry * 0.4], [rx + 0.5, ry * 0.3], [rx - 1, ry * 0.3]], c); return; }
  if (s === 'buzz') { ctx.fillStyle = rgba(c, 0.75); ctx.beginPath(); ctx.moveTo(-rx - 0.3, -ry * 0.1); ctx.bezierCurveTo(-rx - 0.3, -ry * 1.3, rx + 0.3, -ry * 1.3, rx + 0.3, -ry * 0.1); ctx.quadraticCurveTo(rx * 0.3 + fo, -ry * 0.55, -rx - 0.3, -ry * 0.1); ctx.fill(); return; }
  // generic cap
  ctx.beginPath();
  ctx.moveTo(-rx - 0.9, ry * 0.05);
  ctx.bezierCurveTo(-rx - 1.2, -ry * 1.45, rx + 1.2, -ry * 1.45, rx + 0.9, -ry * 0.05);
  // fringe edge (varies by style)
  if (s === 'side_part') { ctx.quadraticCurveTo(rx * 0.6 + fo, -ry * 0.35, rx * 0.15 + fo, -ry * 0.65); ctx.quadraticCurveTo(-rx * 0.4, -ry * 0.35, -rx - 0.9, ry * 0.05); }
  else if (s === 'long' || s === 'wavy' || s === 'bob' || s === 'braid' || s === 'ponytail' || s === 'pigtails' || s === 'bun') { ctx.quadraticCurveTo(rx * 0.9 + fo, -ry * 0.55, fo + rx * 0.35, -ry * 0.42); ctx.quadraticCurveTo(fo, -ry * 0.75, fo - rx * 0.3, -ry * 0.45); ctx.quadraticCurveTo(-rx * 0.8, -ry * 0.5, -rx - 0.9, ry * 0.05); }
  else if (s === 'curly' || s === 'afro') { for (let i = 0; i < 6; i++) { const x = rx + 0.9 - (i + 0.5) * ((rx * 2 + 1.8) / 6); ctx.quadraticCurveTo(x + 1.5, -ry * 0.3, x, -ry * 0.55); } ctx.lineTo(-rx - 0.9, ry * 0.05); }
  else if (s === 'spiky' || s === 'mohawk') { ctx.quadraticCurveTo(rx * 0.5 + fo, -ry * 0.5, -rx - 0.9, ry * 0.05); }
  else { ctx.quadraticCurveTo(rx * 0.4 + fo, -ry * 0.5, -rx - 0.9, ry * 0.05); } // short
  ctx.closePath(); ctx.fill();
  if (s === 'spiky') { for (let i = 0; i < 6; i++) { const x = -rx + 1 + i * (rx * 2 - 2) / 5; fillPoly(ctx, [[x - 1.6, -ry * 0.95], [x + 0.4 + (i - 2.5) * 0.3, -ry * 1.6 - (i % 2) * 1.2], [x + 1.8, -ry * 0.95]], c); } }
  if (s === 'mohawk') { for (let i = 0; i < 5; i++) { const x = -rx * 0.6 + i * rx * 0.35; fillPoly(ctx, [[x - 1.4, -ry * 1.1], [x + 0.6, -ry * 2 + Math.abs(i - 2) * 1.2], [x + 2, -ry * 1.1]], hair.color2 || c); } }
  if (s === 'bun' || s === 'ponytail') { strokeLine(ctx, -rx * 0.2, -ry * 1.1, rx * 0.5 + fo, -ry * 0.5, rgba('#000', 0.15), 0.5); }
  // shine
  ctx.strokeStyle = rgba('#fff', 0.25); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-rx * 0.5, -ry * 1.05); ctx.quadraticCurveTo(0, -ry * 1.25, rx * 0.45, -ry * 1.05); ctx.stroke();
}

// ---------- hats ----------
function drawHat(ctx, hat, app, rx, ry, fo, o) {
  if (!hat || hat === 'none') return;
  const col = app.outfit.hatColor || '#37474f';
  const top = -ry;
  const band = (y, h, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, y, rx + 1.2, h, 0, 0, TAU); ctx.fill(); };
  switch (hat) {
    case 'cap': { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-rx - 0.8, -ry * 0.55); ctx.bezierCurveTo(-rx - 1, -ry * 1.5, rx + 1, -ry * 1.5, rx + 0.8, -ry * 0.55); ctx.closePath(); ctx.fill(); fillRound(ctx, rx - 2, -ry * 0.72, rx * 0.9 + 3, 1.6, 0.8, shade(col, -0.2)); fillCircle(ctx, 0, -ry * 1.35, 0.7, shade(col, 0.2)); break; }
    case 'police_cap': { const c = app.outfit.hatColor || '#1a237e'; fillRound(ctx, -rx - 1.4, -ry * 0.95, rx * 2 + 2.8, 3.2, 1, shade(c, -0.3)); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 1.6, -ry * 0.8); ctx.quadraticCurveTo(-rx - 1, -ry * 1.75, 0, -ry * 1.7); ctx.quadraticCurveTo(rx + 1.5, -ry * 1.75, rx + 1.6, -ry * 0.8); ctx.fill(); fillRound(ctx, rx - 1.5, -ry * 0.78, rx * 0.8 + 2.5, 1.5, 0.7, '#111'); fillPoly(ctx, [[fo - 1.2, -ry * 1.15], [fo, -ry * 1.5], [fo + 1.2, -ry * 1.15], [fo, -ry * 0.95]], '#f1c40f'); break; }
    case 'pilot_cap': { fillRound(ctx, -rx - 1.4, -ry * 0.95, rx * 2 + 2.8, 3.2, 1, '#111'); ctx.fillStyle = '#f5f5f5'; ctx.beginPath(); ctx.moveTo(-rx - 1.6, -ry * 0.8); ctx.quadraticCurveTo(-rx - 1, -ry * 1.75, 0, -ry * 1.7); ctx.quadraticCurveTo(rx + 1.5, -ry * 1.75, rx + 1.6, -ry * 0.8); ctx.fill(); fillRound(ctx, rx - 1.5, -ry * 0.78, rx * 0.8 + 2.5, 1.5, 0.7, '#111'); fillRect(ctx, -rx - 1.4, -ry * 0.95, rx * 2 + 2.8, 1, '#f1c40f'); fillCircle(ctx, fo, -ry * 1.25, 1.3, '#f1c40f'); break; }
    case 'topi': { // Nepali dhaka topi: slightly tapered cylinder with pattern
      const c = app.outfit.hatColor || '#b71c1c'; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 0.5, -ry * 0.7); ctx.lineTo(-rx + 0.8, -ry * 1.55); ctx.lineTo(rx - 0.8, -ry * 1.6); ctx.lineTo(rx + 0.5, -ry * 0.7); ctx.quadraticCurveTo(0, -ry * 0.95, -rx - 0.5, -ry * 0.7); ctx.fill();
      ctx.strokeStyle = rgba('#fff', 0.7); ctx.lineWidth = 0.4; for (let i = 0; i < 4; i++) { const y = -ry * 0.85 - i * ry * 0.18; ctx.beginPath(); ctx.moveTo(-rx + i * 0.3 - 0.2, y); ctx.lineTo(rx - i * 0.3 + 0.2, y - 0.1); ctx.stroke(); } for (let i = -3; i <= 3; i++) fillPoly(ctx, [[i * 2.2 - 0.6, -ry * 1.0], [i * 2.2, -ry * 1.25], [i * 2.2 + 0.6, -ry * 1.0]], '#fdd835'); ctx.strokeStyle = '#111'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(-rx - 0.5, -ry * 0.7); ctx.lineTo(-rx + 0.8, -ry * 1.55); ctx.lineTo(rx - 0.8, -ry * 1.6); ctx.lineTo(rx + 0.5, -ry * 0.7); ctx.stroke(); break; }
    case 'turban': { const c = app.outfit.hatColor || '#f57c00'; ctx.fillStyle = linGrad(ctx, -rx, 0, rx, 0, [[0, shade(c, -0.25)], [0.6, c], [1, shade(c, -0.05)]]); ctx.beginPath(); ctx.moveTo(-rx - 1.8, -ry * 0.45); ctx.bezierCurveTo(-rx - 2.2, -ry * 1.9, rx + 2.2, -ry * 1.9, rx + 1.8, -ry * 0.45); ctx.quadraticCurveTo(fo, -ry * 0.75, -rx - 1.8, -ry * 0.45); ctx.fill(); ctx.strokeStyle = rgba('#000', 0.18); ctx.lineWidth = 0.6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-rx - 1.5 + i * 1.2, -ry * (0.5 + i * 0.12)); ctx.quadraticCurveTo(0, -ry * (1.65 - i * 0.35), rx + 1.5 - i * 0.6, -ry * (0.55 + i * 0.2)); ctx.stroke(); } fillPoly(ctx, [[rx + 0.5, -ry * 1.2], [rx + 2.8, -ry * 1.75], [rx + 1.8, -ry * 0.9]], shade(c, 0.1)); break; }
    case 'straw_hat': { const c = app.outfit.hatColor || '#e6c46a'; band(-ry * 0.62, 2.2, shade(c, -0.1)); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -ry * 0.62, rx + 7, 2.6, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-rx + 0.5, -ry * 0.62); ctx.lineTo(-rx + 1.5, -ry * 1.55); ctx.quadraticCurveTo(0, -ry * 1.8, rx - 1.5, -ry * 1.55); ctx.lineTo(rx - 0.5, -ry * 0.62); ctx.fill(); fillRect(ctx, -rx + 1.2, -ry * 1.0, rx * 2 - 2.4, 1.3, '#8d6e63'); break; }
    case 'sun_hat': { const c = app.outfit.hatColor || '#fce4ec'; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -ry * 0.6, rx + 7, 3, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-rx + 0.5, -ry * 0.6); ctx.quadraticCurveTo(-rx, -ry * 1.7, 0, -ry * 1.65); ctx.quadraticCurveTo(rx, -ry * 1.7, rx - 0.5, -ry * 0.6); ctx.fill(); fillRect(ctx, -rx + 0.8, -ry * 0.95, rx * 2 - 1.6, 1.4, '#ec407a'); break; }
    case 'cowboy_hat': { const c = app.outfit.hatColor || '#795548'; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 6, -ry * 0.75); ctx.quadraticCurveTo(-rx - 6, -ry * 1.3, -rx, -ry * 0.8); ctx.lineTo(rx, -ry * 0.8); ctx.quadraticCurveTo(rx + 6, -ry * 1.3, rx + 6, -ry * 0.75); ctx.quadraticCurveTo(0, -ry * 0.45, -rx - 6, -ry * 0.75); ctx.fill(); ctx.beginPath(); ctx.moveTo(-rx + 0.5, -ry * 0.75); ctx.lineTo(-rx + 1, -ry * 1.6); ctx.quadraticCurveTo(0, -ry * 1.4, rx - 1, -ry * 1.6); ctx.lineTo(rx - 0.5, -ry * 0.75); ctx.fill(); fillRect(ctx, -rx + 0.8, -ry * 1.05, rx * 2 - 1.6, 1.2, '#3e2723'); break; }
    case 'crown': { ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(-rx + 0.5, -ry * 0.85); ctx.lineTo(-rx + 0.5, -ry * 1.6); ctx.lineTo(-rx * 0.5, -ry * 1.2); ctx.lineTo(0, -ry * 1.75); ctx.lineTo(rx * 0.5, -ry * 1.2); ctx.lineTo(rx - 0.5, -ry * 1.6); ctx.lineTo(rx - 0.5, -ry * 0.85); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#b7950b'; ctx.lineWidth = 0.4; ctx.stroke(); fillCircle(ctx, 0, -ry * 1.05, 0.9, '#e74c3c'); fillCircle(ctx, -rx * 0.55, -ry * 1.0, 0.6, '#3498db'); fillCircle(ctx, rx * 0.55, -ry * 1.0, 0.6, '#2ecc71'); break; }
    case 'helmet': { const c = app.outfit.hatColor || '#fdd835'; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 1.2, -ry * 0.65); ctx.bezierCurveTo(-rx - 1.4, -ry * 1.75, rx + 1.4, -ry * 1.75, rx + 1.2, -ry * 0.65); ctx.closePath(); ctx.fill(); ctx.fillStyle = shade(c, -0.15); ctx.beginPath(); ctx.ellipse(0, -ry * 0.62, rx + 2.6, 1.6, 0, 0, TAU); ctx.fill(); fillRect(ctx, -1, -ry * 1.72, 2, ry * 0.95, shade(c, 0.15)); break; }
    case 'chef_hat': { ctx.fillStyle = '#fafafa'; fillRound(ctx, -rx + 0.3, -ry * 1.25, rx * 2 - 0.6, ry * 0.6, 0.6, '#fafafa'); ctx.beginPath(); ctx.moveTo(-rx + 0.3, -ry * 1.2); ctx.bezierCurveTo(-rx - 3, -ry * 2.6, rx + 3, -ry * 2.6, rx - 0.3, -ry * 1.2); ctx.fill(); ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(-rx + 0.3, -ry * 1.25); ctx.lineTo(rx - 0.3, -ry * 1.25); ctx.stroke(); break; }
    case 'wizard_hat': { const c = app.outfit.hatColor || '#4a148c'; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -ry * 0.7, rx + 5, 2.4, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-rx + 0.5, -ry * 0.7); ctx.quadraticCurveTo(0, -ry * 1.5, rx * 0.5, -ry * 3 + Math.sin(o.t * 2) * 0.5); ctx.quadraticCurveTo(rx * 0.6, -ry * 1.4, rx - 0.5, -ry * 0.7); ctx.fill(); for (let i = 0; i < 3; i++) { const sx = -2 + i * 2.5, sy = -ry * (1.1 + i * 0.4); ctx.fillStyle = '#ffd54f'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 0.4 : 0.9; const a = (k / 10) * TAU; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } ctx.fill(); } break; }
    case 'bandana': { const c = app.outfit.hatColor || '#c62828'; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 1, -ry * 0.55); ctx.bezierCurveTo(-rx - 1.2, -ry * 1.45, rx + 1.2, -ry * 1.45, rx + 1, -ry * 0.55); ctx.quadraticCurveTo(fo, -ry * 0.8, -rx - 1, -ry * 0.55); ctx.fill(); fillPoly(ctx, [[-rx - 0.5, -ry * 0.6], [-rx - 4 + Math.sin(o.t * 3), ry * 0.2], [-rx - 1.5, ry * 0.3], [-rx + 0.5, -ry * 0.3]], c); ctx.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 6; i++) fillCircle(ctx, -rx + 1.5 + i * 3, -ry * (1.05 + (i % 2) * 0.15), 0.4, 'rgba(255,255,255,0.5)'); break; }
    case 'nurse_cap': { fillPoly(ctx, [[-rx * 0.6, -ry * 0.95], [-rx * 0.5, -ry * 1.5], [rx * 0.6, -ry * 1.55], [rx * 0.7, -ry * 0.95]], '#fff'); fillRect(ctx, -0.4, -ry * 1.42, 0.8 + 2, 0.6, '#e53935'); fillRect(ctx, 0.6, -ry * 1.5, 0.6, 1.8, '#e53935'); break; }
    case 'beanie': { const c = app.outfit.hatColor || '#1565c0'; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-rx - 1, -ry * 0.35); ctx.bezierCurveTo(-rx - 1.3, -ry * 1.8, rx + 1.3, -ry * 1.8, rx + 1, -ry * 0.35); ctx.closePath(); ctx.fill(); fillRound(ctx, -rx - 1.2, -ry * 0.75, rx * 2 + 2.4, 2.4, 1, shade(c, -0.2)); fillCircle(ctx, 0, -ry * 1.65, 1.4, shade(c, 0.4)); break; }
    case 'hijab': { // the hood is drawn behind the head; here only the rim around the face
      const c = app.outfit.hatColor || '#6a1b9a';
      ctx.strokeStyle = c; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-rx + 0.4, ry * 0.75); ctx.lineTo(-rx + 0.4, -ry * 0.1); ctx.bezierCurveTo(-rx + 0.4, -ry * 1.1, rx - 0.4, -ry * 1.1, rx - 0.4, -ry * 0.1); ctx.lineTo(rx - 0.4, ry * 0.75); ctx.stroke();
      break; }
    case 'party_hat': { const c = app.outfit.hatColor || '#ff6f00'; fillPoly(ctx, [[-rx * 0.55, -ry * 0.95], [0, -ry * 2.3], [rx * 0.55, -ry * 0.95]], c); ctx.fillStyle = '#fff'; for (let i = 0; i < 5; i++) fillCircle(ctx, -rx * 0.3 + (i % 3) * rx * 0.3, -ry * (1.1 + i * 0.22), 0.45, '#fff'); fillCircle(ctx, 0, -ry * 2.3, 1, '#ffd54f'); break; }
    case 'grad_cap': { ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.moveTo(-rx - 0.6, -ry * 0.6); ctx.bezierCurveTo(-rx - 0.8, -ry * 1.3, rx + 0.8, -ry * 1.3, rx + 0.6, -ry * 0.6); ctx.closePath(); ctx.fill(); fillPoly(ctx, [[-rx - 5, -ry * 1.05], [fo, -ry * 1.5], [rx + 5, -ry * 1.05], [fo, -ry * 0.75]], '#212121'); strokeLine(ctx, fo, -ry * 1.1, rx + 4, -ry * 0.3 + Math.sin(o.t * 2), '#fdd835', 0.6); fillCircle(ctx, rx + 4, -ry * 0.3 + Math.sin(o.t * 2), 0.9, '#fdd835'); break; }
    case 'beret': { const c = app.outfit.hatColor || '#c62828'; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(-1.5, -ry * 1.05, rx + 2.5, ry * 0.45, -0.15, 0, TAU); ctx.fill(); fillRound(ctx, -rx - 0.5, -ry * 0.85, rx * 2 + 1, 1.4, 0.7, shade(c, -0.25)); break; }
    case 'headband': { fillRound(ctx, -rx - 0.8, -ry * 0.72, rx * 2 + 1.6, 1.6, 0.8, app.outfit.hatColor || '#e91e63'); break; }
    case 'santa_hat': { ctx.fillStyle = '#d32f2f'; ctx.beginPath(); ctx.moveTo(-rx - 0.8, -ry * 0.7); ctx.quadraticCurveTo(-rx, -ry * 1.9, rx * 0.2, -ry * 1.9); ctx.quadraticCurveTo(rx + 5, -ry * 1.6, rx + 4, -ry * 0.6 + Math.sin(o.t * 2) * 0.5); ctx.quadraticCurveTo(rx + 2, -ry * 1.2, rx + 0.8, -ry * 0.7); ctx.fill(); fillRound(ctx, -rx - 1.4, -ry * 0.95, rx * 2 + 2.8, 2.6, 1.3, '#fff'); fillCircle(ctx, rx + 4, -ry * 0.6 + Math.sin(o.t * 2) * 0.5, 1.5, '#fff'); break; }
    case 'astronaut_helmet': { ctx.fillStyle = rgba('#b3e5fc', 0.35); ctx.beginPath(); ctx.ellipse(0, -ry * 0.1, rx + 3.5, ry + 3.5, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#eceff1'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.strokeStyle = rgba('#fff', 0.6); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(0, -ry * 0.1, rx + 2.5, ry + 2.5, 0, Math.PI * 1.15, Math.PI * 1.5); ctx.stroke(); break; }
  }
}
