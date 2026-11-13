import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/lib/store';
import SearchInput from './SearchInput';
import UserMenu from './UserMenu';

export default function TopBar({ scrollRef }) {
	const router = useRouter();
	const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
	const [scrolled, setScrolled] = useState(false);
	const onSearchPage = router.pathname === '/search';

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return undefined;
		const onScroll = () => setScrolled(el.scrollTop > 40);
		onScroll();
		el.addEventListener('scroll', onScroll, { passive: true });
		return () => el.removeEventListener('scroll', onScroll);
	}, [scrollRef]);

	const navBtn =
		'hidden h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:inline-flex';

	return (
		<div
			className={cn(
				'sticky top-0 z-30 flex h-16 items-center gap-2 px-3 transition-colors duration-300 sm:px-6',
				scrolled ? 'bg-surface/95 shadow-sm backdrop-blur' : 'bg-transparent'
			)}
		>
			<button
				type="button"
				aria-label="Open menu"
				onClick={() => setSidebarOpen(true)}
				className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg hover:bg-hover lg:hidden"
			>
				<Menu className="h-5 w-5" />
			</button>
			<button type="button" aria-label="Go back" onClick={() => router.back()} className={navBtn}>
				<ChevronLeft className="h-5 w-5" />
			</button>
			<button type="button" aria-label="Go forward" onClick={() => window.history.forward()} className={navBtn}>
				<ChevronRight className="h-5 w-5" />
			</button>
			<div className={cn('mx-1 min-w-0 flex-1 sm:mx-3', !onSearchPage && 'hidden md:block')}>
				<SearchInput autoFocus={onSearchPage && !router.query.q} />
			</div>
			{!onSearchPage && <div className="flex-1 md:hidden" />}
			<UserMenu />
		</div>
	);
}
