import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import useSpotify from './useSpotify';

const useVolume = (initialVolume, debounceTime = 200) => {
	const spotifyApi = useSpotify();
	const [volume, setVolume] = useState(initialVolume);

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
		debouncedAdjustVolume(volume);
	}, [volume]);

	return [volume, adjustVolume];
};

export default useVolume;
