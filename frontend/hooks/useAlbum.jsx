import { useEffect, useState } from 'react';
import useSpotify from './useSpotify';

const useAlbum = (albumId) => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [album, setAlbum] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const getAlbumData = async () => {
			if (!spotifyLoading) {
				const albumRes = await spotifyApi.getAlbum(albumId);
				setAlbum(albumRes?.body);
				setLoading(false);
			}
		};
		getAlbumData();
	}, [spotifyLoading]);

	return { album, loading };
};

export default useAlbum;
