import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Shelf from '@/components/media/Shelf';
import QuickTile, { LikedCover } from '@/components/media/QuickTile';
import TrackList from '@/components/media/TrackList';
import Chip from '@/components/ui/Chip';
import { greeting } from '@/lib/format';
import * as spotify from '@/lib/spotify';
import { useMyPlaylists, useSavedAlbums, useSavedShows } from '@/hooks/useLibrary';

const RANGES = [
	{ id: 'short_term', label: '4 weeks' },
	{ id: 'medium_term', label: '6 months' },
	{ id: 'long_term', label: 'All time' }
];

function useRecentAlbums(enabled) {
	return useQuery({
		queryKey: ['recently-played'],
		queryFn: () => spotify.getRecentlyPlayed(50),
		enabled,
		select: (d) => {
			const seen = new Set();
			const albums = [];
			for (const { track } of d?.items ?? []) {
				const album = track?.album;
				if (album?.id && !seen.has(album.id)) {
					seen.add(album.id);
					albums.push(album);
				}
			}
			return albums;
		}
	});
}

export default function Home() {
	const { data: session, status } = useSession();
	const enabled = status === 'authenticated';
	const [range, setRange] = useState('short_term');
	const playlists = useMyPlaylists();
	const albums = useSavedAlbums();
	const shows = useSavedShows();
	const recent = useRecentAlbums(enabled);
	const topArtists = useQuery({
		queryKey: ['top', 'artists', range],
		queryFn: () => spotify.getTopItems('artists', { timeRange: range, limit: 20 }),
		enabled,
		select: (d) => d?.items ?? []
	});
	const topTracks = useQuery({
		queryKey: ['top', 'tracks', range],
		queryFn: () => spotify.getTopItems('tracks', { timeRange: range, limit: 10 }),
		enabled,
		select: (d) => (d?.items ?? []).map((track) => ({ track }))
	});

	const firstName = session?.user?.name?.split(' ')[0];
	const quick = useMemo(() => playlists.data?.slice(0, 7) ?? [], [playlists.data]);
	const userId = session?.user?.id;

	return (
		<>
			<Head>
				<title>Home · Antefy</title>
			</Head>
			<div className="relative -mt-16 pt-16">
				<div aria-hidden className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-accent/25 via-accent/5 to-transparent" />
				<div className="relative space-y-10 px-1 pt-2 sm:px-3">
					<section className="px-3">
						<h1 className="mb-5 text-3xl font-extrabold tracking-tight sm:text-4xl" suppressHydrationWarning>
							{greeting()}
							{firstName ? `, ${firstName}` : ''}
						</h1>
						<div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 xl:grid-cols-4">
							<QuickTile
								href="/liked-songs"
								title="Liked Songs"
								cover={<LikedCover />}
								contextUri={userId ? `spotify:user:${userId}:collection` : undefined}
							/>
							{playlists.isLoading
								? Array.from({ length: 7 }, (_, i) => <div key={i} className="skeleton h-14 sm:h-16" />)
								: quick.map((p) => (
										<QuickTile key={p.id} href={`/playlist/${p.id}`} title={p.name} images={p.images} type="playlist" contextUri={p.uri} />
									))}
						</div>
					</section>

					<Shelf title="Recently played" items={recent.data?.slice(0, 14)} loading={recent.isLoading} rows={1} />

					<section className="space-y-6">
						<div className="flex flex-wrap items-center justify-between gap-3 px-3">
							<h2 className="text-xl font-bold tracking-tight sm:text-2xl">Your top picks</h2>
							<div className="flex gap-2" role="group" aria-label="Time range">
								{RANGES.map((r) => (
									<Chip key={r.id} active={range === r.id} onClick={() => setRange(r.id)}>
										{r.label}
									</Chip>
								))}
							</div>
						</div>
						<Shelf title="Top artists" items={topArtists.data} loading={topArtists.isLoading} rows={1} />
						{topTracks.data?.length > 0 && (
							<div>
								<h3 className="mb-1 px-3 text-lg font-bold">Top tracks</h3>
								<TrackList items={topTracks.data} showAlbum />
							</div>
						)}
					</section>

					<Shelf title="Your playlists" href="/library?tab=playlists" items={playlists.data} loading={playlists.isLoading} rows={1} />
					<Shelf title="Saved albums" href="/library?tab=albums" items={albums.data} loading={albums.isLoading} rows={1} />
					<Shelf title="Your podcasts" href="/library?tab=podcasts" items={shows.data} loading={shows.isLoading} rows={1} />
				</div>
			</div>
		</>
	);
}
