import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistTrackState } from '../atoms/playlistAtom';
import { songListState, trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SongTable from '../components/SongTable';

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
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [playlistTracks, setPlaylistTracks] = useRecoilState(playlistTrackState);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);

	const [songs, setSongs] = useRecoilState(songListState);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	const getCountHistory = async () => {
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/tracks/?page=${currentPage}` +
					new URLSearchParams({
						// start_date: startDate,
						// end_date: endDate
					})
			);
			const data = await res.json();
			setPlaylistTracks({ type: data.type, songs: data.results });
			setSongs(data.results);
			setTotalPages(data.total_pages);
			setLoading(false);
		} catch (err) {
			console.log('err', err);
		}
	};
	useEffect(() => {
		getCountHistory();
	}, [currentPage]);

	const handlePageChange = (page) => {
		setCurrentPage(page);
		setLoading(true);
	};
	// if (loading) {
	// 	return <h3>Loading Historical Data ...</h3>;
	// }
	console.log('songs', songs);
	return (
		<Layout>
			<div>
				<div className="px-8 flex flex-col spacy-y-1 pb-28">
					<button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						Previous
					</button>
					<button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
					>
						Next
					</button>
				</div>

				<SongTable type="history" songs={songs} />
			</div>
		</Layout>
	);
}

export default History;
