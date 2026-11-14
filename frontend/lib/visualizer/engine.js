import { analyse, signal } from './audio';
import { SLIDERS } from './config';
import { getVisualizer, useVisualizerStore } from './store';

/**
 * One requestAnimationFrame loop for the visualizer. Audio is analysed once
 * per frame, eased through springs, then each registered renderer draws. The loop only runs while the mic is live or something is
 * still settling, and stops entirely when the visualizer is off.
 */

const renderers = new Set();
let raf = 0;
let last = 0;

// Sky values follow the music through critically damped springs, so a bass hit
// eases the lights up instead of snapping them.
const soft = { bass: 0, vb: 0, mid: 0, vm: 0, energy: 0, ve: 0 };
function spring(key, vkey, target, dt, w) {
	const a = w * w * (target - soft[key]) - 2 * w * soft[vkey];
	soft[vkey] += a * dt;
	soft[key] += soft[vkey] * dt;
}

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
let pal = ['#3ef0a0', '#19c4b4', '#8b5cf6'].map(hexToRgb);
let palTarget = pal.map((c) => c.slice());
export function setPalette(hexes) {
	palTarget = hexes.map(hexToRgb);
	kick();
}

let reducedQuery = null;
export function prefersReduced(s = getVisualizer()) {
	if (s.reduceMotion != null) return s.reduceMotion;
	reducedQuery ??= typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
	return Boolean(reducedQuery?.matches);
}

/** Register a renderer: { draw(frame), resize?() }. Returns an unregister function. */
export function register(renderer) {
	renderers.add(renderer);
	kick();
	return () => renderers.delete(renderer);
}

function paletteMoving() {
	let d = 0;
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) d += Math.abs(pal[i][j] - palTarget[i][j]);
	return d > 1.5;
}

function frame(t, dt) {
	const s = getVisualizer();
	const k = 1 - Math.exp(-dt * 3);
	for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pal[i][j] += (palTarget[i][j] - pal[i][j]) * k;
	analyse(t, dt);
	const w = SLIDERS.bassDelay.map(s.bassDelay);
	spring('bass', 'vb', signal.bass, dt, w);
	spring('mid', 'vm', signal.mid, dt, w * 0.8);
	spring('energy', 've', signal.energy, dt, w * 0.7);
	const f = {
		t,
		dt,
		s,
		signal,
		soft,
		pal,
		dark: document.documentElement.classList.contains('dark'),
		still: prefersReduced(s)
	};
	renderers.forEach((r) => r.draw(f));
}

function loop(t) {
	const dt = Math.min(0.05, (t - last) / 1000);
	last = t;
	frame(t, dt);
	const s = getVisualizer();
	const visible = s.enabled;
	const settling = Math.abs(soft.energy) + Math.abs(soft.ve) + Math.abs(soft.vb) > 0.004 || signal.energy > 0.003;
	const keepGoing = visible && renderers.size > 0 && (signal.live || settling || paletteMoving());
	raf = keepGoing ? requestAnimationFrame(loop) : 0;
}

/** Draw at least one more frame (settings or theme changed, mic started, resize…). */
export function kick() {
	if (typeof window === 'undefined' || document.hidden) return;
	if (raf) return;
	last = performance.now();
	raf = requestAnimationFrame(loop);
}

if (typeof window !== 'undefined') {
	useVisualizerStore.subscribe(kick);
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			cancelAnimationFrame(raf);
			raf = 0;
		} else kick();
	});
	new MutationObserver(kick).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	window.addEventListener('resize', () => {
		renderers.forEach((r) => r.resize?.());
		kick();
	});
}
