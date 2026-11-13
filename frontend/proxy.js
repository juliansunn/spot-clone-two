import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

/**
 * Unauthenticated requests are *rewritten* to the login page instead of
 * redirected. Next re-absolutizes middleware redirects using its own hostname
 * ("localhost"), which breaks OAuth cookies when browsing on 127.0.0.1 – the
 * only loopback form Spotify accepts for redirect URIs. A rewrite keeps the
 * original URL, so after sign-in the user lands right where they were.
 */
export async function proxy(req) {
	const { pathname } = req.nextUrl;
	if (pathname === '/login') return NextResponse.next();

	const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	const signedIn = Boolean(token) && token.error !== 'RefreshAccessTokenError';
	if (signedIn) return NextResponse.next();

	return NextResponse.rewrite(new URL('/login', req.url));
}

export const config = {
	// Everything except Next internals, API routes and static files.
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img/|.*\\.(?:png|jpg|jpeg|svg|webp|ico|webmanifest)$).*)']
};
