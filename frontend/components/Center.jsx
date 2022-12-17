import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import spotifyApi from '../lib/spotify';
import Playlist from './Playlist';

function Center() {
	const playlistId = useRecoilValue(playlistIdState);
	const [playlist, setPlaylist] = useRecoilState(playlistState);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);

	function selectPlaylist() {
		spotifyApi
			.getPlaylist(playlistId)
			.then((data) => {
				const playlist = data.body;
				setPlaylist(playlist);
			})
			.catch((error) => console.log('something went wrong: ', error));
	}

	useEffect(() => {
		selectPlaylist();
	}, [playlistId]);

	console.log('playlist', playlist);
	return (
		<Playlist
			playlist={playlist}
			trackInfo={trackInfo}
			handleSongSelected={selectPlaylist}
			type="playlist"
		/>
	);
}

export default Center;
