import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { albumsState } from '../atoms/albumAtom';
import useSpotify from './useSpotify';

const useAlbums = () => {
	const spotifyApi = useSpotify();
	const [albums, setAlbums] = useRecoilState(albumsState);
	useEffect(() => {
		const getAlbumData = async () => {
			let albumOffset = 0;
			let total;

			// Loop until all albums have been fetched
			while (albumOffset < total || !total) {
				try {
					const response = await spotifyApi.getMySavedAlbums({
						offset: albumOffset
					});
					const { items, total: newTotal } = response.body;
					setAlbums((prevAlbums) => [...prevAlbums, ...items]);

					if (!total) {
						// If this is the first request, set the total number of albums
						total = newTotal;
					}

					// Increment the offset for the next request
					albumOffset += items.length;
				} catch (error) {
					console.log('Error fetching albums', error);
					break;
				}
			}
		};
		getAlbumData();
	}, []);

	return { albums };
};

export default useAlbums;
