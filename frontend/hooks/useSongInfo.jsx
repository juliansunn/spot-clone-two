import useSpotify from './useSpotify';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
	currentTrackIdState,
	durationState,
	isPlayingState,
	progressState
} from '../atoms/songAtom';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSongControls from './useSongControls';

function useSongInfo() {
	const { spotifyApi, loading } = useSpotify();
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const { data: session } = useSession();
	const [songInfo, setSongInfo] = useState(null);
	const setIsPlaying = useSetRecoilState(isPlayingState);
	const setProgress = useSetRecoilState(progressState);
	const setDuration = useSetRecoilState(durationState);
	const { setIsShuffle } = useSongControls();
	const [context, setContext] = useState(null);
	useEffect(() => {
		const fetchSongInfo = async () => {
			if (!loading) {
				try {
					if (currentTrackId) {
						const trackInfo = await spotifyApi.getTrack(currentTrackId);
						setSongInfo(trackInfo?.body);
					} else {
						const trackInfo = await spotifyApi.getMyCurrentPlaybackState();
						if (trackInfo?.statusCode === 200) {
							setSongInfo(trackInfo?.body?.item);
							setIsPlaying(trackInfo?.body?.is_playing);
							setCurrentTrackId(trackInfo?.body?.item?.id);
							setProgress(trackInfo?.body?.progress_ms);
							setDuration(trackInfo?.body?.item?.duration_ms);
							setIsShuffle(trackInfo?.body?.shuffle_state);
							setContext(trackInfo?.body?.context);
						}
					}
				} catch (error) {
					console.log('Error fetching currently playing track', error);
				}
			}
		};
		fetchSongInfo();
	}, [currentTrackId, session]);
	return { songInfo, context };
}

export default useSongInfo;
