import { useMemo } from 'react';
import Head from 'next/head';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { History } from 'lucide-react';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import { EmptyState, ErrorState } from '@/components/ui/States';
import * as spotify from '@/lib/spotify';

/**
 * Spotify keeps roughly your last 50 plays; page back through them with the
 * `before` cursor until it runs out.
 */
export default function RecentPage() {
	const enabled = useSession().status === 'authenticated';
	const recent = useInfiniteQuery({
		queryKey: ['recently-played', 'pages'],
		queryFn: ({ pageParam }) => spotify.getRecentlyPlayed(50, pageParam),
		initialPageParam: undefined,
		getNextPageParam: (last) => (last?.next && last?.cursors?.before ? last.cursors.before : undefined),
		enabled,
		staleTime: 30 * 1000
	});

	const rows = useMemo(
		() =>
			(recent.data?.pages ?? [])
				.flatMap((p) => p?.items ?? [])
				.map((i) => ({ track: i.track, playedAt: i.played_at })),
		[recent.data]
	);

	return (
		<>
			<Head>
				<title>Recently Played · Antefy</title>
			</Head>
			<div className="px-4 pb-4 pt-2 sm:px-6">
				<h1 className="text-3xl font-extrabold tracking-tight">Recently played</h1>
				<p className="mt-1 text-sm text-muted">Your latest plays on Spotify, newest first.</p>
			</div>
			{recent.isLoading ? (
				<TrackListSkeleton />
			) : recent.error ? (
				<ErrorState error={recent.error} onRetry={recent.refetch} />
			) : rows.length === 0 ? (
				<EmptyState icon={History} title="Nothing played yet">
					Play something on Spotify and it will show up here.
				</EmptyState>
			) : (
				<TrackList
					items={rows}
					dateColumn="played"
					hasMore={recent.hasNextPage}
					loadingMore={recent.isFetchingNextPage}
					onLoadMore={recent.fetchNextPage}
				/>
			)}
		</>
	);
}
