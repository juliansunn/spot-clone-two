import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { getPageList } from '../lib/utility';
import React from 'react';

const Pagination = ({ numPages, currentPage, pageChange }) => {
	const pages = getPageList(numPages, currentPage, 7);
	return (
		<nav aria-label="Page navigation example">
			<ul class="inline-flex items-center -space-x-px">
				<li>
					<button
						onClick={() => pageChange(currentPage != 1 ? currentPage - 1 : 1)}
						style={{ pointerEvents: currentPage === 1 ? 'none' : '' }}
						class="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
					>
						<ChevronLeftIcon className="h-5 w-5" />
					</button>
				</li>
				{pages.map((p) => (
					<li>
						<button
							onClick={() => pageChange(p)}
							style={{ pointerEvents: p === 0 ? 'none' : '' }}
							class={`px-3 py-2 leading-tight text-gray-500 ${
								currentPage === p ? 'bg-gray-300 dark:bg-gray-700' : 'bg-white'
							} border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
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
						class="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white "
					>
						<ChevronRightIcon className="h-5 w-5" />
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
