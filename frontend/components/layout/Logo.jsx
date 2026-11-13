import Link from 'next/link';
import { cn } from '@/lib/cn';

export function LogoMark({ className }) {
	return (
		<svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
			<rect width="32" height="32" rx="9" className="fill-accent" />
			{/* Equalizer bars rising into an "A" silhouette */}
			<rect x="7" y="17" width="3.6" height="8" rx="1.8" className="fill-accent-fg" />
			<rect x="12.2" y="11" width="3.6" height="14" rx="1.8" className="fill-accent-fg" />
			<rect x="17.4" y="7" width="3.6" height="18" rx="1.8" className="fill-accent-fg" />
			<rect x="22.6" y="13" width="3.6" height="12" rx="1.8" className="fill-accent-fg" opacity="0.7" />
		</svg>
	);
}

export default function Logo({ className }) {
	return (
		<Link href="/" className={cn('flex items-center gap-2.5 font-extrabold tracking-tight', className)}>
			<LogoMark />
			<span className="text-xl">Antefy</span>
		</Link>
	);
}
