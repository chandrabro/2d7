// Inspector tab: project settings, music, export shortcuts, help.

import { h, field, select, num, range, textInput, checkbox, button } from './dom.js';
import { ASPECTS } from './stage.js';

export function renderSettingsPanel(app, root) {
  const p = app.project;
  const sec = h('div', { class: 'section' }, h('h3', {}, 'Project'));
  sec.append(h('div', { class: 'grid2' },
    field('Aspect ratio', select(Object.keys(ASPECTS).map((k) => [k, k + (k === '9:16' ? ' (shorts / reels)' : k === '16:9' ? ' (YouTube)' : '')]), p.aspect, (v) => { p.aspect = v; app.commit('aspect'); app.stage.resize(); })),
    field('Speech bubble style', select([['rounded', 'Rounded'], ['box', 'Comic box'], ['thought', 'Thought cloud'], ['shout', 'Shout']], p.bubbleStyle, (v) => { p.bubbleStyle = v; app.commit('bubble'); }))));
  sec.append(h('div', { class: 'grid2' },
    field(' ', checkbox('Fade out at the end', p.fadeOut !== false, (v) => { p.fadeOut = v; app.commit('fade'); })),
    field('Watermark text', textInput(p.watermark || '', (v) => { p.watermark = v; app.commit('watermark'); }, { placeholder: 'optional' }))));
  sec.append(h('div', { class: 'grid2' },
    field('Voice sync offset (s)', num(p.ttsSync || 0, (v) => { p.ttsSync = Math.max(-1, Math.min(2, v || 0)); app.commit('tts sync'); }, { min: -1, max: 2, step: 0.05 })),
    h('div', { class: 'small muted', style: { alignSelf: 'end' } }, 'Fine-tune lip-sync for ALL browser voices. If the voice is heard AFTER the mouth moves, increase it; if the voice comes BEFORE, decrease it.')));
  root.append(sec);

  const m = p.music || (p.music = { audioId: null, volume: 0.35, loop: true });
  const ms = h('div', { class: 'section' }, h('h3', {}, 'Background music'));
  ms.append(field('Music file (mp3, wav…)', h('input', { type: 'file', accept: 'audio/*', style: { fontSize: '12px' }, onChange: async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { const clip = await app.store.add(f, f.name); m.audioId = clip.id; app.commit('music'); app.toast(`Music: ${f.name}`); } catch (err) { app.toast('Could not decode: ' + err.message, true); }
  } })));
  if (m.audioId) {
    const clip = app.store.get(m.audioId);
    ms.append(h('div', { class: 'row' }, h('span', { class: 'badge ok' }, clip ? `🎵 ${clip.name} · ${clip.duration.toFixed(0)}s` : '⚠ missing'), button('remove', () => { m.audioId = null; app.commit('music'); }, 'tiny fixed')));
    ms.append(field('Volume', range(m.volume ?? 0.35, (v) => { m.volume = v; }, { min: 0, max: 1, step: 0.01, onChange: () => app.commit('music vol') })));
    ms.append(checkbox('Loop', m.loop !== false, (v) => { m.loop = v; app.commit('loop'); }));
  }
  root.append(ms);

  const help = h('div', { class: 'section' }, h('h3', {}, 'How to use'));
  help.append(h('ol', { class: 'small', style: { paddingLeft: '18px', margin: 0, lineHeight: 1.6 } },
    h('li', {}, h('b', {}, 'Characters tab:'), ' add ready-made characters (farmer, police, pilot, air hostess…) or build your own.'),
    h('li', {}, h('b', {}, 'Scene tab:'), ' pick one of 50 backgrounds, duration, time of day, weather and camera.'),
    h('li', {}, h('b', {}, 'Actors tab:'), ' add up to 3 characters, drag them on the stage, set facing and add actions (walk to a point, dig, laugh…).'),
    h('li', {}, h('b', {}, 'Dialog tab:'), ' write lines, choose browser voice / record / upload, set the start time. Use Auto-sequence so they never overlap.'),
    h('li', {}, h('b', {}, 'Export:'), ' MP4 is rendered entirely in your browser.')));
  help.append(h('div', { class: 'small muted', style: { marginTop: '8px' } }, h('kbd', {}, 'Space'), ' play/pause · ', h('kbd', {}, '←'), h('kbd', {}, '→'), ' step 0.1 s · ', h('kbd', {}, 'Ctrl+Z'), ' undo · ', h('kbd', {}, 'Ctrl+wheel'), ' zoom timeline · double-click a timeline track to add'));
  root.append(help);
}
