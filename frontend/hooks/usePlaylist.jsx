import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import useSongs from './useSongs';
import useSpotify from './useSpotify';

const usePlaylist = () => {
	const { spotifyApi, loading } = useSpotify();
	const { data: session } = useSession();
	const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
	const [playlist, setPlaylist] = useRecoilState(playlistState);
	const { setSongs } = useSongs();

	const handleSetPlaylist = (id) => {
		spotifyApi
			.getPlaylist(id)
			.then((data) => {
				const playlist = data.body;
				setPlaylist(playlist);
				setPlaylistId(playlist.id);
				setSongs(playlist?.tracks?.items);
			})
			.catch((error) => console.log('something went wrong: ', error));
	};

	useEffect(() => {
		if (!loading) {
			if (!playlistId) {
				spotifyApi
					.getUserPlaylists()
					.then((data) => {
						const idTofetch = data?.body?.items?.[0]?.id;
						if (idTofetch) {
							handleSetPlaylist(idTofetch);
						}
					})
					.catch((error) => {
						console.log('error fetching playlists', error);
					});
			} else {
				handleSetPlaylist(playlistId);
			}
		}
	}, [playlistId, session]);
	return { playlist };
};

export default usePlaylist;
