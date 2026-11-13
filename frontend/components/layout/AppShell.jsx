import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as Dialog from '@radix-ui/react-dialog';
import { Home, Library, Search } from 'lucide-react';
import PlayerBar from '@/components/player/PlayerBar';
import WebPlayerBridge from '@/components/player/WebPlayerBridge';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/lib/store';

const MOBILE_TABS = [
	{ href: '/', label: 'Home', icon: Home },
	{ href: '/search', label: 'Search', icon: Search },
	{ href: '/library', label: 'Library', icon: Library }
];

export default function AppShell({ children }) {
	const router = useRouter();
	const mainRef = useRef(null);
	const sidebarOpen = useUiStore((s) => s.sidebarOpen);
	const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

	// <main> is the scroll container, so reset it ourselves on navigation
	// (except shallow search-as-you-type updates) and close the mobile drawer.
	useEffect(() => {
		const onDone = (_url, { shallow }) => {
			setSidebarOpen(false);
			if (!shallow) mainRef.current?.scrollTo({ top: 0 });
		};
		router.events.on('routeChangeComplete', onDone);
		return () => router.events.off('routeChangeComplete', onDone);
	}, [router.events, setSidebarOpen]);

	return (
		<div className="flex h-[100dvh] flex-col overflow-hidden bg-bg">
			<a
				href="#main"
				className="sr-only z-[100] rounded bg-accent px-3 py-2 text-accent-fg focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
			>
				Skip to content
			</a>
			<div className="flex min-h-0 flex-1 gap-2 p-0 lg:p-2">
				<Sidebar className="hidden w-72 shrink-0 lg:flex xl:w-80" />

				<Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
					<Dialog.Portal>
						<Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" />
						<Dialog.Content
							aria-describedby={undefined}
							className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-xs animate-fade-in flex-col bg-bg p-2 shadow-2xl lg:hidden"
						>
							<Dialog.Title className="sr-only">Navigation</Dialog.Title>
							<Sidebar className="h-full" />
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>

				<main
					id="main"
					ref={mainRef}
					tabIndex={-1}
					className="scroll-area relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-surface outline-none lg:rounded-xl"
				>
					<TopBar scrollRef={mainRef} />
					<div className="min-h-[calc(100%-4rem)] pb-10">{children}</div>
				</main>
			</div>

			<WebPlayerBridge />
			<PlayerBar />

			<nav aria-label="Primary" className="grid grid-cols-3 border-t border-line bg-surface lg:hidden">
				{MOBILE_TABS.map(({ href, label, icon: Icon }) => {
					const active = href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);
					return (
						<Link
							key={href}
							href={href}
							aria-current={active ? 'page' : undefined}
							className={cn(
								'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
								active ? 'text-fg' : 'text-muted'
							)}
						>
							<Icon className="h-5 w-5" />
							{label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
