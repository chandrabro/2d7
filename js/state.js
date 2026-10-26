// Project model, factories, sample project and local persistence (localStorage for the JSON,
// IndexedDB for audio blobs via audioStore).

import { uid, deepClone } from './engine/util.js';
import { presetAppearance, PRESETS } from './engine/presets.js';
import { estimateTtsDuration } from './engine/renderer.js';

export const PROJECT_VERSION = 1;
export const STORAGE_KEY = 'story-animator-project-v1';

export function createProject(title = 'My Story') {
  return {
    version: PROJECT_VERSION, title, fps: 30, aspect: '16:9', quality: 'high',
    bubbleStyle: 'rounded', fadeOut: true, watermark: '',
    characters: [],
    scenes: [],
    music: { audioId: null, volume: 0.35, loop: true },
  };
}
export function newCharacter(presetId = 'custom_male', name) {
  const app = presetAppearance(presetId);
  const preset = PRESETS.find((p) => p.id === presetId);
  return { id: uid('ch'), name: name || (preset ? preset.name : 'Character'), preset: presetId, appearance: app };
}
export function newScene(background = 'living_room', over = {}) {
  return {
    id: uid('sc'), name: '', background, duration: 8, tod: 'day', weather: 'none', filter: 'none', vignette: true,
    transition: 'fade', transitionDuration: 0.7, camera: { preset: 'wide', start: { x: 640, y: 360, zoom: 1 }, end: { x: 640, y: 360, zoom: 1 }, shake: 0 },
    actors: [], dialogs: [], captions: [], seed: Math.floor(Math.random() * 1000) + 1,
    ...over,
  };
}
export function newActor(characterId, x = 640, y = 640) {
  return { characterId, x, y, facing: 1, scale: 1, orientation: 'side', idleAction: 'idle', actions: [], autoGesture: true };
}
export function newAction(action = 'walk', start = 0, end = 3) { return { id: uid('ac'), action, start, end, toX: null, toY: null, facing: 0 }; }
export function newDialog(actor = 0, text = 'Hello!', start = 0) {
  return { id: uid('dl'), actor, text, start, source: 'tts', audioId: null, duration: estimateTtsDuration(text), voice: '', rate: 1, pitch: 1, volume: 1, lead: 0, bubble: true, bubbleStyle: '', trimStart: 0, trimEnd: 0, silent: false };
}
export function newCaption(text = 'Title', start = 0, end = 3) { return { id: uid('cp'), text, start, end, style: 'subtitle', position: 'bottom', size: 0.05, color: '#ffffff', font: 'body' }; }

/** Dialog end time (uses store info when available). */
export function dialogEnd(d, audioInfo) {
  const { dialogDuration } = window.__renderer || {};
  return d.start + (dialogDuration ? dialogDuration(d, audioInfo) : d.duration || 2);
}

/** Make every dialog in the scene start after the previous one ends (fixes overlapping speech). */
export function sequenceDialogs(scene, audioInfo, gap = 0.4, durationFn) {
  const ds = scene.dialogs.slice().sort((a, b) => a.start - b.start);
  let t = ds.length ? Math.max(ds[0].start, (ds[0].lead || 0) + 0.15) : 0;
  let prevEnd = 0;
  for (const d of ds) {
    // a browser voice is started `lead` seconds early, so leave at least that much silence before it
    const g = Math.max(gap, (d.lead || 0) + 0.05);
    d.start = Math.round((prevEnd ? prevEnd + g : t) * 100) / 100;
    prevEnd = d.start + durationFn(d, audioInfo);
    t = prevEnd + gap;
  }
  const needed = Math.ceil(prevEnd + 0.5);
  if (needed > scene.duration) scene.duration = needed;
  return scene;
}

// ---------- sample project ----------
export function createSampleProject() {
  const p = createProject('Village Morning');
  const farmer = newCharacter('nepali_farmer', 'Ram');
  const woman = newCharacter('nepali_woman', 'Sita');
  const police = newCharacter('nepali_police', 'Inspector');
  const kid = newCharacter('boy_kid', 'Hari');
  p.characters.push(farmer, woman, police, kid);

  const s1 = newScene('vegetable_farm', { name: 'At the farm', duration: 12, tod: 'dawn', transition: 'cut', camera: { preset: 'zoom_in' } });
  s1.actors.push({ ...newActor(farmer.id, 380, 640), actions: [{ ...newAction('dig', 0, 4) }, { ...newAction('wave', 5, 7) }, { ...newAction('talk', 7, 12) }] });
  s1.actors.push({ ...newActor(woman.id, 1250, 650), facing: -1, actions: [{ ...newAction('walk', 1, 5), toX: 760 }, { ...newAction('talk', 7, 12) }] });
  s1.dialogs.push({ ...newDialog(1, 'Ram! Breakfast is ready, come home!', 5.2) });
  s1.dialogs.push({ ...newDialog(0, 'Coming Sita! Just finishing this last row.', 8.2) });
  s1.captions.push({ ...newCaption('Village Morning', 0, 3), style: 'title', position: 'center', size: 0.11, font: 'display', color: '#ffd166' });

  const s2 = newScene('kitchen', { name: 'Breakfast', duration: 10, tod: 'day', transition: 'fade', camera: { preset: 'medium' } });
  s2.actors.push({ ...newActor(woman.id, 420, 640), actions: [{ ...newAction('cook', 0, 5) }, { ...newAction('talk', 5, 10) }] });
  s2.actors.push({ ...newActor(farmer.id, 820, 650), facing: -1, actions: [{ ...newAction('sit', 0, 4) }, { ...newAction('eat', 4, 10) }] });
  s2.actors.push({ ...newActor(kid.id, 1060, 660), facing: -1, actions: [{ ...newAction('jump_joy', 0, 3) }, { ...newAction('laugh', 3, 10) }] });
  s2.dialogs.push({ ...newDialog(2, 'Papa, can we go to the city today?', 1) });
  s2.dialogs.push({ ...newDialog(1, 'Eat first, then we will see.', 4.5) });
  s2.dialogs.push({ ...newDialog(0, 'Only if you finish your homework!', 7.5) });

  const s3 = newScene('city_street', { name: 'In the city', duration: 12, tod: 'day', transition: 'slide', camera: { preset: 'pan_lr' } });
  s3.actors.push({ ...newActor(police.id, 900, 650), facing: -1, actions: [{ ...newAction('idle', 0, 3) }, { ...newAction('salute', 3, 6) }, { ...newAction('point', 6, 12) }] });
  s3.actors.push({ ...newActor(farmer.id, 60, 650), actions: [{ ...newAction('walk', 0, 5), toX: 560 }, { ...newAction('namaste', 5, 8) }, { ...newAction('talk', 8, 12) }] });
  s3.actors.push({ ...newActor(kid.id, 20, 660), actions: [{ ...newAction('run', 0.5, 4.5), toX: 700 }, { ...newAction('photo', 5, 12) }] });
  s3.dialogs.push({ ...newDialog(1, 'Namaste, Inspector sahab!', 5.5) });
  s3.dialogs.push({ ...newDialog(0, 'Namaste! The market is that way.', 8) });
  s3.captions.push({ ...newCaption('The End', 10, 12), style: 'title', position: 'center', size: 0.1, font: 'display', color: '#ffffff' });
  p.scenes.push(s1, s2, s3);
  for (const s of p.scenes) sequenceDialogs(s, {}, 0.5, (d) => d.duration || estimateTtsDuration(d.text));
  return p;
}

// ---------- persistence ----------
export function saveLocal(project) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(project)); return true; } catch (e) { console.warn('saveLocal failed', e); return false; }
}
export function loadLocal() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? migrate(JSON.parse(s)) : null; } catch (e) { return null; }
}
export function migrate(p) {
  if (!p || !p.scenes) return null;
  p.version = PROJECT_VERSION;
  p.characters ||= []; p.cast ||= {}; p.music ||= { audioId: null, volume: 0.35, loop: true };
  for (const s of p.scenes) { s.actors ||= []; s.dialogs ||= []; s.captions ||= []; s.camera ||= { preset: 'wide' }; for (const a of s.actors) a.actions ||= []; }
  return p;
}
