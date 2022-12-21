import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { playlistTrackState } from '../atoms/playlistAtom';
import { endDateState, startDateState } from '../atoms/searchAtom';
import { songListState, trackInfoState } from '../atoms/songAtom';
import MyDatePicker from '../components/DatePicker';
import Layout from '../components/Layout';
import SongTable from '../components/SongTable';
import { format as formatDate } from 'date-fns';
import { useQuery } from 'react-query';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';

function PaginationControls({ currentPage, totalPages, onPageChange }) {
	return (
		<div>
			{currentPage > 1 && (
				<button onClick={() => onPageChange(currentPage - 1)}>Previous</button>
			)}
			{currentPage < totalPages && (
				<button onClick={() => onPageChange(currentPage + 1)}>Next</button>
			)}
		</div>
	);
}

function History() {
	const [playlistTracks, setPlaylistTracks] = useRecoilState(playlistTrackState);

	const [songs, setSongs] = useRecoilState(songListState);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const startDate = useRecoilValue(startDateState);
	const endDate = useRecoilValue(endDateState);
	const [showFilter, setShowFilter] = useState(true);
	const format = 'yyyy-MM-dd';
	const { data, error, isLoading } = useQuery(
		['api', currentPage, startDate, endDate],
		async () => {
			const res = await fetch(
				`${
					process.env.NEXT_PUBLIC_API_URL
				}/play-history/?page=${currentPage}&start_date=${formatDate(
					startDate,
					format
				)}&end_date=${formatDate(endDate, format)}`
			);
			const data = await res.json();
			setSongs(data.results);
			setTotalPages(data.total_pages);
		}
	);

	const toggleFilter = () => {
		setShowFilter(!showFilter);
	};
	const handlePageChange = (page) => {
		setCurrentPage(page);
	};

	return (
		<Layout>
			{showFilter && (
				<div className="relative">
					<div className="grid grid-cols-6">
						<div className="col-start-1 col-end-7 md:col-start-2 md:col-span-4">
							<MyDatePicker />
							<div className="flex justify-center items-center">
								<Pagination
									numPages={totalPages}
									currentPage={currentPage}
									pageChange={handlePageChange}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			<button
				className="flex items-center space-x-2 hover:text-green-500"
				onClick={toggleFilter}
			>
				{showFilter ? (
					<ChevronUpIcon className="h-5 w-5" />
				) : (
					<ChevronDownIcon className="h-5 w-5" />
				)}
			</button>

			{isLoading && <Loading />}
			{error && <div>Oops An Error occurred: {error.message}</div>}
			{!isLoading && <SongTable type="history" songs={songs} />}
		</Layout>
	);
}

export default History;
