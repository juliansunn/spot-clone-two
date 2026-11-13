import Cover from '@/components/ui/Cover';
import { useImageColor } from '@/hooks/useImageColor';
import { pickImage } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/States';

/** Hero header used by playlist / album / artist / show / liked-songs pages. */
export default function CollectionHeader({ label, title, images, coverType, cover, meta, description, seed, loading }) {
	const color = useImageColor(pickImage(images, 64), seed || title);
	const long = (title?.length ?? 0) > 28;

	return (
		<header className="relative -mt-16 overflow-hidden pt-16">
			<div
				aria-hidden
				className="absolute inset-0 transition-colors duration-700"
				style={{ background: `linear-gradient(180deg, ${color} 0%, ${color} 35%, transparent 100%)` }}
			/>
			<div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/10 to-surface" />
			<div className="relative flex flex-col items-center gap-5 px-4 pb-6 pt-6 sm:flex-row sm:items-end sm:px-6 sm:pt-10">
				{loading ? (
					<Skeleton className="h-44 w-44 shrink-0 sm:h-52 sm:w-52" />
				) : (
					(cover ?? (
						<Cover
							images={images}
							type={coverType}
							alt=""
							size={300}
							priority
							className="h-44 w-44 shrink-0 shadow-2xl shadow-black/50 sm:h-52 sm:w-52 lg:h-56 lg:w-56"
						/>
					))
				)}
				<div className="flex min-w-0 flex-col items-center gap-2 text-center text-white sm:items-start sm:text-left">
					{loading ? (
						<>
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-12 w-72" />
							<Skeleton className="h-4 w-48" />
						</>
					) : (
						<>
							{label && <span className="text-xs font-semibold uppercase tracking-widest text-white/80">{label}</span>}
							<h1
								className={cn(
									'line-clamp-2 font-extrabold tracking-tight drop-shadow-md',
									long ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-5xl lg:text-7xl'
								)}
							>
								{title}
							</h1>
							{description && <p className="line-clamp-2 max-w-3xl text-sm text-white/75">{description}</p>}
							{meta && (
								<div className="flex flex-wrap items-center justify-center gap-x-1.5 text-sm text-white/90 sm:justify-start">
									{meta}
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</header>
	);
}

export function Dot() {
	return <span aria-hidden className="text-white/60">•</span>;
}

/** Row of primary actions under the header (big play button etc). */
export function ActionBar({ children }) {
	return <div className="flex items-center gap-4 px-4 py-4 sm:px-6">{children}</div>;
}
