import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
	HomeIcon,
	SearchIcon,
	LibraryIcon,
	HeartIcon,
	RssIcon,
	LogoutIcon,
	BookOpenIcon
} from '@heroicons/react/outline';
import Loading from '../components/Loading';

import usePlaylists from '../hooks/usePlaylists';
import { PlayIcon } from '@heroicons/react/solid';

function Sidebar() {
	const { playlists, loading, playlistId, setPlaylistId } = usePlaylists();

	const handleSelected = (playlistId) => {
		setPlaylistId(playlistId);
	};

	return (
		<div>
			<div className="h-full px-3 pb-4 relative space-y-4 text-zinc-900 dark:text-zinc-500 p-5 text-xs md:text-sm  border-zinc-600 ">
				<ul className="space-y-1">
					<li>
						<Link
							href="/login"
							onClick={() => signOut()}
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<LogoutIcon className="w-6 h-6" />
								<span className="ml-3">Logout</span>
							</>
						</Link>
					</li>
					<li>
						<Link
							href="/"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<HomeIcon className="w-6 h-6" />
								<span className="ml-3">Home</span>
							</>
						</Link>
					</li>
					<li>
						<Link
							href="/search"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<SearchIcon className="w-6 h-6" />
								<span className="ml-3">Search</span>
							</>
						</Link>
					</li>
					<li>
						<Link
							href="/library"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<LibraryIcon className="w-6 h-6" />
								<span className="ml-3">Library</span>
							</>
						</Link>
					</li>
					<li>
						<Link
							href="/history"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<BookOpenIcon className="w-6 h-6" />
								<span className="ml-3">History</span>
							</>
						</Link>
					</li>
					<hr className="border-t[0.1px] border-zinc-900 dark:border-zinc-400" />
					<li>
						<Link
							href="/liked-songs"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<HeartIcon className="w-6 h-6" />
								<span className="ml-3">Liked Songs</span>
							</>
						</Link>
					</li>
					<li>
						<Link
							href="/episodes"
							className="flex items-center p-2  font-normal text-zinc-900 rounded-lg dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-green-500 dark:hover:text-white transition duration-200"
						>
							<>
								<RssIcon className="w-6 h-6" />
								<span className="ml-3">Your Episodes</span>
							</>
						</Link>
					</li>
					<hr className="border-t[0.1px] border-zinc-900 dark:border-zinc-400" />
					<div className="space-y-4 h-screen overflow-y-scroll scrollbar-hide pb-96">
						{loading ? (
							<Loading />
						) : (
							playlists?.map((playlist) => (
								<Link href="/playlist" key={playlist.id}>
									<div className="flex space-x-1 mb-2">
										{playlistId === playlist.id && (
											<PlayIcon className="h-5 w-5 text-green-500" />
										)}
										<p
											key={playlist.id}
											onClick={() => handleSelected(playlist.id)}
											className="cursor-pointer hover:text-green-500 dark:hover:text-white"
										>
											{playlist.name}
										</p>
									</div>
								</Link>
							))
						)}
					</div>
				</ul>
			</div>
		</div>
	);
}

export default Sidebar;
