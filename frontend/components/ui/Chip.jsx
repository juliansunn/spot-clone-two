import { cn } from '@/lib/cn';

export default function Chip({ active, className, children, ...props }) {
	return (
		<button
			type="button"
			aria-pressed={active}
			className={cn(
				'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
				active ? 'bg-fg text-bg' : 'bg-elevated text-fg hover:bg-hover',
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}
