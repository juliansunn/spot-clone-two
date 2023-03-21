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
import { useRecoilValue } from 'recoil';

import { sidebarVisibilityState } from '../atoms/visibilityAtom';
import usePlaylists from '../hooks/usePlaylists';
import { PlayIcon } from '@heroicons/react/solid';

function Sidebar() {
	const { playlists, playlistId, setPlaylistId } = usePlaylists();
	const isOpen = useRecoilValue(sidebarVisibilityState);

	const handleSelected = (playlistId) => {
		setPlaylistId(playlistId);
	};

	return (
		<div>
			<div class="h-full px-3 pb-4 bg-white dark:bg-gray-800 relative space-y-4 text-gray-900 dark:text-gray-500 p-5 text-xs md:text-sm lg:text-lg  border-gray-600 ">
				<ul class="space-y-1">
					<li>
						<Link href="/login" onClick={() => signOut()}>
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<LogoutIcon className="w-6 h-6" />
								<span class="ml-3">Logout</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<HomeIcon className="w-6 h-6" />
								<span class="ml-3">Home</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/search">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<SearchIcon className="w-6 h-6" />
								<span class="ml-3">Search</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/library">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<LibraryIcon className="w-6 h-6" />
								<span class="ml-3">Library</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/history">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<BookOpenIcon className="w-6 h-6" />
								<span class="ml-3">History</span>
							</a>
						</Link>
					</li>
					<hr className="border-t[0.1px] border-gray-900 dark:border-gray-400" />
					<li>
						<Link href="/liked-songs">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<HeartIcon className="w-6 h-6" />
								<span class="ml-3">Liked Songs</span>
							</a>
						</Link>
					</li>
					<li>
						<Link href="/episodes">
							<a className="flex items-center p-2  font-normal text-gray-900 rounded-lg dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 dark:hover:text-white transition duration-200">
								<RssIcon className="w-6 h-6" />
								<span class="ml-3">Your Episodes</span>
							</a>
						</Link>
					</li>
					<hr className="border-t[0.1px] border-gray-900 dark:border-gray-400" />
					<div className="space-y-4 h-screen overflow-y-scroll scrollbar-hide">
						{playlists?.map((playlist) => (
							<Link href="/playlist" key={playlist.id}>
								<div className="flex space-x-1 ">
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
						))}
					</div>
				</ul>
			</div>
		</div>
	);
}

export default Sidebar;
