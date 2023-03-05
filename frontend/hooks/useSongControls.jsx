import { shuffle } from 'lodash';
import React, { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackLocState,
	isPlayingState,
	manualChangeState,
	trackInfoState
} from '../atoms/songAtom';
import useSongs from './useSongs';
import useSpotify from './useSpotify';

const useSongControls = () => {
	const spotifyApi = useSpotify();
	const [isShuffle, setIsShuffle] = useState(false);
	const [isRepeat, setIsRepeat] = useState(false);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
	const [currentTrackLoc, setCurrentTrackLoc] =
		useRecoilState(currentTrackLocState);
	const setCurrentTrackId = useSetRecoilState(currentTrackIdState);
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

	const { songs } = useSongs();

	const toggleShuffle = () => {
		var info = songs?.map((track, i) => ({
			position: i,
			uri: track.track ? track.track.uri : track.uri,
			id: track.track ? track.track.id : track.id
		}));
		if (isShuffle) {
			setTrackInfo(info);
		} else {
			setTrackInfo(shuffle(info));
		}
		setIsShuffle((prevState) => !prevState);
	};

	const toggleRepeat = () => {
		setIsRepeat((prevState) => !prevState);
	};

	const changeSong = (direction, manual = false) => {
		const uris = trackInfo?.map(({ uri }) => uri);
		if (songs) {
			var newLoc = currentTrackLoc + direction;
			if (newLoc >= uris?.length) {
				if (isRepeat) {
					newLoc = 0;
				} else {
					console.log('We need to search and put new songs in the playlist queue');
					return;
				}
			}
			if (newLoc < 0) {
				if (isRepeat) {
					newLoc = uris?.length - 1;
				} else {
					newLoc = 0;
				}
			}
			if (manual) {
				spotifyApi.play({
					uris: uris,
					offset: { position: newLoc }
				});
				setManualChange(true);
			}
			setCurrentTrackLoc(newLoc);
			setCurrentTrackId(trackInfo[newLoc]?.id);
		}
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
		handlePlayPause
	};
};

export default useSongControls;
