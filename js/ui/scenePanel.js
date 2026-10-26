// Inspector tab: Scene settings, camera, captions.

import { h, field, select, num, range, textInput, checkbox, button, color, round } from './dom.js';
import { SCENES, SCENE_CATEGORIES } from '../engine/scenes/index.js';
import { CAMERA_PRESETS, TRANSITIONS, WEATHER, TODS } from '../engine/renderer.js';
import { newCaption } from '../state.js';

export function renderScenePanel(app, root) {
  const s = app.currentScene();
  if (!s) { root.append(h('div', { class: 'section' }, 'Add a scene to begin.')); return; }
  const sceneOptions = SCENE_CATEGORIES.map((cat) => ({ group: cat, options: SCENES.filter((x) => x.category === cat).map((x) => [x.id, x.name]) }));

  root.append(h('div', { class: 'section' },
    h('h3', {}, 'Scene ' + (app.sel.scene + 1)),
    field('Name', textInput(s.name, (v) => { s.name = v; app.commit('scene name'); }, { placeholder: 'e.g. At the farm' })),
    field('Background (50 locations)', select(sceneOptions, s.background, (v) => { s.background = v; app.commit('background'); })),
    h('div', { class: 'grid2' },
      field('Duration (s)', num(s.duration, (v) => { s.duration = Math.max(1, Math.min(300, v || 1)); app.commit('duration'); }, { min: 1, max: 300, step: 0.5 })),
      field('Time of day', select(TODS, s.tod, (v) => { s.tod = v; app.commit('tod'); }))),
    h('div', { class: 'grid2' },
      field('Weather / FX', select(WEATHER, s.weather, (v) => { s.weather = v; app.commit('weather'); })),
      field('Colour filter', select([['none', 'None'], ['warm', 'Warm'], ['cool', 'Cool'], ['sepia', 'Sepia'], ['bw', 'Black & white'], ['dream', 'Dreamy'], ['dark', 'Dark / dramatic']], s.filter, (v) => { s.filter = v; app.commit('filter'); }))),
    h('div', { class: 'grid2' },
      field('Transition in', select(TRANSITIONS, s.transition, (v) => { s.transition = v; app.commit('transition'); })),
      field('Vignette', select([['true', 'Soft'], ['strong', 'Strong'], ['false', 'Off']], String(s.vignette), (v) => { s.vignette = v === 'true' ? true : v === 'false' ? false : 'strong'; app.commit('vignette'); }))),
  ));

  // camera
  const cam = s.camera || (s.camera = { preset: 'wide' });
  const camSec = h('div', { class: 'section' }, h('h3', {}, 'Camera'));
  camSec.append(field('Shot / movement', select(Object.entries(CAMERA_PRESETS).map(([k, v]) => [k, v.name]), cam.preset, (v) => {
    cam.preset = v;
    if (v === 'custom' && !cam.start) { cam.start = { x: 640, y: 380, zoom: 1.2 }; cam.end = { x: 640, y: 380, zoom: 1.2 }; }
    app.commit('camera');
  })));
  if (cam.preset === 'custom') {
    cam.start ||= { x: 640, y: 360, zoom: 1 }; cam.end ||= { ...cam.start };
    const camRow = (label, o) => h('div', {}, h('div', { class: 'small muted', style: { marginBottom: '4px' } }, label),
      h('div', { class: 'grid3' },
        field('X', num(o.x, (v) => { o.x = v; app.commit('camera'); }, { min: -200, max: 1500, step: 10 })),
        field('Y', num(o.y, (v) => { o.y = v; app.commit('camera'); }, { min: -200, max: 900, step: 10 })),
        field('Zoom', num(o.zoom, (v) => { o.zoom = Math.max(0.4, Math.min(5, v)); app.commit('camera'); }, { min: 0.4, max: 5, step: 0.1 }))));
    camSec.append(camRow('Start of scene', cam.start), camRow('End of scene (camera moves between)', cam.end),
      button('Copy start → end (static shot)', () => { cam.end = { ...cam.start }; app.commit('camera'); }, 'tiny'),
      field('Handheld shake', range(cam.shake || 0, (v) => { cam.shake = v; app.refresh(); }, { min: 0, max: 2, step: 0.1, onChange: () => app.commit('camera') })));
    camSec.append(h('div', { class: 'note' }, 'Tip: the stage is 1280 × 720. X/Y is the point the camera looks at; zoom 1 shows the whole stage, 2.5 is a close-up.'));
  }
  root.append(camSec);

  // captions
  const capSec = h('div', { class: 'section' }, h('h3', {}, 'Captions & titles', h('span', { class: 'right' }, button('+ Add', () => { s.captions.push(newCaption('Title', 0, Math.min(3, s.duration))); app.commit('caption'); }, 'tiny'))));
  if (!s.captions.length) capSec.append(h('div', { class: 'small muted' }, 'Overlay text: titles, subtitles, "The End"…'));
  for (const c of s.captions) {
    capSec.append(h('div', { class: 'item' },
      h('div', { class: 'head' }, textInput(c.text, (v) => { c.text = v; app.commit('caption'); }), button('✕', () => { s.captions.splice(s.captions.indexOf(c), 1); app.commit('caption'); }, 'tiny danger')),
      h('div', { class: 'grid3' },
        field('Start', num(c.start, (v) => { c.start = Math.max(0, v); app.commit('caption'); }, { min: 0, step: 0.1 })),
        field('End', num(c.end, (v) => { c.end = Math.max(c.start + 0.2, v); app.commit('caption'); }, { min: 0, step: 0.1 })),
        field('Size', num(c.size, (v) => { c.size = Math.max(0.02, Math.min(0.3, v)); app.commit('caption'); }, { min: 0.02, max: 0.3, step: 0.01 }))),
      h('div', { class: 'grid3' },
        field('Style', select([['subtitle', 'Subtitle box'], ['title', 'Big title']], c.style, (v) => { c.style = v; app.commit('caption'); })),
        field('Position', select([['bottom', 'Bottom'], ['center', 'Centre'], ['top', 'Top']], c.position, (v) => { c.position = v; app.commit('caption'); })),
        field('Font', select([['body', 'Clean'], ['display', 'Display']], c.font, (v) => { c.font = v; app.commit('caption'); }))),
      h('div', { class: 'row' }, h('span', { class: 'small muted fixed' }, 'Colour'), h('span', { class: 'fixed' }, color(c.color, (v) => { c.color = v; app.commitLazy('caption'); }))),
    ));
  }
  root.append(capSec);
}
