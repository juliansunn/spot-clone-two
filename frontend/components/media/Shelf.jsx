import Link from 'next/link';
import { cn } from '@/lib/cn';
import MediaCard, { MediaCardSkeleton } from './MediaCard';

export const CARD_GRID = 'grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-7';

/**
 * A titled section of cards. With `rows={1}` only one row is shown (the rest
 * hidden responsively), and an optional "Show all" link appears.
 */
export default function Shelf({ title, href, items, loading, rows, className, children }) {
	const limited = rows === 1;
	if (!loading && !items?.length && !children) return null;
	return (
		<section className={cn('animate-fade-in', className)}>
			<div className="mb-1 flex items-end justify-between gap-4 px-3">
				<h2 className="text-xl font-bold tracking-tight sm:text-2xl">
					{href ? (
						<Link href={href} className="hover:underline">
							{title}
						</Link>
					) : (
						title
					)}
				</h2>
				{href && (
					<Link href={href} className="shrink-0 text-sm font-semibold text-muted hover:text-fg hover:underline">
						Show all
					</Link>
				)}
			</div>
			{children ?? (
				<div
					className={cn(
						CARD_GRID,
						limited &&
							'[&>*:nth-child(n+3)]:hidden sm:[&>*:nth-child(n+3)]:flex sm:[&>*:nth-child(n+4)]:hidden md:[&>*:nth-child(n+4)]:flex md:[&>*:nth-child(n+5)]:hidden lg:[&>*:nth-child(n+5)]:flex lg:[&>*:nth-child(n+6)]:hidden 2xl:[&>*:nth-child(n+6)]:flex 2xl:[&>*:nth-child(n+8)]:hidden'
					)}
				>
					{loading
						? Array.from({ length: 7 }, (_, i) => <MediaCardSkeleton key={i} />)
						: items.map((item, i) => <MediaCard key={`${item.id}-${i}`} item={item} priority={i < 4} />)}
				</div>
			)}
		</section>
	);
}
