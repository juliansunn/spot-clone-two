import { Heart } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useToggleSaved } from '@/hooks/useLibrary';

export default function LikeButton({ uri, name, saved, className, size = 16 }) {
	const toggle = useToggleSaved();
	if (!uri) return null;
	return (
		<button
			type="button"
			aria-label={saved ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
			aria-pressed={saved}
			onClick={(e) => {
				e.stopPropagation();
				toggle.mutate({ uri, name, saved });
			}}
			className={cn(
				'inline-flex items-center justify-center rounded-full p-1 transition hover:scale-110 active:scale-95',
				saved ? 'text-accent' : 'text-muted hover:text-fg',
				className
			)}
		>
			<Heart style={{ width: size, height: size }} className={cn(saved && 'fill-current')} />
		</button>
	);
}
