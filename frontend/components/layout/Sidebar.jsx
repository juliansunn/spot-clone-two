import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart, History, Home, Library, Search, Volume2, X } from 'lucide-react';
import Cover from '@/components/ui/Cover';
import { Skeleton } from '@/components/ui/States';
import Logo from './Logo';
import { cn } from '@/lib/cn';
import { useMyPlaylists } from '@/hooks/useLibrary';
import { useNowPlaying } from '@/hooks/usePlayback';

const NAV = [
	{ href: '/', label: 'Home', icon: Home },
	{ href: '/search', label: 'Search', icon: Search },
	{ href: '/library', label: 'Your Library', icon: Library },
	{ href: '/liked-songs', label: 'Liked Songs', icon: Heart },
	{ href: '/history', label: 'Listening History', icon: History }
];

function isActive(router, href) {
	return href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);
}

export default function Sidebar({ className }) {
	const router = useRouter();
	const { data: playlists, isLoading } = useMyPlaylists();
	const { contextUri, isPlaying } = useNowPlaying();
	const [filter, setFilter] = useState('');

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		return q ? playlists?.filter((p) => p.name?.toLowerCase().includes(q)) : playlists;
	}, [playlists, filter]);

	return (
		<aside className={cn('flex min-h-0 flex-col gap-2', className)} aria-label="Sidebar">
			<nav className="rounded-xl bg-surface px-3 py-4">
				<Logo className="mb-4 px-3" />
				<ul className="space-y-0.5">
					{NAV.map(({ href, label, icon: Icon }) => {
						const active = isActive(router, href);
						return (
							<li key={href}>
								<Link
									href={href}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition',
										active ? 'bg-hover/60 text-fg' : 'text-muted hover:text-fg'
									)}
								>
									<Icon className={cn('h-5 w-5', active && href === '/liked-songs' && 'fill-current')} />
									{label}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			<section className="flex min-h-0 flex-1 flex-col rounded-xl bg-surface">
				<div className="flex items-center justify-between px-6 pb-2 pt-4">
					<h2 className="text-sm font-bold text-muted">Your playlists</h2>
					{playlists?.length > 0 && <span className="text-xs text-subtle">{playlists.length}</span>}
				</div>
				{playlists?.length > 8 && (
					<div className="relative mx-4 mb-2">
						<Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
						<input
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							placeholder="Filter playlists"
							aria-label="Filter playlists"
							className="h-8 w-full rounded-md bg-elevated pl-8 pr-7 text-sm placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-line"
						/>
						{filter && (
							<button
								type="button"
								aria-label="Clear filter"
								onClick={() => setFilter('')}
								className="absolute right-1.5 top-1/2 -translate-y-1/2 text-subtle hover:text-fg"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				)}
				<ul className="scroll-area min-h-0 flex-1 overflow-y-auto px-2 pb-3">
					{isLoading &&
						Array.from({ length: 8 }, (_, i) => (
							<li key={i} className="flex items-center gap-3 px-2 py-1.5">
								<Skeleton className="h-11 w-11 shrink-0" />
								<div className="flex-1 space-y-1.5">
									<Skeleton className="h-3.5 w-3/4" />
									<Skeleton className="h-3 w-1/3" />
								</div>
							</li>
						))}
					{filtered?.map((p) => {
						const active = router.query.playlistId === p.id;
						const playing = contextUri === p.uri;
						return (
							<li key={p.id}>
								<Link
									href={`/playlist/${p.id}`}
									aria-current={active ? 'page' : undefined}
									className={cn(
										'flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-hover/60',
										active && 'bg-hover/80'
									)}
								>
									<Cover images={p.images} type="playlist" alt="" size={64} className="h-11 w-11 shrink-0 rounded" />
									<span className="min-w-0 flex-1">
										<span className={cn('block truncate text-[15px]', playing && 'text-accent')}>{p.name}</span>
										<span className="block truncate text-xs text-muted">
											Playlist · {p.owner?.display_name}
										</span>
									</span>
									{playing && isPlaying && <Volume2 className="h-4 w-4 shrink-0 text-accent" aria-label="Playing" />}
								</Link>
							</li>
						);
					})}
					{filtered && filtered.length === 0 && (
						<li className="px-4 py-6 text-center text-sm text-muted">
							{filter ? 'No playlists match.' : 'No playlists yet.'}
						</li>
					)}
				</ul>
			</section>
		</aside>
	);
}
