import SpotifyWebApi from 'spotify-web-api-node';

const scopes = [
	'user-modify-playback-state',
	'user-read-playback-state',
	'user-read-playback-position',
	'user-read-email',
	'user-read-private',
	'playlist-read-private',
	'user-library-read',
	'user-library-modify',
	'user-read-currently-playing',
	'user-read-recently-played',
	'playlist-read-collaborative',
	'user-top-read',
	'user-follow-read'
].join(',');

const params = {
	scope: scopes
};

const queryParamString = new URLSearchParams(params);

const LOGIN_URL = `https://accounts.spotify.com/authorize?${queryParamString.toString()}`;

const spotifyApi = new SpotifyWebApi({
	clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
	clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET
});

export default spotifyApi;

export { LOGIN_URL };
