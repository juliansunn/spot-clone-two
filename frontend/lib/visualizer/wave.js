import { waveform } from './audio';
import { SLIDERS } from './config';

/**
 * Player-bar sound wave: the real waveform from the mic, pinned at both ends
 * like a plucked string, with the last few frames lingering as fading echoes.
 */
export function createWave(canvas, getTokens) {
	const g = canvas.getContext('2d');
	const history = [];
	let PW = 0;
	let PH = 0;

	function resize() {
		const r = canvas.getBoundingClientRect();
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		PW = r.width;
		PH = r.height;
		canvas.width = Math.round(PW * dpr);
		canvas.height = Math.round(PH * dpr);
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function stroke(data, amp, color, alpha, width) {
		const mid = PH * 0.5;
		const n = data.length;
		g.beginPath();
		for (let p = 0; p < n; p++) {
			const u = p / (n - 1);
			const env = Math.pow(Math.sin(Math.PI * u), 0.8);
			const y = mid + data[p] * amp * env;
			if (p === 0) g.moveTo(u * PW, y);
			else g.lineTo(u * PW, y);
		}
		g.strokeStyle = `rgba(${color.map((v) => v | 0)},${alpha})`;
		g.lineWidth = width;
		g.lineJoin = 'round';
		g.stroke();
	}

	function draw(f) {
		const { s, dt, dark, still, pal } = f;
		g.clearRect(0, 0, PW, PH);
		if (!s.enabled || !s.waveOn || !PW) {
			history.length = 0;
			return;
		}
		const { accent, fg } = getTokens();
		const colorAt = (i) => (s.waveColor === 'accent' ? accent : s.waveColor === 'mono' ? fg : pal[i % 3]);
		const amp = PH * 0.4 * SLIDERS.waveStrength.map(s.waveStrength);
		const lw = SLIDERS.waveThickness.map(s.waveThickness);
		const glow = SLIDERS.waveGlow.map(s.waveGlow);
		const keep = SLIDERS.waveTrail.map(s.waveTrail) + 1;

		const points = Math.max(60, Math.min(320, Math.round(PW / 3)));
		const fresh = still ? null : waveform(points, SLIDERS.waveSmooth.map(s.waveSmooth), dt);
		if (fresh) history.unshift(fresh);
		else for (const h of history) for (let i = 0; i < h.length; i++) h[i] *= Math.exp(-dt * 6); // settle flat
		while (history.length > keep) history.pop();

		if (!history.length) {
			stroke(new Float32Array(2), 0, colorAt(0), dark ? 0.3 : 0.25, lw);
			return;
		}
		for (let i = history.length - 1; i >= 1; i--) {
			stroke(history[i], amp, colorAt(i), (dark ? 0.22 : 0.16) * (1 - i / keep), Math.max(1, lw * 0.7));
		}
		if (glow > 0.01) {
			stroke(history[0], amp, colorAt(0), (dark ? 0.1 : 0.07) * glow * 2, lw + 10 * glow);
			stroke(history[0], amp, colorAt(0), (dark ? 0.2 : 0.14) * glow * 2, lw + 4 * glow);
		}
		stroke(history[0], amp, colorAt(0), dark ? 0.8 : 0.65, lw);
	}

	resize();
	return { draw, resize };
}
