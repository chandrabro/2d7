// Inspector tab: actors in the current scene + their action timeline.

import { h, field, select, num, range, checkbox, button, round } from './dom.js';
import { ACTIONS, ACTION_CATEGORIES, getAction } from '../engine/actions.js';
import { newActor, newAction } from '../state.js';
import { STAGE_W, STAGE_H } from '../engine/util.js';

const MAX_ACTORS = 3;

export function renderActorsPanel(app, root) {
  const s = app.currentScene(); const p = app.project;
  if (!s) { root.append(h('div', { class: 'section' }, 'Add a scene first.')); return; }
  const def = app.currentSceneDef();
  const sec = h('div', { class: 'section' }, h('h3', {}, `Actors in scene (${s.actors.length}/${MAX_ACTORS})`));
  if (!p.characters.length) sec.append(h('div', { class: 'note' }, 'No characters yet. Create one in the Characters tab first.'));
  if (s.actors.length < MAX_ACTORS && p.characters.length) {
    const sel = select(p.characters.map((c) => [c.id, c.name]), p.characters[0].id, () => {});
    sec.append(h('div', { class: 'row' }, sel, button('+ Add to scene', () => {
      const n = s.actors.length;
      const a = newActor(sel.value, 320 + n * 320, Math.round((def.groundY * STAGE_H + def.horizonY * STAGE_H) / 2 + 40));
      if (n === 1) a.facing = -1;
      s.actors.push(a); app.sel.actor = s.actors.length - 1; app.commit('add actor');
    }, 'primary fixed')));
  }
  // actor list
  const list = h('div', { class: 'list', style: { marginTop: '8px' } });
  s.actors.forEach((a, i) => {
    const ch = p.characters.find((c) => c.id === a.characterId);
    list.append(h('div', { class: 'item' + (i === app.sel.actor ? ' selected' : ''), onClick: () => { if (app.sel.actor !== i) { app.sel.actor = i; app.rerenderPanels(); app.refresh(); } } },
      h('div', { class: 'head' }, h('b', {}, `${i + 1}. ${ch ? ch.name : 'missing character'}`), h('span', { class: 'badge' }, `${a.actions.length} actions`),
        button('✕', (e) => { e.stopPropagation(); s.actors.splice(i, 1); s.dialogs = s.dialogs.filter((d) => d.actor !== i).map((d) => ({ ...d, actor: d.actor > i ? d.actor - 1 : d.actor })); app.sel.actor = -1; app.commit('remove actor'); }, 'tiny danger'))));
  });
  sec.append(list);
  root.append(sec);

  const a = s.actors[app.sel.actor];
  if (!a) { root.append(h('div', { class: 'section small muted' }, 'Select an actor (click it on the stage or in the list) to edit its position, facing and actions.')); return; }
  const ch = p.characters.find((c) => c.id === a.characterId);

  // placement
  const place = h('div', { class: 'section' }, h('h3', {}, `${ch ? ch.name : 'Actor'} – placement`));
  place.append(field('Character', select(p.characters.map((c) => [c.id, c.name]), a.characterId, (v) => { a.characterId = v; app.commit('actor character'); })));
  place.append(h('div', { class: 'grid3' },
    field('Start X', num(a.x, (v) => { a.x = v; app.commit('actor pos'); }, { min: -100, max: STAGE_W + 100, step: 10 })),
    field('Start Y (depth)', num(a.y, (v) => { a.y = v; app.commit('actor pos'); }, { min: 0, max: STAGE_H, step: 10 })),
    field('Size', num(a.scale, (v) => { a.scale = Math.max(0.3, Math.min(2.5, v)); app.commit('actor scale'); }, { min: 0.3, max: 2.5, step: 0.05 }))));
  place.append(h('div', { class: 'grid2' },
    field('Facing', select([['1', 'Right →'], ['-1', '← Left']], String(a.facing), (v) => { a.facing = parseInt(v); app.commit('facing'); })),
    field('View', select([['side', '3/4 view (default)'], ['front', 'Facing camera']], a.orientation || 'side', (v) => { a.orientation = v; app.commit('orientation'); }))));
  place.append(h('div', { class: 'grid2' },
    field('Idle action (when nothing else runs)', select(actionOptions(), a.idleAction || 'idle', (v) => { a.idleAction = v; app.commit('idle'); })),
    field(' ', checkbox('Gesture automatically while speaking', a.autoGesture !== false, (v) => { a.autoGesture = v; app.commit('gesture'); }))));
  place.append(h('div', { class: 'small muted' }, 'Tip: drag the character on the stage to place it. Higher Y = closer to the camera (bigger).'));
  root.append(place);

  // actions
  const act = h('div', { class: 'section' }, h('h3', {}, 'Action timeline', h('span', { class: 'right' }, button('+ Add action', () => app.addAction(app.sel.actor), 'tiny primary'))));
  act.append(h('div', { class: 'small muted', style: { marginBottom: '8px' } }, 'Actions play in order by their start time. Add a "move to" target to walk/run somewhere; the character turns automatically.'));
  const sorted = a.actions.slice().sort((x, y) => x.start - y.start);
  for (const seg of sorted) {
    const end = seg.end ?? seg.start + 2;
    const info = getAction(seg.action);
    const item = h('div', { class: 'item' + (app.sel.action === seg.id ? ' selected' : ''), onClick: () => { if (app.sel.action !== seg.id) { app.sel.action = seg.id; app.rerenderPanels(); } } });
    item.append(h('div', { class: 'head' },
      select(actionOptions(), seg.action, (v) => { seg.action = v; const d = getAction(v); if (!d.loop && end - seg.start > d.duration + 0.5) seg.end = round(seg.start + d.duration, 1); app.commit('action'); }),
      button('⧉', (e) => { e.stopPropagation(); const c = { ...seg, id: newAction().id, start: round(end, 1), end: round(end + (end - seg.start), 1) }; a.actions.push(c); app.commit('dup action'); }, 'tiny', { title: 'Duplicate after' }),
      button('✕', (e) => { e.stopPropagation(); a.actions.splice(a.actions.indexOf(seg), 1); app.commit('remove action'); }, 'tiny danger')));
    item.append(h('div', { class: 'grid3' },
      field('Start (s)', num(seg.start, (v) => { const len = end - seg.start; seg.start = Math.max(0, v); seg.end = round(seg.start + len, 1); app.commit('action time'); }, { min: 0, step: 0.1 })),
      field('End (s)', num(end, (v) => { seg.end = Math.max(seg.start + 0.2, v); app.commit('action time'); }, { min: 0, step: 0.1 })),
      field('Face', select([['0', 'Auto'], ['1', 'Right'], ['-1', 'Left']], String(seg.facing || 0), (v) => { seg.facing = parseInt(v) || 0; app.commit('action facing'); }))));
    const hasMove = seg.toX != null || seg.toY != null;
    const moveRow = h('div', { class: 'actor-pos' },
      field('Move to X', num(seg.toX ?? a.x, (v) => { seg.toX = v; if (seg.toY == null) seg.toY = a.y; app.commit('move'); }, { min: -100, max: STAGE_W + 100, step: 10 })),
      field('Move to Y', num(seg.toY ?? a.y, (v) => { seg.toY = v; if (seg.toX == null) seg.toX = a.x; app.commit('move'); }, { min: 0, max: STAGE_H, step: 10 })),
      h('div', { class: 'field' }, h('span', { class: 'lbl' }, ' '), h('div', { class: 'row' },
        button('🎯 Pick', () => app.setPickMode({ hint: `Click where ${ch ? ch.name : 'the actor'} should end up`, onPick: (x, y) => { seg.toX = x; seg.toY = y; app.commit('move'); } }), 'tiny'),
        button('✕', () => { seg.toX = null; seg.toY = null; app.commit('move'); }, 'tiny', { title: 'Remove movement' }))));
    if (hasMove) item.append(moveRow);
    else item.append(h('div', { class: 'row' }, button('+ Move somewhere during this action', () => { seg.toX = Math.min(STAGE_W - 100, a.x + 300); seg.toY = a.y; app.commit('move'); }, 'tiny')));
    if (!info.loop) item.append(h('div', { class: 'small muted' }, `One-shot action (${info.duration}s); the last frame holds until the next action.`));
    act.append(item);
  }
  if (!a.actions.length) act.append(h('div', { class: 'small muted' }, 'No actions yet – the actor stays idle. Add one, or double-click the actor track in the timeline.'));
  root.append(act);
}

export function actionOptions() {
  return ACTION_CATEGORIES.map((cat) => ({ group: cat, options: ACTIONS.filter((x) => x.category === cat).map((x) => [x.id, x.name]) }));
}
