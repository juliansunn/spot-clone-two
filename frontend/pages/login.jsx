import Head from 'next/head';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { LogoMark } from '@/components/layout/Logo';

const ERRORS = {
	OAuthCallback: 'Spotify sign-in was cancelled or failed. Please try again.',
	OAuthSignin: 'Could not start Spotify sign-in. Check the app credentials.',
	AccessDenied: 'Access was denied. Your Spotify account may not be allow-listed for this app.',
	default: 'Something went wrong signing in. Please try again.'
};

function SpotifyGlyph() {
	return (
		<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
			<path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.85-1.74-6.43-2.13-10.66-1.17a.75.75 0 1 1-.33-1.46c4.62-1.05 8.6-.6 11.74 1.33.36.22.47.69.25 1.05Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.26-2-8.22-2.58-12.08-1.41a.94.94 0 1 1-.54-1.8c4.4-1.33 9.88-.69 13.6 1.6.44.27.58.85.31 1.3Zm.13-3.4C15.2 8.3 8.8 8.1 5.06 9.23a1.13 1.13 0 1 1-.65-2.16c4.3-1.3 11.4-1.05 15.85 1.6a1.13 1.13 0 0 1-1.16 1.95Z" />
		</svg>
	);
}

export default function Login() {
	const router = useRouter();
	const { status } = useSession();
	const [loading, setLoading] = useState(false);
	const error = typeof router.query.error === 'string' ? ERRORS[router.query.error] ?? ERRORS.default : null;
	// Middleware rewrites protected URLs to this page, so asPath is where the user was headed.
	const path = router.asPath.split('?')[0];
	const queryCallback = typeof router.query.callbackUrl === 'string' ? router.query.callbackUrl : null;
	const callbackUrl =
		queryCallback && queryCallback.startsWith('/') && !queryCallback.startsWith('//')
			? queryCallback
			: path !== '/login'
				? router.asPath
				: '/';

	useEffect(() => {
		if (status === 'authenticated' && path === '/login') router.replace(callbackUrl);
	}, [status, path, callbackUrl, router]);

	return (
		<>
			<Head>
				<title>Sign in · Antefy</title>
			</Head>
			<main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg px-4">
				<div
					aria-hidden
					className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]"
				/>
				<div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-500/10 blur-[100px]" />

				<div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface/80 p-8 text-center shadow-2xl backdrop-blur">
					<LogoMark className="mx-auto h-14 w-14" />
					<h1 className="mt-5 text-3xl font-extrabold tracking-tight">Antefy</h1>
					<p className="mt-2 text-sm text-muted">
						Your Spotify library and a cleaner player, all in one place.
					</p>

					{error && (
						<p role="alert" className="mt-6 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
							{error}
						</p>
					)}

					<button
						type="button"
						disabled={loading}
						onClick={() => {
							setLoading(true);
							signIn('spotify', { callbackUrl });
						}}
						className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3.5 font-bold text-accent-fg transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
					>
						{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SpotifyGlyph />}
						Continue with Spotify
					</button>
					<p className="mt-4 text-xs text-subtle">Playback control requires Spotify Premium and an open Spotify app.</p>
				</div>
			</main>
		</>
	);
}

Login.bare = true;
