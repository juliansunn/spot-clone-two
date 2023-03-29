import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { songListState } from '../atoms/songAtom';
import useSpotify from './useSpotify';

const useLikedSongs = () => {
	const spotifyApi = useSpotify();
	const { data: session } = useSession();
	const [likedSongs, setLikedSongs] = useRecoilState(songListState);

	useEffect(() => {
		const getLikedSongs = async () => {
			const likedSongsArray = [];
			let offset = 0;
			let total;

			// Loop until all playlists have been fetched or an error occurs
			while (true) {
				try {
					const response = await spotifyApi.getMySavedTracks({ offset });
					const { items, total: newTotal } = response.body;
					likedSongsArray.push(...items);

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
					console.log('Error fetching liked-songs', error);
					break;
				}
			}
			setLikedSongs(likedSongsArray);
			// Set the playlistId to the ID of the first playlist in the array
		};

		getLikedSongs();
	}, []);

	return { likedSongs };
};

export default useLikedSongs;
