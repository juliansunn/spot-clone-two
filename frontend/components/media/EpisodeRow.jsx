import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Cover from '@/components/ui/Cover';
import PlayButton from './PlayButton';
import { cn } from '@/lib/cn';
import { cleanDescription, formatDate, formatLongDuration } from '@/lib/format';
import { useNowPlaying } from '@/hooks/usePlayback';

function EpisodeRow({ episode, onPlay }) {
	const now = useNowPlaying();
	const current = now.id === episode.id;
	const resume = episode.resume_point;
	const played = resume?.fully_played;
	const pct = !played && resume?.resume_position_ms ? (resume.resume_position_ms / episode.duration_ms) * 100 : 0;
	const remaining = pct ? episode.duration_ms - resume.resume_position_ms : 0;
	const playable = episode.is_playable !== false;

	return (
		<article
			className={cn(
				'group flex gap-4 border-b border-line/60 px-4 py-4 transition hover:bg-hover/40 sm:px-6',
				!playable && 'opacity-50'
			)}
		>
			<Cover images={episode.images} type="episode" alt="" size={120} className="hidden h-28 w-28 shrink-0 rounded-lg sm:block" />
			<div className="min-w-0 flex-1">
				<h3 className={cn('line-clamp-2 font-semibold', current && 'text-accent')}>
					{episode.explicit && (
						<span className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-muted/70 align-[2px] text-[9px] font-bold text-bg">
							E
						</span>
					)}
					{episode.name}
				</h3>
				<p className="mt-1 line-clamp-2 text-sm text-muted">{cleanDescription(episode.description)}</p>
				<div className="mt-3 flex items-center gap-4">
					<PlayButton
						size="sm"
						playing={current && now.isPlaying}
						label={`${current && now.isPlaying ? 'Pause' : 'Play'} ${episode.name}`}
						onClick={() => playable && onPlay(episode)}
						className="bg-fg text-bg"
					/>
					<span className="text-sm text-muted">
						{formatDate(episode.release_date)} ·{' '}
						{remaining ? `${formatLongDuration(remaining)} left` : formatLongDuration(episode.duration_ms)}
					</span>
					{pct > 0 && (
						<span className="hidden h-1 w-24 overflow-hidden rounded-full bg-fg/20 sm:block">
							<span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
						</span>
					)}
					{played && <CheckCircle2 className="h-4 w-4 text-accent" aria-label="Played" />}
				</div>
			</div>
		</article>
	);
}

export default memo(EpisodeRow);
