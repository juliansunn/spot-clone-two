import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { describeError } from '@/lib/spotify';

export function Spinner({ className }) {
	return <Loader2 className={cn('h-5 w-5 animate-spin text-muted', className)} aria-label="Loading" />;
}

export function EmptyState({ icon: Icon, title, children, action, className }) {
	return (
		<div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
			{Icon && (
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-muted">
					<Icon className="h-6 w-6" />
				</div>
			)}
			<h3 className="text-lg font-semibold">{title}</h3>
			{children && <p className="max-w-md text-sm text-muted">{children}</p>}
			{action}
		</div>
	);
}

export function ErrorState({ error, onRetry, title = "Couldn't load this", className }) {
	const notFound = error?.status === 404;
	return (
		<EmptyState
			icon={AlertTriangle}
			title={notFound ? 'Not available' : title}
			className={className}
			action={
				onRetry && !notFound ? (
					<button
						type="button"
						onClick={onRetry}
						className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-bg transition hover:scale-105"
					>
						Try again
					</button>
				) : null
			}
		>
			{notFound
				? "This item doesn't exist or isn't available to this app."
				: describeError(error)}
		</EmptyState>
	);
}

export function Skeleton({ className }) {
	return <div className={cn('skeleton', className)} />;
}
