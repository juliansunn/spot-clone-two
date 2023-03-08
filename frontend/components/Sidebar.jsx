import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
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

	const sidebarVariants = {
		open: {
			x: 0
		},
		closed: {
			x: '-100%'
		}
	};

	const sidebarTransition = {
		duration: 0.5,
		ease: 'easeInOut'
	};

	const handleSelected = (playlistId) => {
		setPlaylistId(playlistId);
	};

	return (
		<motion.div
			className="sidebar"
			initial={isOpen ? 'closed' : 'open'}
			animate={isOpen ? 'open' : 'closed'}
			exit={{ width: 0, transition: { delay: 0.7, duration: 0.3 } }}
			variants={sidebarVariants}
			transition={sidebarTransition}
		>
			<div className="relative space-y-4 text-gray-900 dark:text-gray-500 p-5 text-xs lg:text-sm border-r border-gray-600 sm:max-w-[12rem] lg:max-w-[15rem] sm:min-w-[12rem] lg:min-w-[15rem]">
				<button
					className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white "
					onClick={() => signOut()}
				>
					<LogoutIcon className="h-5 w-5" />
					<p>Logout</p>
				</button>
				<Link href="/">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<HomeIcon className="h-5 w-5" />
						<p>Home</p>
					</button>
				</Link>
				<Link href="/search">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<SearchIcon className="h-5 w-5" />
						<p>Search</p>
					</button>
				</Link>
				<Link href="/library">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<LibraryIcon className="h-5 w-5" />
						<p>Library</p>
					</button>
				</Link>
				<Link href="/history">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<BookOpenIcon className="h-5 w-5" />
						<p>History</p>
					</button>
				</Link>

				<hr className="border-t[0.1px] border-gray-900 dark:border-gray-400" />
				<Link href="/liked-songs">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<HeartIcon className="h-5 w-5" />
						<p>Liked Songs</p>
					</button>
				</Link>
				<Link href="/episodes">
					<button className="flex items-center space-x-2 hover:text-green-500 dark:hover:text-white">
						<RssIcon className="h-5 w-5" />
						<p>Your Episodes</p>
					</button>
				</Link>
				<hr className="border-t[0.1px] border-gray-900 dark:border-gray-400" />
			</div>
			<div
				className="text-gray-900 dark:text-gray-500 p-5 text-xs lg:text-sm border-r border-gray-600
        overflow-y-scroll h-screen scrollbar-hide sm:max-w-[12rem] lg:max-w-[15rem] sm:min-w-[12rem] lg:min-w-[15rem] md:inline-flex"
			>
				<div className="space-y-4">
					{playlists?.map((playlist) => (
						<Link href="/playlist" key={playlist.id}>
							<div className="flex space-x-2 ">
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
			</div>
		</motion.div>
	);
}

export default Sidebar;
