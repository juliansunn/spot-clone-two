import SpotifyProvider from 'next-auth/providers/spotify';

export const SPOTIFY_SCOPES = [
	// Required by the Web Playback SDK so this browser can be a playback device.
	'streaming',
	'user-read-email',
	'user-read-private',
	'user-read-playback-state',
	'user-modify-playback-state',
	'user-read-currently-playing',
	'user-read-playback-position',
	'user-read-recently-played',
	'user-top-read',
	'user-follow-read',
	'user-library-read',
	'user-library-modify',
	'playlist-read-private',
	'playlist-read-collaborative',
	// Saving radio mixes as playlists.
	'playlist-modify-private',
	'playlist-modify-public'
].join(' ');

const clientId = process.env.SPOTIFY_CLIENT_ID || '';
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';

// Refresh one minute early so in-flight requests never race the expiry.
const EXPIRY_BUFFER_MS = 60 * 1000;

async function refreshAccessToken(token) {
	try {
		const res = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
			},
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: token.refreshToken
			})
		});
		const refreshed = await res.json();
		if (!res.ok) throw refreshed;

		return {
			...token,
			accessToken: refreshed.access_token,
			accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
			// Spotify only sometimes rotates the refresh token.
			refreshToken: refreshed.refresh_token ?? token.refreshToken,
			error: undefined
		};
	} catch (error) {
		console.error('[auth] Failed to refresh Spotify access token', error);
		return { ...token, error: 'RefreshAccessTokenError' };
	}
}

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
	providers: [
		SpotifyProvider({
			clientId,
			clientSecret,
			authorization: {
				url: 'https://accounts.spotify.com/authorize',
				params: { scope: SPOTIFY_SCOPES }
			}
		})
	],
	secret: process.env.NEXTAUTH_SECRET,
	pages: { signIn: '/login' },
	session: { strategy: 'jwt' },
	callbacks: {
		async jwt({ token, account }) {
			// Initial sign in
			if (account) {
				return {
					...token,
					accessToken: account.access_token,
					refreshToken: account.refresh_token,
					spotifyId: account.providerAccountId,
					scope: account.scope,
					accessTokenExpires: account.expires_at
						? account.expires_at * 1000
						: Date.now() + 3600 * 1000
				};
			}

			if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - EXPIRY_BUFFER_MS) {
				return token;
			}

			if (!token.refreshToken) return { ...token, error: 'RefreshAccessTokenError' };
			return refreshAccessToken(token);
		},
		async session({ session, token }) {
			// Only expose what the browser needs. The refresh token stays server-side.
			session.accessToken = token.accessToken;
			session.accessTokenExpires = token.accessTokenExpires;
			session.error = token.error;
			session.scope = token.scope;
			session.user = { ...session.user, id: token.spotifyId };
			return session;
		}
	}
};
