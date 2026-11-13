import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function PlayButton({ playing, onClick, size = 'md', className, label }) {
	const Icon = playing ? Pause : Play;
	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onClick?.(e);
			}}
			aria-label={label ?? (playing ? 'Pause' : 'Play')}
			className={cn(
				'inline-flex shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg shadow-black/30 transition hover:scale-105 hover:brightness-110 active:scale-95',
				size === 'sm' && 'h-10 w-10',
				size === 'md' && 'h-12 w-12',
				size === 'lg' && 'h-14 w-14',
				className
			)}
		>
			<Icon className={cn('fill-current', size === 'sm' ? 'h-4 w-4' : 'h-5 w-5', !playing && 'translate-x-[1px]')} />
		</button>
	);
}
