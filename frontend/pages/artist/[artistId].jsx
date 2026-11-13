import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { BadgeCheck } from 'lucide-react';
import CollectionHeader, { ActionBar } from '@/components/media/CollectionHeader';
import PlayButton from '@/components/media/PlayButton';
import Shelf, { CARD_GRID } from '@/components/media/Shelf';
import MediaCard, { MediaCardSkeleton } from '@/components/media/MediaCard';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import Chip from '@/components/ui/Chip';
import { ErrorState } from '@/components/ui/States';
import { formatNumber } from '@/lib/format';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';
import { useArtist } from '@/hooks/useCollections';

const FILTERS = [
	{ id: 'all', label: 'All' },
	{ id: 'album', label: 'Albums' },
	{ id: 'single', label: 'Singles & EPs' },
	{ id: 'compilation', label: 'Compilations' }
];

export default function ArtistPage() {
	const { query } = useRouter();
	const id = query.artistId;
	const { artist, topTracks, albums } = useArtist(id);
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	const [filter, setFilter] = useState('all');
	const [showAllTop, setShowAllTop] = useState(false);
	const a = artist.data;

	const releases = useMemo(() => {
		const list = albums.data?.releases ?? [];
		return filter === 'all' ? list : list.filter((r) => r.album_type === filter);
	}, [albums.data, filter]);
	const availableFilters = FILTERS.filter(
		(f) => f.id === 'all' || albums.data?.releases?.some((r) => r.album_type === f.id)
	);
	const topRows = useMemo(() => (topTracks.data ?? []).map((track) => ({ track })), [topTracks.data]);

	if (artist.error) return <ErrorState error={artist.error} onRetry={artist.refetch} className="min-h-[60vh]" />;

	const isCurrent = a && now.contextUri === a.uri;

	return (
		<>
			<Head>
				<title>{a ? `${a.name} · Antefy` : 'Artist · Antefy'}</title>
			</Head>
			<CollectionHeader
				loading={artist.isLoading}
				label={
					<span className="inline-flex items-center gap-1.5">
						<BadgeCheck className="h-4 w-4 text-sky-400" /> Artist
					</span>
				}
				title={a?.name}
				images={a?.images}
				coverType="artist"
				seed={id}
				meta={
					a && (
						<>
							{a.followers?.total > 0 && <span>{formatNumber(a.followers.total)} followers</span>}
							{a.genres?.length > 0 && (
								<span className="text-white/70">{a.followers?.total > 0 ? ' · ' : ''}{a.genres.slice(0, 3).join(', ')}</span>
							)}
						</>
					)
				}
			/>
			{a && (
				<ActionBar>
					<PlayButton size="lg" playing={isCurrent && now.isPlaying} onClick={() => playFrom({ contextUri: a.uri })} />
				</ActionBar>
			)}

			<section className="mb-8">
				<h2 className="mb-1 px-4 text-xl font-bold sm:px-6 sm:text-2xl">Popular</h2>
				{topTracks.isLoading || artist.isLoading ? (
					<TrackListSkeleton rows={5} />
				) : topRows.length ? (
					<>
						<TrackList items={showAllTop ? topRows : topRows.slice(0, 5)} showAlbum />
						{topRows.length > 5 && (
							<button
								type="button"
								onClick={() => setShowAllTop((v) => !v)}
								className="ml-6 text-sm font-semibold text-muted hover:text-fg"
							>
								{showAllTop ? 'Show less' : 'See more'}
							</button>
						)}
					</>
				) : (
					<p className="px-6 text-sm text-muted">No popular tracks available.</p>
				)}
			</section>

			<section className="space-y-3 px-1 sm:px-3">
				<div className="flex flex-wrap items-center gap-3 px-3">
					<h2 className="mr-2 text-xl font-bold sm:text-2xl">Discography</h2>
					{availableFilters.length > 2 &&
						availableFilters.map((f) => (
							<Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
								{f.label}
							</Chip>
						))}
				</div>
				<div className={CARD_GRID}>
					{albums.isLoading
						? Array.from({ length: 5 }, (_, i) => <MediaCardSkeleton key={i} />)
						: releases.map((r) => <MediaCard key={r.id} item={r} />)}
				</div>
				{!albums.isLoading && releases.length === 0 && (
					<p className="px-3 text-sm text-muted">No releases found.</p>
				)}
			</section>

			{albums.data?.appearsOn?.length > 0 && (
				<div className="mt-8 px-1 sm:px-3">
					<Shelf title="Appears on" items={albums.data.appearsOn} rows={1} />
				</div>
			)}
		</>
	);
}
