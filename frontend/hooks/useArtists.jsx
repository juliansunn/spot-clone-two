import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { artistsState } from '../atoms/artistAtom';
import useSpotify from './useSpotify';

const useArtists = () => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [artists, setArtists] = useRecoilState(artistsState);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const getArtistData = async () => {
			if (!spotifyLoading) {
				const artsts = [];
				let offset = 0;
				let after;
				let total;
				while (offset < total || !total) {
					try {
						const args = after ? { after } : {};
						const response = await spotifyApi.getFollowedArtists(args);
						const { items, total: newTotal } = response.body?.artists;
						artsts.push(...items);
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
				setArtists(artsts);
				setLoading(false);
			}
		};
		getArtistData();
	}, [spotifyLoading]);

	return { artists, loading };
};

export default useArtists;
