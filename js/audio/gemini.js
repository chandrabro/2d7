// Google AI Studio "Gemini" text-to-speech (REST, called straight from the browser with YOUR api key).
// The key is kept only in this browser's localStorage – it is never written into project files.

export const GEMINI_KEY_STORAGE = 'story-animator-gemini-key';
export const GEMINI_MODEL_STORAGE = 'story-animator-gemini-model';
export const DEFAULT_MODELS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'];

// The 30 prebuilt Gemini voices (+ Google's one-word character description). Use ▶ Preview to hear them.
export const GEMINI_VOICES = [
  ['Zephyr', 'Bright'], ['Puck', 'Upbeat'], ['Charon', 'Informative'], ['Kore', 'Firm'], ['Fenrir', 'Excitable'], ['Leda', 'Youthful'],
  ['Orus', 'Firm'], ['Aoede', 'Breezy'], ['Callirrhoe', 'Easy-going'], ['Autonoe', 'Bright'], ['Enceladus', 'Breathy'], ['Iapetus', 'Clear'],
  ['Umbriel', 'Easy-going'], ['Algieba', 'Smooth'], ['Despina', 'Smooth'], ['Erinome', 'Clear'], ['Algenib', 'Gravelly'], ['Rasalgethi', 'Informative'],
  ['Laomedeia', 'Upbeat'], ['Achernar', 'Soft'], ['Alnilam', 'Firm'], ['Schedar', 'Even'], ['Gacrux', 'Mature'], ['Pulcherrima', 'Forward'],
  ['Achird', 'Friendly'], ['Zubenelgenubi', 'Casual'], ['Vindemiatrix', 'Gentle'], ['Sadachbia', 'Lively'], ['Sadaltager', 'Knowledgeable'], ['Sulafat', 'Warm'],
];

export const getKey = () => { try { return localStorage.getItem(GEMINI_KEY_STORAGE) || ''; } catch (e) { return ''; } };
export const setKey = (k) => { try { k ? localStorage.setItem(GEMINI_KEY_STORAGE, k) : localStorage.removeItem(GEMINI_KEY_STORAGE); } catch (e) { /* ignore */ } };
export const getModel = () => { try { return localStorage.getItem(GEMINI_MODEL_STORAGE) || DEFAULT_MODELS[0]; } catch (e) { return DEFAULT_MODELS[0]; } };
export const setModel = (m) => { try { localStorage.setItem(GEMINI_MODEL_STORAGE, m); } catch (e) { /* ignore */ } };

const sleep = (ms, signal) => new Promise((res, rej) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener?.('abort', () => { clearTimeout(t); rej(new DOMException('aborted', 'AbortError')); }, { once: true });
});

export class GeminiError extends Error { constructor(msg, status, retryMs) { super(msg); this.status = status; this.retryMs = retryMs; } }

function b64ToBytes(b64) { const bin = atob(b64); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }

/** One request. Returns { samples: Int16Array, sampleRate }. */
export async function requestSpeech({ text, voice = 'Kore', style = '', model, apiKey, signal }) {
  if (!apiKey) throw new GeminiError('No Gemini API key. Open Cast voices and paste your AI Studio key.', 401);
  const prompt = style && style.trim() ? `${style.trim().replace(/[:：]\s*$/, '')}: ${text}` : text;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || getModel())}:generateContent`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST', signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      }),
    });
  } catch (e) {
    if (e.name === 'AbortError') throw e;
    throw new GeminiError('Network error talking to Google (' + e.message + '). Check your internet / ad-blocker.', 0);
  }
  let json = null; try { json = await res.json(); } catch (e) { /* ignore */ }
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText || 'request failed';
    let retryMs = 0;
    const m = /retry in ([\d.]+)s/i.exec(msg); if (m) retryMs = Math.ceil(parseFloat(m[1]) * 1000);
    const det = (json?.error?.details || []).find((d) => d.retryDelay); if (det) retryMs = Math.max(retryMs, Math.ceil(parseFloat(det.retryDelay) * 1000));
    throw new GeminiError(`Gemini ${res.status}: ${msg}`, res.status, retryMs);
  }
  const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part) throw new GeminiError('Gemini returned no audio (' + (json?.candidates?.[0]?.finishReason || json?.promptFeedback?.blockReason || 'unknown reason') + ').', 502);
  const rate = parseInt(/rate=(\d+)/.exec(part.inlineData.mimeType || '')?.[1] || '24000', 10);
  const bytes = b64ToBytes(part.inlineData.data);
  const samples = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
  return { samples, sampleRate: rate };
}

/** Request with automatic waiting + retry for the free-tier rate limits (429) and flaky 5xx answers. */
export async function generateSpeech(opts, { retries = 6, onWait, baseWaitMs = 20000 } = {}) {
  let attempt = 0;
  for (;;) {
    try { return await requestSpeech(opts); } catch (e) {
      if (e.name === 'AbortError') throw e;
      const retryable = e.status === 429 || e.status >= 500 || e.status === 0;
      if (!retryable || attempt >= retries) throw e;
      attempt++;
      const wait = (e.retryMs ? e.retryMs : (e.status === 429 ? baseWaitMs : 3000 * attempt)) + 500;
      onWait?.(wait, e, attempt);
      await sleep(wait, opts.signal);
    }
  }
}

/** Cut the silence Gemini leaves before/after the speech so the mouth starts and ends with the sound. */
export function trimSilence(samples, sampleRate, headKeep = 0.06, tailKeep = 0.14) {
  let peak = 0; for (let i = 0; i < samples.length; i += 3) peak = Math.max(peak, Math.abs(samples[i]));
  const thr = Math.max(250, peak * 0.03);
  let a = 0, b = samples.length - 1;
  while (a < samples.length && Math.abs(samples[a]) < thr) a++;
  while (b > a && Math.abs(samples[b]) < thr) b--;
  if (a >= b) return samples;
  const from = Math.max(0, a - Math.round(headKeep * sampleRate));
  const to = Math.min(samples.length, b + Math.round(tailKeep * sampleRate));
  return samples.slice(from, to);
}

export function pcmToWavBlob(samples, sampleRate) {
  const dataLen = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataLen); const v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, dataLen, true);
  new Int16Array(buf, 44).set(samples);
  return new Blob([buf], { type: 'audio/wav' });
}

export const geminiSig = (model, voice, style, text) => ['g', model, voice, style || '', text].join('|');
