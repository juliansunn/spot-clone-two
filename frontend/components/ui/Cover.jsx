import { useState } from 'react';
import { Disc3, ListMusic, Mic2, Music, Podcast, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { pickImage } from '@/lib/format';

const ICONS = { playlist: ListMusic, album: Disc3, artist: User, show: Podcast, episode: Mic2, track: Music };

/** Cover art with a graceful placeholder (many playlists/artists have no image). */
export default function Cover({ images, src, alt = '', type = 'track', size = 300, rounded, className, priority }) {
	const [failed, setFailed] = useState(false);
	const url = src ?? pickImage(images, size);
	const Icon = ICONS[type] ?? Music;
	const shape = rounded ?? (type === 'artist' ? 'rounded-full' : 'rounded-md');

	if (!url || failed) {
		return (
			<div
				role="img"
				aria-label={alt}
				className={cn('flex aspect-square items-center justify-center bg-elevated text-subtle', shape, className)}
			>
				<Icon className="h-1/3 w-1/3" strokeWidth={1.5} />
			</div>
		);
	}
	return (
		<img
			src={url}
			alt={alt}
			loading={priority ? 'eager' : 'lazy'}
			decoding="async"
			draggable={false}
			onError={() => setFailed(true)}
			className={cn('aspect-square bg-elevated object-cover', shape, className)}
		/>
	);
}
