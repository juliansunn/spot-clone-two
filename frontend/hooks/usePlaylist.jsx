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
	}, [spotifyLoading]);

	return { playlist, loading };
};

// const { spotifyApi, loading } = useSpotify();
// const { data: session } = useSession();
// // const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
// const [playlist, setPlaylist] = useRecoilState(playlistState);
// const { setSongs } = useSongs();

// const handleSetPlaylist = (id) => {
// 	spotifyApi
// 		.getPlaylist(id)
// 		.then((data) => {
// 			const playlist = data.body;
// 			// setPlaylist(playlist);
// 			// setPlaylistId(playlist.id);
// 			setSongs(playlist?.tracks?.items);
// 		})
// 		.catch((error) => console.log('something went wrong: ', error));
// };

// useEffect(() => {
// 	if (!loading) {
// 		if (!playlistId) {
// 			spotifyApi
// 				.getUserPlaylists()
// 				.then((data) => {
// 					const idTofetch = data?.body?.items?.[0]?.id;
// 					if (idTofetch) {
// 						handleSetPlaylist(idTofetch);
// 					}
// 				})
// 				.catch((error) => {
// 					console.log('error fetching playlists', error);
// 				});
// 		} else {
// 			handleSetPlaylist(playlistId);
// 		}
// 	}
// }, [playlistId, session]);
// };

export default usePlaylist;
