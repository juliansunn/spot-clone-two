import Link from 'next/link';
import React, { useRef, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { searchQueryState } from '../atoms/searchAtom';
import { sidebarVisibilityState } from '../atoms/visibilityAtom';
import { ArrowsExpandIcon } from '@heroicons/react/outline';

function SearchBar({ toggleSidebar }) {
	const searchParams = useRef();
	const setSearchQuery = useSetRecoilState(searchQueryState);
	const setSearchResults = () => {
		setSearchQuery(searchParams.current.value);
	};

	return (
		<div>
			<form>
				<div className="relative w-full rounded-full border-gray-300 border-2 ">
					<input
						ref={searchParams}
						type="search"
						id="search-dropdown"
						className="opacity-60 block p-2.5 w-full z-60 text-sm text-gray-900 bg-white rounded-full focus:opacity-90  dark:placeholder-gray-900 dark:text-black"
						placeholder="Search Artists, Albums, Podcasts..."
						required
					/>
					<Link href="/search">
						<button
							className="absolute opacity-90 hover:opacity-70 top-0 right-0 p-2.5 text-sm font-medium text-white bg-gray-900 rounded-r-full"
							onClick={setSearchResults}
						>
							<svg
								aria-hidden="true"
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinejoin="round"
									strokeLinecap="round"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								></path>
							</svg>
						</button>
					</Link>
				</div>
			</form>
		</div>
	);
}

export default SearchBar;
