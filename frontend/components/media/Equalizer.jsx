import { cn } from '@/lib/cn';

/** Animated "now playing" bars; static when paused. */
export default function Equalizer({ playing = true, className }) {
	return (
		<span className={cn('inline-flex h-3.5 items-end gap-[2px]', className)} aria-hidden>
			{[0, 0.25, 0.5].map((delay) => (
				<span
					key={delay}
					className={cn('w-[3px] origin-bottom rounded-sm bg-accent', playing ? 'h-full animate-eq' : 'h-1/3')}
					style={{ animationDelay: `${delay}s` }}
				/>
			))}
		</span>
	);
}
