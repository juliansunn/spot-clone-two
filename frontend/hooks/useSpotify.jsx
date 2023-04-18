import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import spotifyApi from '../lib/spotify';

function useSpotify() {
	const { data: session, status: sessionLoading } = useSession();
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (session && sessionLoading === 'authenticated') {
			//if refresh access token attempt fails, direct user to login...
			if (session.error === 'RefreshAccessTokenError') {
				signIn();
			}
			spotifyApi.setAccessToken(session.user.accessToken);
			setLoading(false);
		}
	}, [session]);

	const getPlaylist = (playlistId) => {
		if (loading) {
			throw new Error('Spotify API not ready yet');
		}
		const playlist = spotifyApi.getPlaylist(playlistId);

		return playlist;
	};
	return { spotifyApi, loading, getPlaylist };
}

export default useSpotify;
