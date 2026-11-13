import Link from 'next/link';
import Cover from '@/components/ui/Cover';
import PlayButton from './PlayButton';
import { cn } from '@/lib/cn';
import { cleanDescription, releaseYear } from '@/lib/format';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';

const HREF = {
	playlist: (i) => `/playlist/${i.id}`,
	album: (i) => `/album/${i.id}`,
	artist: (i) => `/artist/${i.id}`,
	show: (i) => `/podcast/${i.id}`
};

function subtitle(item) {
	switch (item.type) {
		case 'playlist':
			return cleanDescription(item.description) || `By ${item.owner?.display_name ?? 'Spotify'}`;
		case 'album': {
			const year = releaseYear(item.release_date);
			const artists = item.artists?.map((a) => a.name).join(', ');
			return [year, artists].filter(Boolean).join(' · ');
		}
		case 'artist':
			return 'Artist';
		case 'show':
			return item.publisher || 'Podcast';
		default:
			return '';
	}
}

export default function MediaCard({ item, className, priority }) {
	const playFrom = usePlayFrom();
	const { contextUri, isPlaying } = useNowPlaying();
	if (!item?.id || !HREF[item.type]) return null;
	const isCurrent = contextUri === item.uri;

	return (
		<div
			className={cn(
				'group relative flex min-w-0 flex-col gap-3 rounded-lg p-3 transition hover:bg-hover/60 has-[a:focus-visible]:bg-hover/60',
				className
			)}
		>
			<div className="relative">
				<Cover
					images={item.images}
					type={item.type}
					alt=""
					size={300}
					priority={priority}
					className="w-full shadow-lg shadow-black/20"
				/>
				<PlayButton
					size="md"
					playing={isCurrent && isPlaying}
					label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${item.name}`}
					onClick={() => playFrom({ contextUri: item.uri })}
					className={cn(
						'absolute bottom-2 right-2 z-10 transition-all duration-200',
						isCurrent && isPlaying
							? 'translate-y-0 opacity-100'
							: 'translate-y-2 opacity-0 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100'
					)}
				/>
			</div>
			<div className="min-w-0">
				{/* The link's ::after stretches over the whole card so the card is clickable. */}
				<Link
					href={HREF[item.type](item)}
					className={cn(
						'block truncate font-semibold outline-none after:absolute after:inset-0 after:rounded-lg',
						isCurrent && 'text-accent'
					)}
				>
					{item.name}
				</Link>
				<p className="mt-0.5 line-clamp-2 text-sm text-muted">{subtitle(item)}</p>
			</div>
		</div>
	);
}

export function MediaCardSkeleton() {
	return (
		<div className="flex flex-col gap-3 p-3">
			<div className="skeleton aspect-square w-full" />
			<div className="skeleton h-4 w-3/4" />
			<div className="skeleton h-3 w-1/2" />
		</div>
	);
}
