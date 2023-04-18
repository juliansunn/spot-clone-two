import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { songListState, songQueueState } from '../atoms/songAtom';
import useSpotify from './useSpotify';

const useSongs = () => {
	const { data: session } = useSession();
	const [songs, setSongs] = useRecoilState(songListState);
	const [songQueue, setSongQueue] = useRecoilState(songQueueState);
	const { spotifyApi, loading } = useSpotify();
	useEffect(() => {
		const fetchQueuedSongs = async () => {
			if (!loading) {
				const queuedTracks = await fetch(
					'https://api.spotify.com/v1/me/player/queue',
					{
						headers: {
							Authorization: `Bearer ${spotifyApi.getAccessToken()}`
						}
					}
				).then((res) => res.json());
				if (queuedTracks) {
					setSongs(queuedTracks?.queue);
					setSongQueue(queuedTracks?.queue);
				}
			}
		};
		if (!songQueue?.length) {
			fetchQueuedSongs();
		}
	}, [session]);

	return { songs, setSongs, songQueue, setSongQueue };
};

export default useSongs;
