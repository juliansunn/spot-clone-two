import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Search lives in the URL (?q=) so results survive refresh, back/forward and
 * can be shared. Typing updates the URL after a short pause.
 */
export default function SearchInput({ className, autoFocus }) {
	const router = useRouter();
	const urlQuery = typeof router.query.q === 'string' ? router.query.q : '';
	const [value, setValue] = useState(urlQuery);
	const inputRef = useRef(null);
	const onSearchPage = router.pathname === '/search';

	// Keep the input in sync with back/forward, and clear it when leaving search.
	useEffect(() => {
		setValue(onSearchPage ? urlQuery : '');
	}, [urlQuery, onSearchPage]);

	useEffect(() => {
		const trimmed = value.trim();
		if (trimmed === urlQuery.trim()) return undefined;
		if (!onSearchPage && !trimmed) return undefined;
		const t = setTimeout(() => {
			const href = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
			if (onSearchPage) router.replace(href, undefined, { shallow: true, scroll: false });
			else router.push(href);
		}, 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// "/" focuses search from anywhere.
	useEffect(() => {
		const onKey = (e) => {
			if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
			if (e.target?.closest?.('input, textarea, [contenteditable="true"]')) return;
			e.preventDefault();
			inputRef.current?.focus();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	return (
		<form
			role="search"
			className={cn('relative w-full max-w-md', className)}
			onSubmit={(e) => {
				e.preventDefault();
				const trimmed = value.trim();
				router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
			}}
		>
			<Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
			<input
				ref={inputRef}
				type="search"
				value={value}
				autoFocus={autoFocus}
				onChange={(e) => setValue(e.target.value)}
				placeholder="What do you want to listen to?"
				aria-label="Search Spotify"
				className="h-11 w-full rounded-full border border-transparent bg-elevated pl-11 pr-10 text-[15px] text-fg shadow-sm transition placeholder:text-subtle hover:border-line focus:border-fg/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
			/>
			{value && (
				<button
					type="button"
					aria-label="Clear search"
					onClick={() => {
						setValue('');
						inputRef.current?.focus();
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
				>
					<X className="h-5 w-5" />
				</button>
			)}
		</form>
	);
}
