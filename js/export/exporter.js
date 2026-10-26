// Video export – everything runs in the browser.
//  1. exportMp4Offline: frame-exact MP4 (H.264 + AAC/Opus) via WebCodecs + Mediabunny (loaded from a CDN on demand).
//  2. exportRealtime: MediaRecorder fallback (WebM, or MP4 where the browser supports it).
//  3. exportLiveWithTabAudio: real-time recording that captures the tab's audio, so browser TTS voices are included.

import { renderFrame, totalDuration } from '../engine/renderer.js';
import { renderMix, hasAnyAudio } from '../audio/mixer.js';

const MEDIABUNNY_URL = 'https://cdn.jsdelivr.net/npm/mediabunny@1.61.6/dist/bundles/mediabunny.min.mjs';
let mbPromise = null;
export function loadMediabunny() {
  if (!mbPromise) mbPromise = import(/* webpackIgnore: true */ MEDIABUNNY_URL).catch((e) => { mbPromise = null; throw new Error('Could not load the MP4 encoder library (needs internet for the first load): ' + e.message); });
  return mbPromise;
}
export const supportsWebCodecs = () => typeof window !== 'undefined' && 'VideoEncoder' in window;

const yieldUI = () => new Promise((r) => setTimeout(r, 0));

export async function exportMp4Offline(project, store, { width = 1280, height = 720, fps = 30, quality = 'high', onProgress = () => {}, signal } = {}) {
  if (!supportsWebCodecs()) throw new Error('WebCodecs is not available in this browser. Use Chrome / Edge, or choose the WebM export.');
  const mb = await loadMediabunny();
  const { Output, Mp4OutputFormat, BufferTarget, CanvasSource, AudioBufferSource, Quality, getFirstEncodableVideoCodec, getFirstEncodableAudioCodec } = mb;
  const videoCodec = await getFirstEncodableVideoCodec(['avc', 'hevc', 'av1', 'vp9'], { width, height });
  if (!videoCodec) throw new Error('No supported video encoder found for ' + width + 'x' + height);
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const bitrate = quality === 'ultra' ? 16e6 : quality === 'high' ? 9e6 : quality === 'medium' ? 5e6 : 2.5e6;
  const videoSource = new CanvasSource(canvas, { codec: videoCodec, quality: new Quality({ bitrate: Math.round(bitrate * (width * height) / (1920 * 1080)) }) });
  output.addVideoTrack(videoSource, { frameRate: fps });
  let audioSource = null, mix = null;
  const includeAudio = hasAnyAudio(project, store);
  if (includeAudio) {
    onProgress({ stage: 'audio', ratio: 0 });
    mix = await renderMix(project, store, 48000);
    const audioCodec = await getFirstEncodableAudioCodec(['aac', 'opus'], { numberOfChannels: 2, sampleRate: 48000 }) || 'pcm-s16';
    audioSource = new AudioBufferSource({ codec: audioCodec, quality: new Quality({ bitrate: 160e3 }) });
    output.addAudioTrack(audioSource);
  }
  output.setMetadataTags?.({ title: project.title || 'StoryStage movie', comment: 'Made with StoryStage' });
  await output.start();
  if (audioSource) { await audioSource.add(mix); audioSource.close?.(); }
  const total = totalDuration(project);
  const frames = Math.ceil(total * fps);
  const audioInfo = store.info;
  const t0 = performance.now();
  for (let i = 0; i < frames; i++) {
    if (signal && signal.aborted) { await output.cancel(); throw new Error('Export cancelled'); }
    const t = i / fps;
    renderFrame(ctx, project, t, { width, height, audioInfo });
    await videoSource.add(t, 1 / fps);
    if (i % 5 === 0) { onProgress({ stage: 'video', ratio: i / frames, fps: i / ((performance.now() - t0) / 1000) }); await yieldUI(); }
  }
  videoSource.close?.();
  onProgress({ stage: 'finalize', ratio: 1 });
  await output.finalize();
  return { blob: new Blob([output.target.buffer], { type: 'video/mp4' }), ext: 'mp4', codec: videoCodec };
}

function pickRecorderMime() {
  const list = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  return list.find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
}

/** Measures the loudness of a captured audio stream (so we can tell the user when NOTHING is being captured). */
function monitorLevel(actx, stream) {
  const src = actx.createMediaStreamSource(stream);
  const an = actx.createAnalyser(); an.fftSize = 1024; src.connect(an);   // not connected to the speakers → no echo
  const buf = new Float32Array(an.fftSize); let max = 0;
  return {
    read() { an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; const r = Math.sqrt(s / buf.length); if (r > max) max = r; return r; },
    max: () => max,
    stop() { try { src.disconnect(); } catch (e) { /* ignore */ } },
  };
}

/** Real-time render + MediaRecorder. audioStream: optional MediaStream with audio tracks to include. */
async function recordRealtime(project, store, { width, height, fps, onProgress, signal, extraAudioStream, playTts = false, player = null }) {
  if (!window.MediaRecorder) throw new Error('MediaRecorder is not available in this browser.');
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  const stream = canvas.captureStream(fps);
  const actx = store.ctx; await Promise.race([store.resume(), new Promise((r) => setTimeout(r, 500))]);
  const dest = actx.createMediaStreamDestination();
  let mixSrc = null;
  if (!extraAudioStream && hasAnyAudio(project, store)) {
    const mix = await renderMix(project, store, actx.sampleRate);
    mixSrc = actx.createBufferSource(); mixSrc.buffer = mix; mixSrc.connect(dest);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
  }
  let level = null;
  if (extraAudioStream) { extraAudioStream.getAudioTracks().forEach((t) => stream.addTrack(t)); try { level = monitorLevel(actx, extraAudioStream); } catch (e) { console.warn('level monitor failed', e); } }
  const mime = pickRecorderMime();
  const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 8e6 });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  const total = totalDuration(project);
  const done = new Promise((resolve) => { rec.onstop = () => resolve(); });
  rec.start(250);
  const start = performance.now();
  if (mixSrc) mixSrc.start();
  if (playTts && player) { player.ttsEnabled = true; await player.play(project, 0); }
  const start2 = performance.now();   // video clock starts AFTER the player is running, so voices and mouths stay in sync
  await new Promise((resolve) => {
    const tick = () => {
      const t = (performance.now() - start2) / 1000;
      if (signal && signal.aborted) return resolve();
      if (t >= total) return resolve();
      renderFrame(ctx, project, t, { width, height, audioInfo: store.info });
      onProgress({ stage: 'video', ratio: t / total, level: level ? level.read() : null });
      requestAnimationFrame(tick);
    };
    tick();
  });
  rec.stop(); await done;
  if (mixSrc) { try { mixSrc.stop(); } catch (e) { /* ignore */ } }
  if (player) player.pause();
  if (signal && signal.aborted) throw new Error('Export cancelled');
  const type = rec.mimeType || mime || 'video/webm';
  if (level) level.stop();
  return { blob: new Blob(chunks, { type }), ext: type.includes('mp4') ? 'mp4' : 'webm', codec: type, maxLevel: level ? level.max() : null };
}

export async function exportRealtime(project, store, opts) { return recordRealtime(project, store, opts); }

/**
 * Live export that records the sound the browser is playing (includes browser TTS voices).
 *  opts.audioSource = 'tab'    → share THIS TAB with "Share tab audio" (works for voices Chrome/Edge route through the tab)
 *  opts.audioSource = 'system' → share the ENTIRE SCREEN with "Share system audio" (Windows / ChromeOS; captures every
 *                                 sound the PC plays, including OS / Edge "Natural" voices that tab capture misses)
 * The result has `maxLevel` (0..1): ~0 means that nothing was captured.
 */
export async function exportLiveWithTabAudio(project, store, player, opts) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) throw new Error('Screen/tab capture is not available in this browser.');
  const system = opts.audioSource === 'system';
  const constraints = system
    ? { video: true, audio: true, systemAudio: 'include', selfBrowserSurface: 'exclude', surfaceSwitching: 'exclude', monitorTypeSurfaces: 'include' }
    : { video: true, audio: true, preferCurrentTab: true, selfBrowserSurface: 'include', systemAudio: 'exclude' };
  const disp = await navigator.mediaDevices.getDisplayMedia(constraints);
  // IMPORTANT: keep the video track alive. Stopping it can end the whole capture and silence the audio track.
  const audioTracks = disp.getAudioTracks();
  if (!audioTracks.length) {
    disp.getTracks().forEach((t) => t.stop());
    throw new Error(system
      ? 'No system audio was shared. In the share dialog choose "Entire screen" and tick "Also share system audio" (Windows / ChromeOS only).'
      : 'No tab audio was shared. In the share dialog choose this tab and enable "Share tab audio".');
  }
  const audioStream = new MediaStream(audioTracks);
  try {
    player.setMuted(false);
    const result = await recordRealtime(project, store, { ...opts, extraAudioStream: audioStream, playTts: true, player });
    result.audioSource = system ? 'system' : 'tab';
    return result;
  } finally { disp.getTracks().forEach((t) => t.stop()); }
}

export function snapshotPng(project, store, time, width = 1920, height = 1080) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  renderFrame(canvas.getContext('2d'), project, time, { width, height, audioInfo: store.info });
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
