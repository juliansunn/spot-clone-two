import { useEffect, useState } from 'react';
import useSpotify from './useSpotify';

const useArtist = (artistId) => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [artist, setArtist] = useState(null);
	const [artistAlbums, setArtistAlbums] = useState([]);
	const [topArtistSongs, setTopArtistSongs] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getArtistData = async () => {
			if (!spotifyLoading) {
				const artistRes = await spotifyApi.getArtist(artistId);
				setArtist(artistRes.body);

				const albumRes = await spotifyApi.getArtistAlbums(artistId, {
					include_groups: 'album',
					market: 'US'
				});
				const { items: albums } = albumRes.body;
				setArtistAlbums(albums);

				const topSongsRes = await spotifyApi.getArtistTopTracks(artistId, 'US');
				const { items: tracks } = topSongsRes.body;
				setTopArtistSongs(tracks);

				setLoading(false);
			}
		};
		getArtistData();
	}, [spotifyLoading]);

	return { artist, artistAlbums, topArtistSongs, loading };
};

export default useArtist;
