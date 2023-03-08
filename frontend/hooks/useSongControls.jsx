import { shuffle } from 'lodash';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackLocState,
	isPlayingState,
	manualChangeState
} from '../atoms/songAtom';
import useSongs from './useSongs';
import useSpotify from './useSpotify';
import { mapSongsForQueue } from '../lib/utility';

const useSongControls = () => {
	const spotifyApi = useSpotify();
	const [isShuffle, setIsShuffle] = useState(false);
	const [isRepeat, setIsRepeat] = useState(false);
	const [currentTrackLoc, setCurrentTrackLoc] =
		useRecoilState(currentTrackLocState);
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

	const { songs, songQueue, setSongQueue } = useSongs();

	const toggleShuffle = () => {
		if (isShuffle) {
			setSongQueue(songQueue);
		} else {
			setSongQueue(shuffle(songQueue));
		}
		setIsShuffle((prevState) => !prevState);
	};

	const toggleRepeat = () => {
		setIsRepeat((prevState) => !prevState);
	};

	const changeSong = (direction, manual = false) => {
		const queue = mapSongsForQueue(songQueue);
		if (songQueue) {
			var newLoc = currentTrackLoc + direction;
			if (newLoc >= queue?.length) {
				if (isRepeat) {
					newLoc = 0;
				} else {
					console.log('We need to search and put new songs in the playlist queue');
					return;
				}
			}
			if (newLoc < 0) {
				if (isRepeat) {
					newLoc = queue?.length - 1;
				} else {
					newLoc = 0;
				}
			}
			if (manual) {
				spotifyApi.play({
					uris: queue.map(({ uri }) => uri),
					offset: { position: newLoc }
				});
				setManualChange(true);
			}
			setCurrentTrackLoc(newLoc);
			setCurrentTrackId(
				songQueue[newLoc].track
					? songQueue[newLoc].track.id
					: songQueue[newLoc].spotify_id
			);
			// setCurrentTrackId(trackInfo ? trackInfo[newLoc]?.id : null);
		}
	};

	const playSong = (track, order) => {
		setCurrentTrackId(track?.id);
		setCurrentTrackLoc(order);
		setSongQueue(songs);
		setIsPlaying(true);
		setManualChange(true);
		const uris = mapSongsForQueue(songs).map(({ uri }) => uri);
		spotifyApi.play({
			uris: uris,
			offset: { position: order }
		});
	};

	const handlePlayPause = () => {
		spotifyApi.getMyCurrentPlaybackState().then((data) => {
			if (data?.body?.is_playing) {
				spotifyApi.pause();
				setIsPlaying(false);
			} else {
				spotifyApi.play();
				setIsPlaying(true);
			}
		});
	};

	return {
		isShuffle,
		isRepeat,
		toggleShuffle,
		toggleRepeat,
		changeSong,
		manualChange,
		setManualChange,
		isPlaying,
		handlePlayPause,
		playSong,
		currentTrackLoc,
		currentTrackId
	};
};

export default useSongControls;
