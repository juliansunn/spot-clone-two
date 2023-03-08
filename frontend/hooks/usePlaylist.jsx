import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { playlistState } from '../atoms/playlistAtom';
import useSongs from './useSongs';
import useSpotify from './useSpotify';

const usePlaylist = (playlistId) => {
	const [playlist, setPlaylist] = useRecoilState(playlistState);
	const spotifyApi = useSpotify();
	const { setSongs } = useSongs();

	useEffect(() => {
		const selectPlaylist = () => {
			spotifyApi
				.getPlaylist(playlistId)
				.then((data) => {
					const playlist = data.body;
					setPlaylist(playlist);
					setSongs(playlist?.tracks?.items);
				})
				.catch((error) => console.log('something went wrong: ', error));
		};
		selectPlaylist();
	}, [playlistId]);
	return { playlist };
};

export default usePlaylist;
