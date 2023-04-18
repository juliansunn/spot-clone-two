import { shuffle, toSafeInteger } from 'lodash';
import { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackLocState,
	durationState,
	isPlayingState,
	isShuffleState,
	manualChangeState,
	progressState
} from '../atoms/songAtom';
import useSongs from './useSongs';
import useSpotify from './useSpotify';
import { mapSongsForQueue } from '../lib/utility';
import { toast } from 'react-toastify';

const useSongControls = () => {
	const { spotifyApi } = useSpotify();
	const [isShuffle, setIsShuffle] = useRecoilState(isShuffleState);
	const [isRepeat, setIsRepeat] = useState(false);
	const [currentTrackLoc, setCurrentTrackLoc] =
		useRecoilState(currentTrackLocState);
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);
	const setIsPlaying = useSetRecoilState(isPlayingState);
	const setProgress = useSetRecoilState(progressState);
	const setDuration = useSetRecoilState(durationState);

	const { songs, songQueue, setSongQueue } = useSongs();

	const toggleShuffle = () => {
		if (isShuffle) {
			setSongQueue(songQueue);
		} else {
			setSongQueue(shuffle(songQueue));
		}
		spotifyApi.setShuffle(!isShuffle);
		setIsShuffle((prevState) => !prevState);
	};
	const toggleRepeat = () => {
		setIsRepeat((prevState) => !prevState);
	};

	const changeSong = (direction, manual = false, index = null) => {
		const queue = mapSongsForQueue(songQueue);
		if (songQueue) {
			var newLoc = !index ? currentTrackLoc + direction : index;
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
			setProgress(0);
			setCurrentTrackLoc(newLoc);
			setCurrentTrackId(
				songQueue[newLoc].track
					? songQueue[newLoc].track.id
					: songQueue[newLoc].spotify_id
			);
		}
	};

	const playSong = (track, order) => {
		let mySongs = songs;
		let myOrder = order;
		if (isShuffle) {
			mySongs = shuffle(songs);
			myOrder = mySongs.findIndex((item) => item?.track?.id === track.id);
		}
		const uris = mapSongsForQueue(mySongs).map(({ uri }) => uri);
		spotifyApi.play({
			uris: uris,
			offset: { position: myOrder }
		});

		setSongQueue(mySongs);
		setManualChange(true);
		setProgress(0);
		setDuration(track.duration_ms);
		setCurrentTrackLoc(myOrder);
		setCurrentTrackId(track.id);
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

	const likeSong = (trackId) => {
		if (trackId) {
			spotifyApi.addToMySavedTracks(trackId);
			toast(`Added ${trackId} to your Liked Songs!`);
		}
	};

	return {
		isShuffle,
		setIsShuffle,
		isRepeat,
		toggleShuffle,
		toggleRepeat,
		changeSong,
		manualChange,
		setManualChange,
		handlePlayPause,
		playSong,
		currentTrackId,
		likeSong
	};
};

export default useSongControls;
