import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import CollectionHeader, { ActionBar, Dot } from '@/components/media/CollectionHeader';
import PlayButton from '@/components/media/PlayButton';
import { LikedCover } from '@/components/media/QuickTile';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { pluralize } from '@/lib/format';
import { useLikedSongs } from '@/hooks/useLibrary';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';

export default function LikedSongsPage() {
	const { data: session } = useSession();
	const liked = useLikedSongs();
	const playFrom = usePlayFrom();
	const now = useNowPlaying();

	const rows = useMemo(
		() => (liked.data?.pages ?? []).flatMap((p) => p.items ?? []).map((i) => ({ track: i.track, addedAt: i.added_at })),
		[liked.data]
	);
	const total = liked.data?.pages?.[0]?.total ?? 0;
	const userId = session?.user?.id;
	// Spotify exposes Liked Songs as a playable "collection" context, so next/prev
	// and shuffle work across the whole library – not just the loaded page.
	const context = userId ? { contextUri: `spotify:user:${userId}:collection` } : undefined;
	const isCurrent = context && now.contextUri === context.contextUri;

	return (
		<>
			<Head>
				<title>Liked Songs · Antefy</title>
			</Head>
			<CollectionHeader
				label="Playlist"
				title="Liked Songs"
				seed="liked-songs-indigo"
				cover={<LikedCover className="h-44 w-44 rounded-md shadow-2xl shadow-black/50 sm:h-52 sm:w-52 lg:h-56 lg:w-56" />}
				meta={
					<>
						<span className="font-semibold">{session?.user?.name}</span>
						{total > 0 && (
							<>
								<Dot />
								<span>{pluralize(total, 'song')}</span>
							</>
						)}
					</>
				}
			/>
			{total > 0 && (
				<ActionBar>
					<PlayButton size="lg" playing={isCurrent && now.isPlaying} onClick={() => playFrom(context)} />
				</ActionBar>
			)}
			{liked.isLoading ? (
				<TrackListSkeleton />
			) : liked.error ? (
				<ErrorState error={liked.error} onRetry={liked.refetch} />
			) : rows.length === 0 ? (
				<EmptyState
					icon={Heart}
					title="Songs you like will appear here"
					action={
						<Link href="/search" className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-bg hover:scale-105">
							Find songs
						</Link>
					}
				>
					Save songs by tapping the heart icon.
				</EmptyState>
			) : (
				<TrackList
					items={rows}
					context={context}
					dateColumn="added"
					assumeSaved
					hasMore={liked.hasNextPage}
					loadingMore={liked.isFetchingNextPage}
					onLoadMore={liked.fetchNextPage}
				/>
			)}
		</>
	);
}
