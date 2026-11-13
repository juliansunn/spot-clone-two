import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { setAccessToken } from '@/lib/spotify';

/**
 * Keeps the Spotify client's token in sync with the NextAuth session and
 * sends the user back through sign-in if the refresh token stopped working.
 */
export default function SessionSync({ children }) {
	const { data: session } = useSession();

	// Set synchronously so queries enabled on this render already have a token.
	if (session?.accessToken) setAccessToken(session.accessToken);

	useEffect(() => {
		if (session?.error === 'RefreshAccessTokenError') {
			setAccessToken(null);
			signIn('spotify', { callbackUrl: window.location.href });
		}
	}, [session?.error]);

	return children;
}
