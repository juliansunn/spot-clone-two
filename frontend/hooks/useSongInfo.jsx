import useSpotify from './useSpotify';
import { useRecoilValue } from 'recoil';
import { currentTrackIdState, currentTrackLocState } from '../atoms/songAtom';
import { useEffect, useState } from 'react';

function useSongInfo() {
	const spotifyApi = useSpotify();
	const currentTrackId = useRecoilValue(currentTrackIdState);
	const currentTrackLoc = useRecoilValue(currentTrackLocState);
	const [songInfo, setSongInfo] = useState(null);
	useEffect(() => {
		const fetchSongInfo = async () => {
			if (currentTrackId) {
				const trackInfo = await fetch(
					`https://api.spotify.com/v1/tracks/${currentTrackId}`,
					{
						headers: {
							Authorization: `Bearer ${spotifyApi.getAccessToken()}`
						}
					}
				).then((res) => res.json());
				setSongInfo(trackInfo);
			}
		};
		fetchSongInfo();
	}, [currentTrackId]);
	return songInfo;
}

export default useSongInfo;
