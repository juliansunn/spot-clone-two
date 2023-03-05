import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import useSpotify from './useSpotify';
import useDevice from './useDevice';

const useVolume = (debounceTime = 200) => {
	const spotifyApi = useSpotify();
	const { initialVolume } = useDevice();
	const [volume, setVolume] = useState(null);

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

	useEffect(() => {
		if (initialVolume && !volume) {
			setVolume(initialVolume);
			debouncedAdjustVolume(initialVolume);
		}
		debouncedAdjustVolume(volume);
	}, [volume, initialVolume]);

	return [volume, adjustVolume];
};

export default useVolume;
