// Inspector tab: character library + character builder with live preview.

import { h, field, select, textInput, checkbox, button, color, swatches, chips, clear } from './dom.js';
import { PRESETS, SKIN_TONES, HAIR_COLORS, EYE_COLORS, TOPS, BOTTOMS, SHOES, SLEEVES, BUILD_NAMES, WEIGHTS, ACCESSORIES, presetAppearance } from '../engine/presets.js';
import { HAIR_STYLES, HATS, FACIAL, GLASSES, EXPRESSION_NAMES } from '../engine/face.js';
import { drawCharacter } from '../engine/character.js';
import { getAction, poseAt } from '../engine/actions.js';
import { newCharacter } from '../state.js';

const thumbCache = new Map();
function presetThumb(preset) {
  if (!thumbCache.has(preset.id)) {
    const c = document.createElement('canvas'); c.width = 120; c.height = 180;
    drawCharacter(c.getContext('2d'), preset.app, poseAt(getAction('idle'), 0.4), { x: 60, y: 168, scale: 1.55, facing: 1, t: 0.4 });
    thumbCache.set(preset.id, c);
  }
  const src = thumbCache.get(preset.id);
  const out = document.createElement('canvas'); out.width = src.width; out.height = src.height;
  out.getContext('2d').drawImage(src, 0, 0);
  return out;
}

export function renderCharactersPanel(app, root) {
  const p = app.project;
  // library
  const lib = h('div', { class: 'section' }, h('h3', {}, `Your characters (${p.characters.length})`));
  const list = h('div', { class: 'list' });
  p.characters.forEach((c, i) => {
    const used = p.scenes.reduce((n, s) => n + s.actors.filter((a) => a.characterId === c.id).length, 0);
    list.append(h('div', { class: 'item' + (app.sel.character === c.id ? ' selected' : ''), onClick: () => { app.sel.character = c.id; app.rerenderPanels(); } },
      h('div', { class: 'head' }, h('b', {}, c.name), h('span', { class: 'badge' }, used ? `in ${used} scene${used > 1 ? 's' : ''}` : 'unused'),
        button('⧉', (e) => { e.stopPropagation(); const d = JSON.parse(JSON.stringify(c)); d.id = newCharacter().id; d.name = c.name + ' copy'; p.characters.push(d); app.sel.character = d.id; app.commit('dup char'); }, 'tiny', { title: 'Duplicate' }),
        button('✕', (e) => { e.stopPropagation(); if (used && !confirm(`${c.name} is used in ${used} scene(s). Remove anyway?`)) return; p.characters.splice(i, 1); for (const s of p.scenes) s.actors = s.actors.filter((a) => a.characterId !== c.id); app.sel.character = null; app.commit('remove char'); }, 'tiny danger'))));
  });
  lib.append(list);
  root.append(lib);

  // presets gallery
  const gal = h('div', { class: 'section' }, h('h3', {}, 'Add a ready-made character'));
  const grid = h('div', { class: 'char-grid' });
  for (const pr of PRESETS) {
    grid.append(h('div', { class: 'char-cell', title: pr.name, onClick: () => { const c = newCharacter(pr.id); p.characters.push(c); app.sel.character = c.id; app.commit('add char'); app.toast(`${c.name} added. Customise below or add to a scene in the Actors tab.`); } }, presetThumb(pr), pr.name));
  }
  gal.append(grid);
  root.append(gal);

  // builder
  const c = p.characters.find((x) => x.id === app.sel.character);
  if (!c) { root.append(h('div', { class: 'section small muted' }, 'Select a character above to customise body, hair, face and outfit.')); return; }
  const a = c.appearance; a.outfit.accessories ||= [];
  const b = h('div', { class: 'section' }, h('h3', {}, `Customise: ${c.name}`));
  const preview = h('canvas', { class: 'preview-canvas', width: 480, height: 300 });
  let previewAction = 'idle';
  let previewT = 0;
  const drawPreview = () => {
    const ctx = preview.getContext('2d');
    ctx.clearRect(0, 0, 480, 300);
    const pose = poseAt(getAction(previewAction), previewT);
    drawCharacter(ctx, a, pose, { x: 160, y: 280, scale: 2.6, facing: 1, t: previewT });
    drawCharacter(ctx, a, { ...pose, face: previewFace }, { x: 350, y: 280, scale: 2.6, facing: 1, orientation: 'front', t: previewT });
  };
  let previewFace = 'happy';
  const live = () => { drawPreview(); app.refresh(); };
  const commit = (label) => { app.commitLazy(label || 'character'); drawPreview(); };
  // animate preview
  let raf; const loop = () => { if (!document.body.contains(preview)) return; previewT += 1 / 60; drawPreview(); raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop);
  b.append(preview);
  b.append(h('div', { class: 'row', style: { marginTop: '6px' } },
    select([['idle', 'Preview: idle'], ['walk', 'Preview: walk'], ['talk', 'Preview: talk'], ['dance', 'Preview: dance'], ['wave', 'Preview: wave']], previewAction, (v) => { previewAction = v; }),
    select(EXPRESSION_NAMES.map((e) => [e, 'Face: ' + e]), previewFace, (v) => { previewFace = v; })));

  b.append(field('Name', textInput(c.name, (v) => { c.name = v || 'Character'; app.commit('name'); })));
  b.append(h('div', { class: 'grid3' },
    field('Gender', select([['male', 'Male'], ['female', 'Female']], a.gender, (v) => { a.gender = v; commit(); })),
    field('Age / build', select(BUILD_NAMES, a.build, (v) => { a.build = v; commit(); })),
    field('Body', select(WEIGHTS, a.weight, (v) => { a.weight = v; commit(); }))));
  b.append(field('Skin tone', h('div', { class: 'row' }, swatches(SKIN_TONES, a.skin, (v) => { a.skin = v; commit(); }), h('span', { class: 'fixed' }, color(a.skin, (v) => { a.skin = v; live(); })))));
  b.append(h('div', { class: 'grid2' },
    field('Hair style', select(HAIR_STYLES.map((s) => [s, s.replace('_', ' ')]), a.hair.style, (v) => { a.hair.style = v; commit(); })),
    field('Hair colour', h('div', { class: 'row' }, swatches(HAIR_COLORS, a.hair.color, (v) => { a.hair.color = v; commit(); }), h('span', { class: 'fixed' }, color(a.hair.color, (v) => { a.hair.color = v; live(); }))))));
  b.append(h('div', { class: 'grid3' },
    field('Eyes', h('div', { class: 'row' }, swatches(EYE_COLORS, a.eyeColor, (v) => { a.eyeColor = v; commit(); }))),
    field('Facial hair', select(FACIAL.map((s) => [s, s.replace('_', ' ')]), a.facialHair || 'none', (v) => { a.facialHair = v; commit(); })),
    field('Glasses', select(GLASSES.map((s) => [s, s.replace('_', ' ')]), a.glasses || 'none', (v) => { a.glasses = v; commit(); }))));
  const o = a.outfit;
  b.append(h('h3', { style: { marginTop: '8px' } }, 'Outfit'));
  b.append(h('div', { class: 'grid3' },
    field('Top', select(TOPS, o.top, (v) => { o.top = v; if (['dress', 'sari'].includes(v)) o.bottom = 'none'; else if (o.bottom === 'none') o.bottom = 'pants'; commit(); })),
    field('Top colour', color(o.topColor, (v) => { o.topColor = v; live(); })),
    field('Trim / collar', color(o.trimColor || '#ffffff', (v) => { o.trimColor = v; live(); }))));
  b.append(h('div', { class: 'grid3' },
    field('Sleeves', select(SLEEVES, o.sleeves || 'long', (v) => { o.sleeves = v; commit(); })),
    field('Bottom', select(BOTTOMS, o.bottom, (v) => { o.bottom = v; commit(); })),
    field('Bottom colour', color(o.bottomColor, (v) => { o.bottomColor = v; live(); }))));
  if (o.bottom === 'skirt') b.append(field('Skirt length', select([['short', 'Knee'], ['long', 'Long']], o.skirtLength || 'short', (v) => { o.skirtLength = v; commit(); })));
  if (o.top === 'dress') b.append(field('Dress length', select([['short', 'Knee'], ['long', 'Long gown']], o.dressLength || 'short', (v) => { o.dressLength = v; commit(); })));
  b.append(h('div', { class: 'grid3' },
    field('Shoes', select(SHOES, o.shoes, (v) => { o.shoes = v; commit(); })),
    field('Shoe colour', color(o.shoeColor || '#333333', (v) => { o.shoeColor = v; live(); })),
    field('Belt colour', color(o.beltColor || '#3b2a1e', (v) => { o.beltColor = v; live(); }))));
  b.append(h('div', { class: 'grid2' },
    field('Hat / headwear', select(HATS.map((s) => [s, s.replace(/_/g, ' ')]), o.hat || 'none', (v) => { o.hat = v; commit(); })),
    field('Hat colour', color(o.hatColor || '#37474f', (v) => { o.hatColor = v; live(); }))));
  b.append(field('Accessories', chips(ACCESSORIES.map((x) => [x, x]), o.accessories, (v) => { const i = o.accessories.indexOf(v); if (i >= 0) o.accessories.splice(i, 1); else o.accessories.push(v); commit(); })));
  b.append(h('div', { class: 'grid3' },
    field('Tie colour', color(o.tieColor || '#b71c1c', (v) => { o.tieColor = v; live(); })),
    field('Scarf colour', color(o.scarfColor || '#e53935', (v) => { o.scarfColor = v; live(); })),
    field('Apron / bag colour', color(o.apronColor || '#f5f5f5', (v) => { o.apronColor = v; o.bagColor = v; live(); }))));
  b.append(h('div', { class: 'row' },
    button('Reset to preset', () => { c.appearance = presetAppearance(c.preset); app.commit('reset'); }, 'tiny'),
    select([['', 'Switch preset…'], ...PRESETS.map((pr) => [pr.id, pr.name])], '', (v) => { if (!v) return; c.preset = v; c.appearance = presetAppearance(v); app.commit('preset'); })));
  root.append(b);
  drawPreview();
}
