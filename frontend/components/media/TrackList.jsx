import { memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Clock3, Explicit, Pause, Play } from '@/components/media/icons';
import Cover from '@/components/ui/Cover';
import { Spinner } from '@/components/ui/States';
import ArtistLinks from './ArtistLinks';
import Equalizer from './Equalizer';
import LikeButton from './LikeButton';
import { cn } from '@/lib/cn';
import { formatAddedAt, formatDuration, formatPlayedAt } from '@/lib/format';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';
import { useSavedStatus } from '@/hooks/useLibrary';
import { useInView } from '@/hooks/useInView';

/**
 * items: [{ track, addedAt?, playedAt?, playCount? }]
 * context: { contextUri } | { uris } – defaults to the list's own uris.
 */
export default function TrackList({
	items,
	context,
	showAlbum = true,
	showCover = true,
	dateColumn, // 'added' | 'played' | undefined
	assumeSaved = false,
	hasMore,
	loadingMore,
	onLoadMore,
	className
}) {
	const playFrom = usePlayFrom();
	const rows = useMemo(() => (items ?? []).filter((i) => i?.track), [items]);
	const uris = useMemo(() => rows.map((r) => r.track.uri), [rows]);
	const isSaved = useSavedStatus(uris, { assumeSaved });
	const sentinel = useInView(() => hasMore && !loadingMore && onLoadMore?.(), { enabled: Boolean(hasMore) });

	const ctx = useMemo(() => context ?? { uris: uris.filter((u) => u?.startsWith('spotify:track:')) }, [context, uris]);
	const onPlay = useCallback((track) => playFrom(ctx, track), [playFrom, ctx]);

	const grid = cn(
		'grid items-center gap-3 px-4',
		'grid-cols-[2rem_minmax(0,1fr)_auto]',
		showAlbum && dateColumn
			? 'md:grid-cols-[2rem_minmax(0,4fr)_minmax(0,3fr)_auto] xl:grid-cols-[2rem_minmax(0,4fr)_minmax(0,3fr)_minmax(0,2fr)_auto]'
			: showAlbum
				? 'md:grid-cols-[2rem_minmax(0,4fr)_minmax(0,3fr)_auto]'
				: dateColumn
					? 'lg:grid-cols-[2rem_minmax(0,4fr)_minmax(0,2fr)_auto]'
					: ''
	);

	return (
		<div role="table" aria-label="Tracks" className={cn('pb-4', className)}>
			<div
				role="row"
				className={cn(
					grid,
					'sticky top-16 z-10 mb-2 h-9 border-b border-line bg-surface/95 text-xs font-medium uppercase tracking-wider text-muted backdrop-blur'
				)}
			>
				<span role="columnheader" className="text-right">#</span>
				<span role="columnheader">Title</span>
				{showAlbum && <span role="columnheader" className="hidden md:block">Album</span>}
				{dateColumn && (
					<span role="columnheader" className={cn('hidden', showAlbum ? 'xl:block' : 'lg:block')}>
						{dateColumn === 'played' ? 'Last played' : 'Date added'}
					</span>
				)}
				<span role="columnheader" className="flex w-[5.5rem] justify-end pr-1">
					<Clock3 className="h-4 w-4" aria-label="Duration" />
				</span>
			</div>

			<div role="rowgroup">
				{rows.map((row, i) => (
					<TrackRow
						key={`${row.track.id ?? row.track.uri}-${i}`}
						index={i}
						row={row}
						grid={grid}
						showAlbum={showAlbum}
						showCover={showCover}
						dateColumn={dateColumn}
						saved={isSaved(row.track.uri)}
						onPlay={onPlay}
					/>
				))}
			</div>

			{hasMore && (
				<div ref={sentinel} className="flex justify-center py-6">
					{loadingMore ? (
						<Spinner />
					) : (
						<button type="button" onClick={onLoadMore} className="text-sm font-semibold text-muted hover:text-fg">
							Load more
						</button>
					)}
				</div>
			)}
		</div>
	);
}

const TrackRow = memo(function TrackRow({ row, index, grid, showAlbum, showCover, dateColumn, saved, onPlay }) {
	const { track } = row;
	const nowPlaying = useNowPlaying();
	const isCurrent = nowPlaying.id === track.id || (track.linked_from && nowPlaying.id === track.linked_from.id);
	const isPlaying = isCurrent && nowPlaying.isPlaying;
	const playable = track.is_playable !== false && !track.is_local;
	const date = dateColumn === 'played' ? formatPlayedAt(row.playedAt) : formatAddedAt(row.addedAt);

	const play = () => playable && onPlay(track);

	return (
		<div
			role="row"
			tabIndex={0}
			aria-selected={isCurrent}
			onDoubleClick={play}
			onKeyDown={(e) => {
				if (e.key === 'Enter' && e.target === e.currentTarget) play();
			}}
			className={cn(
				grid,
				'group h-14 rounded-md text-sm text-muted transition-colors hover:bg-hover/70 focus-visible:bg-hover/70',
				!playable && 'opacity-50'
			)}
		>
			<div role="cell" className="relative flex justify-end">
				<span className={cn('tabular-nums', 'group-hover:invisible group-focus-within:invisible', isCurrent && 'invisible')}>
					{index + 1}
				</span>
				{isCurrent && (
					<span className="absolute inset-0 flex items-center justify-end group-hover:invisible">
						<Equalizer playing={isPlaying} />
					</span>
				)}
				<button
					type="button"
					disabled={!playable}
					aria-label={isPlaying ? `Pause ${track.name}` : `Play ${track.name}`}
					onClick={play}
					className="invisible absolute inset-0 flex items-center justify-end text-fg group-hover:visible group-focus-within:visible disabled:cursor-not-allowed"
				>
					{isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
				</button>
			</div>

			<div role="cell" className="flex min-w-0 items-center gap-3">
				{showCover && track.album && (
					<Cover images={track.album.images} type="album" alt="" size={64} className="h-10 w-10 shrink-0 rounded" />
				)}
				<div className="min-w-0">
					<p className={cn('truncate text-base text-fg', isCurrent && 'text-accent')}>{track.name}</p>
					<p className="flex min-w-0 items-center gap-1.5">
						{track.explicit && <Explicit />}
						<ArtistLinks artists={track.artists} />
					</p>
				</div>
			</div>

			{showAlbum && (
				<div role="cell" className="hidden min-w-0 md:block">
					{track.album?.id ? (
						<Link href={`/album/${track.album.id}`} className="link-hover block truncate">
							{track.album.name}
						</Link>
					) : (
						<span className="truncate">{track.album?.name}</span>
					)}
				</div>
			)}

			{dateColumn && (
				<div role="cell" className={cn('hidden truncate', showAlbum ? 'xl:block' : 'lg:block')}>
					{date}
					{row.playCount > 1 && <span className="ml-2 text-xs text-subtle">×{row.playCount}</span>}
				</div>
			)}

			<div role="cell" className="flex w-[5.5rem] items-center justify-end gap-2">
				<LikeButton
					uri={track.uri?.startsWith('spotify:track:') ? track.uri : null}
					name={track.name}
					saved={saved}
					className={cn(!saved && 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100')}
				/>
				<span className="w-10 text-right tabular-nums">{formatDuration(track.duration_ms)}</span>
			</div>
		</div>
	);
});

export function TrackListSkeleton({ rows = 8 }) {
	return (
		<div className="space-y-2 px-4 pt-12">
			{Array.from({ length: rows }, (_, i) => (
				<div key={i} className="flex h-12 items-center gap-3">
					<div className="skeleton h-10 w-10 shrink-0" />
					<div className="flex-1 space-y-2">
						<div className="skeleton h-3.5 w-1/3" />
						<div className="skeleton h-3 w-1/5" />
					</div>
				</div>
			))}
		</div>
	);
}
