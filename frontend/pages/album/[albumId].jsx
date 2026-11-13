import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CollectionHeader, { ActionBar, Dot } from '@/components/media/CollectionHeader';
import PlayButton from '@/components/media/PlayButton';
import Shelf from '@/components/media/Shelf';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import { ErrorState } from '@/components/ui/States';
import { formatLongDuration, formatReleaseDate, pluralize, releaseYear } from '@/lib/format';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';
import { useAlbum } from '@/hooks/useCollections';
import { useQuery } from '@tanstack/react-query';
import * as spotify from '@/lib/spotify';

const LABEL = { album: 'Album', single: 'Single', compilation: 'Compilation' };

export default function AlbumPage() {
	const { query } = useRouter();
	const id = query.albumId;
	const { album, firstPage, more, hasMore, loadMore, loadingMore } = useAlbum(id);
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	const a = album.data;
	const mainArtist = a?.artists?.[0];

	const moreByArtist = useQuery({
		queryKey: ['artist-albums', mainArtist?.id, 'more'],
		queryFn: () => spotify.getArtistAlbums(mainArtist.id, { groups: 'album,single', limit: 12 }),
		enabled: Boolean(mainArtist?.id),
		select: (d) => (d?.items ?? []).filter((x) => x.id !== id)
	});

	const rows = useMemo(() => {
		const pages = [firstPage, ...(more.data?.pages ?? [])].filter(Boolean);
		return pages.flatMap((p) => p.items ?? []).map((track) => ({ track }));
	}, [firstPage, more.data]);
	const totalMs = rows.reduce((sum, r) => sum + (r.track.duration_ms ?? 0), 0);

	if (album.error) return <ErrorState error={album.error} onRetry={album.refetch} className="min-h-[60vh]" />;

	const isCurrent = a && now.contextUri === a.uri;

	return (
		<>
			<Head>
				<title>{a ? `${a.name} · ${mainArtist?.name ?? ''} · Antefy` : 'Album · Antefy'}</title>
			</Head>
			<CollectionHeader
				loading={album.isLoading}
				label={LABEL[a?.album_type] ?? 'Album'}
				title={a?.name}
				images={a?.images}
				coverType="album"
				seed={id}
				meta={
					a && (
						<>
							{a.artists?.map((artist, i) => (
								<span key={artist.id}>
									{i > 0 && ', '}
									<Link href={`/artist/${artist.id}`} className="font-semibold hover:underline">
										{artist.name}
									</Link>
								</span>
							))}
							<Dot />
							<span title={formatReleaseDate(a.release_date, a.release_date_precision)}>{releaseYear(a.release_date)}</span>
							<Dot />
							<span>{pluralize(a.total_tracks, 'song')}</span>
							{totalMs > 0 && !hasMore && (
								<span className="text-white/70">, {formatLongDuration(totalMs)}</span>
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
			{album.isLoading ? (
				<TrackListSkeleton />
			) : (
				<TrackList
					items={rows}
					context={a ? { contextUri: a.uri } : undefined}
					showAlbum={false}
					showCover={false}
					hasMore={hasMore}
					loadingMore={loadingMore}
					onLoadMore={loadMore}
				/>
			)}
			{a && (
				<div className="space-y-2 px-6 pb-6 text-xs text-muted">
					<p>{formatReleaseDate(a.release_date, a.release_date_precision)}</p>
					{a.copyrights?.map((c, i) => (
						<p key={i}>
							{c.type === 'P' ? '℗' : '©'} {c.text.replace(/^(©|℗|\(C\)|\(P\))\s*/i, '')}
						</p>
					))}
				</div>
			)}
			{mainArtist && moreByArtist.data?.length > 0 && (
				<div className="px-1 pt-4 sm:px-3">
					<Shelf title={`More by ${mainArtist.name}`} href={`/artist/${mainArtist.id}`} items={moreByArtist.data} rows={1} />
				</div>
			)}
		</>
	);
}
