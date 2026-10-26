// Free browser text-to-speech via the Web Speech API (no API keys, no setup).
// Note: TTS audio cannot be captured by the offline MP4 export; use "Export (live, with tab audio)"
// or record your voice / upload a clip for exported speech.

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

let voicesCache = [];
export function getVoices() {
  if (!ttsAvailable()) return [];
  const v = speechSynthesis.getVoices();
  if (v.length) voicesCache = v;
  return voicesCache;
}
if (ttsAvailable()) { getVoices(); speechSynthesis.addEventListener?.('voiceschanged', getVoices); }

const _norm = (x) => String(x || '').toLowerCase().replace('_', '-');
const _STOP = new Set(['microsoft', 'google', 'online', 'natural', 'nepali', 'nepal', 'hindi', 'india']);
/** Find an installed voice by exact name, language code (hi-IN / hi_IN / ne), or by a distinctive word of its name (e.g. "Sagar"). */
export function findVoice(nameOrLang) {
  const voices = getVoices();
  if (!nameOrLang) return null;
  const want = _norm(nameOrLang);
  const isLang = /^[a-z]{2}(-[a-z]{2})?$/.test(want);
  let v = voices.find((x) => x.name === nameOrLang)
    || voices.find((x) => _norm(x.lang) === want)
    || voices.find((x) => _norm(x.lang).startsWith(want));
  if (!v && !isLang) {   // match by a distinctive word of the voice name, e.g. "Sagar" or "Hemkala"
    const toks = want.replace(/[()\-]/g, ' ').split(/\s+/).filter((t) => t.length > 2 && !_STOP.has(t));
    v = voices.find((x) => toks.some((t) => _norm(x.name).includes(t)));
  }
  if (!v && isLang) v = voices.find((x) => _norm(x.lang).split('-')[0] === want.split('-')[0]);
  return v || null;
}
/** Apply a voice to an utterance; if nothing matched but a language code was given, set u.lang so the browser picks one. */
function applyVoice(u, nameOrLang) {
  const v = findVoice(nameOrLang);
  if (v) { u.voice = v; u.lang = v.lang; }
  else if (nameOrLang && /^[a-z]{2}([-_][A-Za-z]{2})?$/.test(nameOrLang)) u.lang = nameOrLang.replace('_', '-');
}

let current = null;
/** Speak text. Resolves when finished (or cancelled). Returns the utterance. */
export function speak(text, { voice, rate = 1, pitch = 1, volume = 1, onBoundary } = {}) {
  if (!ttsAvailable()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    applyVoice(u, voice);
    u.rate = rate; u.pitch = pitch; u.volume = volume;
    u.onend = () => { if (current === u) current = null; resolve(u); };
    u.onerror = () => { if (current === u) current = null; resolve(u); };
    if (onBoundary) u.onboundary = onBoundary;
    current = u;
    speechSynthesis.speak(u);
  });
}
export function cancel() { if (ttsAvailable()) { speechSynthesis.cancel(); current = null; } }
export function isSpeaking() { return ttsAvailable() && speechSynthesis.speaking; }

/**
 * Measure how a line really sounds: speaks it silently (volume 0) and returns
 * { duration, latency } in seconds. `latency` = time between speak() and the first audible sound
 * (online "Natural" voices need a moment to start). Returns null if speech is unavailable / failed.
 */
export function measureSpeech(text, opts = {}) {
  if (!ttsAvailable() || !String(text || '').trim()) return Promise.resolve(null);
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    applyVoice(u, opts.voice);
    u.rate = opts.rate || 1; u.pitch = opts.pitch || 1; u.volume = 0;
    let t0 = 0, started = null, done = false, timer = null;
    const finish = (ok) => {
      if (done) return; done = true; clearTimeout(timer);
      const t1 = performance.now();
      if (!ok) return resolve(null);
      if (started == null) return resolve({ duration: (t1 - t0) / 1000, latency: 0, noStartEvent: true });
      resolve({ duration: (t1 - started) / 1000, latency: (started - t0) / 1000 });
    };
    u.onstart = () => { started = performance.now(); };
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    opts.signal?.addEventListener?.('abort', () => { cancel(); finish(false); }, { once: true });
    timer = setTimeout(() => { cancel(); finish(false); }, opts.timeout || 60000);
    cancel();
    t0 = performance.now();
    speechSynthesis.speak(u);
  });
}

/** Backwards compatible helper: only the spoken duration (seconds). */
export async function measureDuration(text, opts = {}) {
  const r = await measureSpeech(text, opts);
  return r ? Math.max(0.3, r.duration) : null;
}

/** Wait until the browser has loaded its voice list (Edge/Chrome load it asynchronously). */
export function waitForVoices(timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (!ttsAvailable()) return resolve([]);
    const have = getVoices(); if (have.length) return resolve(have);
    const t = setTimeout(() => resolve(getVoices()), timeoutMs);
    speechSynthesis.addEventListener('voiceschanged', () => { clearTimeout(t); resolve(getVoices()); }, { once: true });
  });
}
