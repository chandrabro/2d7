// "Measure all voices": one click measures every browser-voice (TTS) line of every scene, fixes the
// timing (line lengths, gaps, scene durations, actions, captions) and records each voice's start-up
// delay so lip-sync starts exactly when the sound does.

import { h, field, num, checkbox, button, fmtTime, round } from './dom.js';
import * as tts from '../audio/tts.js';
import { relayoutScene, median, dialogSig } from '../audio/retime.js';
import { dialogDuration, totalDuration } from '../engine/renderer.js';

const isTts = (d) => d.source === 'tts' && !d.audioId && String(d.text || '').trim();

export function openMeasureAll(app) {
  app.pause();
  const p = app.project;
  const lines = [];
  p.scenes.forEach((s, si) => s.dialogs.forEach((d) => { if (isTts(d)) lines.push({ si, s, d }); }));

  const status = h('div', { class: 'note' }, '');
  const bar = h('div', { class: 'progress' }, h('i'));
  const warn = h('div', { class: 'note warn', style: { display: 'none' } });
  const summary = h('div', { class: 'small', style: { marginTop: '8px', lineHeight: 1.6 } });
  let gap = 0.4, tail = 0.6, remeasure = false, running = false, confirmedMissing = false, controller = null, finished = false;

  const startBtn = button('⏱ Measure all & fix timing', () => { if (finished) { app.closeModal(); app.seek(0); app.play(); } else run(); }, 'primary');
  const closeBtn = button('Close', () => { if (running && controller) controller.abort(); app.closeModal(); });
  const body = h('div', {},
    h('h2', {}, 'Measure all voices'),
    h('div', { class: 'note' }, `${lines.length} spoken line${lines.length === 1 ? '' : 's'} in ${p.scenes.length} scene${p.scenes.length === 1 ? '' : 's'}. ` +
      'Each line is "spoken" silently once to learn its real length and how long the voice takes to start. ' +
      'Then every scene is re-timed so no scene ends in the middle of a line and the mouth moves exactly when you hear the voice.'),
    h('div', { class: 'note warn' }, 'This takes about as long as the story itself (the browser can only speak in real time). Keep this tab open and in front until it finishes. Already-measured lines are skipped, so you can cancel and continue later.'),
    h('div', { class: 'grid3' },
      field('Pause between lines (s)', num(gap, (v) => { gap = Math.max(0.1, Math.min(3, v || 0.4)); }, { min: 0.1, max: 3, step: 0.1 })),
      field('Quiet end of scene (s)', num(tail, (v) => { tail = Math.max(0.2, Math.min(5, v || 0.6)); }, { min: 0.2, max: 5, step: 0.1 })),
      field(' ', checkbox('Re-measure everything', false, (v) => { remeasure = v; }))),
    warn, status, bar, summary,
    h('div', { class: 'row', style: { marginTop: '12px' } }, startBtn, closeBtn));
  app.modal(body);
  status.textContent = lines.length ? 'Ready.' : 'No browser-voice lines found (lines with uploaded/recorded audio are not measured).';
  if (!lines.length || !tts.ttsAvailable()) { startBtn.disabled = true; if (!tts.ttsAvailable()) status.textContent = 'This browser has no speech synthesis. Use Microsoft Edge or Chrome.'; }

  async function run() {
    if (running) return;
    await tts.waitForVoices(3000);
    // are the chosen voices installed?
    const missing = [...new Set(lines.map((l) => l.d.voice).filter((v) => v && !tts.findVoice(v)))];
    if (missing.length && !confirmedMissing) {
      warn.style.display = ''; warn.textContent = 'These voices were not found in this browser, the default voice would be measured instead: ' + missing.join(' · ') +
        '. Pick the correct voice in Dialog → Voice, or press the button again to measure anyway.';
      startBtn.textContent = 'Measure anyway'; confirmedMissing = true; return;
    }
    running = true; controller = new AbortController();
    startBtn.disabled = true; warn.style.display = 'none'; summary.textContent = '';
    const sigOf = dialogSig;
    const todo = lines.filter(({ d }) => remeasure || d.mSig !== sigOf(d) || !(d.mDur > 0));
    let remaining = todo.reduce((a, { d }) => a + (d.duration || 2), 0);
    let done = 0, failed = 0;
    const t0 = performance.now();
    for (const { d } of todo) {
      if (controller.signal.aborted) break;
      status.textContent = `Measuring ${done + 1} / ${todo.length}  ·  about ${fmtTime(Math.max(0, remaining))} left\n“${d.text.slice(0, 70)}${d.text.length > 70 ? '…' : ''}”`;
      status.style.whiteSpace = 'pre-line';
      bar.firstChild.style.width = Math.round((done / Math.max(1, todo.length)) * 100) + '%';
      const r = await tts.measureSpeech(d.text, { voice: d.voice, rate: d.rate || 1, pitch: d.pitch || 1, signal: controller.signal, timeout: 60000 });
      if (controller.signal.aborted) break;
      if (r && r.duration > 0.2) { d.mSig = sigOf(d); d.mDur = round(r.duration, 3); d.mLat = round(r.latency, 3); }
      else failed++;
      remaining -= (d.duration || 2); done++;
      await new Promise((r2) => setTimeout(r2, 120));
    }
    running = false; startBtn.disabled = false; startBtn.textContent = '⏱ Measure all & fix timing';
    if (controller.signal.aborted) {
      status.textContent = `Cancelled after ${done} line${done === 1 ? '' : 's'}. Your measurements are kept – press the button again to continue.`;
      app.commit('measure partial'); return;
    }
    bar.firstChild.style.width = '100%';

    // start-up delay per voice = median of all measured delays (single measurements are noisy)
    const latByVoice = new Map();
    for (const { d } of lines) if (d.mLat != null && d.mSig === sigOf(d)) { const k = d.voice || ''; (latByVoice.get(k) || latByVoice.set(k, []).get(k)).push(d.mLat); }
    const leadFor = (d) => { const arr = latByVoice.get(d.voice || '') || []; return arr.length ? Math.min(2.5, round(median(arr) + 0.05, 2)) : 0; };

    const before = totalDuration(p);
    const info = app.store.info;
    const changes = [];
    p.scenes.forEach((s, si) => {
      if (!s.dialogs.length) return;
      const map = new Map();
      for (const d of s.dialogs) {
        if (isTts(d) && d.mSig === sigOf(d)) map.set(d.id, { duration: d.mDur, lead: leadFor(d) });
        else if (isTts(d)) map.set(d.id, { duration: Math.max(0.5, (d.duration || 2) - 0.1), lead: leadFor(d) });      // measurement failed: keep estimate
        else map.set(d.id, { duration: Math.max(0.3, dialogDuration(d, info) - 0.1), lead: 0 });                       // recorded / uploaded audio
      }
      const res = relayoutScene(s, map, { gap, minTail: tail, pad: 0.1, firstPad: 0.15, syncExtra: p.ttsSync || 0 });
      if (res.changed) changes.push(`Scene ${si + 1}: ${round(res.oldDuration, 1)} s → ${round(res.newDuration, 1)} s`);
    });
    const after = totalDuration(p);
    app.commit('measure all voices');
    app.seek(0);
    const leads = [...latByVoice.entries()].map(([v, a]) => `${v || 'default voice'}: starts ${median(a).toFixed(2)} s after it is told to speak`);
    status.textContent = `Done in ${fmtTime((performance.now() - t0) / 1000)}.  Story length ${fmtTime(before)} → ${fmtTime(after)}.` + (failed ? `  ${failed} line(s) could not be measured and kept their estimate.` : '');
    summary.innerHTML = '';
    summary.append(h('div', {}, h('b', {}, 'Voice start-up delay (now used to start each voice early): ')), ...leads.map((t) => h('div', {}, '• ' + t)),
      h('div', { style: { marginTop: '6px' } }, h('b', {}, `${changes.length} scene${changes.length === 1 ? '' : 's'} re-timed:`)),
      h('div', { class: 'muted', style: { maxHeight: '140px', overflowY: 'auto' } }, changes.length ? changes.map((c) => h('div', {}, c)) : 'Nothing needed changing.'),
      h('div', { class: 'small muted', style: { marginTop: '6px' } }, 'Still hear the voice slightly before/after the mouth? Settings → "Voice sync offset" nudges all voices. Ctrl+Z undoes this whole operation.'));
    closeBtn.textContent = 'Close';
    finished = true; startBtn.textContent = '▶ Play from start';
  }
}
