import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { albumsState } from '../atoms/albumAtom';
import useSpotify from './useSpotify';

const useAlbums = () => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [albums, setAlbums] = useRecoilState(albumsState);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const getAlbumData = async () => {
			if (!spotifyLoading) {
				const albms = [];
				let albumOffset = 0;
				let total;

				// Loop until all albums have been fetched
				while (albumOffset < total || !total) {
					try {
						const response = await spotifyApi.getMySavedAlbums({
							offset: albumOffset
						});
						const { items, total: newTotal } = response.body;
						// setAlbums((prevAlbums) => [...prevAlbums, ...items]);
						albms.push(...items);

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
				setAlbums(albms);
				setLoading(false);
			}
		};
		getAlbumData();
	}, [spotifyLoading]);

	return { albums, loading };
};

export default useAlbums;
