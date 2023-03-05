import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import useSpotify from './useSpotify';
import useDevice from './useDevice';

const useVolume = (debounceTime = 200) => {
	const spotifyApi = useSpotify();
	const { initialVolume } = useDevice();
	const [volume, setVolume] = useState(null);
	const [muted, setMuted] = useState(false);

	const debouncedAdjustVolume = useCallback(
		debounce((volume) => {
			spotifyApi.setVolume(volume);
		}, debounceTime),
		[]
	);
	const adjustVolume = useCallback(
		(newVolume) => {
			if (newVolume >= 0 && newVolume <= 100) {
				setVolume(newVolume);
				debouncedAdjustVolume(newVolume);
			}
		},
		[debouncedAdjustVolume]
	);

	const toggleMute = () => {
		if (!muted) {
			setMuted(true);
			spotifyApi.setVolume(0);
		} else {
			setMuted(false);
			spotifyApi.setVolume(volume);
		}
	};

	useEffect(() => {
		if (initialVolume && !volume) {
			setVolume(initialVolume);
		}
		if (volume) {
			debouncedAdjustVolume(volume);
		}
	}, [volume, initialVolume]);

	return { volume, adjustVolume, muted, toggleMute };
};

export default useVolume;
