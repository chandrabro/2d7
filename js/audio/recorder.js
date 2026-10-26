// Microphone recording with MediaRecorder.

export class Recorder {
  constructor() { this.rec = null; this.chunks = []; this.stream = null; this.startedAt = 0; this.analyser = null; }
  get recording() { return !!this.rec && this.rec.state === 'recording'; }
  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((m) => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
    this.rec = new MediaRecorder(this.stream, mime ? { mimeType: mime } : undefined);
    this.chunks = [];
    this.rec.ondataavailable = (e) => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.rec.start(100);
    this.startedAt = performance.now();
    // level meter
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(this.stream);
      this.analyser = ctx.createAnalyser(); this.analyser.fftSize = 256; src.connect(this.analyser); this._meterCtx = ctx;
    } catch (e) { this.analyser = null; }
  }
  level() {
    if (!this.analyser) return 0;
    const d = new Uint8Array(this.analyser.frequencyBinCount); this.analyser.getByteTimeDomainData(d);
    let m = 0; for (const v of d) m = Math.max(m, Math.abs(v - 128)); return m / 128;
  }
  async stop() {
    if (!this.rec) return null;
    const rec = this.rec;
    const blob = await new Promise((resolve) => { rec.onstop = () => resolve(new Blob(this.chunks, { type: rec.mimeType || 'audio/webm' })); rec.stop(); });
    this.stream.getTracks().forEach((t) => t.stop());
    try { this._meterCtx && this._meterCtx.close(); } catch (e) { /* ignore */ }
    this.rec = null; this.stream = null; this.analyser = null;
    return blob;
  }
}
