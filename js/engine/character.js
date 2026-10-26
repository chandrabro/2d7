// 2D character rig. A character is described by an "appearance" object (see presets.js)
// and drawn in a given "pose" (see actions.js). Coordinates are in character units:
// origin = point between the feet on the ground, +y down, +x = the direction the
// character faces. 100 units = full adult height. The caller scales to pixels.

import { DEG, TAU, clamp, lerp, shade, mixColor, rgba, roundRect, ellipse, circle, poly, curve, fillRect, fillEllipse, fillCircle, fillPoly, fillRound, strokeLine, linGrad, radGrad } from './util.js';
import { drawHead } from './face.js';
import { drawProp } from './props.js';

export const BUILDS = {
  adult:  { scale: 1,    head: 1,    widthMul: 1 },
  tall:   { scale: 1.08, head: 0.95, widthMul: 1 },
  child:  { scale: 0.66, head: 1.3,  widthMul: 1.05 },
  teen:   { scale: 0.85, head: 1.1,  widthMul: 0.95 },
  elder:  { scale: 0.95, head: 1,    widthMul: 1 },
};

/** Canonical proportions in units (adult). */
export function proportions(app) {
  const b = BUILDS[app.build] || BUILDS.adult;
  const female = app.gender === 'female';
  const wm = (app.weight === 'heavy' ? 1.25 : app.weight === 'slim' ? 0.88 : 1) * b.widthMul;
  return {
    s: b.scale,
    headCY: -89, headRX: 9 * b.head, headRY: 11 * b.head,
    neckTop: -78, neckW: female ? 3 : 3.6,
    shoulderY: -73, shoulderHW: (female ? 8.6 : 10) * wm,
    waistY: -58, waistHW: (female ? 6.2 : 8) * wm,
    hipY: -47, hipHW: (female ? 8.6 : 7.6) * wm,
    upperArm: 15, foreArm: 14, armW: (female ? 2.6 : 3.1) * wm, handR: 2.6,
    thigh: 21, shin: 20, legW: (female ? 3.4 : 3.8) * wm, footL: 8, footH: 3.6,
  };
}

// ---------- pose helpers ----------
export const IDLE_POSE = {
  bodyX: 0, bodyY: 0, rot: 0,
  torso: 0, head: 0, headTilt: 0,
  armN: [6, 10], armF: [-6, 10],   // [shoulder, elbow] degrees. shoulder + = forward, elbow + = flex forward
  legN: [2, 0], legF: [-2, 0],     // [hip, knee]. hip + = forward, knee + = bend backward
  footN: 0, footF: 0,              // foot pitch
  handN: 'open', handF: 'open',    // open | fist | point | grip | flat
  face: 'neutral', mouthOpen: 0, eyes: null, blink: true,
  prop: null, fx: [],
  sit: false, lookBack: false,
};

export function composePose(base, over) {
  const p = { ...base, ...over };
  if (over && over.fx === undefined) p.fx = base.fx || [];
  return p;
}
function lerpArr(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
export function lerpPose(a, b, t) {
  if (t <= 0) return a; if (t >= 1) return b;
  const p = { ...b };
  for (const k of ['bodyX', 'bodyY', 'rot', 'torso', 'head', 'headTilt', 'footN', 'footF', 'mouthOpen']) p[k] = lerp(a[k] || 0, b[k] || 0, t);
  for (const k of ['armN', 'armF', 'legN', 'legF']) p[k] = lerpArr(a[k] || [0, 0], b[k] || [0, 0], t);
  for (const k of ['handN', 'handF', 'face', 'eyes', 'sit', 'lookBack']) p[k] = t < 0.5 ? a[k] : b[k];
  p.prop = t < 0.5 ? a.prop : b.prop;
  if (a.prop && b.prop && a.prop.type === b.prop.type) p.prop = { ...b.prop, angle: lerp(a.prop.angle || 0, b.prop.angle || 0, t), dx: lerp(a.prop.dx || 0, b.prop.dx || 0, t), dy: lerp(a.prop.dy || 0, b.prop.dy || 0, t) };
  p.fx = t < 0.5 ? a.fx : b.fx;
  return p;
}

// ---------- outfit colour resolution ----------
function limbColors(app) {
  const o = app.outfit;
  const skin = app.skin;
  const sleeves = o.sleeves || (['tshirt', 'tanktop', 'blouse'].includes(o.top) ? 'short' : 'long');
  const topC = o.topColor;
  const upper = sleeves === 'none' ? skin : topC;
  const fore = sleeves === 'long' ? (o.top === 'labcoat' ? '#f5f5f5' : topC) : skin;
  const bottom = o.bottom;
  let thigh = o.bottomColor, shin = o.bottomColor;
  if (bottom === 'shorts') shin = skin;
  if (bottom === 'skirt' || bottom === 'none') { thigh = app.stockings || skin; shin = app.stockings || skin; }
  if (bottom === 'dhoti') { thigh = o.bottomColor; shin = skin; }
  const shoe = o.shoes === 'barefoot' ? skin : (o.shoeColor || '#333');
  return { upper, fore, hand: skin, thigh, shin, shoe, sleeves };
}

// ---------- drawing primitives ----------
function outlineColor(c) { return shade(c, -0.45); }
/** Draw a limb segment from (0,0) downward of length L and width w. */
function segment(ctx, L, w, color, { round = true, taper = 0.85 } = {}) {
  const w2 = w * taper;
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.lineTo(-w2, L);
  if (round) ctx.arc(0, L, w2, Math.PI, 0, true); else ctx.lineTo(w2, L);
  ctx.lineTo(w, 0);
  ctx.arc(0, 0, w, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.lineWidth = 0.5; ctx.strokeStyle = rgba(outlineColor(color), 0.6); ctx.stroke();
}
function rot(ctx, deg) { ctx.rotate(-deg * DEG); }

function drawHand(ctx, r, color, shape) {
  ctx.lineWidth = 0.5; ctx.strokeStyle = rgba(outlineColor(color), 0.7);
  if (shape === 'fist' || shape === 'grip') { fillCircle(ctx, 0, r * 0.8, r * 1.05, color); ctx.stroke(); strokeLine(ctx, -r * 0.5, r * 0.9, r * 0.6, r * 0.9, rgba(outlineColor(color), 0.5), 0.4); return; }
  if (shape === 'point') { fillEllipse(ctx, 0, r * 0.8, r * 0.95, r * 1.1, color); ctx.stroke(); roundRect(ctx, -r * 0.35, r * 1.2, r * 0.7, r * 1.9, r * 0.35); ctx.fillStyle = color; ctx.fill(); ctx.stroke(); return; }
  if (shape === 'flat') { roundRect(ctx, -r * 0.8, 0, r * 1.6, r * 2.6, r * 0.6); ctx.fillStyle = color; ctx.fill(); ctx.stroke(); return; }
  // open hand: palm + 3 finger bumps + thumb
  fillEllipse(ctx, 0, r, r * 0.95, r * 1.25, color); ctx.stroke();
  for (let i = -1; i <= 1; i++) { fillCircle(ctx, i * r * 0.55, r * 2.05, r * 0.42, color); }
  fillCircle(ctx, r * 0.95, r * 0.9, r * 0.4, color);
}

function drawFoot(ctx, P, color, type, pitch) {
  rot(ctx, pitch);
  const L = P.footL, h = P.footH;
  if (type === 'heels') {
    poly(ctx, [[-P.legW * 0.9, 0], [L * 0.9, h * 0.3], [L, h], [L * 0.5, h * 1.1], [-P.legW * 0.4, h * 1.6], [-P.legW * 0.9, h * 1.6]]);
    ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = rgba(outlineColor(color), 0.7); ctx.lineWidth = 0.5; ctx.stroke(); return;
  }
  if (type === 'sandals' || type === 'barefoot') {
    roundRect(ctx, -P.legW * 0.9, -0.5, L * 1.05, h, 1.6); ctx.fillStyle = type === 'barefoot' ? color : '#e9d8b4'; ctx.fill();
    if (type === 'sandals') { strokeLine(ctx, L * 0.3, -0.5, L * 0.6, h * 0.9, color, 0.8); }
    ctx.strokeStyle = rgba(outlineColor(color), 0.7); ctx.lineWidth = 0.5; roundRect(ctx, -P.legW * 0.9, -0.5, L * 1.05, h, 1.6); ctx.stroke(); return;
  }
  const hi = type === 'boots' ? h * 2.2 : h;
  roundRect(ctx, -P.legW * 1.05, -hi + h * 0.9, P.legW * 2.1, hi, 1.4); ctx.fillStyle = color; ctx.fill();
  roundRect(ctx, -P.legW * 0.95, -0.4, L * 1.05, h, 1.8); ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = rgba(outlineColor(color), 0.7); ctx.lineWidth = 0.5; ctx.stroke();
  if (type === 'sneakers') { fillRound(ctx, -P.legW * 0.95, h * 0.55, L * 1.05, h * 0.45, 1, '#f4f4f4'); strokeLine(ctx, 0, 0.2, L * 0.6, 0.6, '#fff', 0.5); }
  if (type === 'formal') { fillRound(ctx, L * 0.2, -0.4, L * 0.85, h * 0.5, 1, shade(color, 0.25)); }
}

function drawArm(ctx, P, pose, which, colors, app, hasPropHand, t) {
  const [sh, el] = pose['arm' + which];
  const side = which === 'N' ? 1 : -1; // near arm pivots slightly forward
  ctx.save();
  ctx.translate(side * 1.2, P.shoulderY + 1.2);
  rot(ctx, sh);
  segment(ctx, P.upperArm, P.armW, colors.upper, { taper: 0.88 });
  if (colors.sleeves === 'short') { fillRound(ctx, -P.armW * 1.15, -1.5, P.armW * 2.3, P.upperArm * 0.5, 1.2, colors.upper); }
  if (app.outfit.accessories?.includes('epaulettes') && which === 'N') { fillRect(ctx, -P.armW * 1.4, -2.2, P.armW * 2.8, 1.4, '#f1c40f'); }
  if (app.outfit.top === 'vest' && which === 'N') { }
  ctx.translate(0, P.upperArm);
  rot(ctx, el);
  segment(ctx, P.foreArm, P.armW * 0.9, colors.fore, { taper: 0.82 });
  if (app.outfit.accessories?.includes('watch') && which === 'N') { fillRect(ctx, -P.armW, P.foreArm - 3.2, P.armW * 2, 1.6, '#222'); fillCircle(ctx, 0, P.foreArm - 2.4, 1.1, '#cfd8dc'); }
  ctx.translate(0, P.foreArm);
  const hand = pose['hand' + which];
  drawHand(ctx, P.handR, colors.hand, hand);
  if (pose.prop && hasPropHand) {
    ctx.save(); ctx.translate(pose.prop.dx || 0, (pose.prop.dy || 0) + P.handR * 0.9); rot(ctx, pose.prop.angle || 0);
    drawProp(ctx, pose.prop, app, t); ctx.restore();
  }
  ctx.restore();
}
function drawLeg(ctx, P, pose, which, colors, app) {
  const [hip, knee] = pose['leg' + which];
  const side = which === 'N' ? 1 : -1;
  ctx.save();
  ctx.translate(side * P.hipHW * 0.5, P.hipY + 1);
  rot(ctx, hip);
  const bottom = app.outfit.bottom;
  segment(ctx, P.thigh, P.legW, colors.thigh, { taper: 0.9 });
  if (bottom === 'shorts') { fillRound(ctx, -P.legW * 1.05, -1, P.legW * 2.1, P.thigh * 0.6, 1.2, colors.thigh); }
  if (bottom === 'suruwal') { fillRound(ctx, -P.legW * 1.2, -1, P.legW * 2.4, P.thigh * 0.95, 2, colors.thigh); }
  ctx.translate(0, P.thigh);
  rot(ctx, -knee);
  segment(ctx, P.shin, P.legW * 0.88, colors.shin, { taper: 0.78 });
  ctx.translate(0, P.shin);
  drawFoot(ctx, P, colors.shoe, app.outfit.shoes || 'sneakers', pose['foot' + which] || 0);
  ctx.restore();
}

function drawTorso(ctx, P, pose, app, colors) {
  const o = app.outfit;
  const c = o.topColor, c2 = o.trimColor || shade(c, 0.35);
  const top = o.top;
  const sw = P.shoulderHW, ww = P.waistHW, hw = P.hipHW;
  const sy = P.shoulderY, wy = P.waistY, hy = P.hipY;
  const long = ['kurta', 'daura', 'dress', 'robe', 'labcoat', 'sari', 'coat'].includes(top);
  const hemY = top === 'robe' ? -2 : top === 'dress' ? (o.dressLength === 'long' ? -4 : -24) : top === 'labcoat' ? -22 : top === 'sari' ? -2 : top === 'kurta' ? -26 : top === 'daura' ? -30 : top === 'coat' ? -24 : hy + 2;
  // lower flap (skirt / kurta / robe) drawn behind the torso but in front of legs
  if (o.bottom === 'skirt') {
    const skL = o.skirtLength === 'long' ? -6 : -28;
    poly(ctx, [[-hw - 0.5, hy - 2], [hw + 0.5, hy - 2], [hw + (skL - hy) * 0.4, skL], [-hw - (skL - hy) * 0.4, skL]]);
    ctx.fillStyle = linGrad(ctx, -hw, 0, hw, 0, [[0, shade(o.bottomColor, -0.2)], [0.6, o.bottomColor], [1, shade(o.bottomColor, -0.1)]]); ctx.fill();
    ctx.strokeStyle = rgba(outlineColor(o.bottomColor), 0.6); ctx.lineWidth = 0.5; ctx.stroke();
  }
  if (o.bottom === 'dhoti') {
    poly(ctx, [[-hw - 0.5, hy], [hw + 0.5, hy], [hw + 3, hy + 18], [2, hy + 22], [-2, hy + 20], [-hw - 3, hy + 18]]);
    ctx.fillStyle = o.bottomColor; ctx.fill(); ctx.strokeStyle = rgba(outlineColor(o.bottomColor), 0.6); ctx.lineWidth = 0.5; ctx.stroke();
    for (let i = -1; i <= 1; i++) strokeLine(ctx, i * 2.5, hy + 2, i * 3.2, hy + 19, rgba('#000', 0.1), 0.5);
  }
  if (long) {
    const flare = top === 'robe' || top === 'dress' || top === 'sari' ? 0.32 : 0.12;
    poly(ctx, [[-hw - 0.5, hy - 4], [hw + 0.5, hy - 4], [hw + (hemY - hy) * flare + 1, hemY], [-hw - (hemY - hy) * flare - 1, hemY]]);
    ctx.fillStyle = linGrad(ctx, -hw, 0, hw, 0, [[0, shade(c, -0.22)], [0.6, c], [1, shade(c, -0.1)]]); ctx.fill();
    ctx.strokeStyle = rgba(outlineColor(c), 0.6); ctx.lineWidth = 0.5; ctx.stroke();
    if (top === 'labcoat' || top === 'coat' || top === 'robe') { strokeLine(ctx, 1.5, hy - 4, 1.5, hemY, rgba('#000', 0.18), 0.6); }
    if (top === 'kurta' || top === 'daura') { strokeLine(ctx, hw + 1, hy + 4, hw + 2, hemY, rgba('#000', 0.15), 0.5); }
  }
  // main torso
  ctx.beginPath();
  ctx.moveTo(-sw, sy);
  ctx.quadraticCurveTo(-sw - 0.6, (sy + wy) / 2, -ww, wy);
  ctx.quadraticCurveTo(-hw - 0.5, (wy + hy) / 2 + 2, -hw, hy + 1);
  ctx.lineTo(hw, hy + 1);
  ctx.quadraticCurveTo(hw + 0.5, (wy + hy) / 2 + 2, ww, wy);
  ctx.quadraticCurveTo(sw + 0.6, (sy + wy) / 2, sw, sy);
  ctx.quadraticCurveTo(0, sy - 2.4, -sw, sy);
  ctx.closePath();
  ctx.fillStyle = linGrad(ctx, -sw, 0, sw, 0, [[0, shade(c, -0.22)], [0.55, c], [1, shade(c, -0.08)]]); ctx.fill();
  ctx.strokeStyle = rgba(outlineColor(c), 0.6); ctx.lineWidth = 0.5; ctx.stroke();
  // chest shading for females
  if (app.gender === 'female') { ctx.fillStyle = rgba('#000', 0.07); ellipse(ctx, 2.2, sy + 7, 4.4, 2.2); ctx.fill(); }
  // garment details
  const neckW = P.neckW + 1.5;
  if (top === 'tshirt' || top === 'hoodie' || top === 'tanktop') { ctx.fillStyle = c2; ellipse(ctx, 0, sy - 0.4, neckW, 1.4); ctx.fill(); }
  if (top === 'tanktop') { ctx.fillStyle = app.skin; fillPoly(ctx, [[-sw, sy], [-sw + 4.2, sy], [-ww + 1, wy - 2], [-sw - 0.5, wy - 6]], app.skin); fillPoly(ctx, [[sw, sy], [sw - 4.2, sy], [ww - 1, wy - 2], [sw + 0.5, wy - 6]], app.skin); }
  if (top === 'hoodie') { ctx.fillStyle = shade(c, -0.15); curve(ctx, [[-sw + 1, sy - 1], [-neckW, sy - 3.5], [0, sy - 2], [neckW, sy - 3.5], [sw - 1, sy - 1], [0, sy + 3]], true); ctx.fill(); fillRound(ctx, -5, wy - 2, 10, 8, 2, shade(c, -0.12)); strokeLine(ctx, -1.5, sy + 1, -1.5, sy + 8, '#f5f5f5', 0.6); strokeLine(ctx, 1.5, sy + 1, 1.5, sy + 8, '#f5f5f5', 0.6); }
  if (['shirt', 'uniform', 'suit', 'labcoat', 'coat', 'daura', 'blouse'].includes(top)) {
    // collar
    const cc = top === 'suit' ? '#ffffff' : top === 'labcoat' ? '#ffffff' : c2;
    fillPoly(ctx, [[-neckW - 1.2, sy - 1], [0, sy + 5.5], [neckW + 1.2, sy - 1], [neckW + 3.5, sy + 1.5], [0, sy + 7.5], [-neckW - 3.5, sy + 1.5]], cc);
    if (top !== 'daura') strokeLine(ctx, 0, sy + 5.5, 0, hy - 1, rgba('#000', 0.18), 0.6);
    if (top === 'daura') { strokeLine(ctx, -neckW, sy + 1, 5.5, sy + 16, c2, 0.9); strokeLine(ctx, neckW, sy + 1, -5.5, sy + 16, c2, 0.9); }
    if (top === 'uniform') { fillRound(ctx, -sw + 2, sy + 9, 5.5, 5, 0.8, shade(c, -0.12)); fillRound(ctx, sw - 7.5, sy + 9, 5.5, 5, 0.8, shade(c, -0.12)); for (let i = 0; i < 4; i++) fillCircle(ctx, 0, sy + 9 + i * 5, 0.7, '#f1c40f'); }
    if (top === 'shirt' || top === 'blouse') { for (let i = 0; i < 4; i++) fillCircle(ctx, 0, sy + 8 + i * 5, 0.6, shade(c, -0.4)); }
    if (top === 'suit') { fillPoly(ctx, [[-sw + 0.5, sy + 0.5], [-1.5, sy + 9], [-1.5, hy], [-ww - 2, hy]], shade(c, 0.06)); fillPoly(ctx, [[sw - 0.5, sy + 0.5], [1.5, sy + 9], [1.5, hy], [ww + 2, hy]], shade(c, 0.06)); fillPoly(ctx, [[-neckW - 1, sy - 1], [0, sy + 6], [-1.5, sy + 9], [-sw + 1, sy + 1]], '#fff'); fillPoly(ctx, [[neckW + 1, sy - 1], [0, sy + 6], [1.5, sy + 9], [sw - 1, sy + 1]], '#fff'); }
    if (top === 'labcoat') { fillPoly(ctx, [[-neckW - 1, sy - 1], [0, sy + 6], [-1.5, sy + 10], [-sw + 1, sy + 2]], '#fff'); fillPoly(ctx, [[neckW + 1, sy - 1], [0, sy + 6], [1.5, sy + 10], [sw - 1, sy + 2]], '#fff'); }
  }
  if (top === 'kurta') { ctx.strokeStyle = c2; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-neckW, sy - 1); ctx.quadraticCurveTo(0, sy + 2, neckW, sy - 1); ctx.stroke(); strokeLine(ctx, 0, sy + 1, 0, sy + 12, c2, 0.9); for (let i = 0; i < 3; i++) fillCircle(ctx, 0, sy + 3 + i * 3.5, 0.6, '#fff'); }
  if (top === 'sari') {
    // pallu drape across torso
    ctx.fillStyle = shade(c, -0.1); poly(ctx, [[-sw + 1, sy - 0.5], [sw - 2, hy - 6], [hw + 1, hy + 1], [-hw - 1, hy + 1], [-sw - 0.4, wy]]); ctx.fill();
    ctx.strokeStyle = o.trimColor || '#f1c40f'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-sw + 1, sy - 0.5); ctx.lineTo(sw - 2, hy - 6); ctx.stroke();
    fillPoly(ctx, [[-sw, sy], [-neckW, sy - 1.5], [neckW, sy - 1.5], [sw, sy], [sw - 1, sy + 4], [-sw + 1, sy + 4]], o.blouseColor || '#8e2a52');
  }
  if (top === 'vest') { fillPoly(ctx, [[-sw + 0.5, sy + 1], [-sw + 5, sy + 1], [-ww + 2, hy], [-hw, hy]], '#ff8f00'); fillPoly(ctx, [[sw - 0.5, sy + 1], [sw - 5, sy + 1], [ww - 2, hy], [hw, hy]], '#ff8f00'); fillRect(ctx, -sw, sy + 9, sw * 2, 1.6, '#eceff1'); fillRect(ctx, -sw, wy, sw * 2, 1.6, '#eceff1'); }
  if (top === 'apron' || o.apron) { fillPoly(ctx, [[-5, sy + 3], [5, sy + 3], [hw + 2, hemY > hy ? hy + 16 : hy + 16], [-hw - 2, hy + 16]], o.apronColor || '#f5f5f5'); strokeLine(ctx, -5, sy + 3, -sw + 1, sy - 1, '#ddd', 0.7); strokeLine(ctx, 5, sy + 3, sw - 1, sy - 1, '#ddd', 0.7); }
  // belt
  if (['pants', 'suruwal'].includes(o.bottom) && !long && top !== 'hoodie') { fillRect(ctx, -hw - 0.3, hy - 1.5, hw * 2 + 0.6, 2.2, o.beltColor || '#3b2a1e'); fillRect(ctx, -1.2, hy - 1.7, 2.4, 2.6, '#c9a227'); }
  // accessories on torso
  const acc = o.accessories || [];
  if (acc.includes('tie')) { fillPoly(ctx, [[-1.3, sy + 5], [1.3, sy + 5], [1.9, sy + 18], [0, sy + 21], [-1.9, sy + 18]], o.tieColor || '#b71c1c'); }
  if (acc.includes('badge')) { fillPoly(ctx, [[sw - 6, sy + 7], [sw - 3, sy + 5.5], [sw - 1, sy + 7], [sw - 2, sy + 10.5], [sw - 5, sy + 10.5]], '#f1c40f'); }
  if (acc.includes('scarf')) { ctx.strokeStyle = o.scarfColor || '#e53935'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-neckW - 1, sy + 0.5); ctx.quadraticCurveTo(0, sy + 4, neckW + 1.5, sy + 0.5); ctx.stroke(); strokeLine(ctx, neckW + 1, sy + 1, neckW + 3, sy + 9, o.scarfColor || '#e53935', 2.2); }
  if (acc.includes('necklace')) { ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(-neckW, sy); ctx.quadraticCurveTo(0, sy + 7, neckW, sy); ctx.stroke(); fillCircle(ctx, 0, sy + 5.2, 0.9, '#e74c3c'); }
  if (acc.includes('stethoscope')) { ctx.strokeStyle = '#37474f'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-neckW - 1, sy - 1); ctx.quadraticCurveTo(-sw, sy + 10, -3, sy + 17); ctx.moveTo(neckW + 1, sy - 1); ctx.quadraticCurveTo(sw, sy + 8, 3, sy + 12); ctx.stroke(); fillCircle(ctx, -3, sy + 17.5, 1.5, '#90a4ae'); }
  if (acc.includes('medal')) { strokeLine(ctx, 0, sy + 2, 0, sy + 9, '#1565c0', 1.2); fillCircle(ctx, 0, sy + 10, 1.6, '#f1c40f'); }
  if (acc.includes('backpack')) { fillRound(ctx, -sw - 4, sy + 2, 5, 16, 1.5, o.bagColor || '#2e7d32'); }
}

/**
 * Draw a character.
 * @param ctx canvas context
 * @param app appearance object
 * @param pose pose object (IDLE_POSE shape)
 * @param opts { x, y, scale (px per unit), facing: 1|-1, orientation: 'side'|'front', t: seconds, mouthOpen?, blinkSeed }
 */
export function drawCharacter(ctx, app, pose, opts) {
  const P = proportions(app);
  const colors = limbColors(app);
  const facing = opts.facing || 1;
  const front = opts.orientation === 'front';
  const t = opts.t || 0;
  ctx.save();
  ctx.translate(opts.x, opts.y);
  ctx.scale(opts.scale * P.s * facing, opts.scale * P.s);
  if (pose.rot) ctx.rotate(-pose.rot * DEG);
  ctx.translate(pose.bodyX || 0, pose.bodyY || 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  const propHand = pose.prop ? (pose.prop.hand || 'N') : null;
  const inHand = (which) => propHand === which || (propHand === 'both' && !pose.prop.center && which === 'N');
  // a simple stool under sitting characters
  if (pose.sit && pose.stool !== false) {
    const sy = P.hipY + (pose.bodyY || 0) + 2;
    fillRound(ctx, -9, sy, 18, 3, 1, '#6d4c41');
    fillRect(ctx, -7, sy + 3, 2.2, -sy - 3, '#5d4037'); fillRect(ctx, 5, sy + 3, 2.2, -sy - 3, '#5d4037');
  }
  // --- far limbs ---
  if (!pose.sit) drawLeg(ctx, P, pose, 'F', colors, app); else drawSitLeg(ctx, P, pose, 'F', colors, app);
  drawArm(ctx, P, pose, 'F', colors, app, inHand('F'), t);
  // --- torso (rotates about hips) ---
  ctx.save();
  ctx.translate(0, P.hipY); rot(ctx, pose.torso || 0); ctx.translate(0, -P.hipY);
  if (!pose.sit) drawLeg(ctx, P, pose, 'N', colors, app); else drawSitLeg(ctx, P, pose, 'N', colors, app);
  // the near leg is attached to hips, not torso: undo torso rotation for leg is skipped for simplicity (small angles)
  drawTorso(ctx, P, pose, app, colors);
  // neck
  fillRound(ctx, -P.neckW, P.neckTop - 1, P.neckW * 2, P.shoulderY - P.neckTop + 3, 1.5, shade(app.skin, -0.08));
  // head
  ctx.save();
  ctx.translate(0, P.neckTop); rot(ctx, pose.head || 0); if (pose.headTilt) ctx.rotate(pose.headTilt * DEG); ctx.translate(0, -P.neckTop);
  drawHead(ctx, app, pose, P, { front, t, mouthOpen: opts.mouthOpen ?? pose.mouthOpen ?? 0, blinkSeed: opts.blinkSeed || 0, lookBack: pose.lookBack });
  ctx.restore();
  // near arm (in front)
  drawArm(ctx, P, pose, 'N', colors, app, inHand('N'), t);
  ctx.restore();
  // two-handed prop drawn centred between hands
  if (pose.prop && propHand === 'both' && pose.prop.center) {
    ctx.save(); ctx.translate(pose.prop.dx || 0, (pose.prop.dy || 0)); rot(ctx, pose.prop.angle || 0); drawProp(ctx, pose.prop, app, t); ctx.restore();
  }
  // effects (zzz, hearts...) in character space
  if (pose.fx && pose.fx.length) drawFx(ctx, pose.fx, P, t);
  ctx.restore();
}

/** Sitting leg: thigh horizontal forward, shin down. */
function drawSitLeg(ctx, P, pose, which, colors, app) {
  const side = which === 'N' ? 1 : -1;
  ctx.save();
  ctx.translate(side * P.hipHW * 0.5, P.hipY + 1);
  const [hip, knee] = pose['leg' + which];
  rot(ctx, 85 + hip);
  segment(ctx, P.thigh, P.legW, colors.thigh, { taper: 0.92 });
  if (app.outfit.bottom === 'shorts') fillRound(ctx, -P.legW * 1.05, -1, P.legW * 2.1, P.thigh * 0.6, 1.2, colors.thigh);
  ctx.translate(0, P.thigh);
  rot(ctx, -(85 + knee));
  segment(ctx, P.shin, P.legW * 0.88, colors.shin, { taper: 0.78 });
  ctx.translate(0, P.shin);
  drawFoot(ctx, P, colors.shoe, app.outfit.shoes || 'sneakers', pose['foot' + which] || 0);
  ctx.restore();
}

// ---------- effects ----------
function drawFx(ctx, fx, P, t) {
  for (const f of fx) {
    const x = f.x ?? 8, y = f.y ?? (P.headCY - 14);
    ctx.save(); ctx.translate(x, y);
    switch (f.type) {
      case 'zzz': {
        for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i * 0.33) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = '#5c6bc0'; ctx.font = `bold ${3 + i * 1.2 + ph * 2}px sans-serif`; ctx.fillText('z', 2 + i * 4 + ph * 4, -ph * 10 - i * 3); }
        break; }
      case 'hearts': {
        for (let i = 0; i < 3; i++) { const ph = (t * 0.7 + i * 0.33) % 1; ctx.globalAlpha = 1 - ph; heart(ctx, -4 + i * 5 + Math.sin(ph * 6 + i) * 2, -ph * 14 - i * 2, 1.6 + ph, '#ff4d6d'); }
        break; }
      case 'sparkle': case 'magic': {
        const col = f.color || '#ffd166';
        for (let i = 0; i < 6; i++) { const a = t * 3 + i * 1.05, r = 4 + Math.sin(t * 5 + i) * 2; star(ctx, Math.cos(a) * r, Math.sin(a) * r * 0.6, 1 + Math.sin(t * 8 + i) * 0.5, col); }
        if (f.type === 'magic') { ctx.fillStyle = radGrad(ctx, 0, 0, 0, 9, [[0, rgba(col, 0.6)], [1, rgba(col, 0)]]); circle(ctx, 0, 0, 9); ctx.fill(); }
        break; }
      case 'sweat': { const ph = (t * 1.5) % 1; ctx.globalAlpha = 1 - ph * 0.6; drop(ctx, 0, ph * 4, 1.4, '#4fc3f7'); break; }
      case 'tears': { for (let i = 0; i < 2; i++) { const ph = (t * 1.6 + i * 0.5) % 1; ctx.globalAlpha = 1 - ph; drop(ctx, i * 5 - 2, ph * 9, 1, '#4fc3f7'); } break; }
      case 'anger': { ctx.strokeStyle = '#e53935'; ctx.lineWidth = 0.9; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 1.5, Math.sin(a) * 1.5); ctx.lineTo(Math.cos(a) * 3.5, Math.sin(a) * 3.5); ctx.stroke(); } break; }
      case 'exclaim': { const s = 1 + Math.sin(t * 10) * 0.08; ctx.scale(s, s); ctx.fillStyle = '#e53935'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('!', 0, 0); break; }
      case 'question': { ctx.fillStyle = '#3949ab'; ctx.font = 'bold 8px sans-serif'; ctx.fillText('?', 0, Math.sin(t * 3) * 1); break; }
      case 'notes': { for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i * 0.33) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = '#263238'; ctx.font = `bold ${4 + i}px sans-serif`; ctx.fillText(i % 2 ? '♪' : '♫', i * 5 + Math.sin(ph * 5) * 2, -ph * 12 - i * 2); } break; }
      case 'dust': { for (let i = 0; i < 4; i++) { const ph = (t * 1.2 + i * 0.25) % 1; ctx.globalAlpha = (1 - ph) * 0.6; fillCircle(ctx, -4 + i * 3 + ph * 2, -ph * 3, 1.5 + ph * 2, '#c8b89a'); } break; }
      case 'water': { for (let i = 0; i < 8; i++) { const ph = (t * 1.8 + i * 0.125) % 1; ctx.globalAlpha = 1 - ph; drop(ctx, i * 1.2 + ph * 4, ph * 12 + ph * ph * 6, 0.7, '#4fc3f7'); } break; }
      case 'seeds': { for (let i = 0; i < 6; i++) { const ph = (t * 1.5 + i * 0.17) % 1; ctx.globalAlpha = 1 - ph * 0.5; fillCircle(ctx, i * 1.5 - 3 + ph * 3, ph * 14 + ph * ph * 8, 0.6, '#8d6e63'); } break; }
      case 'dirt': { for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i * 0.2) % 1; ctx.globalAlpha = 1 - ph; fillCircle(ctx, 4 + i * 2 + ph * 6, -ph * 10 + ph * ph * 14, 1 + (i % 2), '#795548'); } break; }
      case 'chips': { for (let i = 0; i < 5; i++) { const ph = (t * 1.6 + i * 0.2) % 1; ctx.globalAlpha = 1 - ph; fillRect(ctx, 2 + i * 2 + ph * 8, -ph * 8 + ph * ph * 12, 1.4, 0.8, '#d7b98e'); } break; }
      case 'stars': { for (let i = 0; i < 4; i++) { const a = t * 2 + i * 1.57; star(ctx, Math.cos(a) * 7, Math.sin(a) * 2.5, 1.4, '#ffd166'); } break; }
      case 'flash': { ctx.globalAlpha = Math.max(0, 1 - ((t * 2) % 1) * 2); ctx.fillStyle = '#fff'; circle(ctx, 0, 0, 5); ctx.fill(); break; }
      case 'confetti': { for (let i = 0; i < 8; i++) { const ph = (t * 0.9 + i * 0.125) % 1; ctx.globalAlpha = 1 - ph; fillRect(ctx, -8 + i * 2.3 + Math.sin(ph * 8 + i) * 2, -10 + ph * 20, 1.4, 1, ['#e53935', '#fdd835', '#43a047', '#1e88e5'][i % 4]); } break; }
      case 'smoke': { for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i * 0.25) % 1; ctx.globalAlpha = (1 - ph) * 0.5; fillCircle(ctx, Math.sin(ph * 4 + i) * 2, -ph * 12, 1.5 + ph * 3, '#b0bec5'); } break; }
      case 'bubble': { // thought bubble with text
        ctx.globalAlpha = 1; fillCircle(ctx, -2, 4, 1, '#fff'); fillCircle(ctx, 0, 1, 1.5, '#fff'); fillEllipse(ctx, 6, -5, 9, 5.5, '#fff'); ctx.fillStyle = '#333'; ctx.font = 'bold 4px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text || '…', 6, -3.6); ctx.textAlign = 'left'; break; }
      case 'ball': { // thrown/caught ball flying away
        const ph = (t * 0.9) % 1; ctx.globalAlpha = 1 - Math.max(0, ph - 0.7) / 0.3; fillCircle(ctx, ph * 40, -ph * 25 + ph * ph * 30, 2.6, '#e67e22'); strokeLine(ctx, ph * 40 - 2, -ph * 25 + ph * ph * 30, ph * 40 + 2, -ph * 25 + ph * ph * 30, '#fff', 0.5); break; }
      case 'flame': { for (let i = 0; i < 3; i++) { fillEllipse(ctx, i * 3 - 3, 0, 1.2, 2.5 + Math.sin(t * 20 + i) * 0.8, '#ffb52e'); } break; }
      case 'glow': { ctx.fillStyle = radGrad(ctx, 0, 0, 0, f.r || 8, [[0, rgba(f.color || '#80deea', 0.55)], [1, rgba(f.color || '#80deea', 0)]]); circle(ctx, 0, 0, f.r || 8); ctx.fill(); break; }
    }
    ctx.restore();
  }
}
export function heart(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y + s);
  ctx.bezierCurveTo(x - s * 1.6, y - s * 0.4, x - s * 0.6, y - s * 1.4, x, y - s * 0.4);
  ctx.bezierCurveTo(x + s * 0.6, y - s * 1.4, x + s * 1.6, y - s * 0.4, x, y + s); ctx.fill();
}
export function star(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.4 : s; const a = (i / 8) * TAU - Math.PI / 2; ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
}
export function drop(ctx, x, y, s, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - s * 1.6); ctx.quadraticCurveTo(x + s * 1.2, y, x, y + s); ctx.quadraticCurveTo(x - s * 1.2, y, x, y - s * 1.6); ctx.fill();
}
