import { useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { SearchX } from 'lucide-react';
import Cover from '@/components/ui/Cover';
import Chip from '@/components/ui/Chip';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import MediaCard, { MediaCardSkeleton } from '@/components/media/MediaCard';
import PlayButton from '@/components/media/PlayButton';
import Shelf, { CARD_GRID } from '@/components/media/Shelf';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import ArtistLinks from '@/components/media/ArtistLinks';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';
import * as spotify from '@/lib/spotify';

const FILTERS = [
	{ id: 'all', label: 'All' },
	{ id: 'track', label: 'Songs', key: 'tracks' },
	{ id: 'artist', label: 'Artists', key: 'artists' },
	{ id: 'album', label: 'Albums', key: 'albums' },
	{ id: 'playlist', label: 'Playlists', key: 'playlists' },
	{ id: 'show', label: 'Podcasts', key: 'shows' }
];

const GENRES = [
	['Pop', 'from-pink-500 to-rose-700'],
	['Hip-Hop', 'from-orange-500 to-amber-700'],
	['Rock', 'from-red-600 to-red-900'],
	['Indie', 'from-emerald-500 to-teal-800'],
	['Electronic', 'from-cyan-500 to-blue-800'],
	['Jazz', 'from-amber-500 to-yellow-800'],
	['R&B', 'from-fuchsia-500 to-purple-800'],
	['Classical', 'from-stone-500 to-stone-800'],
	['Country', 'from-yellow-600 to-orange-800'],
	['Metal', 'from-zinc-600 to-zinc-900'],
	['Latin', 'from-lime-500 to-green-800'],
	['Lo-fi', 'from-indigo-500 to-violet-800']
];

/** Null entries show up in Spotify search results; drop them. */
const clean = (page) => (page?.items ?? []).filter(Boolean);

function TopResult({ item }) {
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	if (!item) return null;
	const isTrack = item.type === 'track';
	const href = isTrack ? `/album/${item.album?.id}` : `/${item.type === 'show' ? 'podcast' : item.type}/${item.id}`;
	const current = isTrack ? now.uri === item.uri : now.contextUri === item.uri;
	const images = isTrack ? item.album?.images : item.images;

	return (
		<div className="group relative flex h-full flex-col gap-5 rounded-xl bg-elevated/70 p-5 transition hover:bg-hover/70">
			<Cover images={images} type={item.type} alt="" size={160} className="h-24 w-24 shadow-xl" />
			<div className="min-w-0">
				<Link href={href} className="line-clamp-2 text-3xl font-extrabold after:absolute after:inset-0">
					{item.name}
				</Link>
				<p className="mt-1 flex items-center gap-2 text-sm text-muted">
					{isTrack && <ArtistLinks artists={item.artists} className="relative z-10" />}
					<span className="rounded-full bg-bg/60 px-2.5 py-0.5 text-xs font-semibold capitalize text-fg">
						{item.type === 'track' ? 'Song' : item.type}
					</span>
				</p>
			</div>
			<PlayButton
				playing={current && now.isPlaying}
				onClick={() => (isTrack ? playFrom({ uris: [item.uri] }, item) : playFrom({ contextUri: item.uri }))}
				className="absolute bottom-5 right-5 z-10 translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
			/>
		</div>
	);
}

function pickTopResult(data, q) {
	const needle = q.toLowerCase().replace(/^(artist|album|track|genre):/, '').replace(/"/g, '').trim();
	const artist = clean(data?.artists)[0];
	if (artist && artist.name.toLowerCase() === needle) return artist;
	const track = clean(data?.tracks)[0];
	const album = clean(data?.albums)[0];
	if (album && album.name.toLowerCase() === needle) return album;
	return track ?? artist ?? album ?? clean(data?.playlists)[0] ?? null;
}

function Browse() {
	return (
		<div className="px-4 sm:px-6">
			<h1 className="pb-4 pt-2 text-2xl font-bold">Browse genres</h1>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
				{GENRES.map(([name, gradient]) => (
					<Link
						key={name}
						href={`/search?q=${encodeURIComponent(`genre:"${name.toLowerCase()}"`)}`}
						className={`relative aspect-[16/10] overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-4 text-xl font-extrabold text-white shadow-lg transition hover:scale-[1.02]`}
					>
						{name}
						<span aria-hidden className="absolute -bottom-4 -right-4 h-20 w-20 rotate-12 rounded-lg bg-white/15" />
					</Link>
				))}
			</div>
		</div>
	);
}

function AllResults({ q }) {
	const enabled = useSession().status === 'authenticated';
	const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
		queryKey: ['search', q, 'all'],
		queryFn: () => spotify.search(q),
		enabled,
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000
	});

	if (error) return <ErrorState error={error} onRetry={refetch} />;
	if (isLoading) {
		return (
			<div className="space-y-6">
				<TrackListSkeleton rows={4} />
				<div className={CARD_GRID}>
					{Array.from({ length: 5 }, (_, i) => (
						<MediaCardSkeleton key={i} />
					))}
				</div>
			</div>
		);
	}
	const tracks = clean(data?.tracks).map((track) => ({ track }));
	const top = pickTopResult(data, q);
	const nothing = !top && !clean(data?.shows).length;
	if (nothing) {
		return (
			<EmptyState icon={SearchX} title={`No results found for “${q}”`}>
				Check the spelling, or try fewer or different keywords.
			</EmptyState>
		);
	}

	return (
		<div className={isPlaceholderData ? 'space-y-8 opacity-60 transition-opacity' : 'space-y-8 transition-opacity'}>
			<div className="grid gap-6 px-1 sm:px-3 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
				<section className="px-3">
					<h2 className="mb-3 text-2xl font-bold">Top result</h2>
					<TopResult item={top} />
				</section>
				{tracks.length > 0 && (
					<section className="min-w-0">
						<h2 className="mb-1 px-3 text-2xl font-bold">Songs</h2>
						<TrackList items={tracks.slice(0, 5)} context={{ uris: tracks.map((t) => t.track.uri) }} showAlbum={false} className="-mx-1" />
					</section>
				)}
			</div>
			<div className="space-y-8 px-1 sm:px-3">
				<Shelf title="Artists" items={clean(data?.artists)} rows={1} />
				<Shelf title="Albums" items={clean(data?.albums)} rows={1} />
				<Shelf title="Playlists" items={clean(data?.playlists)} rows={1} />
				<Shelf title="Podcasts" items={clean(data?.shows)} rows={1} />
			</div>
		</div>
	);
}

function TypedResults({ q, filter }) {
	const enabled = useSession().status === 'authenticated';
	const res = useInfiniteQuery({
		queryKey: ['search', q, filter.id],
		queryFn: ({ pageParam }) => spotify.search(q, [filter.id], { limit: 10, offset: pageParam }),
		initialPageParam: 0,
		getNextPageParam: (last) => {
			const page = last?.[filter.key];
			// The search API stops at offset 1000.
			return page?.next && page.offset + page.limit < 1000 ? page.offset + page.limit : undefined;
		},
		enabled
	});
	const items = useMemo(() => (res.data?.pages ?? []).flatMap((p) => clean(p?.[filter.key])), [res.data, filter.key]);

	if (res.error) return <ErrorState error={res.error} onRetry={res.refetch} />;
	if (res.isLoading) return filter.id === 'track' ? <TrackListSkeleton /> : (
		<div className={CARD_GRID}>{Array.from({ length: 10 }, (_, i) => <MediaCardSkeleton key={i} />)}</div>
	);
	if (!items.length) return <EmptyState icon={SearchX} title={`No ${filter.label.toLowerCase()} found for “${q}”`} />;

	const more = res.hasNextPage && (
		<div className="flex justify-center py-6">
			<button
				type="button"
				onClick={() => res.fetchNextPage()}
				disabled={res.isFetchingNextPage}
				className="rounded-full border border-line px-5 py-2 text-sm font-semibold transition hover:border-fg disabled:opacity-50"
			>
				{res.isFetchingNextPage ? <Spinner className="h-4 w-4" /> : 'Load more'}
			</button>
		</div>
	);

	if (filter.id === 'track') {
		const rows = items.map((track) => ({ track }));
		return (
			<>
				<TrackList items={rows} context={{ uris: items.map((t) => t.uri) }} />
				{more}
			</>
		);
	}
	return (
		<div className="px-1 sm:px-3">
			<div className={CARD_GRID}>
				{items.map((item, i) => (
					<MediaCard key={`${item.id}-${i}`} item={item} />
				))}
			</div>
			{more}
		</div>
	);
}

export default function SearchPage() {
	const router = useRouter();
	const q = typeof router.query.q === 'string' ? router.query.q.trim() : '';
	const filter = FILTERS.find((f) => f.id === router.query.type) ?? FILTERS[0];

	const setFilter = (id) => {
		const query = { q, ...(id !== 'all' ? { type: id } : {}) };
		router.replace({ pathname: '/search', query }, undefined, { shallow: true, scroll: false });
	};

	return (
		<>
			<Head>
				<title>{q ? `“${q}” · Search · Antefy` : 'Search · Antefy'}</title>
			</Head>
			{!q ? (
				<Browse />
			) : (
				<div className="space-y-6">
					<div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-1 sm:px-6" role="tablist" aria-label="Result type">
						{FILTERS.map((f) => (
							<Chip key={f.id} role="tab" aria-selected={f.id === filter.id} active={f.id === filter.id} onClick={() => setFilter(f.id)}>
								{f.label}
							</Chip>
						))}
					</div>
					{filter.id === 'all' ? <AllResults q={q} /> : <TypedResults key={filter.id} q={q} filter={filter} />}
				</div>
			)}
		</>
	);
}
