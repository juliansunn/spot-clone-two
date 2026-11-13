import { useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowDownAZ, Clock, Library as LibraryIcon, Search } from 'lucide-react';
import MediaCard, { MediaCardSkeleton } from '@/components/media/MediaCard';
import { CARD_GRID } from '@/components/media/Shelf';
import Chip from '@/components/ui/Chip';
import IconButton from '@/components/ui/IconButton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { useFollowedArtists, useMyPlaylists, useSavedAlbums, useSavedShows } from '@/hooks/useLibrary';

const TABS = [
	{ id: 'playlists', label: 'Playlists', noun: 'playlists' },
	{ id: 'albums', label: 'Albums', noun: 'albums' },
	{ id: 'artists', label: 'Artists', noun: 'artists you follow' },
	{ id: 'podcasts', label: 'Podcasts', noun: 'podcasts' }
];

function secondaryText(item) {
	return [item.owner?.display_name, item.artists?.map((a) => a.name).join(' '), item.publisher].filter(Boolean).join(' ');
}

export default function LibraryPage() {
	const router = useRouter();
	const tabId = TABS.some((t) => t.id === router.query.tab) ? router.query.tab : 'playlists';
	const [filter, setFilter] = useState('');
	const [sort, setSort] = useState('recent');

	// Hooks must run unconditionally; react-query caches each list.
	const results = { playlists: useMyPlaylists(), albums: useSavedAlbums(), artists: useFollowedArtists(), podcasts: useSavedShows() };
	const tab = TABS.find((t) => t.id === tabId);
	const { data, isLoading, error, refetch } = results[tabId];

	const items = useMemo(() => {
		const q = filter.trim().toLowerCase();
		let list = data ?? [];
		if (q) list = list.filter((i) => i.name?.toLowerCase().includes(q) || secondaryText(i).toLowerCase().includes(q));
		if (sort === 'alpha') list = [...list].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
		return list;
	}, [data, filter, sort]);

	const setTab = (id) => {
		setFilter('');
		router.replace({ pathname: '/library', query: { tab: id } }, undefined, { shallow: true, scroll: false });
	};

	return (
		<>
			<Head>
				<title>Your Library · Antefy</title>
			</Head>
			<div className="px-1 sm:px-3">
				<h1 className="px-3 pb-4 pt-2 text-3xl font-extrabold tracking-tight">Your Library</h1>
				<div className="flex flex-wrap items-center gap-3 px-3 pb-4">
					<div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1" role="tablist" aria-label="Library sections">
						{TABS.map((t) => (
							<Chip key={t.id} role="tab" aria-selected={t.id === tabId} active={t.id === tabId} onClick={() => setTab(t.id)}>
								{t.label}
								{results[t.id].data && <span className="ml-1.5 text-xs opacity-60">{results[t.id].data.length}</span>}
							</Chip>
						))}
					</div>
					<div className="ml-auto flex items-center gap-1">
						<div className="relative">
							<Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
							<input
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
								placeholder={`Search ${tab.label.toLowerCase()}`}
								aria-label={`Search ${tab.label.toLowerCase()}`}
								className="h-9 w-44 rounded-md bg-elevated pl-8 pr-2 text-sm placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-line sm:w-56"
							/>
						</div>
						<IconButton
							label={sort === 'recent' ? 'Sort alphabetically' : 'Sort by recently added'}
							onClick={() => setSort((s) => (s === 'recent' ? 'alpha' : 'recent'))}
						>
							{sort === 'recent' ? <Clock className="h-[18px] w-[18px]" /> : <ArrowDownAZ className="h-[18px] w-[18px]" />}
						</IconButton>
					</div>
				</div>

				{error ? (
					<ErrorState error={error} onRetry={refetch} />
				) : isLoading ? (
					<div className={CARD_GRID}>
						{Array.from({ length: 14 }, (_, i) => (
							<MediaCardSkeleton key={i} />
						))}
					</div>
				) : items.length === 0 ? (
					<EmptyState icon={LibraryIcon} title={filter ? 'No matches' : `No ${tab.noun} yet`}>
						{filter ? `Nothing in your ${tab.label.toLowerCase()} matches “${filter}”.` : 'Things you save on Spotify show up here.'}
					</EmptyState>
				) : (
					<div className={CARD_GRID}>
						{items.map((item, i) => (
							<MediaCard key={item.id} item={item} priority={i < 6} />
						))}
					</div>
				)}
			</div>
		</>
	);
}
