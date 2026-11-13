import Link from 'next/link';
import Cover from '@/components/ui/Cover';
import PlayButton from './PlayButton';
import { cn } from '@/lib/cn';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';

/** Compact horizontal tile used in the home page "quick access" grid. */
export default function QuickTile({ href, title, images, type, contextUri, cover }) {
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	const current = contextUri && now.contextUri === contextUri;

	return (
		<div className="group relative flex h-14 items-center gap-3 overflow-hidden rounded-md bg-fg/[0.07] pr-2 transition hover:bg-fg/[0.14] sm:h-16">
			{cover ?? <Cover images={images} type={type} alt="" size={64} rounded="rounded-none" className="h-full w-auto shrink-0 shadow-lg" />}
			<Link
				href={href}
				className={cn('min-w-0 flex-1 truncate text-sm font-bold after:absolute after:inset-0 sm:text-[15px]', current && 'text-accent')}
			>
				{title}
			</Link>
			{contextUri && (
				<PlayButton
					size="sm"
					playing={current && now.isPlaying}
					label={`Play ${title}`}
					onClick={() => playFrom({ contextUri })}
					className={cn(
						'relative z-10 hidden transition sm:inline-flex',
						current && now.isPlaying ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100'
					)}
				/>
			)}
		</div>
	);
}

export function LikedCover({ className }) {
	return (
		<div
			className={cn(
				'flex aspect-square h-full shrink-0 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-500 to-emerald-300 text-white',
				className
			)}
		>
			<svg viewBox="0 0 24 24" className="h-[40%] w-[40%]" fill="currentColor" aria-hidden>
				<path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.4h2c.7-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21Z" />
			</svg>
		</div>
	);
}
