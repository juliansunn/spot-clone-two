import useSpotify from './useSpotify';
import { useRecoilValue } from 'recoil';
import { currentTrackIdState } from '../atoms/songAtom';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function useSongInfo() {
	const spotifyApi = useSpotify();
	const currentTrackId = useRecoilValue(currentTrackIdState);
	const { data: session } = useSession();
	const [songInfo, setSongInfo] = useState(null);
	useEffect(() => {
		const url = currentTrackId
			? `https://api.spotify.com/v1/tracks/${currentTrackId}`
			: 'https://api.spotify.com/v1/me/player/currently-playing';
		const fetchSongInfo = async () => {
			const trackInfo = await fetch(url, {
				headers: {
					Authorization: `Bearer ${spotifyApi.getAccessToken()}`
				}
			}).then((res) => res.json());
			setSongInfo(!currentTrackId ? trackInfo?.item : trackInfo);
		};
		fetchSongInfo();
	}, [currentTrackId, session]);
	return songInfo;
}

export default useSongInfo;
