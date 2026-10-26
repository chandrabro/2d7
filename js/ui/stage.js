// Stage canvas: renders the current frame and lets the user drag actors / pick positions.

import { renderFrame, outputToStage, actorStateAt, sceneAt, CHAR_PX_PER_UNIT } from '../engine/renderer.js';
import { proportions } from '../engine/character.js';
import { STAGE_W, STAGE_H, clamp } from '../engine/util.js';

export const ASPECTS = { '16:9': [1280, 720], '9:16': [720, 1280], '1:1': [900, 900], '4:3': [1200, 900] };

export function setupStage(app) {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('stageWrap');
  const hint = document.getElementById('stageHint');

  function resize() {
    const [w, h] = ASPECTS[app.project.aspect] || ASPECTS['16:9'];
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const rect = wrap.getBoundingClientRect();
    const availW = rect.width - 28, availH = rect.height - 28;
    const s = Math.min(availW / w, availH / h);
    canvas.style.width = Math.floor(w * s) + 'px'; canvas.style.height = Math.floor(h * s) + 'px';
  }
  window.addEventListener('resize', () => { resize(); draw(); });

  function draw() {
    try {
      renderFrame(ctx, app.project, app.time, { width: canvas.width, height: canvas.height, audioInfo: app.store.info, selection: app.playing ? null : { sceneIndex: app.sel.scene, actorIndex: app.sel.actor }, showGuides: app.showGuides, noTransitions: !app.playing });
    } catch (e) { console.error(e); ctx.fillStyle = '#300'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif'; ctx.fillText('Render error: ' + e.message, 20, 40); }
  }

  // --- pointer interaction ---
  let drag = null;
  const toStage = (e) => {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * (canvas.width / r.width), py = (e.clientY - r.top) * (canvas.height / r.height);
    return outputToStage(app.project, app.time, px, py, canvas.width, canvas.height);
  };
  const hitActor = (pt) => {
    const { index, scene, local } = sceneAt(app.project, app.time);
    if (index !== app.sel.scene) return -1;
    let best = -1, bestD = Infinity;
    scene.actors.forEach((a, i) => {
      const ch = app.project.characters.find((c) => c.id === a.characterId); if (!ch) return;
      const st = actorStateAt(a, local, scene);
      const P = proportions(ch.appearance);
      const hgt = 100 * CHAR_PX_PER_UNIT * (a.scale || 1) * P.s * 0.9;
      const inside = Math.abs(pt.x - st.x) < hgt * 0.22 && pt.y < st.y + 10 && pt.y > st.y - hgt;
      const d = Math.hypot(pt.x - st.x, pt.y - (st.y - hgt / 2));
      if (inside && d < bestD) { best = i; bestD = d; }
    });
    return best;
  };
  canvas.addEventListener('pointerdown', (e) => {
    const pt = toStage(e);
    if (app.pickMode) { app.pickMode.onPick(Math.round(pt.x), Math.round(pt.y)); app.setPickMode(null); return; }
    const i = hitActor(pt);
    if (i >= 0) {
      app.sel.actor = i;
      const a = app.currentScene().actors[i];
      const { local } = sceneAt(app.project, app.time);
      const st = actorStateAt(a, local, app.currentScene());
      // if the actor is inside a move segment, drag edits that segment's target; otherwise the base position
      const seg = st.segment && (st.segment.toX != null || st.segment.toY != null) ? st.segment : null;
      drag = { i, seg, ox: pt.x - (seg ? (seg.toX ?? st.x) : a.x), oy: pt.y - (seg ? (seg.toY ?? st.y) : a.y), moved: false };
      canvas.setPointerCapture(e.pointerId);
      app.rerenderPanels();
      draw();
    } else { app.sel.actor = -1; app.rerenderPanels(); draw(); }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const pt = toStage(e);
    const a = app.currentScene().actors[drag.i];
    const def = app.currentSceneDef();
    const x = clamp(Math.round(pt.x - drag.ox), -100, STAGE_W + 100);
    const y = clamp(Math.round(pt.y - drag.oy), def.horizonY * STAGE_H, def.groundY * STAGE_H + 20);
    if (drag.seg) { drag.seg.toX = x; drag.seg.toY = y; } else { a.x = x; a.y = y; }
    drag.moved = true;
    draw();
  });
  const endDrag = () => { if (drag && drag.moved) app.commit('move actor'); else if (drag) app.rerenderPanels(); drag = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  app.setPickMode = (mode) => {
    app.pickMode = mode;
    canvas.classList.toggle('pick', !!mode);
    hint.textContent = mode ? (mode.hint || 'Click on the stage to choose the position') : 'Drag characters to move them · Click to select';
  };
  resize();
  return { canvas, ctx, draw, resize };
}
