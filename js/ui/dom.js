// Tiny DOM helpers for building panels without a framework.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k in el && k !== 'list' && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
export const text = (s) => document.createTextNode(s);

export function field(label, control, extra) {
  return h('div', { class: 'field' }, h('span', { class: 'lbl' }, label), control, extra);
}
export function select(options, value, onChange, attrs = {}) {
  // options: [[value, label]] or [{group, options:[[v,l]]}]
  const sel = h('select', { ...attrs, onChange: (e) => onChange(e.target.value, e) });
  const addOpts = (parent, opts) => { for (const [v, l] of opts) parent.append(h('option', { value: v, selected: String(v) === String(value) }, l)); };
  for (const o of options) {
    if (o && o.group) { const g = h('optgroup', { label: o.group }); addOpts(g, o.options); sel.append(g); }
    else addOpts(sel, [o]);
  }
  return sel;
}
export function num(value, onChange, { min, max, step = 0.1, width } = {}) {
  const inp = h('input', { type: 'number', value: round(value), min, max, step, style: width ? { width } : null, onChange: (e) => onChange(parseFloat(e.target.value)) });
  return inp;
}
export function range(value, onInput, { min = 0, max = 1, step = 0.01, onChange } = {}) {
  return h('input', { type: 'range', value, min, max, step, onInput: (e) => onInput(parseFloat(e.target.value)), onChange: onChange ? (e) => onChange(parseFloat(e.target.value)) : null });
}
export function textInput(value, onChange, attrs = {}) {
  return h('input', { type: 'text', value: value ?? '', ...attrs, onChange: (e) => onChange(e.target.value) });
}
export function textarea(value, onChange, attrs = {}) {
  return h('textarea', { ...attrs, onChange: (e) => onChange(e.target.value) }, value ?? '');
}
export function color(value, onChange) {
  return h('input', { type: 'color', value: value || '#000000', onInput: (e) => onChange(e.target.value) });
}
export function checkbox(label, checked, onChange, cls = 'chk') {
  return h('label', { class: cls }, h('input', { type: 'checkbox', checked: !!checked, onChange: (e) => onChange(e.target.checked) }), label);
}
export function button(label, onClick, cls = '', attrs = {}) {
  return h('button', { class: cls, onClick, ...attrs }, label);
}
export function swatches(colors, value, onPick) {
  const wrap = h('div', { class: 'swatches' });
  for (const c of colors) wrap.append(h('span', { class: 'swatch' + (c.toLowerCase() === String(value).toLowerCase() ? ' on' : ''), style: { background: c }, title: c, onClick: () => onPick(c) }));
  return wrap;
}
export function chips(items, selected, onToggle) {
  // items: [[value,label]]; selected: array
  const wrap = h('div', { class: 'row', style: { flexWrap: 'wrap', gap: '4px' } });
  for (const [v, l] of items) wrap.append(h('span', { class: 'chip' + (selected.includes(v) ? ' on' : ''), style: { flex: '0 0 auto' }, onClick: () => onToggle(v) }, l));
  return wrap;
}
export function round(v, d = 2) { const m = Math.pow(10, d); return Math.round((+v || 0) * m) / m; }
export function fmtTime(t) {
  t = Math.max(0, t || 0);
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}
export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
export function download(blob, filename) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
