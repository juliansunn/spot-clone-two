import { PRESETS } from './config';

/** Parse 'rgb(r g b)', 'rgb(r, g, b)', 'hsl(h s% l%)' or '#rrggbb' into [r, g, b]. */
export function parseColor(str) {
	if (!str) return null;
	if (str.startsWith('#') && str.length === 7) return [1, 3, 5].map((i) => parseInt(str.slice(i, i + 2), 16));
	const nums = str.match(/-?\d+(\.\d+)?/g)?.map(Number);
	if (!nums || nums.length < 3) return null;
	if (str.startsWith('hsl')) return hslToRgb(nums[0], nums[1] / 100, nums[2] / 100);
	return nums.slice(0, 3);
}

function rgbToHsl([r, g, b]) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	if (max === min) return [0, 0, l];
	const d = max - min;
	const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	return [h * 60, s, l];
}

function hslToRgb(h, s, l) {
	h = ((h % 360) + 360) % 360;
	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}

const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/**
 * Turn a cover's average colour into three aurora colours: the cover hue made
 * luminous, plus two neighbours so the lights have some range.
 */
export function albumPalette(color) {
	const rgb = parseColor(color);
	if (!rgb) return PRESETS[0].colors;
	const [h, s] = rgbToHsl(rgb);
	const sat = Math.max(0.55, Math.min(0.9, s * 1.4));
	return [hslToRgb(h, sat, 0.6), hslToRgb(h + 35, sat, 0.58), hslToRgb(h - 70, sat * 0.9, 0.66)].map(toHex);
}

export function resolvePalette(s, albumColor) {
	if (s.colorMode === 'album') return albumPalette(albumColor);
	if (s.colorMode === 'custom') return s.customColors;
	return (PRESETS.find((p) => p.id === s.presetId) ?? PRESETS[0]).colors;
}
