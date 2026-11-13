import { useEffect, useRef } from 'react';
import { createAurora } from '@/lib/visualizer/aurora';
import { register } from '@/lib/visualizer/engine';

/** Full-screen northern lights behind the app shell. Purely decorative. */
export default function AuroraBackground() {
	const ref = useRef(null);
	useEffect(() => register(createAurora(ref.current)), []);
	return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
