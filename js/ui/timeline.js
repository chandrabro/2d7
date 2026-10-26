// Timeline: scene strip + per-actor action tracks + dialog + caption tracks for the current scene.

import { h, clear, fmtTime, round } from './dom.js';
import { sceneStart, dialogDuration, totalDuration } from '../engine/renderer.js';
import { getAction } from '../engine/actions.js';

const PX_PER_SEC_DEFAULT = 60;

export function setupTimeline(app) {
  const root = document.getElementById('timeline');
  let pxPerSec = PX_PER_SEC_DEFAULT;
  let playhead, body, scenesStrip;

  function build() {
    clear(root);
    const p = app.project; const sIdx = app.sel.scene; const scene = p.scenes[sIdx];
    const total = Math.max(0.001, totalDuration(p));
    // scene strip
    scenesStrip = h('div', { class: 'tl-scenes' });
    p.scenes.forEach((s, i) => {
      scenesStrip.append(h('div', { class: 'tl-scene' + (i === sIdx ? ' active' : ''), style: { width: (s.duration / total * 100) + '%' }, title: `${i + 1}. ${s.name || s.background}`, onClick: (e) => {
        const r = e.currentTarget.getBoundingClientRect(); const u = (e.clientX - r.left) / r.width; app.seek(sceneStart(p, i) + u * s.duration); app.selectScene(i);
      } }, `${i + 1}. ${s.name || s.background} · ${s.duration}s`));
    });
    const stripHead = h('div', { class: 'tl-playhead', style: { left: '0px' } });
    scenesStrip.append(stripHead);
    root.append(scenesStrip);
    if (!scene) return;

    body = h('div', { class: 'tl-body' });
    const width = 110 + scene.duration * pxPerSec + 40;
    const inner = h('div', { style: { position: 'relative', width: width + 'px', minHeight: '100%' } });
    // ruler
    const ruler = h('div', { class: 'tl-ruler' });
    for (let t = 0; t <= scene.duration; t += scene.duration > 30 ? 5 : 1) {
      ruler.append(h('span', { style: { left: (110 + t * pxPerSec) + 'px' } }, t + 's'));
      ruler.append(h('i', { style: { left: (110 + t * pxPerSec) + 'px' } }));
    }
    const scrub = h('div', { class: 'tl-scrub', onPointerDown: (e) => { scrubTo(e); const mv = (ev) => scrubTo(ev); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); } });
    const scrubTo = (e) => { const r = inner.getBoundingClientRect(); const t = Math.max(0, Math.min(scene.duration, (e.clientX - r.left - 110) / pxPerSec)); app.seek(sceneStart(p, sIdx) + t); };
    inner.append(ruler, scrub);
    // actor tracks
    scene.actors.forEach((a, ai) => {
      const ch = p.characters.find((c) => c.id === a.characterId);
      const track = h('div', { class: 'tl-track', onDblClick: (e) => { if (e.target !== track) return; const r = inner.getBoundingClientRect(); const t = Math.max(0, (e.clientX - r.left - 110) / pxPerSec); app.addAction(ai, round(t, 1)); } });
      track.append(h('span', { class: 'tl-label', title: 'Double-click the track to add an action' }, `👤 ${ch ? ch.name : '?'}`));
      for (const seg of a.actions) {
        const end = seg.end ?? seg.start + 2;
        const el = h('div', { class: 'tl-seg action' + (app.sel.action === seg.id ? ' selected' : ''), style: { left: (110 + seg.start * pxPerSec) + 'px', width: Math.max(14, (end - seg.start) * pxPerSec) + 'px' }, title: `${getAction(seg.action).name} ${seg.start}s → ${end}s` + (seg.toX != null ? ` (move to ${seg.toX},${seg.toY ?? ''})` : '') },
          getAction(seg.action).name + (seg.toX != null ? ' →' : ''), h('span', { class: 'grip' }));
        makeDraggable(el, seg, 'start', 'end', scene.duration, () => { app.sel.actor = ai; app.sel.action = seg.id; app.tab = 'actors'; });
        track.append(el);
      }
      inner.append(track);
    });
    // dialog track
    const dtrack = h('div', { class: 'tl-track', onDblClick: (e) => { if (e.target !== dtrack) return; const r = inner.getBoundingClientRect(); const t = Math.max(0, (e.clientX - r.left - 110) / pxPerSec); app.addDialog(round(t, 1)); } });
    dtrack.append(h('span', { class: 'tl-label', title: 'Double-click to add a dialog' }, '💬 Dialog'));
    const dl = scene.dialogs.slice().sort((x, y) => x.start - y.start);
    dl.forEach((d, i) => {
      const dur = dialogDuration(d, app.store.info);
      const overlap = dl.some((o) => o !== d && o.start < d.start + dur && d.start < o.start + dialogDuration(o, app.store.info));
      const ch = scene.actors[d.actor] ? p.characters.find((c) => c.id === scene.actors[d.actor].characterId) : null;
      const el = h('div', { class: 'tl-seg dialog' + (overlap ? ' overlap' : '') + (app.sel.dialog === d.id ? ' selected' : ''), style: { left: (110 + d.start * pxPerSec) + 'px', width: Math.max(14, dur * pxPerSec) + 'px' }, title: `${ch ? ch.name : '?'}: ${d.text}` + (overlap ? ' — OVERLAPS another dialog' : '') },
        `${ch ? ch.name : '?'}: ${d.text}`);
      el._dur = dur;
      makeDraggable(el, d, 'start', null, scene.duration, () => { app.sel.dialog = d.id; app.tab = 'dialog'; }, dur);
      dtrack.append(el);
    });
    inner.append(dtrack);
    // captions track
    if (scene.captions.length) {
      const ctrack = h('div', { class: 'tl-track' });
      ctrack.append(h('span', { class: 'tl-label' }, '🔤 Captions'));
      for (const c of scene.captions) {
        const el = h('div', { class: 'tl-seg caption', style: { left: (110 + c.start * pxPerSec) + 'px', width: Math.max(14, (c.end - c.start) * pxPerSec) + 'px' } }, c.text, h('span', { class: 'grip' }));
        makeDraggable(el, c, 'start', 'end', scene.duration, () => { app.tab = 'scene'; });
        ctrack.append(el);
      }
      inner.append(ctrack);
    }
    playhead = h('div', { class: 'tl-playhead' });
    inner.append(playhead);
    body.append(inner);
    root.append(body);
    // zoom with ctrl+wheel
    body.addEventListener('wheel', (e) => { if (!e.ctrlKey && !e.metaKey) return; e.preventDefault(); pxPerSec = Math.max(20, Math.min(300, pxPerSec * (e.deltaY < 0 ? 1.15 : 0.87))); build(); updatePlayhead(); }, { passive: false });
    updatePlayhead();
  }

  function makeDraggable(el, obj, startKey, endKey, maxT, onSelect, fixedDur) {
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      onSelect && onSelect();
      const resizing = e.target.classList.contains('grip') && endKey;
      const x0 = e.clientX; const s0 = obj[startKey]; const e0 = endKey ? (obj[endKey] ?? obj[startKey] + 2) : null;
      let moved = false;
      const mv = (ev) => {
        const dt = (ev.clientX - x0) / pxPerSec;
        if (resizing) { obj[endKey] = round(Math.max(s0 + 0.2, Math.min(maxT, e0 + dt)), 1); }
        else {
          const len = endKey ? e0 - s0 : (fixedDur || 0);
          const ns = round(Math.max(0, Math.min(maxT - len, s0 + dt)), 1);
          obj[startKey] = ns; if (endKey) obj[endKey] = round(ns + len, 1);
        }
        moved = true;
        el.style.left = (110 + obj[startKey] * pxPerSec) + 'px';
        if (endKey) el.style.width = Math.max(14, (obj[endKey] - obj[startKey]) * pxPerSec) + 'px';
        app.refresh();
      };
      const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (moved) app.commit('timeline edit'); else app.rerenderPanels(); };
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    });
  }

  function updatePlayhead() {
    const p = app.project; const total = Math.max(0.001, totalDuration(p));
    const head = scenesStrip && scenesStrip.querySelector('.tl-playhead');
    if (head) head.style.left = (app.time / total * 100) + '%';
    if (playhead) {
      const local = app.time - sceneStart(p, app.sel.scene);
      playhead.style.left = (110 + Math.max(0, local) * pxPerSec) + 'px';
      playhead.style.display = local < 0 || local > p.scenes[app.sel.scene].duration + 0.01 ? 'none' : '';
    }
  }
  return { build, updatePlayhead };
}
