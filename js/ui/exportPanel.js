// Export modal.

import { h, field, select, button, download, fmtTime } from './dom.js';
import { exportMp4Offline, exportRealtime, exportLiveWithTabAudio, snapshotPng, supportsWebCodecs } from '../export/exporter.js';
import { totalDuration } from '../engine/renderer.js';
import { hasTts } from '../audio/mixer.js';
import { ASPECTS } from './stage.js';

export function openExportModal(app) {
  const p = app.project;
  const [aw, ah] = ASPECTS[p.aspect] || ASPECTS['16:9'];
  const resolutions = p.aspect === '9:16' ? [['720', '720 × 1280 (HD)'], ['1080', '1080 × 1920 (Full HD)']] : p.aspect === '1:1' ? [['720', '720 × 720'], ['1080', '1080 × 1080']] : p.aspect === '4:3' ? [['720', '960 × 720'], ['1080', '1440 × 1080']] : [['720', '1280 × 720 (HD)'], ['1080', '1920 × 1080 (Full HD)']];
  let res = '1080', fps = '30', quality = 'high', mode = supportsWebCodecs() ? 'mp4' : 'realtime';
  const tts = hasTts(p);
  const total = totalDuration(p);
  const body = h('div');
  const progress = h('div', { class: 'progress' }, h('i'));
  const status = h('div', { class: 'small muted', style: { margin: '6px 0 10px' } }, `Movie length: ${fmtTime(total)} · ${p.scenes.length} scene(s)`);
  let controller = null;
  const modeSel = select([
    ['mp4', supportsWebCodecs() ? 'MP4 – fast, frame-perfect (recommended)' : 'MP4 (needs Chrome/Edge – not available here)'],
    ['live', 'Live recording with tab audio – browser voices (if the browser lets the tab share them)'],
    ['livesys', 'Live recording with SYSTEM audio – records every sound the PC plays (Windows, share Entire Screen)'],
    ['realtime', 'WebM / MP4 via screen-less real-time recording (fallback)'],
  ], mode, (v) => { mode = v; updateNote(); });
  const note = h('div', { class: 'note' });
  const updateNote = () => {
    note.className = 'note';
    if (mode === 'mp4') note.textContent = tts ? 'This export renders every frame exactly and mixes uploaded/recorded audio and music. Browser TTS voices cannot be captured this way – those dialogs will show bubbles but stay silent. To include TTS choose "Live recording with tab audio", or record the lines with your microphone.' : 'Renders every frame exactly, with uploaded/recorded audio and music mixed in. Encoding happens in your browser; nothing is uploaded.';
    else if (mode === 'live') { note.className = 'note warn'; note.textContent = `Plays the movie in real time (${fmtTime(total)}) while recording. The browser will ask you to share a tab: pick THIS tab and turn on "Share tab audio". NOTE: many browsers do NOT put browser/OS voices (Web Speech) into the tab's audio – watch the level meter: if it stays empty, cancel and use "SYSTEM audio" or voice files (see README).`; }
    else if (mode === 'livesys') { note.className = 'note warn'; note.textContent = `Plays the movie in real time (${fmtTime(total)}). In the share dialog choose "Entire screen" and tick "Also share system audio", then press Share. Everything the PC plays is recorded – close other sounds (music, notifications), keep the volume up and don't mute the PC.`; }
    else note.textContent = 'Records the canvas in real time with MediaRecorder. Produces WebM in most browsers (MP4 in Safari / recent Chrome). Uploaded audio and music are included; browser TTS is not.';
  };
  updateNote();
  const startBtn = button('Start export', run, 'accent');
  const cancelBtn = button('Cancel', () => { if (controller) controller.abort(); else app.closeModal(); }, 'ghost');
  const pngBtn = button('Save current frame as PNG', async () => { const blob = await snapshotPng(p, app.store, app.time, res === '1080' ? aw * 1.5 : aw, res === '1080' ? ah * 1.5 : ah); download(blob, `${safeName(p.title)}-frame.png`); }, 'ghost');
  body.append(
    h('h2', {}, 'Export video'),
    status,
    h('div', { class: 'grid3' },
      field('Resolution', select(resolutions, res, (v) => { res = v; })),
      field('Frame rate', select([['24', '24 fps (film)'], ['30', '30 fps'], ['60', '60 fps']], fps, (v) => { fps = v; })),
      field('Quality', select([['medium', 'Medium (small file)'], ['high', 'High'], ['ultra', 'Ultra']], quality, (v) => { quality = v; }))),
    field('Method', modeSel), note, progress,
    h('div', { class: 'row', style: { marginTop: '12px' } }, startBtn, pngBtn, cancelBtn));
  app.modal(body);

  async function run() {
    if (!p.scenes.length) { app.toast('Nothing to export – add a scene first.', true); return; }
    const scale = res === '1080' ? 1.5 : 1;
    const width = Math.round(aw * scale), height = Math.round(ah * scale);
    controller = new AbortController();
    startBtn.disabled = true; modeSel.disabled = true; pngBtn.disabled = true; cancelBtn.textContent = 'Cancel export';
    app.pause();
    const onProgress = ({ stage, ratio, fps: f, level }) => {
      progress.firstChild.style.width = Math.round(ratio * 100) + '%';
      const meter = level == null ? '' : '  ·  sound captured: ' + '█'.repeat(Math.min(10, Math.round(Math.sqrt(level) * 18))).padEnd(10, '░') + (level < 0.002 ? ' (silent)' : '');
      status.textContent = stage === 'audio' ? 'Mixing audio…' : stage === 'finalize' ? 'Finalising file…' : `Rendering ${Math.round(ratio * 100)}%` + (f ? ` · ${f.toFixed(0)} frames/s` : '') + meter;
    };
    try {
      const opts = { width, height, fps: parseInt(fps), quality, onProgress, signal: controller.signal };
      let result;
      if (mode === 'mp4') result = await exportMp4Offline(p, app.store, opts);
      else if (mode === 'live' || mode === 'livesys') result = await exportLiveWithTabAudio(p, app.store, app.player, { ...opts, audioSource: mode === 'livesys' ? 'system' : 'tab' });
      else result = await exportRealtime(p, app.store, opts);
      const name = `${safeName(p.title)}.${result.ext}`;
      download(result.blob, name);
      status.textContent = `Done: ${name} (${(result.blob.size / 1048576).toFixed(1)} MB)`;
      if (result.maxLevel != null && result.maxLevel < 0.003) {
        status.textContent += '\n⚠ NO SOUND was captured, so this video is silent. ' + (result.audioSource === 'tab' ? 'The browser did not share its voices through the tab. Export again with "Live recording with SYSTEM audio", or generate voice files (voice-tools/make_voices.py, see README) and use the fast MP4 export.' : 'Make sure "Also share system audio" was ticked, the PC is not muted, and Entire screen was chosen.');
        status.style.whiteSpace = 'pre-line'; status.style.color = 'var(--danger, #ff6b6b)';
        app.toast('Video exported WITHOUT sound – see the message in the export window.', true);
      } else app.toast(`Exported ${name}`);
    } catch (e) {
      console.error(e);
      status.textContent = 'Export failed: ' + e.message;
      app.toast('Export failed: ' + e.message, true);
      if (mode === 'mp4' && /WebCodecs|encoder|load/i.test(e.message)) status.textContent += ' — try the real-time WebM method.';
    } finally {
      controller = null; startBtn.disabled = false; modeSel.disabled = false; pngBtn.disabled = false; cancelBtn.textContent = 'Close';
    }
  }
}
function safeName(s) { return String(s || 'story').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'story'; }
