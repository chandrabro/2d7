// Inspector tab: dialogs (text, timing, voice source: TTS / upload / record).

import { h, field, select, num, range, textarea, checkbox, button, round, fmtTime } from './dom.js';
import { dialogDuration, estimateTtsDuration } from '../engine/renderer.js';
import { sequenceDialogs } from '../state.js';
import { dialogSig } from '../audio/retime.js';
import * as tts from '../audio/tts.js';
import { Recorder } from '../audio/recorder.js';
import { openMeasureAll } from './measureAllPanel.js';

const recorder = new Recorder();

export function renderDialogPanel(app, root) {
  const s = app.currentScene(); const p = app.project;
  if (!s) { root.append(h('div', { class: 'section' }, 'Add a scene first.')); return; }
  const info = app.store.info;
  const sec = h('div', { class: 'section' }, h('h3', {}, 'Dialogs', h('span', { class: 'right' },
    button('⏱ Measure all voices', () => openMeasureAll(app), 'tiny', { title: 'Measure every spoken line of every scene and fix the timing' }),
    button('Auto-sequence', () => { sequenceDialogs(s, info, 0.4, dialogDuration); app.commit('sequence'); app.toast('Dialogs arranged one after another – no overlaps.'); }, 'tiny', { title: 'Make every dialog start after the previous one ends' }),
    button('+ Add', () => app.addDialog(), 'tiny primary'))));
  if (!s.actors.length) sec.append(h('div', { class: 'note warn' }, 'Add actors to this scene first (Actors tab).'));
  sec.append(h('div', { class: 'note' }, 'Each dialog has its own start time. Characters only speak together if their dialogs overlap on the timeline – the red bars in the timeline show overlaps. Use Auto-sequence to fix them in one click.'));
  const sorted = s.dialogs.slice().sort((a, b) => a.start - b.start);
  sorted.forEach((d, idx) => {
    const dur = dialogDuration(d, info);
    const overlap = sorted.some((o) => o !== d && o.start < d.start + dur && d.start < o.start + dialogDuration(o, info));
    const actorOpts = s.actors.map((a, i) => { const c = p.characters.find((x) => x.id === a.characterId); return [String(i), `${i + 1}. ${c ? c.name : '?'}`]; });
    const item = h('div', { class: 'item' + (app.sel.dialog === d.id ? ' selected' : ''), onClick: () => { if (app.sel.dialog !== d.id) { app.sel.dialog = d.id; app.rerenderPanels(); } } });
    item.append(h('div', { class: 'head' },
      h('b', {}, `#${idx + 1}`),
      select(actorOpts, String(d.actor), (v) => { d.actor = parseInt(v); app.commit('dialog actor'); }),
      overlap ? h('span', { class: 'badge warn', title: 'Overlaps another dialog' }, 'overlap') : h('span', { class: 'badge ok' }, fmtTime(d.start) + ' → ' + fmtTime(d.start + dur)),
      button('✕', (e) => { e.stopPropagation(); s.dialogs.splice(s.dialogs.indexOf(d), 1); app.commit('remove dialog'); }, 'tiny danger')));
    item.append(field('Text (shown in the speech bubble)', textarea(d.text, (v) => { d.text = v; if (d.source === 'tts' && !d.audioId) d.duration = estimateTtsDuration(v, d.rate || 1); app.commit('dialog text'); })));
    item.append(h('div', { class: 'grid3' },
      field('Start (s)', num(d.start, (v) => { d.start = Math.max(0, v); app.commit('dialog start'); }, { min: 0, step: 0.1 })),
      field('Length (s)', d.audioId ? h('input', { type: 'text', value: round(dur, 2), disabled: true }) : num(d.duration || dur, (v) => { d.duration = Math.max(0.3, v); app.commit('dialog dur'); }, { min: 0.3, step: 0.1 })),
      field('Voice source', select([['tts', 'Browser voice (TTS)'], ['upload', 'Upload audio'], ['record', 'Record mic']], d.source, (v) => { d.source = v; app.commit('dialog source'); }))));
    // source specific controls
    if (d.source === 'tts') {
      const voices = tts.getVoices();
      if (!tts.ttsAvailable()) item.append(h('div', { class: 'note warn' }, 'This browser has no speech synthesis. Use upload or record instead.'));
      else {
        item.append(h('div', { class: 'grid2' },
          field('Voice', select([['', 'Default voice'], ...voices.map((v) => [v.name, `${v.name} (${v.lang})`])], d.voice || '', (v) => { d.voice = v; app.commit('voice'); })),
          h('div', { class: 'grid2' },
            field('Rate', num(d.rate || 1, (v) => { d.rate = Math.max(0.5, Math.min(2, v)); d.duration = estimateTtsDuration(d.text, d.rate); app.commit('rate'); }, { min: 0.5, max: 2, step: 0.1 })),
            field('Pitch', num(d.pitch || 1, (v) => { d.pitch = Math.max(0.5, Math.min(2, v)); app.commit('pitch'); }, { min: 0.5, max: 2, step: 0.1 })))));
        item.append(h('div', { class: 'row' },
          button('▶ Preview voice', async (e) => { e.stopPropagation(); tts.cancel(); await tts.speak(d.text, { voice: d.voice, rate: d.rate || 1, pitch: d.pitch || 1 }); }, 'tiny'),
          button('⏱ Measure this line', async (e) => { e.stopPropagation(); const b = e.currentTarget; b.disabled = true; b.textContent = 'measuring…'; const r = await tts.measureSpeech(d.text, { voice: d.voice, rate: d.rate || 1, pitch: d.pitch || 1 }); if (r) { d.duration = round(r.duration + 0.1, 2); d.lead = round(r.latency, 2); d.mSig = dialogSig(d); d.mDur = d.duration; d.mLead = d.lead; app.commit('measure'); app.toast(`Measured ${r.duration.toFixed(2)} s (voice starts after ${r.latency.toFixed(2)} s)`); } else { b.disabled = false; b.textContent = '⏱ Measure this line'; } }, 'tiny', { title: 'Speaks silently to measure the real duration and the voice start-up delay. To fix a whole story at once use "Measure all voices" in the top bar.' }),
          field('Voice pre-start (s)', num(d.lead || 0, (v) => { d.lead = Math.max(0, Math.min(3, v || 0)); app.commit('lead'); }, { min: 0, max: 3, step: 0.05 }))));
        item.append(h('div', { class: 'small muted' }, 'Note: browser voices play in the preview but cannot be captured by the fast MP4 export. For TTS in the video use "Export live (with tab audio)" in Export, or record / upload the voice.'));
      }
    } else if (d.source === 'upload') {
      const inp = h('input', { type: 'file', accept: 'audio/*', style: { fontSize: '12px' }, onChange: async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { const clip = await app.store.add(f, f.name); d.audioId = clip.id; d.trimStart = 0; d.trimEnd = 0; app.commit('upload'); app.toast(`Added ${f.name} (${clip.duration.toFixed(1)} s)`); } catch (err) { app.toast('Could not decode this audio file: ' + err.message, true); }
      } });
      item.append(field('Audio file (mp3, wav, m4a, ogg…)', inp));
    } else if (d.source === 'record') {
      const level = h('div', { class: 'level' }, h('i'));
      const status = h('span', { class: 'small muted' }, recorder.recording ? 'Recording…' : 'Ready');
      const recBtn = button(recorder.recording ? '■ Stop' : '● Record', async (e) => {
        e.stopPropagation();
        if (!recorder.recording) {
          try { await recorder.start(); } catch (err) { app.toast('Microphone not available: ' + err.message, true); return; }
          recBtn.textContent = '■ Stop'; status.textContent = 'Recording… speak now';
          const tick = () => { if (!recorder.recording) return; level.firstChild.style.width = Math.min(100, recorder.level() * 160) + '%'; requestAnimationFrame(tick); }; tick();
        } else {
          const blob = await recorder.stop();
          status.textContent = 'Processing…';
          try { const clip = await app.store.add(blob, 'recording ' + new Date().toLocaleTimeString()); d.audioId = clip.id; d.trimStart = 0; d.trimEnd = 0; app.commit('record'); app.toast(`Recorded ${clip.duration.toFixed(1)} s`); } catch (err) { app.toast('Recording failed: ' + err.message, true); }
        }
      }, recorder.recording ? 'tiny danger' : 'tiny primary');
      item.append(h('div', { class: 'row' }, recBtn, status), level);
    }
    if (d.audioId) {
      const clip = app.store.get(d.audioId);
      item.append(h('div', { class: 'row' },
        h('span', { class: 'badge ok' }, clip ? `${d.gen ? '🎙 Gemini · ' + d.gen.voice : '🎵 ' + clip.name} · ${clip.duration.toFixed(1)}s` : '⚠ audio missing'),
        button('▶', (e) => { e.stopPropagation(); app.player.preview(d.audioId); }, 'tiny fixed', { title: 'Play clip' }),
        button('remove audio', (e) => { e.stopPropagation(); if (d.gen) { app.store.remove(d.audioId); delete d.gen; d.source = 'tts'; } d.audioId = null; d.duration = estimateTtsDuration(d.text); app.commit('remove audio'); }, 'tiny fixed')));
      if (clip) item.append(h('div', { class: 'grid3' },
        field('Trim start (s)', num(d.trimStart || 0, (v) => { d.trimStart = Math.max(0, Math.min(clip.duration - 0.2, v)); app.commit('trim'); }, { min: 0, step: 0.1 })),
        field('Trim end (s, 0 = full)', num(d.trimEnd || 0, (v) => { d.trimEnd = v <= 0 ? 0 : Math.min(clip.duration, Math.max((d.trimStart || 0) + 0.2, v)); app.commit('trim'); }, { min: 0, step: 0.1 })),
        field('Volume', num(d.volume ?? 1, (v) => { d.volume = Math.max(0, Math.min(3, v)); app.commit('volume'); }, { min: 0, max: 3, step: 0.1 }))));
    }
    item.append(h('div', { class: 'row' },
      checkbox('Show speech bubble', d.bubble !== false, (v) => { d.bubble = v; app.commit('bubble'); }),
      select([['', 'Default bubble'], ['rounded', 'Rounded'], ['thought', 'Thought'], ['shout', 'Shout'], ['box', 'Box']], d.bubbleStyle || '', (v) => { d.bubbleStyle = v; app.commit('bubble style'); }),
      checkbox('Silent (no mouth)', !!d.silent, (v) => { d.silent = v; app.commit('silent'); })));
    sec.append(item);
  });
  if (!s.dialogs.length) sec.append(h('div', { class: 'small muted' }, 'No dialogs in this scene yet.'));
  root.append(sec);
}
