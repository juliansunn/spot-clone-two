import axios from 'axios';
import React, { useEffect, useState } from 'react';
import useSpotify from './useSpotify';

const useShows = () => {
	const [shows, setShows] = useState([]);
	const { spotifyApi } = useSpotify();
	useEffect(() => {
		const getShows = async () => {
			var config = {
				method: 'get',
				url: 'https://api.spotify.com/v1/me/shows',
				headers: {
					Authorization: `Bearer ${spotifyApi.getAccessToken()}`
				}
			};

			const response = await axios(config);
			const items = response?.data?.items;
			setShows(items);
		};
		getShows();
	}, []);

	return { shows };
};

export default useShows;
