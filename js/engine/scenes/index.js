// Registry of all background scenes. Each category file exports an array of scene
// definitions: { id, name, category, groundY, horizonY, indoor, paint(ctx, env), paintFront?(ctx, env) }
import daily from './daily.js';
import farm from './farm.js';
import urban from './urban.js';
import school from './school.js';
import fantasy from './fantasy.js';
import events from './events.js';

export const SCENES = [...daily, ...farm, ...urban, ...school, ...fantasy, ...events];
export const SCENE_MAP = Object.fromEntries(SCENES.map((s) => [s.id, s]));
export const SCENE_CATEGORIES = [...new Set(SCENES.map((s) => s.category))];
export function getScene(id) { return SCENE_MAP[id] || SCENES[0]; }
