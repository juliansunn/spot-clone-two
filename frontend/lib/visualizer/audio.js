/**
 * Microphone listening + signal extraction for the visualizer.
 *
 * Spotify gives no access to playback audio (the Web Playback SDK plays
 * DRM-protected audio in a cross-origin frame, and /audio-analysis returns 403
 * for this app), so the visualizer listens to the room instead. That works for
 * any device: this browser, a laptop, the living-room speaker.
 *
 * Nothing here touches React. The engine calls analyse() once per frame and
 * reads `signal` and waveform() directly.
 */

let ctx = null;
let stream = null;
let source = null;
let analyser = null;
let scope = null;
let freq = null;
let wave = null;
let resumeOnGesture = null;

export const signal = { bass: 0, mid: 0, treble: 0, energy: 0, beat: 0, swell: 0, live: false };
const peak = { bass: 0.3, mid: 0.3, treble: 0.3 };
let bands = null;
let bassAvg = 0;
let lastBeat = 0;
let eFast = 0;
let eSlow = 0;
let scopePeak = 0.2;

export const micSupported = () =>
	typeof window !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(window.AudioContext || window.webkitAudioContext);

/** 'granted' | 'denied' | 'prompt' | 'unknown' — without prompting. */
export async function micPermission() {
	try {
		const res = await navigator.permissions.query({ name: 'microphone' });
		return res.state;
	} catch {
		return 'unknown';
	}
}

function ensureRunning() {
	if (!ctx || ctx.state === 'running') return;
	ctx.resume().catch(() => {});
	// Autoplay rules can keep the context suspended until the page gets a gesture.
	if (!resumeOnGesture) {
		resumeOnGesture = () => {
			ctx?.resume().catch(() => {});
			window.removeEventListener('pointerdown', resumeOnGesture);
			window.removeEventListener('keydown', resumeOnGesture);
			resumeOnGesture = null;
		};
		window.addEventListener('pointerdown', resumeOnGesture);
		window.addEventListener('keydown', resumeOnGesture);
	}
}

/** Opens the mic (prompts the first time). Resolves to 'listening' or a failure status. */
export async function startListening() {
	if (!micSupported()) return 'unsupported';
	if (stream) {
		ensureRunning();
		return 'listening';
	}
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			// Raw signal: echo cancellation would subtract the music when it plays from this tab.
			audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
		});
	} catch (e) {
		stream = null;
		return e?.name === 'NotAllowedError' || e?.name === 'SecurityError' ? 'denied' : 'error';
	}
	if (!ctx) {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		ctx = new Ctx();
		analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.6;
		scope = ctx.createAnalyser();
		scope.fftSize = 4096; // ~85ms window, half of it drawn
		// Pull the graph without making any sound (never route the mic to the speakers).
		const mute = ctx.createGain();
		mute.gain.value = 0;
		analyser.connect(mute);
		scope.connect(mute);
		mute.connect(ctx.destination);
		freq = new Uint8Array(analyser.frequencyBinCount);
		wave = new Float32Array(scope.fftSize);
	}
	source = ctx.createMediaStreamSource(stream);
	source.connect(analyser);
	source.connect(scope);
	ensureRunning();
	return 'listening';
}

/** Closes the mic so the browser's recording indicator goes away. */
export function stopListening() {
	source?.disconnect();
	source = null;
	stream?.getTracks().forEach((t) => t.stop());
	stream = null;
	signal.live = false;
}

export const isListening = () => Boolean(stream) && ctx?.state === 'running';

function binsFor(lo, hi) {
	const n = analyser.frequencyBinCount;
	const hz = ctx.sampleRate / 2 / n;
	return [Math.max(1, Math.round(lo / hz)), Math.min(n - 1, Math.round(hi / hz))];
}

function avg([a, b]) {
	let s = 0;
	for (let i = a; i <= b; i++) s += freq[i];
	return s / (b - a + 1) / 255;
}

/** Update `signal` from the latest audio; decays to rest when not listening. */
export function analyse(now, dt) {
	if (!isListening()) {
		const k = Math.exp(-dt * 2.5);
		signal.bass *= k;
		signal.mid *= k;
		signal.treble *= k;
		signal.energy *= k;
		signal.beat *= k;
		signal.swell *= Math.exp(-dt);
		signal.live = false;
		return;
	}
	signal.live = true;
	analyser.getByteFrequencyData(freq);
	bands ??= { bass: binsFor(25, 150), mid: binsFor(150, 2000), treble: binsFor(2000, 11000) };
	const raw = { bass: avg(bands.bass), mid: avg(bands.mid), treble: avg(bands.treble) };
	for (const k of ['bass', 'mid', 'treble']) {
		// Auto-gain so a quiet room and a loud one both fill the range; the floor keeps silence still.
		peak[k] = Math.max(raw[k], peak[k] * Math.exp(-dt * 0.25), 0.08);
		const v = raw[k] < 0.02 ? 0 : Math.min(1, raw[k] / peak[k]);
		const a = v > signal[k] ? 1 - Math.exp(-dt * 18) : 1 - Math.exp(-dt * 3.5);
		signal[k] += (v - signal[k]) * a;
	}
	signal.energy = signal.bass * 0.5 + signal.mid * 0.3 + signal.treble * 0.2;
	bassAvg += (raw.bass - bassAvg) * (1 - Math.exp(-dt * 1.2));
	if (raw.bass > bassAvg * 1.18 + 0.04 && now - lastBeat > 260) {
		lastBeat = now;
		signal.beat = 1;
	} else {
		signal.beat *= Math.exp(-dt * 4);
	}
	// Swell: loudness relative to the last ~10s, so a chorus glows brighter than a verse.
	const e = raw.bass * 0.5 + raw.mid * 0.3 + raw.treble * 0.2;
	eFast += (e - eFast) * (1 - Math.exp(-dt * 0.8));
	eSlow += (e - eSlow) * (1 - Math.exp(-dt * 0.1));
	const target = Math.max(0, Math.min(1, (eFast / Math.max(eSlow, 0.02) - 0.8) * 1.5));
	signal.swell += (target - signal.swell) * (1 - Math.exp(-dt * 0.7));
}

/**
 * The actual waveform, triggered on a rising zero-crossing so it vibrates in
 * place, box-smoothed and normalised to roughly -1..1. Null when not listening.
 */
export function waveform(points, smooth, dt) {
	if (!isListening()) return null;
	scope.getFloatTimeDomainData(wave);
	const N = wave.length;
	const span = N / 2;
	let start = 0;
	for (let i = 1; i < N - span; i++) {
		if (wave[i - 1] < 0 && wave[i] >= 0) {
			start = i;
			break;
		}
	}
	const out = new Float32Array(points);
	const step = span / points;
	const r = Math.max(1, Math.round((step / 2) * smooth));
	let peakNow = 0;
	for (let p = 0; p < points; p++) {
		const c = start + Math.floor(p * step);
		let s = 0;
		for (let k = -r; k <= r; k++) s += wave[Math.min(N - 1, Math.max(0, c + k))];
		out[p] = s / (2 * r + 1);
		peakNow = Math.max(peakNow, Math.abs(out[p]));
	}
	scopePeak = Math.max(peakNow, scopePeak * Math.exp(-dt * 0.5), 0.01);
	const gate = peakNow < 0.002 ? 0 : 1; // room hiss stays flat
	for (let p = 0; p < points; p++) out[p] = (out[p] / scopePeak) * gate;
	return out;
}
