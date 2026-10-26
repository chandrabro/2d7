// "Cast voices" window: choose the voice of every character + the narrator ONCE, for all scenes.
// Engines: keep (leave lines as they are) · browser voice (Edge/Chrome TTS) · Gemini (Google AI Studio key).

import { h, field, select, num, button, textInput, round } from './dom.js';
import * as gem from '../audio/gemini.js';
import * as tts from '../audio/tts.js';
import { castRows, cfgFor, ensureCast, planGemini, applyCast, previewCfg } from '../audio/cast.js';
import { saveLocal } from '../state.js';

const SAMPLE = 'नमस्ते, म तपाईंको कथाको पात्र हुँ। मेरो आवाज यस्तो सुनिन्छ।';

export function openCastPanel(app) {
  app.pause();
  const p = app.project;
  ensureCast(p);
  let pauseSec = 3, running = false, controller = null;
  const modalCard = document.getElementById('modalCard'); modalCard.style.width = 'min(920px, 96vw)';

  const status = h('div', { class: 'note', style: { whiteSpace: 'pre-line' } }, '');
  const bar = h('div', { class: 'progress' }, h('i'));
  const rowsBox = h('div', {});
  const planBox = h('div', { class: 'small muted', style: { margin: '6px 0' } });

  // ---------- API key / model ----------
  const keyInp = h('input', { type: 'password', value: gem.getKey(), placeholder: 'AIza… (from aistudio.google.com → Get API key)', autocomplete: 'off', spellcheck: false, style: { flex: '1 1 260px' } });
  const modelInp = h('input', { type: 'text', value: gem.getModel(), list: 'gemModels', style: { flex: '1 1 220px' } });
  const dl = h('datalist', { id: 'gemModels' }, ...gem.DEFAULT_MODELS.map((m) => h('option', { value: m })));
  const saveKey = () => { gem.setKey(keyInp.value.trim()); gem.setModel(modelInp.value.trim() || gem.DEFAULT_MODELS[0]); refreshPlan(); };
  keyInp.addEventListener('change', saveKey); modelInp.addEventListener('change', saveKey);
  const showBtn = button('👁', () => { keyInp.type = keyInp.type === 'password' ? 'text' : 'password'; }, 'tiny fixed', { title: 'Show / hide key' });
  const testBtn = button('Test key & voice', async () => {
    saveKey(); testBtn.disabled = true; status.textContent = 'Testing…';
    try { await previewCfg(app, { engine: 'gemini', gVoice: 'Kore', style: '' }, 'नमस्ते'); status.textContent = '✅ The key works – you should have heard "नमस्ते".'; } catch (e) { status.textContent = '❌ ' + e.message; }
    testBtn.disabled = false;
  }, 'tiny');

  // ---------- one row per character ----------
  function renderRows() {
    rowsBox.innerHTML = '';
    const voices = tts.getVoices();
    for (const r of castRows(p)) {
      const cfg = cfgFor(p, r.key);
      const set = (patch) => { ensureCast(p)[r.key] = { ...cfg, ...patch }; saveLocal(p); renderRows(); refreshPlan(); };
      const box = h('div', { class: 'item' });
      box.append(h('div', { style: { font: '700 15px var(--font-display, inherit)', margin: '0 0 6px' } }, r.name));
      box.append(h('div', { class: 'head' }, h('span', { class: 'badge ' + (r.lines ? 'ok' : '') }, `${r.lines} line${r.lines === 1 ? '' : 's'}`),
        select([['keep', 'Keep as is'], ['browser', 'Browser voice (Edge/Chrome)'], ['gemini', 'Gemini (AI Studio)']], cfg.engine, (v) => set({ engine: v }))));
      if (cfg.engine === 'gemini') {
        box.append(h('div', { class: 'grid2' },
          field('Gemini voice', select(gem.GEMINI_VOICES.map(([n, d]) => [n, `${n} – ${d}`]), cfg.gVoice, (v) => set({ gVoice: v }))),
          field('Style / acting (optional)', textInput(cfg.style, (v) => set({ style: v }), { placeholder: 'e.g. Say slowly in a deep, old man\'s voice' }))));
      } else if (cfg.engine === 'browser') {
        box.append(h('div', { class: 'grid3' },
          field('Voice', select([['', '(keep each line\'s current voice)'], ...voices.map((v) => [v.name, `${v.name} (${v.lang})`])], cfg.bVoice, (v) => set({ bVoice: v }))),
          field('Rate (blank = keep)', h('input', { type: 'number', min: 0.5, max: 2, step: 0.05, value: cfg.rate ?? '', placeholder: 'keep', onChange: (e) => set({ rate: e.target.value === '' ? null : Math.max(0.5, Math.min(2, parseFloat(e.target.value))) }) })),
          field('Pitch (blank = keep)', h('input', { type: 'number', min: 0.5, max: 2, step: 0.05, value: cfg.pitch ?? '', placeholder: 'keep', onChange: (e) => set({ pitch: e.target.value === '' ? null : Math.max(0.5, Math.min(2, parseFloat(e.target.value))) }) }))));
      }
      if (cfg.engine !== 'keep') {
        const pb = button('▶ Preview', async (e) => {
          e.stopPropagation(); pb.disabled = true; status.textContent = 'Preview…';
          const sampleLine = p.scenes.flatMap((s) => s.dialogs.filter((d) => (r.key === 'narrator' ? (d.narrator || (d.silent && d.bubble === false)) : s.actors[d.actor]?.characterId === r.key) && d.text)).map((d) => d.text)[0] || SAMPLE;
          try { await previewCfg(app, cfg, sampleLine); status.textContent = ''; } catch (err) { status.textContent = '❌ ' + err.message; }
          pb.disabled = false;
        }, 'tiny');
        box.append(h('div', { class: 'row' }, pb, h('span', { class: 'small muted' }, 'Plays the first line of this character with these settings.')));
      }
      rowsBox.append(box);
    }
  }
  function refreshPlan() {
    const { todo, done } = planGemini(p, app.store, gem.getModel());
    planBox.textContent = todo.length || done.length ? `Gemini lines: ${todo.length} to generate · ${done.length} already generated (kept).` : 'No lines are set to Gemini yet.';
  }

  const goBtn = button('▶ Apply to all scenes & generate', run, 'primary');
  const closeBtn = button('Close', () => { if (running && controller) controller.abort(); modalCard.style.width = ''; app.closeModal(); });

  async function run() {
    if (running) return; saveKey();
    running = true; controller = new AbortController(); goBtn.disabled = true; bar.firstChild.style.width = '0%';
    try {
      const res = await applyCast(app, {
        pauseMs: pauseSec * 1000, signal: controller.signal,
        onStatus: (s) => {
          if (s.phase === 'gen') { status.textContent = `Gemini ${s.i} / ${s.total}  ·  ${s.voice}\n“${s.text.slice(0, 70)}${s.text.length > 70 ? '…' : ''}”`; bar.firstChild.style.width = Math.round(((s.i - 1) / s.total) * 100) + '%'; }
          else if (s.phase === 'wait') status.textContent = `Free-tier limit reached – waiting ${Math.ceil(s.ms / 1000)} s and trying again (line ${s.i}/${s.total})…\n${s.error}`;
        },
      });
      bar.firstChild.style.width = '100%';
      const bad = res.failed.length;
      status.textContent = `Done.  Gemini lines generated: ${res.generated}/${res.total}` + (res.changedBrowser ? `  ·  browser-voice lines updated: ${res.changedBrowser}` : '') + `  ·  ${res.retimed} scene(s) re-timed.` +
        (bad ? `\n⚠ ${bad} line(s) failed${res.failed.fatal ? ': ' + res.failed.fatal : ' (e.g. "' + res.failed[0].error.slice(0, 120) + '")'}. Press the button again to retry only those.` : '\nPress ▶ in the app to listen. Browser-voice lines: use ⏱ Measure voices.');
    } catch (e) { status.textContent = '❌ ' + e.message; }
    running = false; goBtn.disabled = false; renderRows(); refreshPlan();
  }

  const body = h('div', {},
    h('h2', {}, '🎙 Cast voices'),
    h('div', { class: 'note' }, 'Pick the voice of each character ONCE – it is applied to every line in every scene. Narration lines use the Narrator row. Lines you recorded or uploaded yourself are never changed.'),
    h('div', { class: 'section' }, h('h3', {}, 'Gemini (Google AI Studio)'),
      h('div', { class: 'row', style: { flexWrap: 'wrap' } }, keyInp, showBtn),
      h('div', { class: 'row', style: { flexWrap: 'wrap', marginTop: '6px' } }, h('span', { class: 'small muted fixed' }, 'Model'), modelInp, dl, testBtn),
      h('div', { class: 'small muted', style: { marginTop: '6px' } }, 'Get a free key at aistudio.google.com. The key is stored only in THIS browser (never inside your project files). Free keys have limits – the app waits and retries automatically. If you see "404 model not found", copy the current text-to-speech model name from AI Studio into the Model box.'),
      field('Pause between requests (seconds)', num(pauseSec, (v) => { pauseSec = Math.max(0, Math.min(60, v || 0)); }, { min: 0, max: 60, step: 1 }))),
    rowsBox, planBox, status, bar,
    h('div', { class: 'row', style: { marginTop: '12px' } }, goBtn, closeBtn));
  app.modal(body);
  modalCard.style.width = 'min(920px, 96vw)';
  renderRows(); refreshPlan();
}
