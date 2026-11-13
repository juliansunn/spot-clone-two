import { useEffect, useRef } from 'react';
import { createWave } from '@/lib/visualizer/wave';
import { kick, register } from '@/lib/visualizer/engine';

function readTokens() {
	const cs = getComputedStyle(document.documentElement);
	const rgb = (name, fallback) => {
		const parts = cs.getPropertyValue(name).trim().split(/\s+/).map(Number);
		return parts.length === 3 && parts.every((n) => !Number.isNaN(n)) ? parts : fallback;
	};
	return { accent: rgb('--accent', [52, 211, 153]), fg: rgb('--fg', [244, 244, 245]) };
}

/** The live sound wave drawn behind the player bar's controls. */
export default function PlayerWave() {
	const ref = useRef(null);

	useEffect(() => {
		const canvas = ref.current;
		let tokens = readTokens();
		const theme = new MutationObserver(() => {
			tokens = readTokens();
		});
		theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
		const wave = createWave(canvas, () => tokens);
		const unregister = register(wave);
		const ro = new ResizeObserver(() => {
			wave.resize();
			kick();
		});
		ro.observe(canvas);
		return () => {
			unregister();
			ro.disconnect();
			theme.disconnect();
		};
	}, []);

	return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
