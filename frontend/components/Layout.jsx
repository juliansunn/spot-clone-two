import React, { useState } from 'react';
import Head from 'next/head';
import Sidebar from './Sidebar';
import Player from './Player';
import { signOut, useSession } from 'next-auth/react';
import { ChevronDownIcon, MenuIcon } from '@heroicons/react/outline';
import SearchBar from './SearchBar';
import { ThemeProvider } from './Theme/ThemeContext';
import Background from './Theme/Background';
import Theme from './Theme/Toggle';
import ReactModal from 'react-modal';
import useSpotify from '../hooks/useSpotify';

function Layout({ children }) {
	const { data: session } = useSession();
	const [sidebarVisibility, setSidebarVisibility] = useState(false);

	const toggleSidebar = () => {
		setSidebarVisibility((prev) => !prev);
	};
	return (
		<ThemeProvider>
			<Background>
				<Head>
					<title>Antefy</title>
				</Head>
				<div className="flex flex-col h-screen overflow-y-scroll scrollbar-hide border-zinc-200 dark:border-zinc-700">
					<nav className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700">
						<div className="px-3 py-3 lg:px-5 lg:pl-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center justify-start w-3/4">
									<MenuIcon
										className="inline-flex items-center p-2 mx-2 text-sm text-zinc-500 rounded-lg hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:focus:ring-zinc-600 h-10 w-10"
										onClick={toggleSidebar}
									/>

									<div className="w-3/4 md:w-5/12">
										<SearchBar />
									</div>
								</div>

								<div className="right-2 hidden md:inline-flex justify-end w-1/4">
									<div
										className="flex items-center sticky top-0 bg-zinc-300 dark:bg-zinc-700  space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2"
										onClick={signOut}
									>
										<img
											className="rounded-full w-6 h-6"
											src={session?.user.image}
											alt="user_profile_pic"
										/>
										<h2>{session?.user.name}</h2>
										<ChevronDownIcon className="h-5 w-5" />
									</div>
									<Theme />
								</div>
							</div>
						</div>
					</nav>
					<div className="flex-grow w-full">{children}</div>
					<div className="fixed bottom-0 z-5 w-full">
						<Player />
					</div>
				</div>

				{/* {sidebarVisibility && <Sidebar />} */}
				<ReactModal
					className="fixed top-0 left-0 z-40  h-screen bg-zinc-200 border-r border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 max-w-[12rem] sm:max-w-[12rem] lg:max-w-[15rem] sm:min-w-[12rem] lg:min-w-[15rem] pb-20 pt-12"
					onRequestClose={toggleSidebar}
					isOpen={sidebarVisibility}
					ariaHideApp={false}
				>
					<Sidebar />
				</ReactModal>
			</Background>
		</ThemeProvider>
	);
}

export default Layout;
