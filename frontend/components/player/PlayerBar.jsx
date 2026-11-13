import { useEffect } from 'react';
import Link from 'next/link';
import { Pause, Play, Radio, Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import Cover from '@/components/ui/Cover';
import IconButton from '@/components/ui/IconButton';
import ArtistLinks from '@/components/media/ArtistLinks';
import LikeButton from '@/components/media/LikeButton';
import { DeviceIcon } from './DevicePicker';
import DevicePicker from './DevicePicker';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { cn } from '@/lib/cn';
import { usePlaybackState, usePlayerControls, useProgress } from '@/hooks/usePlayback';
import { useSavedStatus } from '@/hooks/useLibrary';

const NEXT_REPEAT = { off: 'context', context: 'track', track: 'off' };

function contextHref(context) {
	if (!context?.uri) return null;
	const [, type, id] = context.uri.split(':');
	if (context.uri.endsWith(':collection')) return '/liked-songs';
	return { playlist: `/playlist/${id}`, album: `/album/${id}`, artist: `/artist/${id}`, show: `/podcast/${id}` }[type] ?? null;
}

function NowPlaying({ item, context }) {
	const uri = item?.uri;
	const isSaved = useSavedStatus(uri ? [uri] : []);
	if (!item) {
		return <div className="hidden text-sm text-muted sm:block">Nothing playing</div>;
	}
	const isEpisode = item.type === 'episode';
	const images = isEpisode ? item.images ?? item.show?.images : item.album?.images;
	const href = isEpisode ? (item.show?.id ? `/podcast/${item.show.id}` : null) : item.album?.id ? `/album/${item.album.id}` : null;
	const ctxHref = contextHref(context);

	return (
		<div className="flex min-w-0 items-center gap-3">
			<Link href={ctxHref ?? href ?? '#'} aria-label="Go to what's playing" className="shrink-0">
				<Cover images={images} type={isEpisode ? 'episode' : 'album'} alt="" size={64} className="h-12 w-12 rounded shadow sm:h-14 sm:w-14" />
			</Link>
			<div className="min-w-0">
				{href ? (
					<Link href={href} className="block truncate text-sm font-medium hover:underline">
						{item.name}
					</Link>
				) : (
					<p className="truncate text-sm font-medium">{item.name}</p>
				)}
				<p className="truncate text-xs text-muted">
					{isEpisode ? item.show?.name : <ArtistLinks artists={item.artists} />}
				</p>
			</div>
			{!isEpisode && <LikeButton uri={uri} name={item.name} saved={isSaved(uri)} className="hidden sm:inline-flex" />}
			{!isEpisode && item.id && (
				<Link
					href={`/radio/${item.id}`}
					aria-label={`Song radio for ${item.name}`}
					title="Song radio"
					className="hidden shrink-0 rounded-full p-1 text-muted transition hover:scale-110 hover:text-fg sm:inline-flex"
				>
					<Radio className="h-4 w-4" />
				</Link>
			)}
		</div>
	);
}

/** Thin progress line for the compact mobile player. */
function MiniProgress() {
	const { progress, duration } = useProgress();
	const pct = duration ? (progress / duration) * 100 : 0;
	return (
		<div className="absolute inset-x-2 bottom-0 h-0.5 overflow-hidden rounded-full bg-fg/20 md:hidden">
			<div className="h-full bg-fg" style={{ width: `${pct}%` }} />
		</div>
	);
}

export default function PlayerBar() {
	const { data: state } = usePlaybackState();
	const c = usePlayerControls();
	const { togglePlay } = c;
	const item = state?.item;
	const isPlaying = Boolean(state?.is_playing);
	const repeat = state?.repeat_state ?? 'off';
	const disallows = state?.actions?.disallows ?? {};
	const hasDevice = Boolean(state?.device);

	// Space = play/pause (unless typing in a field).
	useEffect(() => {
		const onKey = (e) => {
			const t = e.target;
			if (e.code !== 'Space' || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
			if (t?.closest?.('input, textarea, select, button, [role="slider"], [contenteditable="true"]')) return;
			e.preventDefault();
			togglePlay();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [togglePlay]);

	return (
		<footer
			className="relative z-40 border-t border-line bg-surface px-2 pb-[env(safe-area-inset-bottom)] sm:px-4"
			aria-label="Player"
		>
			<div className="grid h-[72px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:h-[var(--player-h)] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] md:gap-4">
				<NowPlaying item={item} context={state?.context} />

				<div className="flex flex-col items-center gap-1">
					<div className="flex items-center gap-1 sm:gap-2">
						<IconButton
							label={state?.shuffle_state ? 'Disable shuffle' : 'Enable shuffle'}
							active={state?.shuffle_state}
							disabled={!hasDevice || disallows.toggling_shuffle}
							onClick={() => c.setShuffle(!state?.shuffle_state)}
							className="hidden md:inline-flex"
						>
							<Shuffle className="h-[18px] w-[18px]" />
						</IconButton>
						<IconButton
							label="Previous"
							disabled={!hasDevice || disallows.skipping_prev}
							onClick={c.previous}
							className="hidden md:inline-flex"
						>
							<SkipBack className="h-5 w-5 fill-current" />
						</IconButton>
						<button
							type="button"
							aria-label={isPlaying ? 'Pause' : 'Play'}
							onClick={c.togglePlay}
							className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg transition hover:scale-105 active:scale-95 md:h-9 md:w-9"
						>
							{isPlaying ? (
								<Pause className="h-5 w-5 fill-current" />
							) : (
								<Play className="h-5 w-5 translate-x-[1px] fill-current" />
							)}
						</button>
						<IconButton label="Next" disabled={!hasDevice || disallows.skipping_next} onClick={c.next}>
							<SkipForward className="h-5 w-5 fill-current" />
						</IconButton>
						<IconButton
							label={repeat === 'off' ? 'Enable repeat' : repeat === 'context' ? 'Enable repeat one' : 'Disable repeat'}
							active={repeat !== 'off'}
							disabled={!hasDevice || disallows.toggling_repeat_context}
							onClick={() => c.setRepeat(NEXT_REPEAT[repeat])}
							className="relative hidden md:inline-flex"
						>
							{repeat === 'track' ? <Repeat1 className="h-[18px] w-[18px]" /> : <Repeat className="h-[18px] w-[18px]" />}
							{repeat !== 'off' && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent" />}
						</IconButton>
					</div>
					<div className="hidden w-full max-w-xl md:block">
						<ProgressBar disabled={!hasDevice || disallows.seeking} />
					</div>
				</div>

				<div className="flex items-center justify-end gap-1">
					<DevicePicker />
					<div className="hidden md:block">
						<VolumeControl />
					</div>
				</div>
			</div>

			{hasDevice && (
				<div
					className={cn(
						'-mx-2 flex items-center justify-center gap-1.5 bg-accent px-3 py-1 text-xs font-semibold text-accent-fg sm:-mx-4 md:hidden',
						!state?.device?.is_active && 'hidden'
					)}
				>
					<DeviceIcon type={state.device.type} className="h-3.5 w-3.5" />
					Listening on {state.device.name}
				</div>
			)}
			<MiniProgress />
		</footer>
	);
}
