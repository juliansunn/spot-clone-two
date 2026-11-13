import { useEffect, useState } from 'react';

const cache = new Map();

function hashColor(str = '') {
	let h = 0;
	for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
	return `hsl(${h} 45% 38%)`;
}

function averageColor(img) {
	const canvas = document.createElement('canvas');
	canvas.width = canvas.height = 12;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(img, 0, 0, 12, 12);
	const { data } = ctx.getImageData(0, 0, 12, 12);
	let r = 0;
	let g = 0;
	let b = 0;
	let n = 0;
	for (let i = 0; i < data.length; i += 4) {
		const max = Math.max(data[i], data[i + 1], data[i + 2]);
		const min = Math.min(data[i], data[i + 1], data[i + 2]);
		// Weight saturated pixels more so covers don't all turn grey.
		const w = 1 + (max - min) / 32;
		r += data[i] * w;
		g += data[i + 1] * w;
		b += data[i + 2] * w;
		n += w;
	}
	// Darken a little so white text stays readable on top.
	const k = 0.72 / n;
	return `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`;
}

/**
 * Average colour of a cover image for header gradients. Falls back to a
 * deterministic hue if the image can't be read (CORS, load failure).
 */
export function useImageColor(url, seed) {
	const fallback = hashColor(seed || url || 'antefy');
	// Last colour resolved asynchronously, tagged with the url it belongs to.
	const [resolved, setResolved] = useState(null);

	useEffect(() => {
		if (!url || cache.has(url)) return undefined;
		let cancelled = false;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			let color = null;
			try {
				color = averageColor(img);
				cache.set(url, color);
			} catch {
				/* tainted canvas – keep the fallback */
			}
			if (!cancelled && color) setResolved({ url, color });
		};
		img.src = url;
		return () => {
			cancelled = true;
		};
	}, [url]);

	if (!url) return fallback;
	if (cache.has(url)) return cache.get(url);
	return resolved?.url === url ? resolved.color : fallback;
}
