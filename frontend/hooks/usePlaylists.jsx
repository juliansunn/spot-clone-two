import { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import useSpotify from './useSpotify';

const usePlaylists = () => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [playlists, setPlaylists] = useState([]);
	const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
	const [loading, setLoading] = useState(true);
	const setPlaylist = useSetRecoilState(playlistState);
	useEffect(() => {
		const getPlaylistData = async () => {
			if (!spotifyLoading) {
				const plsts = [];
				let offset = 0;
				let total;

				// Loop until all playlists have been fetched or an error occurs
				while (true) {
					try {
						const response = await spotifyApi.getUserPlaylists({ offset });
						const { items, total: newTotal } = response.body;
						plsts.push(...items);

						if (!total) {
							// If this is the first request, set the total number of playlists
							total = newTotal;
						}

						// Increment the offset for the next request
						offset += items.length;

						// If all playlists have been fetched, break out of the loop
						if (offset >= total) {
							break;
						}
					} catch (error) {
						console.log('Error fetching playlists', error);
						break;
					}
				}
				setPlaylists(plsts);
				setLoading(false);
				// Set the playlistId to the ID of the first playlist in the array
				if (plsts.length > 0 && !playlistId) {
					setPlaylistId(plsts[0].id);
					setPlaylist(plsts[0]);
				}
			}
		};

		getPlaylistData();
	}, [spotifyLoading]);

	return { playlists, loading, playlistId, setPlaylists, setPlaylistId };
};

export default usePlaylists;
