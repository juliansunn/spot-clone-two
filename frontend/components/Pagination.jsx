import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { getPageList } from '../lib/utility';
import React from 'react';

const Pagination = ({ numPages, currentPage, pageChange }) => {
	const pages = getPageList(numPages, currentPage, 7);
	return (
		<nav aria-label="Page navigation example">
			<ul className="inline-flex items-center -space-x-px">
				<li>
					<button
						onClick={() => pageChange(currentPage != 1 ? currentPage - 1 : 1)}
						style={{ pointerEvents: currentPage === 1 ? 'none' : '' }}
						className="block px-3 py-2 ml-0 leading-tight text-zinc-500 bg-white border border-zinc-300 rounded-l-lg hover:bg-zinc-100 hover:text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
					>
						<ChevronLeftIcon className="h-5 w-5" />
					</button>
				</li>
				{pages.map((p) => (
					<li key={p}>
						<button
							onClick={() => pageChange(p)}
							style={{ pointerEvents: p === 0 ? 'none' : '' }}
							className={`px-3 py-2 leading-tight text-zinc-500 ${
								currentPage === p ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-white'
							} border border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white`}
						>
							{p === 0 ? '...' : p}
						</button>
					</li>
				))}
				<li>
					<button
						onClick={() =>
							pageChange(currentPage != numPages ? currentPage + 1 : numPages)
						}
						style={{ pointerEvents: currentPage === numPages ? 'none' : '' }}
						className="block px-3 py-2 ml-0 leading-tight text-zinc-500 bg-white border border-zinc-300 rounded-r-lg hover:bg-zinc-100 hover:text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white "
					>
						<ChevronRightIcon className="h-5 w-5" />
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
