// Real-time playback scheduler for preview: starts each dialog's audio (or TTS) exactly at its
// own start time on the timeline — so two characters never talk over each other unless their
// dialogs actually overlap on the timeline.

import { sceneStart, dialogDuration } from '../engine/renderer.js';
import * as tts from './tts.js';

export class Player {
  constructor(store) {
    this.store = store;
    this.playing = false;
    this.time = 0;           // current global time (s)
    this._startWall = 0; this._startTime = 0;
    this.sources = new Map(); // dialog id -> AudioBufferSourceNode
    this.started = new Set();
    this.musicSrc = null;
    this.muted = false;
    this.ttsEnabled = true;
    this.onTick = null; this.onEnd = null;
    this.gain = null;
  }
  _ensureGraph() {
    const ctx = this.store.ctx;
    if (!this.gain) { this.gain = ctx.createGain(); this.gain.connect(ctx.destination); }
    this.gain.gain.value = this.muted ? 0 : 1;
  }
  async play(project, fromTime) {
    // never let a blocked AudioContext (no user gesture yet) stop the visual playback
    await Promise.race([this.store.resume(), new Promise((r) => setTimeout(r, 300))]);
    this._ensureGraph();
    this.project = project;
    this.time = fromTime; this._startTime = fromTime; this._startWall = performance.now();
    this.playing = true; this.started.clear();
    this._startMusic(project, fromTime);
    this._loop();
  }
  pause() {
    this.playing = false;
    for (const s of this.sources.values()) { try { s.stop(); } catch (e) { /* ignore */ } }
    this.sources.clear(); this.started.clear();
    if (this.musicSrc) { try { this.musicSrc.stop(); } catch (e) { /* ignore */ } this.musicSrc = null; }
    tts.cancel();
  }
  seek(t) { const was = this.playing; this.pause(); this.time = t; if (was && this.project) this.play(this.project, t); }
  setMuted(m) { this.muted = m; if (this.gain) this.gain.gain.value = m ? 0 : 1; }
  _loop() {
    if (!this.playing) return;
    const now = this._startTime + (performance.now() - this._startWall) / 1000;
    this.time = now;
    const total = this.project.scenes.reduce((a, s) => a + s.duration, 0);
    if (now >= total) { this.pause(); this.time = total; this.onEnd && this.onEnd(); this.onTick && this.onTick(this.time); return; }
    this._schedule(now);
    this.onTick && this.onTick(now);
    requestAnimationFrame(() => this._loop());
  }
  _schedule(now) {
    const p = this.project; const info = this.store.info;
    for (let i = 0; i < p.scenes.length; i++) {
      const sc = p.scenes[i]; const s0 = sceneStart(p, i);
      if (now < s0 - 3 || now > s0 + sc.duration) continue;
      for (const d of sc.dialogs) {
        if (this.started.has(d.id)) continue;
        const gStart = s0 + d.start; const dur = dialogDuration(d, info);
        const isTts = d.source === 'tts' && !(d.audioId && this.store.has(d.audioId));
        // Browser voices need a moment before the first sound: start them a bit EARLY (the measured
        // "lead") so the sound begins exactly when the mouth starts moving.
        const lead = isTts ? Math.max(0, (d.lead || 0) + (this.project.ttsSync || 0)) : 0;
        const trigger = gStart - lead;
        if (now >= trigger && now < gStart + dur) {
          this.started.add(d.id);
          if (d.audioId && this.store.has(d.audioId)) this._playClip(d, now - gStart, dur);
          else if (isTts && d.text && this.ttsEnabled && !this.muted && now - trigger < 0.6) tts.speak(d.text, { voice: d.voice, rate: d.rate || 1, pitch: d.pitch || 1, volume: d.volume ?? 1 });
        }
      }
    }
  }
  _playClip(d, offset, dur) {
    const ctx = this.store.ctx; const clip = this.store.get(d.audioId);
    const src = ctx.createBufferSource(); src.buffer = clip.buffer;
    const g = ctx.createGain(); g.gain.value = d.volume ?? 1; src.connect(g); g.connect(this.gain);
    const start = (d.trimStart || 0) + offset;
    try { src.start(0, start, Math.max(0.01, dur - offset)); } catch (e) { return; }
    this.sources.set(d.id, src);
    src.onended = () => this.sources.delete(d.id);
  }
  _startMusic(project, fromTime) {
    const m = project.music; if (!m || !m.audioId || !this.store.has(m.audioId)) return;
    const ctx = this.store.ctx; const clip = this.store.get(m.audioId);
    const src = ctx.createBufferSource(); src.buffer = clip.buffer; src.loop = m.loop !== false;
    const g = ctx.createGain(); g.gain.value = m.volume ?? 0.35; src.connect(g); g.connect(this.gain);
    const offset = src.loop ? fromTime % clip.duration : fromTime;
    if (!src.loop && offset >= clip.duration) return;
    try { src.start(0, offset); } catch (e) { return; }
    this.musicSrc = src;
  }
  /** Play one clip immediately (for previewing a recording). */
  async preview(audioId) {
    await this.store.resume(); this._ensureGraph();
    const clip = this.store.get(audioId); if (!clip) return;
    const src = this.store.ctx.createBufferSource(); src.buffer = clip.buffer; src.connect(this.gain); src.start();
  }
}
