import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';
import { Disc3, ExternalLink, ListPlus, MoreHorizontal, Radio, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/cn';
import { addToQueue, describeError } from '@/lib/spotify';

const item =
	'flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-hover';

/** "…" menu for a track: radio, queue, navigation. */
export default function TrackMenu({ track, className }) {
	const router = useRouter();
	if (!track?.id || !track.uri?.startsWith('spotify:track:')) return null;
	const artist = track.artists?.find((a) => a.id);

	return (
		<Dropdown.Root modal={false}>
			<Dropdown.Trigger
				aria-label={`More options for ${track.name}`}
				onClick={(e) => e.stopPropagation()}
				onDoubleClick={(e) => e.stopPropagation()}
				className={cn(
					'inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:text-fg data-[state=open]:text-fg data-[state=open]:opacity-100',
					className
				)}
			>
				<MoreHorizontal className="h-4 w-4" />
			</Dropdown.Trigger>
			<Dropdown.Portal>
				<Dropdown.Content
					align="end"
					sideOffset={4}
					collisionPadding={12}
					onClick={(e) => e.stopPropagation()}
					className="z-[60] min-w-[13rem] animate-fade-in rounded-xl border border-line bg-elevated outline-none focus-visible:ring-0 p-1.5 text-fg shadow-2xl"
				>
					<Dropdown.Item className={item} onSelect={() => router.push(`/radio/${track.id}`)}>
						<Radio className="h-4 w-4" /> Go to song radio
					</Dropdown.Item>
					<Dropdown.Item
						className={item}
						onSelect={() =>
							addToQueue(track.uri)
								.then(() => toast.success(`Added “${track.name}” to queue`))
								.catch((e) => toast.error(describeError(e)))
						}
					>
						<ListPlus className="h-4 w-4" /> Add to queue
					</Dropdown.Item>
					<Dropdown.Separator className="my-1 h-px bg-line" />
					{artist && (
						<Dropdown.Item className={item} onSelect={() => router.push(`/artist/${artist.id}`)}>
							<User className="h-4 w-4" /> Go to artist
						</Dropdown.Item>
					)}
					{track.album?.id && (
						<Dropdown.Item className={item} onSelect={() => router.push(`/album/${track.album.id}`)}>
							<Disc3 className="h-4 w-4" /> Go to album
						</Dropdown.Item>
					)}
					<Dropdown.Item asChild className={item}>
						<a href={`https://open.spotify.com/track/${track.id}`} target="_blank" rel="noreferrer">
							<ExternalLink className="h-4 w-4" /> Open in Spotify
						</a>
					</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown.Portal>
		</Dropdown.Root>
	);
}
