import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { signOut, useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import { getStoredTheme, storeTheme } from '@/lib/store';
import { setAccessToken } from '@/lib/spotify';
import { stopWebPlayer } from '@/lib/webPlayer';

function useTheme() {
	// Only rendered inside the (closed-by-default) menu, so reading storage
	// on the client can't cause a hydration mismatch.
	const [theme, setTheme] = useState(() => (typeof window === 'undefined' ? 'dark' : getStoredTheme()));
	const toggle = () => {
		const next = theme === 'dark' ? 'light' : 'dark';
		setTheme(next);
		storeTheme(next);
		document.documentElement.classList.toggle('dark', next === 'dark');
	};
	return { theme, toggle };
}

const itemClass =
	'flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm outline-none data-[highlighted]:bg-hover';

export default function UserMenu() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const { theme, toggle } = useTheme();
	const user = session?.user;
	const initial = (user?.name ?? '?').trim().charAt(0).toUpperCase();

	return (
		<Dropdown.Root>
			<Dropdown.Trigger
				aria-label="Account menu"
				className="flex h-9 items-center gap-2 rounded-full bg-black/40 p-0.5 pr-0.5 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-black/60 sm:pr-3 dark:bg-black/50"
			>
				{user?.image ? (
					<img src={user.image} alt="" className="h-8 w-8 rounded-full object-cover" />
				) : (
					<span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-fg">{initial}</span>
				)}
				<span className="hidden max-w-[10rem] truncate sm:inline">{user?.name}</span>
			</Dropdown.Trigger>
			<Dropdown.Portal>
				<Dropdown.Content
					align="end"
					sideOffset={8}
					className="z-[60] min-w-[14rem] animate-fade-in rounded-xl border border-line bg-elevated outline-none focus-visible:ring-0 p-1.5 text-fg shadow-2xl"
				>
					{user?.name && <div className="truncate px-3 pb-2 pt-1.5 text-xs text-muted">Signed in as {user.name}</div>}
					<Dropdown.Item
						className={itemClass}
						onSelect={(e) => {
							e.preventDefault();
							toggle();
						}}
					>
						{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
						{theme === 'dark' ? 'Light mode' : 'Dark mode'}
					</Dropdown.Item>
					{user?.id && (
						<Dropdown.Item asChild className={itemClass}>
							<a href={`https://open.spotify.com/user/${user.id}`} target="_blank" rel="noreferrer">
								<ExternalLink className="h-4 w-4" />
								Spotify profile
							</a>
						</Dropdown.Item>
					)}
					<Dropdown.Separator className="my-1 h-px bg-line" />
					<Dropdown.Item
						className={itemClass}
						onSelect={() => {
							stopWebPlayer();
							queryClient.clear();
							setAccessToken(null);
							signOut({ callbackUrl: '/login' });
						}}
					>
						<LogOut className="h-4 w-4" />
						Log out
					</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown.Portal>
		</Dropdown.Root>
	);
}
