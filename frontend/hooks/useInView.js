import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Calls `onVisible` whenever the returned ref's element scrolls into view. */
export function useInView(onVisible, { rootMargin = '600px', enabled = true } = {}) {
	const ref = useRef(null);
	const cb = useRef(onVisible);
	useLayoutEffect(() => {
		cb.current = onVisible;
	});

	useEffect(() => {
		const el = ref.current;
		if (!el || !enabled) return undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) cb.current?.();
			},
			{ rootMargin }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [enabled, rootMargin]);

	return ref;
}

export function useDebounced(value, delay = 300) {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const t = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(t);
	}, [value, delay]);
	return debounced;
}
