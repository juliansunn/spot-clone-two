import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { artistsState } from '../atoms/artistAtom';
import useSpotify from './useSpotify';

const useArtists = () => {
	const spotifyApi = useSpotify();
	const [artists, setArtists] = useRecoilState(artistsState);
	useEffect(() => {
		const getArtistData = async () => {
			let offset = 0;
			let after;
			let total;
			while (offset < total || !total) {
				try {
					const args = after ? { after } : {};
					const response = await spotifyApi.getFollowedArtists(args);
					const { items, total: newTotal } = response.body?.artists;
					setArtists((prevArtists) => [...prevArtists, ...items]);
					after = items[items.length - 1].id;
					if (!total) {
						// If this is the first request, set the total number of artists
						total = newTotal;
					}
					offset += items?.length;
				} catch (error) {
					console.log('Error fetching Albums: ', error);
					break;
				}
			}
		};
		getArtistData();
	}, []);

	return { artists };
};

export default useArtists;
