// Offline mix of all clips (dialogs + music) into one AudioBuffer for export.

import { sceneStart, totalDuration, dialogDuration } from '../engine/renderer.js';

export async function renderMix(project, store, sampleRate = 48000) {
  const total = Math.max(0.1, totalDuration(project));
  const ctx = new OfflineAudioContext(2, Math.ceil(total * sampleRate), sampleRate);
  const info = store.info;
  for (let i = 0; i < project.scenes.length; i++) {
    const sc = project.scenes[i]; const s0 = sceneStart(project, i);
    for (const d of sc.dialogs) {
      if (!d.audioId || !store.has(d.audioId)) continue;
      const clip = store.get(d.audioId);
      const dur = dialogDuration(d, info);
      const src = ctx.createBufferSource(); src.buffer = clip.buffer;
      const g = ctx.createGain(); g.gain.value = d.volume ?? 1; src.connect(g); g.connect(ctx.destination);
      const at = s0 + d.start; if (at >= total) continue;
      src.start(at, d.trimStart || 0, Math.min(dur, total - at));
    }
  }
  const m = project.music;
  if (m && m.audioId && store.has(m.audioId)) {
    const clip = store.get(m.audioId);
    const src = ctx.createBufferSource(); src.buffer = clip.buffer; src.loop = m.loop !== false;
    const g = ctx.createGain(); g.gain.value = m.volume ?? 0.35;
    if (project.fadeOut) { g.gain.setValueAtTime(m.volume ?? 0.35, Math.max(0, total - 1.5)); g.gain.linearRampToValueAtTime(0, total); }
    src.connect(g); g.connect(ctx.destination); src.start(0);
    if (src.loop) src.stop(total);
  }
  return await ctx.startRendering();
}
export function hasAnyAudio(project, store) {
  if (project.music && project.music.audioId && store.has(project.music.audioId)) return true;
  return project.scenes.some((s) => s.dialogs.some((d) => d.audioId && store.has(d.audioId)));
}
export function hasTts(project) {
  return project.scenes.some((s) => s.dialogs.some((d) => d.source === 'tts' && !d.audioId && d.text));
}
