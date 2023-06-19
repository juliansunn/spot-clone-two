import { useEffect, useState } from 'react';
import useSpotify from './useSpotify';
import useSongs from './useSongs';

const usePlaylist = (playlistId) => {
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const [playlist, setPlaylist] = useState(null);
	const [loading, setLoading] = useState(true);
	const { setSongs } = useSongs();

	useEffect(() => {
		const getPlaylistData = async () => {
			if (!spotifyLoading) {
				const playlistResponse = await spotifyApi.getPlaylist(playlistId);
				const data = playlistResponse?.body;
				setPlaylist(data);
				setLoading(false);
				setSongs(data?.tracks?.items);
			}
		};
		getPlaylistData();
	}, [spotifyLoading, playlistId]);

	return { playlist, loading };
};

export default usePlaylist;
