/**
 * Music visualizer (northern lights) settings: every default, preset and slider
 * range lives here. Users change these from the player bar's visualizer panel; their choices are
 * persisted per browser (see ./store.js). Slider values are 0–100 in the UI and
 * mapped to engine units by the functions in SLIDERS.
 */

export const STYLES = [
	{ id: 'curtains', label: 'Curtains', note: 'Draped ribbons with vertical rays. Bass lifts the hem, mids stretch the rays.' },
	{ id: 'corona', label: 'Corona', note: 'Rays bursting from one point overhead. Bass pulls the rays in.' },
	{ id: 'arc', label: 'Quiet arc', note: 'One calm, glowing arch low in the sky. The most restful option.' },
	{ id: 'pulse', label: 'Pulsating', note: 'Soft patches that slowly breathe on and off. The song’s energy sets the pace.' },
	{ id: 'steve', label: 'STEVE', note: 'A thin glowing stripe with a green “picket fence” of streaks below it.' }
];

export const PRESETS = [
	{ id: 'arctic', label: 'Arctic green', colors: ['#3ef0a0', '#19c4b4', '#8b5cf6'] },
	{ id: 'polar', label: 'Polar night', colors: ['#38bdf8', '#34d399', '#c084fc'] },
	{ id: 'magenta', label: 'Magenta storm', colors: ['#f472b6', '#a855f7', '#38bdf8'] },
	{ id: 'solar', label: 'Solar flare', colors: ['#fbbf24', '#fb7185', '#a78bfa'] },
	{ id: 'glacier', label: 'Glacier', colors: ['#bae6fd', '#7dd3fc', '#a5b4fc'] }
];

/** UI slider (0–100) → engine value, plus the label shown next to each slider. */
export const SLIDERS = {
	brightness: { label: 'Brightness', ends: ['Faint', 'Vivid'], min: 10, map: (v) => v / 100, show: (v) => `${v}%` },
	reactivity: { label: 'Music reactivity', ends: ['Calm', 'Lively'], map: (v) => 0.3 + (v / 100) * 0.9, show: (v) => `${v}%` },
	speed: { label: 'Drift speed', ends: ['Glacial', 'Fast'], map: (v) => 0.15 + (v / 100) * 1.85, show: (v) => `${(0.15 + (v / 100) * 1.85).toFixed(1)}×` },
	// Spring stiffness for how the lights follow the bass: high = snappy, low = floaty.
	bassDelay: { label: 'Bass response', ends: ['Snappy', 'Floaty'], map: (v) => 6 - (v / 100) * 4.6, show: (v) => `${(0.25 + (v / 100) * 0.9).toFixed(2)}s` },
	// Glass panels over the lights: how see-through (surface alpha) and how frosted (backdrop blur).
	glass: {
		label: 'Glass',
		ends: ['Subtle', 'Strong'],
		map: (v) => ({ alpha: 0.72 - (v / 100) * 0.5, blur: 10 + (v / 100) * 20 }),
		show: (v) => `${v}%`
	}
};

export const DEFAULTS = {
	enabled: true, // master switch: off = no lights, opaque panels, mic never opened
	stars: true,
	style: 'curtains',
	colorMode: 'preset', // 'preset' | 'album' | 'custom'
	presetId: 'arctic',
	customColors: ['#3ef0a0', '#19c4b4', '#8b5cf6'],
	reduceMotion: null, // null = follow the OS setting
	micEnabled: false, // user opted in to listening via the microphone
	micHintShown: false,
	brightness: 90,
	reactivity: 55,
	speed: 40,
	bassDelay: 55,
	glass: 65
};

export const STORAGE_KEY = 'antefy-visualizer';
