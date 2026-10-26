// App bootstrap: state, playback, undo, persistence and panel wiring.

import { createProject, createSampleProject, newScene, newActor, newAction, newDialog, saveLocal, loadLocal, migrate, sequenceDialogs } from './state.js';
import { AudioStore } from './audio/audioStore.js';
import { Player } from './audio/player.js';
import { sceneStart, totalDuration, sceneAt, dialogDuration } from './engine/renderer.js';
import { getScene } from './engine/scenes/index.js';
import { h, clear, fmtTime, download, round } from './ui/dom.js';
import { setupStage } from './ui/stage.js';
import { setupTimeline } from './ui/timeline.js';
import { setupScenesPanel } from './ui/scenesPanel.js';
import { renderScenePanel } from './ui/scenePanel.js';
import { renderActorsPanel } from './ui/actorsPanel.js';
import { renderDialogPanel } from './ui/dialogPanel.js';
import { renderCharactersPanel } from './ui/charactersPanel.js';
import { renderSettingsPanel } from './ui/settingsPanel.js';
import { openExportModal } from './ui/exportPanel.js';
import { openMeasureAll } from './ui/measureAllPanel.js';
import { openCastPanel } from './ui/castPanel.js';
import { deepClone } from './engine/util.js';

const app = {
  project: null, store: new AudioStore(), player: null,
  time: 0, playing: false, showGuides: false,
  sel: { scene: 0, actor: -1, action: null, dialog: null, character: null },
  tab: 'scene', pickMode: null,
  undo: [], redo: [],
};
window.app = app;
app.player = new Player(app.store);

// ---------- helpers ----------
app.currentScene = () => app.project.scenes[app.sel.scene];
app.currentSceneDef = () => getScene(app.currentScene()?.background);
app.toast = (msg, isError = false) => {
  const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast' + (isError ? ' error' : '');
  clearTimeout(app._toastTimer); app._toastTimer = setTimeout(() => t.classList.add('hidden'), isError ? 6000 : 3000);
};
app.modal = (content) => { const m = document.getElementById('modal'); const card = document.getElementById('modalCard'); card.style.width = ''; clear(card); card.append(content); m.classList.remove('hidden'); };
app.closeModal = () => { document.getElementById('modal').classList.add('hidden'); document.getElementById('modalCard').style.width = ''; };
document.getElementById('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') app.closeModal(); });

// ---------- persistence / undo ----------
let saveTimer = null;
function autosave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveLocal(app.project), 400); }
app.commit = (label) => {
  app.undo.push(app._snapshot); if (app.undo.length > 60) app.undo.shift(); app.redo.length = 0;
  app._snapshot = JSON.stringify(app.project);
  clampSelection(); autosave(); app.rerenderAll();
};
let lazyTimer = null;
app.commitLazy = (label) => { app.refresh(); clearTimeout(lazyTimer); lazyTimer = setTimeout(() => app.commit(label), 500); };
app.doUndo = () => { if (!app.undo.length) return; app.redo.push(JSON.stringify(app.project)); app.project = migrate(JSON.parse(app.undo.pop())); app._snapshot = JSON.stringify(app.project); clampSelection(); autosave(); app.rerenderAll(); };
app.doRedo = () => { if (!app.redo.length) return; app.undo.push(JSON.stringify(app.project)); app.project = migrate(JSON.parse(app.redo.pop())); app._snapshot = JSON.stringify(app.project); clampSelection(); autosave(); app.rerenderAll(); };
function clampSelection() {
  const p = app.project;
  app.sel.scene = Math.max(0, Math.min(p.scenes.length - 1, app.sel.scene));
  const s = p.scenes[app.sel.scene];
  if (!s || app.sel.actor >= s.actors.length) app.sel.actor = -1;
  if (s && app.sel.action && !s.actors.some((a) => a.actions.some((x) => x.id === app.sel.action))) app.sel.action = null;
  if (s && app.sel.dialog && !s.dialogs.some((d) => d.id === app.sel.dialog)) app.sel.dialog = null;
  if (app.sel.character && !p.characters.some((c) => c.id === app.sel.character)) app.sel.character = null;
  const total = totalDuration(p); if (app.time > total) app.time = total;
}

// ---------- rendering ----------
app.rerenderAll = () => { app.scenesPanel.build(); app.timeline.build(); app.rerenderPanels(); app.stage.draw(); updateTime(); };
app.rerenderPanels = () => {
  const body = document.getElementById('tabBody'); clear(body);
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === app.tab));
  const r = { scene: renderScenePanel, actors: renderActorsPanel, dialog: renderDialogPanel, characters: renderCharactersPanel, settings: renderSettingsPanel }[app.tab];
  try { r(app, body); } catch (e) { console.error(e); body.append(h('div', { class: 'note warn' }, 'Panel error: ' + e.message)); }
  // keep selection highlights in the timeline in sync
  app.timeline.build();
  app.stage.draw();
};
app.refresh = () => { app.stage.draw(); app.timeline.updatePlayhead(); app.scenesPanel.refreshActive(); updateTime(); };
function updateTime() {
  document.getElementById('timeDisplay').textContent = `${fmtTime(app.time)} / ${fmtTime(totalDuration(app.project))}`;
  document.getElementById('btnPlay').textContent = app.playing ? '⏸' : '▶';
}

// ---------- playback ----------
app.seek = (t) => {
  app.time = Math.max(0, Math.min(totalDuration(app.project), t));
  const { index } = sceneAt(app.project, app.time);
  const sceneChanged = index !== app.sel.scene;
  if (sceneChanged) { app.sel.scene = index; app.sel.actor = -1; app.sel.action = null; app.sel.dialog = null; }
  if (app.playing) app.player.seek(app.time);
  if (sceneChanged) { app.scenesPanel.build(); app.timeline.build(); app.rerenderPanels(); }
  app.refresh();
};
app.play = async () => {
  if (!app.project.scenes.length) return;
  if (app.time >= totalDuration(app.project) - 0.01) app.time = 0;
  app.playing = true; updateTime();
  app.player.onTick = (t) => {
    app.time = t;
    const { index } = sceneAt(app.project, t);
    if (index !== app.sel.scene) { app.sel.scene = index; app.sel.actor = -1; app.scenesPanel.build(); app.timeline.build(); if (app.tab !== 'characters' && app.tab !== 'settings') app.rerenderPanels(); }
    app.refresh();
  };
  app.player.onEnd = () => { app.playing = false; updateTime(); };
  await app.player.play(app.project, app.time);
};
app.pause = () => { app.playing = false; app.player.pause(); updateTime(); };
app.togglePlay = () => (app.playing ? app.pause() : app.play());

// ---------- scene / actor / dialog operations ----------
app.selectScene = (i) => { if (i === app.sel.scene) return; app.sel.scene = i; app.sel.actor = -1; app.sel.action = null; app.sel.dialog = null; app.scenesPanel.build(); app.timeline.build(); app.rerenderPanels(); app.refresh(); };
app.addScene = () => {
  const prev = app.currentScene();
  const s = newScene(prev ? prev.background : 'living_room');
  if (prev) { s.tod = prev.tod; for (const a of prev.actors) s.actors.push({ ...newActor(a.characterId, a.x, a.y), facing: a.facing, scale: a.scale }); }
  app.project.scenes.splice(app.sel.scene + 1, 0, s);
  app.sel.scene = app.project.scenes.indexOf(s); app.sel.actor = -1;
  app.commit('add scene'); app.seek(sceneStart(app.project, app.sel.scene)); app.tab = 'scene'; app.rerenderPanels();
};
app.duplicateScene = (i) => { const c = deepClone(app.project.scenes[i]); c.id = newScene().id; c.name = (c.name || '') + ' copy'; app.project.scenes.splice(i + 1, 0, c); app.sel.scene = i + 1; app.commit('duplicate scene'); };
app.deleteScene = (i) => { if (!confirm('Delete this scene?')) return; app.project.scenes.splice(i, 1); app.sel.scene = Math.max(0, i - 1); app.commit('delete scene'); app.seek(Math.min(app.time, totalDuration(app.project))); };
app.moveScene = (i, dir) => { const j = i + dir; const sc = app.project.scenes; if (j < 0 || j >= sc.length) return; [sc[i], sc[j]] = [sc[j], sc[i]]; app.sel.scene = j; app.commit('move scene'); };
app.addAction = (actorIndex, start = null) => {
  const s = app.currentScene(); const a = s.actors[actorIndex]; if (!a) return;
  const last = a.actions.reduce((m, x) => Math.max(m, x.end ?? x.start + 2), 0);
  const st = start ?? round(Math.min(last, s.duration - 1), 1);
  const seg = newAction('walk', st, round(Math.min(s.duration, st + 3), 1));
  a.actions.push(seg); app.sel.actor = actorIndex; app.sel.action = seg.id; app.tab = 'actors'; app.commit('add action');
};
app.addDialog = (start = null) => {
  const s = app.currentScene(); if (!s.actors.length) { app.toast('Add an actor to the scene first.', true); return; }
  const info = app.store.info;
  const last = s.dialogs.reduce((m, d) => Math.max(m, d.start + dialogDuration(d, info)), 0);
  const actor = app.sel.actor >= 0 ? app.sel.actor : (s.dialogs.length ? (s.dialogs[s.dialogs.length - 1].actor + 1) % s.actors.length : 0);
  const d = newDialog(actor, 'Hello!', start ?? round(Math.min(last + 0.4, s.duration - 1), 1));
  s.dialogs.push(d); app.sel.dialog = d.id; app.tab = 'dialog';
  if (d.start + d.duration > s.duration) s.duration = Math.ceil(d.start + d.duration + 0.5);
  app.commit('add dialog');
};

// ---------- file open / save ----------
async function saveProjectFile() {
  const p = deepClone(app.project);
  const ids = new Set(); for (const s of p.scenes) for (const d of s.dialogs) if (d.audioId) ids.add(d.audioId); if (p.music?.audioId) ids.add(p.music.audioId);
  p.audio = {};
  for (const id of ids) { const url = await app.store.toDataURL(id); if (url) p.audio[id] = { name: app.store.get(id).name, data: url }; }
  download(new Blob([JSON.stringify(p)], { type: 'application/json' }), `${(p.title || 'story').replace(/[^\w\- ]+/g, '').trim() || 'story'}.storystage.json`);
  app.toast('Project file saved (includes audio).');
}
async function openProjectFile(file) {
  try {
    const p = migrate(JSON.parse(await file.text()));
    if (!p) throw new Error('Not a StoryStage project file');
    if (p.audio) for (const [id, a] of Object.entries(p.audio)) { if (!app.store.has(id)) await app.store.addFromDataURL(a.data, a.name, id); }
    delete p.audio;
    app.project = p; app._snapshot = JSON.stringify(p); app.undo.length = 0; app.redo.length = 0;
    app.sel = { scene: 0, actor: -1, action: null, dialog: null, character: null }; app.time = 0;
    autosave(); app.stage.resize(); app.rerenderAll(); app.toast(`Opened "${p.title}"`);
  } catch (e) { app.toast('Could not open: ' + e.message, true); }
}

// ---------- boot ----------
async function boot() {
  app.project = loadLocal() || createSampleProject();
  app._snapshot = JSON.stringify(app.project);
  app.stage = setupStage(app);
  app.timeline = setupTimeline(app);
  app.scenesPanel = setupScenesPanel(app);
  document.getElementById('projectTitle').value = app.project.title;
  document.getElementById('projectTitle').addEventListener('change', (e) => { app.project.title = e.target.value; app.commit('title'); });
  document.getElementById('btnPlay').onclick = () => app.togglePlay();
  document.getElementById('btnStart').onclick = () => app.seek(sceneStart(app.project, app.sel.scene) === app.time ? 0 : sceneStart(app.project, app.sel.scene));
  document.getElementById('btnEnd').onclick = () => app.seek(totalDuration(app.project));
  document.getElementById('btnMute').onclick = (e) => { app.player.setMuted(!app.player.muted); e.currentTarget.textContent = app.player.muted ? '🔇' : '🔊'; };
  document.getElementById('chkGuides').onchange = (e) => { app.showGuides = e.target.checked; app.refresh(); };
  document.getElementById('btnUndo').onclick = () => app.doUndo();
  document.getElementById('btnRedo').onclick = () => app.doRedo();
  document.getElementById('btnNew').onclick = () => { if (!confirm('Start a new empty project? (The current one stays in this browser until you overwrite it, so save a file first if needed.)')) return; app.pause(); app.project = createProject(); app.project.scenes.push(newScene('house_exterior')); app.sel = { scene: 0, actor: -1, action: null, dialog: null, character: null }; app.time = 0; app.commit('new'); app.tab = 'characters'; app.rerenderPanels(); document.getElementById('projectTitle').value = app.project.title; };
  document.getElementById('btnSample').onclick = () => { if (!confirm('Replace the current project with the demo story?')) return; app.pause(); app.project = createSampleProject(); app.sel = { scene: 0, actor: -1, action: null, dialog: null, character: null }; app.time = 0; app.commit('demo'); document.getElementById('projectTitle').value = app.project.title; };
  document.getElementById('btnSave').onclick = saveProjectFile;
  const fileInput = document.getElementById('fileInput');
  document.getElementById('btnOpen').onclick = () => { fileInput.accept = '.json'; fileInput.onchange = () => { if (fileInput.files[0]) openProjectFile(fileInput.files[0]); fileInput.value = ''; }; fileInput.click(); };
  document.getElementById('btnExport').onclick = () => openExportModal(app);
  document.getElementById('btnMeasure').onclick = () => openMeasureAll(app);
  document.getElementById('btnCast').onclick = () => openCastPanel(app);
  document.getElementById('tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; app.tab = b.dataset.tab; app.rerenderPanels(); });
  window.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase(); if (['input', 'textarea', 'select'].includes(tag)) return;
    if (e.code === 'Space') { e.preventDefault(); app.togglePlay(); }
    else if (e.code === 'ArrowRight') { e.preventDefault(); app.seek(app.time + (e.shiftKey ? 1 : 0.1)); }
    else if (e.code === 'ArrowLeft') { e.preventDefault(); app.seek(app.time - (e.shiftKey ? 1 : 0.1)); }
    else if (e.code === 'Home') app.seek(0);
    else if (e.code === 'End') app.seek(totalDuration(app.project));
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') { e.preventDefault(); e.shiftKey ? app.doRedo() : app.doUndo(); }
    else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') { e.preventDefault(); app.doRedo(); }
    else if (e.code === 'Escape') { app.setPickMode(null); app.closeModal(); }
    else if (e.code === 'Delete' || e.code === 'Backspace') { if (app.sel.actor >= 0 && app.tab === 'actors' && !app.sel.action) { app.currentScene().actors.splice(app.sel.actor, 1); app.sel.actor = -1; app.commit('delete actor'); } }
  });
  app.rerenderAll();
  // load stored audio clips referenced by the project
  const ids = new Set(); for (const s of app.project.scenes) for (const d of s.dialogs) if (d.audioId) ids.add(d.audioId); if (app.project.music?.audioId) ids.add(app.project.music.audioId);
  if (ids.size) { try { await app.store.loadPersisted(ids); app.rerenderAll(); } catch (e) { console.warn(e); } }
  // unlock audio on first interaction
  const unlock = () => { app.store.resume(); window.removeEventListener('pointerdown', unlock); }; window.addEventListener('pointerdown', unlock);
  window.addEventListener('beforeunload', () => saveLocal(app.project));
}
boot().catch((e) => { console.error(e); alert('Failed to start: ' + e.message); });
