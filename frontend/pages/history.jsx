import { useMemo, useState } from 'react';
import Head from 'next/head';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, History, ServerOff } from 'lucide-react';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import Chip from '@/components/ui/Chip';
import IconButton from '@/components/ui/IconButton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { formatNumber } from '@/lib/format';

const PRESETS = [
	{ id: 7, label: 'Last 7 days' },
	{ id: 30, label: 'Last 30 days' },
	{ id: 90, label: 'Last 90 days' },
	{ id: 365, label: 'Last year' }
];
const fmt = (d) => format(d, 'yyyy-MM-dd');

class HistoryError extends Error {
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

async function fetchHistory({ page, start, end }) {
	const params = new URLSearchParams({ page: String(page), start_date: start, end_date: end });
	const res = await fetch(`/api/history?${params}`);
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new HistoryError(res.status, body.error || 'Could not load history', body.code);
	return body;
}

/** The Django serializer uses `spotify_id`; map to the Spotify shapes TrackList expects. */
function toSpotifyTrack(t) {
	const album = t.album
		? { ...t.album, id: t.album.spotify_id, images: t.album.images ?? [] }
		: null;
	return {
		...t,
		id: t.spotify_id,
		uri: t.uri || (t.spotify_id ? `spotify:track:${t.spotify_id}` : undefined),
		album,
		artists: (t.artists ?? []).map((a) => ({ ...a, id: a.spotify_id }))
	};
}

export default function HistoryPage() {
	const today = fmt(new Date());
	const [range, setRange] = useState({ start: fmt(subDays(new Date(), 7)), end: today, preset: 7 });
	const [page, setPage] = useState(1);

	const { data, error, isLoading, isFetching, isPlaceholderData, refetch } = useQuery({
		queryKey: ['history', range.start, range.end, page],
		queryFn: () => fetchHistory({ page, start: range.start, end: range.end }),
		placeholderData: keepPreviousData,
		retry: (count, e) => e?.status >= 500 && e?.status !== 503 && count < 2
	});

	const rows = useMemo(
		() =>
			(data?.results ?? []).map((t) => ({ track: toSpotifyTrack(t), playedAt: t.last_play, playCount: t.play_cnt })),
		[data]
	);
	const totalPages = data?.total_pages ?? 1;

	const applyPreset = (days) => {
		setRange({ start: fmt(subDays(new Date(), days)), end: today, preset: days });
		setPage(1);
	};
	const setDate = (key, value) => {
		if (!value) return;
		setRange((r) => {
			const next = { ...r, [key]: value, preset: null };
			// Keep the range valid instead of silently clamping like the old picker.
			if (next.start > next.end) key === 'start' ? (next.end = value) : (next.start = value);
			return next;
		});
		setPage(1);
	};

	const unavailable = error && (error.status === 503 || error.code);

	return (
		<>
			<Head>
				<title>Listening History · Antefy</title>
			</Head>
			<div className="px-4 pt-2 sm:px-6">
				<h1 className="text-3xl font-extrabold tracking-tight">Listening history</h1>
				<p className="mt-1 text-sm text-muted">
					Every play recorded by the Antefy history service, grouped by track.
				</p>

				<div className="mt-5 flex flex-wrap items-center gap-2">
					{PRESETS.map((p) => (
						<Chip key={p.id} active={range.preset === p.id} onClick={() => applyPreset(p.id)}>
							{p.label}
						</Chip>
					))}
					<div className="flex items-center gap-2 text-sm text-muted sm:ml-2">
						<label className="sr-only" htmlFor="start">Start date</label>
						<input
							id="start"
							type="date"
							value={range.start}
							max={today}
							onChange={(e) => setDate('start', e.target.value)}
							className="h-9 rounded-md border border-line bg-elevated px-2 text-fg"
						/>
						<span>to</span>
						<label className="sr-only" htmlFor="end">End date</label>
						<input
							id="end"
							type="date"
							value={range.end}
							max={today}
							onChange={(e) => setDate('end', e.target.value)}
							className="h-9 rounded-md border border-line bg-elevated px-2 text-fg"
						/>
					</div>
				</div>

				{data && (
					<div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted">
						<span>
							{formatNumber(data.count)} track{data.count === 1 ? '' : 's'}
							{isFetching && !isLoading && <span className="ml-2 text-subtle">Updating…</span>}
						</span>
						{totalPages > 1 && (
							<div className="flex items-center gap-1">
								<IconButton label="Previous page" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
									<ChevronLeft className="h-5 w-5" />
								</IconButton>
								<span className="tabular-nums">
									Page {page} of {totalPages}
								</span>
								<IconButton label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
									<ChevronRight className="h-5 w-5" />
								</IconButton>
							</div>
						)}
					</div>
				)}
			</div>

			<div className="mt-4">
				{isLoading ? (
					<TrackListSkeleton />
				) : unavailable ? (
					<EmptyState icon={ServerOff} title="History service unavailable">
						{error.message} Start it with <code className="rounded bg-elevated px-1.5 py-0.5">make backend</code>; plays
						are collected every 15 minutes once you&apos;ve signed in.
					</EmptyState>
				) : error ? (
					<ErrorState error={error} onRetry={refetch} />
				) : rows.length === 0 ? (
					<EmptyState icon={History} title="No plays in this range">
						Try a wider date range. New plays show up within about 15 minutes.
					</EmptyState>
				) : (
					<div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
						<TrackList items={rows} dateColumn="played" />
					</div>
				)}
			</div>
		</>
	);
}
