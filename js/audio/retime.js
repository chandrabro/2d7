// Pure timeline maths for "Measure all voices": lays the dialogs of a scene out one after another
// using their measured lengths, resizes the scene, and re-times actions / captions so that
// everything stays in step with the speech (an action that lasted "while line 3 is spoken" still does).
// No DOM here, so it can be unit-tested in Node.

const r2 = (x) => Math.round(x * 100) / 100;

/** Piecewise-linear map built from [oldTime, newTime] anchor pairs (old strictly increasing, new non-decreasing). */
export function makeTimeMap(anchors, oldDur, newDur) {
  const a = [[0, 0]];
  for (const [o, n] of anchors) {
    const last = a[a.length - 1];
    if (o <= last[0] + 1e-6) continue;           // old time must increase
    a.push([o, Math.max(n, last[1])]);            // new time must not go backwards
  }
  const last = a[a.length - 1];
  if (oldDur > last[0] + 1e-6) a.push([oldDur, Math.max(newDur, last[1])]);
  return (t) => {
    if (t <= 0) return t;
    for (let i = 1; i < a.length; i++) {
      if (t <= a[i][0]) {
        const [o0, n0] = a[i - 1], [o1, n1] = a[i];
        return n0 + ((t - o0) / (o1 - o0)) * (n1 - n0);
      }
    }
    const [oL, nL] = a[a.length - 1];
    return nL + (t - oL);   // after the last anchor: simple shift
  };
}

/**
 * Re-lay-out one scene.
 *  measured: Map(dialogId -> { duration, lead })  (TTS dialogs that were measured)
 *  opts.gap        minimum silence between two lines (s)
 *  opts.minTail    minimum silence kept after the last line (s)
 *  opts.pad        extra time added to every measured line so speech is never cut (s)
 *  opts.firstPad   extra time before the first line (s) on top of its pre-start lead
 *  opts.syncExtra  global extra pre-start (project.ttsSync)
 * Returns { oldDuration, newDuration, changed }.
 */
export function relayoutScene(scene, measured, opts = {}) {
  const gap = opts.gap ?? 0.4, minTail = opts.minTail ?? 0.6, pad = opts.pad ?? 0.1, firstPad = opts.firstPad ?? 0.15, syncExtra = opts.syncExtra ?? 0;
  const ds = scene.dialogs.slice().sort((a, b) => a.start - b.start);
  if (!ds.length) return { oldDuration: scene.duration, newDuration: scene.duration, changed: false };
  const oldDur = scene.duration;
  const winOld = ds.map((d) => ({ s: d.start, e: d.start + (d.duration || 2) }));
  const lastOldEnd = Math.max(...winOld.map((w) => w.e));
  const oldTail = Math.min(8, Math.max(minTail, oldDur - lastOldEnd));

  // new durations
  const durNew = ds.map((d) => { const m = measured.get(d.id); return m ? r2(m.duration + pad) : (d.duration || 2); });
  const leadOf = (d) => Math.max(0, ((measured.get(d.id)?.lead ?? d.lead) || 0) + syncExtra);

  // new start times: one after another; the pre-start lead of the NEXT line must fit inside the silence
  const startNew = [];
  let t = 0;
  ds.forEach((d, i) => {
    if (i === 0) t = Math.max(winOld[0].s, leadOf(d) + firstPad);
    else t = t + Math.max(gap, leadOf(d) + 0.05);
    startNew.push(r2(t));
    t += durNew[i];
  });
  const newLastEnd = startNew[startNew.length - 1] + durNew[durNew.length - 1];
  const newDur = Math.max(1, Math.ceil((newLastEnd + oldTail) * 10) / 10);

  // anchors old -> new
  const anchors = [];
  ds.forEach((d, i) => { anchors.push([winOld[i].s, startNew[i]]); anchors.push([winOld[i].e, startNew[i] + durNew[i]]); });
  anchors.sort((a, b) => a[0] - b[0]);
  const mapT = makeTimeMap(anchors, oldDur, newDur);

  // apply: dialogs
  ds.forEach((d, i) => { d.start = startNew[i]; d.duration = durNew[i]; const m = measured.get(d.id); if (m) d.lead = r2(m.lead); });

  // actions
  for (const a of scene.actors || []) {
    for (const seg of a.actions || []) {
      const s = mapT(seg.start), e = mapT(seg.end ?? seg.start + 2);
      seg.start = r2(Math.max(0, s)); seg.end = r2(Math.min(newDur, Math.max(seg.start + 0.2, e)));
      if (seg.start >= newDur) seg.start = r2(Math.max(0, newDur - 0.3));
      if (seg.end <= seg.start) seg.end = r2(Math.min(newDur, seg.start + 0.3));
    }
  }
  // captions: narration subtitles snap exactly to their spoken line, other captions are re-timed
  const byText = new Map(ds.map((d, i) => [d.text, { s: startNew[i], e: startNew[i] + durNew[i] }]));
  for (const c of scene.captions || []) {
    const hit = byText.get(c.text);
    if (hit) { c.start = r2(hit.s); c.end = r2(Math.min(newDur, hit.e + 0.3)); continue; }
    const s = mapT(c.start), e = mapT(c.end);
    c.start = r2(Math.max(0, s)); c.end = r2(Math.min(newDur, Math.max(c.start + 0.3, e)));
  }
  scene.duration = newDur;
  return { oldDuration: oldDur, newDuration: newDur, changed: Math.abs(newDur - oldDur) > 0.05 || ds.some((d, i) => Math.abs(winOld[i].s - startNew[i]) > 0.05) };
}

export const median = (arr) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export const dialogSig = (d) => [d.voice || '', d.rate || 1, d.pitch || 1, d.text || ''].join('|');
