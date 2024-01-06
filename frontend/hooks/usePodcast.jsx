import axios from 'axios';
import React, { useEffect, useState } from 'react';
import useSpotify from './useSpotify';

const usePodcast = (podcastId) => {
	const [podcast, setPodcast] = useState([]);
	const [loading, setLoading] = useState(true);
	const { spotifyApi } = useSpotify();

	useEffect(() => {
		const fetchPodcast = async () => {
			const url = `https://api.spotify.com/v1/shows/${podcastId}/episodes`;
			const token = spotifyApi.getAccessToken();

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			setPodcast(response.data);
			setLoading(false);
		};

		fetchPodcast();
	}, []);

	return { podcast, loading };
};

export default usePodcast;
