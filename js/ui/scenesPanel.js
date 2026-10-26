// Left column: list of scenes with live thumbnails.

import { h, clear } from './dom.js';
import { renderFrame, sceneStart } from '../engine/renderer.js';
import { getScene } from '../engine/scenes/index.js';

export function setupScenesPanel(app) {
  const root = document.getElementById('scenesPanel');
  const thumbs = [];
  function build() {
    clear(root); thumbs.length = 0;
    const p = app.project;
    p.scenes.forEach((s, i) => {
      const c = h('canvas', { width: 320, height: 180 });
      const card = h('div', { class: 'scene-card' + (i === app.sel.scene ? ' active' : ''), onClick: () => { app.selectScene(i); app.seek(sceneStart(p, i)); } },
        c, h('span', { class: 'num' }, i + 1),
        h('div', { class: 'tools' },
          h('button', { title: 'Move up', onClick: (e) => { e.stopPropagation(); app.moveScene(i, -1); } }, '↑'),
          h('button', { title: 'Move down', onClick: (e) => { e.stopPropagation(); app.moveScene(i, 1); } }, '↓'),
          h('button', { title: 'Duplicate', onClick: (e) => { e.stopPropagation(); app.duplicateScene(i); } }, '⧉'),
          h('button', { title: 'Delete scene', onClick: (e) => { e.stopPropagation(); app.deleteScene(i); } }, '✕')),
        h('div', { class: 'meta' }, h('b', {}, s.name || getScene(s.background).name), h('span', { class: 'muted' }, s.duration + 's')));
      root.append(card);
      thumbs.push({ c, i });
    });
    root.append(h('button', { class: 'add-scene', onClick: () => app.addScene() }, '+ Add scene'));
    drawThumbs();
  }
  let thumbTimer = null;
  function drawThumbs() {
    for (const { c, i } of thumbs) {
      const ctx = c.getContext('2d');
      const s = app.project.scenes[i]; if (!s) continue;
      const t = i === app.sel.scene ? app.time : sceneStart(app.project, i) + Math.min(1.5, s.duration / 2);
      try { renderFrame(ctx, app.project, t, { width: c.width, height: c.height, audioInfo: app.store.info, noTransitions: true }); } catch (e) { /* ignore */ }
    }
  }
  function refreshActive() {
    clearTimeout(thumbTimer);
    thumbTimer = setTimeout(() => {
      const th = thumbs.find((t) => t.i === app.sel.scene); if (!th) return;
      try { renderFrame(th.c.getContext('2d'), app.project, app.time, { width: th.c.width, height: th.c.height, audioInfo: app.store.info, noTransitions: true }); } catch (e) { /* ignore */ }
    }, 120);
  }
  return { build, refreshActive };
}
