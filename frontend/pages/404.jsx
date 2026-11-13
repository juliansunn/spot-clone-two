import Link from 'next/link';
import { Compass } from 'lucide-react';
import { EmptyState } from '@/components/ui/States';

export default function NotFound() {
	return (
		<EmptyState
			icon={Compass}
			title="Page not found"
			className="min-h-[60vh]"
			action={
				<Link href="/" className="rounded-full bg-fg px-5 py-2 text-sm font-semibold text-bg transition hover:scale-105">
					Go home
				</Link>
			}
		>
			We couldn&apos;t find what you were looking for.
		</EmptyState>
	);
}
