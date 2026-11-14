import { SLIDERS } from './config';

/**
 * Northern-lights renderer. The aurora is drawn at 1/4 resolution into an
 * offscreen canvas and smoothed up, which keeps it soft and cheap.
 */

const SCALE = 4;
const RIBBONS = [
	{ y: 0.3, amp: 0.07, f1: 1.6, f2: 3.7, sp: 0.045, len: 0.3, a: 0.55 },
	{ y: 0.42, amp: 0.09, f1: 1.1, f2: 2.9, sp: -0.035, len: 0.24, a: 0.4 },
	{ y: 0.22, amp: 0.05, f1: 2.3, f2: 5.1, sp: 0.06, len: 0.18, a: 0.3 }
];
const frac = (x) => ((x % 1) + 1) % 1;
const PATCHES = Array.from({ length: 16 }, (_, i) => ({
	x: frac(Math.sin(i * 12.9898) * 43758.5453),
	y: 0.12 + frac(Math.sin(i * 78.233) * 12543.21) * 0.5,
	r: 0.07 + frac(i * 0.618) * 0.1,
	ph: i * 2.4,
	sp: 0.6 + frac(i * 0.37) * 0.9
}));
const STARS = Array.from({ length: 140 }, (_, i) => ({
	x: frac(Math.sin(i * 91.7) * 9631.3),
	y: frac(Math.sin(i * 37.1) * 4271.9) * 0.75,
	r: 0.3 + frac(i * 0.7548) * 1.1,
	p: i * 1.3
}));

export function createAurora(canvas) {
	const g = canvas.getContext('2d');
	const low = document.createElement('canvas');
	const lg = low.getContext('2d');
	// One vertical "ray" sprite per ribbon: bright lower edge fading up into a second hue.
	const sprites = [0, 1, 2].map(() => {
		const c = document.createElement('canvas');
		c.width = 1;
		c.height = 128;
		return c;
	});
	let spriteKey = '';
	let W = 0;
	let H = 0;
	let tt = 3.2; // music-warped time; starts mid-drift so the resting frame looks natural

	function resize() {
		const dpr = Math.min(1.5, window.devicePixelRatio || 1);
		W = window.innerWidth;
		H = window.innerHeight;
		canvas.width = Math.round(W * dpr);
		canvas.height = Math.round(H * dpr);
		g.setTransform(dpr, 0, 0, dpr, 0, 0);
		low.width = Math.ceil(W / SCALE);
		low.height = Math.ceil(H / SCALE);
	}

	// Light mode: push saturation up and deepen slightly so the lights stay vivid on a pale sky.
	const tone = (c, dark) => {
		if (dark) return c.map((v) => v | 0);
		const mean = (c[0] + c[1] + c[2]) / 3;
		return c.map((v) => Math.max(0, Math.min(255, (mean + (v - mean) * 1.6) * 0.82)) | 0);
	};

	function buildSprites(pal, dark) {
		const key = pal.map((c) => c.map((v) => v | 0).join(',')).join('|') + dark;
		if (key === spriteKey) return;
		spriteKey = key;
		sprites.forEach((c, i) => {
			const x = c.getContext('2d');
			const lo = tone(pal[i], dark);
			const hi = tone(pal[(i + 2) % 3], dark);
			x.clearRect(0, 0, 1, 128);
			const gr = x.createLinearGradient(0, 0, 0, 128);
			gr.addColorStop(0, `rgba(${hi},0)`);
			gr.addColorStop(0.45, `rgba(${hi},0.35)`);
			gr.addColorStop(0.82, `rgba(${lo},0.9)`);
			gr.addColorStop(0.9, `rgba(${lo},1)`);
			gr.addColorStop(1, `rgba(${lo},0)`);
			x.fillStyle = gr;
			x.fillRect(0, 0, 1, 128);
		});
	}

	// ---- styles: each draws into the low-res canvas ----
	function curtains(w, h, o) {
		const { glow, I, t, soft, signal, mute } = o;
		RIBBONS.forEach((r, ri) => {
			const lift = soft.bass * 0.06 * I;
			for (let x = 0; x < w; x++) {
				const u = x / w;
				const y =
					(r.y -
						lift * (ri === 0 ? 1 : 0.6) +
						r.amp * Math.sin(u * r.f1 * 6.28 + tt * r.sp * 6.28 + ri) +
						r.amp * 0.4 * Math.sin(u * r.f2 * 6.28 - tt * r.sp * 9 + ri * 2)) *
					h;
				const fold = 0.5 + 0.5 * Math.sin(u * 23 + tt * 0.9 + ri * 4) * Math.sin(u * 7.3 - tt * 0.4);
				const shimmer = signal.treble * I * 0.35 * Math.sin(u * 140 + t * 0.006 + ri);
				const a = r.a * glow * (0.35 + 0.65 * fold + shimmer) * mute;
				if (a <= 0.01) continue;
				const len = h * r.len * (1 + soft.mid * 0.5 * I) * (0.7 + 0.3 * fold);
				lg.globalAlpha = Math.min(1, a);
				lg.drawImage(sprites[ri], x, y - len * 0.9, 1.6, len);
			}
		});
	}

	function corona(w, h, o) {
		const { glow, I, t, soft, signal, mute } = o;
		const cx = w * 0.5;
		const cy = -h * 0.12;
		const n = 96;
		const inner = h * (0.28 - soft.bass * 0.09 * I);
		for (let i = 0; i < n; i++) {
			const u = i / (n - 1);
			const ang = Math.PI * (0.06 + 0.88 * u) + Math.sin(tt * 0.25 + i * 1.7) * 0.012;
			const fold = 0.5 + 0.5 * Math.sin(i * 0.71 + tt * 0.8) * Math.sin(i * 0.23 - tt * 0.33);
			const shimmer = signal.treble * I * 0.3 * Math.sin(i * 3.1 + t * 0.006);
			const a = 0.32 * glow * (0.25 + 0.75 * fold + shimmer) * mute;
			if (a <= 0.01) continue;
			const len = h * (0.5 + 0.35 * fold) * (1 + soft.mid * 0.4 * I);
			lg.save();
			lg.translate(cx, cy);
			lg.rotate(ang - Math.PI / 2);
			lg.globalAlpha = Math.min(1, a);
			lg.drawImage(sprites[i % 3], -1.1, inner, 2.2, len);
			lg.restore();
		}
	}

	function arc(w, h, o) {
		const { glow, I, soft, mute } = o;
		const lift = soft.bass * 0.05 * I;
		const len = h * 0.2 * (1 + soft.mid * 0.3 * I);
		for (let x = 0; x < w; x++) {
			const u = x / w;
			const y = h * (0.58 - lift - 0.2 * Math.sin(Math.PI * u) + 0.015 * Math.sin(u * 5 + tt * 0.3));
			const a = 0.5 * glow * (0.85 + 0.15 * Math.sin(u * 6 + tt * 0.35)) * mute;
			lg.globalAlpha = Math.min(1, a);
			lg.drawImage(sprites[0], x, y - len * 0.9, 1.6, len);
			lg.globalAlpha = Math.min(1, a * 0.3); // diffuse veil above
			lg.drawImage(sprites[2], x, y - len * 2.4, 1.6, len * 1.9);
		}
	}

	function pulse(w, h, o) {
		const { glow, I, soft, pal, mute, dark } = o;
		lg.globalAlpha = 1;
		PATCHES.forEach((p, i) => {
			const s = Math.max(0, Math.sin(tt * p.sp + p.ph));
			const b = s * s;
			if (b < 0.02) return;
			const r = h * p.r * (1 + soft.bass * 0.3 * I);
			const x = p.x * w + Math.sin(tt * 0.1 + i) * w * 0.02;
			const y = p.y * h;
			const c = tone(pal[i % 3], dark);
			const rg = lg.createRadialGradient(x, y, 0, x, y, r * 1.6);
			rg.addColorStop(0, `rgba(${c},${Math.min(1, 0.55 * glow * b * mute)})`);
			rg.addColorStop(1, `rgba(${c},0)`);
			lg.fillStyle = rg;
			lg.beginPath();
			lg.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
			lg.fill();
		});
	}

	function steve(w, h, o) {
		const { glow, I, soft, mute } = o;
		const lift = soft.bass * 0.04 * I;
		for (let x = 0; x < w; x++) {
			const u = x / w;
			const y = h * (0.26 - lift + 0.06 * Math.sin(u * 2.2 + tt * 0.12) - 0.04 * Math.sin(Math.PI * u));
			lg.globalAlpha = Math.min(1, 0.6 * glow * mute);
			lg.drawImage(sprites[2], x, y - h * 0.05, 1.6, h * 0.06);
			if (x % 3 === 0) {
				const fence = 0.5 + 0.5 * Math.sin(x * 1.3 + tt * 0.7);
				const len = h * (0.1 + 0.08 * fence) * (1 + soft.mid * 0.4 * I);
				lg.globalAlpha = Math.min(1, 0.55 * glow * fence * mute);
				lg.drawImage(sprites[0], x, y + h * 0.04, 1.4, len);
			}
		}
	}

	const STYLE_FNS = { curtains, corona, arc, pulse, steve };

	function draw(f) {
		const { s, dt, t, dark, still, soft, signal, pal } = f;
		g.clearRect(0, 0, W, H);
		if (!s.enabled) return;
		buildSprites(pal, dark);
		const I = SLIDERS.reactivity.map(s.reactivity);
		g.globalAlpha = SLIDERS.brightness.map(s.brightness);

		// Sky tint: a faint wash of the lights' top color (stronger on a pale sky).
		const top = tone(pal[2], dark);
		const sky = g.createLinearGradient(0, 0, 0, H);
		sky.addColorStop(0, `rgba(${top},${dark ? 0.08 : 0.24})`);
		sky.addColorStop(0.7, `rgba(${top},0)`);
		g.fillStyle = sky;
		g.fillRect(0, 0, W, H);
		if (!dark) {
			// a second wash rising from the bottom, so the whole sky carries color
			const base = tone(pal[0], dark);
			const low = g.createLinearGradient(0, H, 0, H * 0.35);
			low.addColorStop(0, `rgba(${base},0.16)`);
			low.addColorStop(1, `rgba(${base},0)`);
			g.fillStyle = low;
			g.fillRect(0, 0, W, H);
		}
		if (dark) {
			if (s.stars) {
				for (const st of STARS) {
					const tw = still ? 0.7 : 0.55 + 0.45 * Math.sin(t * 0.0015 + st.p + signal.treble * 2);
					g.fillStyle = `rgba(255,255,255,${0.35 * tw})`;
					g.fillRect(st.x * W, st.y * H, st.r, st.r);
				}
			}
		}

		// Drift only while audio is live (the loop isn't running otherwise).
		if (!still && signal.live) tt += dt * SLIDERS.speed.map(s.speed) * (0.6 + soft.energy * 1.4 * I);

		const w = low.width;
		const h = low.height;
		lg.clearRect(0, 0, w, h);
		lg.globalCompositeOperation = dark ? 'lighter' : 'source-over';
		// The lights are the centerpiece: a clearly visible resting glow, brighter with the music.
		const glow = 0.85 + (soft.energy * 0.6 + signal.swell * 0.5) * I;
		(STYLE_FNS[s.style] ?? curtains)(w, h, { glow, I, t, soft, signal, pal, dark, mute: dark ? 1 : 1.35 });
		lg.globalAlpha = 1;
		lg.globalCompositeOperation = 'source-over';

		g.imageSmoothingEnabled = true;
		g.imageSmoothingQuality = 'high';
		// Dark: additive glow. Light: painted-on pastel lights (multiply made them muddy).
		g.globalCompositeOperation = dark ? 'lighter' : 'source-over';
		g.drawImage(low, 0, 0, W, H);
		g.globalCompositeOperation = 'source-over';
		g.globalAlpha = 1;
	}

	resize();
	return { draw, resize };
}
