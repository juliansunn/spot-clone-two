import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { endDateState, startDateState } from '../atoms/searchAtom';
import { songListState } from '../atoms/songAtom';
import MyDatePicker from '../components/DatePicker';
import Layout from '../components/Layout';
import SongTable from '../components/SongTable';
import { format as formatDate } from 'date-fns';
import { useQuery } from 'react-query';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import { historyHeaders } from '../lib/utility';
import useAxios from '../utils/axiosInstance';

function History() {
	const [songs, setSongs] = useRecoilState(songListState);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const startDate = useRecoilValue(startDateState);
	const endDate = useRecoilValue(endDateState);
	const [showFilter, setShowFilter] = useState(true);
	const format = 'yyyy-MM-dd';
	const { axiosInstance, user } = useAxios();

	const { error, isLoading } = useQuery(
		['sp-api', currentPage, startDate, endDate],
		async () => {
			axiosInstance.instance
				.get('/play-history/', {
					params: {
						page: currentPage,
						start_date: formatDate(startDate, format),
						end_date: formatDate(endDate, format)
					}
				})
				.then((response) => {
					if (response.status === 200) {
						setSongs(response.data.results);
						setTotalPages(response.data.total_pages);
					}
				})
				.catch((error) => {
					console.log(error);
				});
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
				<div className="pt-16 ">
					<div className="grid grid-cols-6">
						<div className="col-start-1 col-end-7">
							<MyDatePicker />
							<div className="flex justify-left items-center">
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
			{!isLoading && (
				<SongTable type="history" songs={songs} headers={historyHeaders} />
			)}
		</Layout>
	);
}

export default History;
