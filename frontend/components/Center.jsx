import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import { songListState } from '../atoms/songAtom';
import spotifyApi from '../lib/spotify';
import Playlist from './Playlist';

function Center() {
	const playlistId = useRecoilValue(playlistIdState);
	const [playlist, setPlaylist] = useRecoilState(playlistState);
	const [songs, setSongs] = useRecoilState(songListState);

	function selectPlaylist() {
		spotifyApi
			.getPlaylist(playlistId)
			.then((data) => {
				const playlist = data.body;
				setPlaylist(playlist);
				setSongs(playlist?.tracks?.items);
			})
			.catch((error) => console.log('something went wrong: ', error));
	}

	useEffect(() => {
		selectPlaylist();
	}, [playlistId]);

	return <Playlist playlist={playlist} type="playlist" />;
}

export default Center;
