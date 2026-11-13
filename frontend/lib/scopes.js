/**
 * Scopes added after the first release. Sessions missing any of them get a
 * one-time prompt to re-authorize. (Kept separate from lib/auth.js so client
 * code doesn't pull in the NextAuth provider.)
 */
export const REQUIRED_NEW_SCOPES = ['streaming', 'playlist-modify-private'];

export function hasScopes(session, scopes = REQUIRED_NEW_SCOPES) {
	const granted = session?.scope?.split(' ') ?? [];
	return scopes.every((s) => granted.includes(s));
}
