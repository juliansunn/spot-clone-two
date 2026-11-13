import { useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ListPlus, Radio, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CollectionHeader, { ActionBar, Dot } from '@/components/media/CollectionHeader';
import PlayButton from '@/components/media/PlayButton';
import TrackList, { TrackListSkeleton } from '@/components/media/TrackList';
import Cover from '@/components/ui/Cover';
import IconButton from '@/components/ui/IconButton';
import { EmptyState, ErrorState } from '@/components/ui/States';
import { formatLongDuration, pluralize } from '@/lib/format';
import { buildRadio } from '@/lib/radio';
import * as spotify from '@/lib/spotify';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';

function RadioCover({ track }) {
	return (
		<div className="relative h-44 w-44 shrink-0 sm:h-52 sm:w-52 lg:h-56 lg:w-56">
			<Cover images={track?.album?.images} type="album" alt="" size={300} priority className="h-full w-full shadow-2xl shadow-black/50" />
			<div className="absolute inset-0 rounded-md bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
			<span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-fg shadow">
				<Radio className="h-3.5 w-3.5" /> Radio
			</span>
		</div>
	);
}

export default function RadioPage() {
	const { query } = useRouter();
	const id = typeof query.trackId === 'string' ? query.trackId : null;
	const { data: session, status } = useSession();
	const enabled = status === 'authenticated' && Boolean(id);
	const queryClient = useQueryClient();
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	const [variant, setVariant] = useState(0);
	// Playlist saved for a given mix, so the button flips to "Saved".
	const [saved, setSaved] = useState({});

	const seed = useQuery({ queryKey: ['track', id], queryFn: () => spotify.getTrack(id), enabled });
	const radio = useQuery({
		queryKey: ['radio', id, variant],
		queryFn: () => buildRadio(seed.data, variant),
		enabled: Boolean(seed.data),
		staleTime: Infinity
	});

	const tracks = useMemo(() => radio.data?.tracks ?? [], [radio.data]);
	const rows = useMemo(() => tracks.map((track) => ({ track })), [tracks]);
	const uris = useMemo(() => tracks.map((t) => t.uri), [tracks]);
	const totalMs = tracks.reduce((s, t) => s + (t.duration_ms ?? 0), 0);
	const title = seed.data ? `${seed.data.name} Radio` : 'Song radio';
	const savedPlaylist = saved[variant];
	const isCurrent = uris.length > 0 && now.uri && uris.includes(now.uri) && !now.contextUri;

	const save = useMutation({
		mutationFn: async () => {
			const artists = seed.data.artists?.map((a) => a.name).join(', ');
			const playlist = await spotify.createPlaylist(session?.user?.id, {
				name: title,
				description: `Songs like ${seed.data.name} by ${artists}. Made with Antefy.`
			});
			await spotify.addTracksToPlaylist(playlist.id, uris);
			return playlist;
		},
		onSuccess: (playlist) => {
			setSaved((s) => ({ ...s, [variant]: playlist }));
			queryClient.invalidateQueries({ queryKey: ['library', 'playlists'] });
			toast.success(`Saved “${playlist.name}” to your library`);
		},
		onError: (e) => {
			if (e instanceof spotify.SpotifyApiError && (e.status === 401 || e.status === 403)) {
				toast.error('Saving playlists needs an extra permission.', {
					action: { label: 'Re-authorize', onClick: () => signIn('spotify', { callbackUrl: window.location.href }) }
				});
			} else {
				toast.error(spotify.describeError(e));
			}
		}
	});

	if (seed.error) return <ErrorState error={seed.error} onRetry={seed.refetch} className="min-h-[60vh]" />;

	return (
		<>
			<Head>
				<title>{`${title} · Antefy`}</title>
			</Head>
			<CollectionHeader
				loading={seed.isLoading}
				label="Song radio"
				title={title}
				images={seed.data?.album?.images}
				seed={id}
				cover={seed.data ? <RadioCover track={seed.data} /> : undefined}
				description={
					radio.data?.source === 'mix'
						? 'A mix built from this song’s artist and genres.'
						: radio.data
							? 'Recommended by Spotify based on this song.'
							: undefined
				}
				meta={
					seed.data && (
						<>
							<span>
								Based on <span className="font-semibold">{seed.data.name}</span> by{' '}
								{seed.data.artists?.[0]?.id ? (
									<Link href={`/artist/${seed.data.artists[0].id}`} className="font-semibold hover:underline">
										{seed.data.artists[0].name}
									</Link>
								) : (
									seed.data.artists?.[0]?.name
								)}
							</span>
							{tracks.length > 0 && (
								<>
									<Dot />
									<span>{pluralize(tracks.length, 'song')}</span>
									<span className="-ml-1.5 text-white/70">, {formatLongDuration(totalMs)}</span>
								</>
							)}
						</>
					)
				}
			/>
			{tracks.length > 0 && (
				<ActionBar>
					<PlayButton
						size="lg"
						playing={isCurrent && now.isPlaying}
						onClick={() => (isCurrent ? playFrom({ uris }, tracks.find((t) => t.uri === now.uri)) : playFrom({ uris }, tracks[0]))}
						label="Play radio"
					/>
					<IconButton
						label="New mix"
						size="lg"
						disabled={radio.isFetching}
						onClick={() => setVariant((v) => v + 1)}
					>
						<RefreshCw className={radio.isFetching ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
					</IconButton>
					{savedPlaylist ? (
						<Link
							href={`/playlist/${savedPlaylist.id}`}
							className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10"
						>
							<Check className="h-4 w-4" /> Saved · Open playlist
						</Link>
					) : (
						<button
							type="button"
							disabled={save.isPending}
							onClick={() => save.mutate()}
							className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-fg disabled:opacity-50"
						>
							<ListPlus className="h-4 w-4" />
							{save.isPending ? 'Saving…' : 'Save as playlist'}
						</button>
					)}
				</ActionBar>
			)}
			{seed.isLoading || radio.isLoading ? (
				<TrackListSkeleton />
			) : radio.error ? (
				<ErrorState error={radio.error} onRetry={radio.refetch} />
			) : tracks.length <= 1 ? (
				<EmptyState icon={Radio} title="Couldn’t build a radio for this song">
					Spotify didn’t return enough similar songs. Try another track.
				</EmptyState>
			) : (
				<TrackList items={rows} context={{ uris }} />
			)}
		</>
	);
}
