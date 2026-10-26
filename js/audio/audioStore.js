// Stores uploaded / recorded audio clips: decoded AudioBuffers + loudness envelopes for lip-sync.
// Blobs are persisted in IndexedDB so the project survives a reload.

import { uid } from '../engine/util.js';

const DB_NAME = 'story-animator-audio', STORE = 'clips';
const ENVELOPE_RATE = 60; // samples per second

function openDb() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return resolve(null);
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export class AudioStore {
  constructor() {
    this.clips = new Map(); // id -> { id, name, blob, buffer, duration, envelope, envelopeRate, gain, type }
    this.info = {}; // plain object given to the renderer
    this._ctx = null;
  }
  get ctx() {
    if (!this._ctx) this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    return this._ctx;
  }
  async resume() { try { if (this.ctx.state !== 'running') await this.ctx.resume(); } catch (e) { /* ignore */ } }

  async add(blob, name = 'clip', id = null, persist = true) {
    id = id || uid('au');
    const buffer = await this.decode(blob);
    const clip = { id, name, blob, buffer, duration: buffer.duration, type: blob.type, gain: 1 };
    const env = computeEnvelope(buffer, ENVELOPE_RATE);
    clip.envelope = env.envelope; clip.envelopeRate = ENVELOPE_RATE; clip.gain = env.gain;
    this.clips.set(id, clip);
    this.info[id] = { duration: clip.duration, envelope: clip.envelope, envelopeRate: ENVELOPE_RATE, gain: clip.gain, name };
    if (persist) this.persist(clip).catch(() => {});
    return clip;
  }
  async decode(blob) {
    const ab = await blob.arrayBuffer();
    return await this.ctx.decodeAudioData(ab.slice(0));
  }
  get(id) { return this.clips.get(id); }
  has(id) { return this.clips.has(id); }
  remove(id) {
    this.clips.delete(id); delete this.info[id];
    openDb().then((db) => { if (!db) return; const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); });
  }
  async persist(clip) {
    const db = await openDb(); if (!db) return;
    await new Promise((res, rej) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put({ id: clip.id, name: clip.name, blob: clip.blob }); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  }
  /** Load all persisted clips (called at startup). Only the ids listed in `wanted` are decoded if given. */
  async loadPersisted(wanted = null) {
    const db = await openDb(); if (!db) return;
    const rows = await new Promise((res) => { const tx = db.transaction(STORE, 'readonly'); const r = tx.objectStore(STORE).getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); });
    for (const row of rows) {
      if (wanted && !wanted.has(row.id)) continue;
      try { await this.add(row.blob, row.name, row.id, false); } catch (e) { console.warn('could not decode stored clip', row.id, e); }
    }
  }
  /** Remove stored clips that no project references. */
  async prune(keepIds) {
    const db = await openDb(); if (!db) return;
    const tx = db.transaction(STORE, 'readwrite'); const st = tx.objectStore(STORE);
    const req = st.getAllKeys();
    req.onsuccess = () => { for (const k of req.result) if (!keepIds.has(k)) st.delete(k); };
  }
  async toDataURL(id) {
    const c = this.clips.get(id); if (!c) return null;
    return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(c.blob); });
  }
  async addFromDataURL(dataUrl, name, id) {
    const blob = await (await fetch(dataUrl)).blob();
    return this.add(blob, name, id);
  }
}

function computeEnvelope(buffer, rate) {
  const ch = buffer.numberOfChannels;
  const data = [];
  for (let c = 0; c < ch; c++) data.push(buffer.getChannelData(c));
  const win = Math.max(1, Math.floor(buffer.sampleRate / rate));
  const n = Math.ceil(buffer.length / win);
  const env = new Float32Array(n);
  let peak = 0;
  for (let i = 0; i < n; i++) {
    let sum = 0, cnt = 0;
    const s0 = i * win, s1 = Math.min(buffer.length, s0 + win);
    for (let c = 0; c < ch; c++) { const d = data[c]; for (let s = s0; s < s1; s += 4) { sum += d[s] * d[s]; cnt++; } }
    const rms = Math.sqrt(sum / Math.max(1, cnt));
    env[i] = rms; if (rms > peak) peak = rms;
  }
  // smooth (attack fast, release slower) and normalise
  const out = new Float32Array(n); let v = 0;
  for (let i = 0; i < n; i++) { const x = env[i] / (peak || 1); v = x > v ? x : v * 0.75 + x * 0.25; out[i] = Math.pow(v, 0.7); }
  return { envelope: out, gain: 1 };
}
