import { useEffect, useState } from 'react';

const cache = new Map();

function hashColor(str = '') {
	let h = 0;
	for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
	return `hsl(${h} 45% 38%)`;
}

/**
 * Average colour of a cover image for header gradients. Falls back to a
 * deterministic hue if the image can't be read (CORS, load failure).
 */
export function useImageColor(url, seed) {
	const fallback = hashColor(seed || url || 'antefy');
	const [color, setColor] = useState(() => (url && cache.get(url)) || fallback);

	useEffect(() => {
		if (!url) {
			setColor(fallback);
			return undefined;
		}
		if (cache.has(url)) {
			setColor(cache.get(url));
			return undefined;
		}
		let cancelled = false;
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				canvas.width = canvas.height = 12;
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				ctx.drawImage(img, 0, 0, 12, 12);
				const { data } = ctx.getImageData(0, 0, 12, 12);
				let r = 0, g = 0, b = 0, n = 0;
				for (let i = 0; i < data.length; i += 4) {
					const max = Math.max(data[i], data[i + 1], data[i + 2]);
					const min = Math.min(data[i], data[i + 1], data[i + 2]);
					// Weight saturated pixels more so covers don't all turn grey.
					const w = 1 + (max - min) / 32;
					r += data[i] * w; g += data[i + 1] * w; b += data[i + 2] * w; n += w;
				}
				// Darken a little so white text stays readable on top.
				const k = 0.72 / n;
				const c = `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`;
				cache.set(url, c);
				if (!cancelled) setColor(c);
			} catch {
				if (!cancelled) setColor(fallback);
			}
		};
		img.onerror = () => !cancelled && setColor(fallback);
		img.src = url;
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return color;
}
