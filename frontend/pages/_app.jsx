import '@/styles/globals.css';
import { useState } from 'react';
import Head from 'next/head';
import { Figtree } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import * as Tooltip from '@radix-ui/react-tooltip';
import { SpotifyApiError, describeError } from '@/lib/spotify';
import SessionSync from '@/components/layout/SessionSync';
import AppShell from '@/components/layout/AppShell';

const font = Figtree({ subsets: ['latin'], display: 'swap' });

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				refetchOnWindowFocus: false,
				retry: (count, error) => {
					// Don't retry client errors (bad id, removed endpoint, auth) – only flaky failures.
					if (error instanceof SpotifyApiError && error.status < 500 && error.status !== 429) return false;
					return count < 2;
				}
			},
			mutations: {
				onError: (error) => toast.error(describeError(error))
			}
		},
		queryCache: new QueryCache({
			onError: (error, query) => {
				// Background queries only toast when they opt in via meta.
				if (query.meta?.toastOnError) toast.error(describeError(error));
			}
		})
	});
}

export default function App({ Component, pageProps: { session, ...pageProps } }) {
	// One client per app instance (previously recreated on every render, wiping the cache).
	const [queryClient] = useState(makeQueryClient);
	const bare = Component.bare === true;

	return (
		<SessionProvider session={session} refetchInterval={5 * 60} refetchOnWindowFocus>
			<QueryClientProvider client={queryClient}>
				<Tooltip.Provider delayDuration={400}>
					<Head>
						<title>Antefy</title>
						<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
					</Head>
					{/* Define the font on :root so portalled UI (menus, popovers, toasts) gets it too. */}
					<style jsx global>{`
						:root {
							--font-sans: ${font.style.fontFamily};
						}
					`}</style>
					<div className="h-full font-sans">
						{bare ? (
							<Component {...pageProps} />
						) : (
							<SessionSync>
								<AppShell>
									<Component {...pageProps} />
								</AppShell>
							</SessionSync>
						)}
					</div>
					<Toaster
						position="bottom-center"
						offset={110}
						toastOptions={{
							classNames: { description: '!text-muted', actionButton: '!bg-accent !text-accent-fg !font-semibold' },
							className:
								'!bg-elevated !text-fg !border !border-line !shadow-2xl !rounded-xl !font-sans'
						}}
					/>
				</Tooltip.Provider>
			</QueryClientProvider>
		</SessionProvider>
	);
}
