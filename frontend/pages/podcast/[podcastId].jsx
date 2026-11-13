import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Podcast } from 'lucide-react';
import CollectionHeader, { ActionBar, Dot } from '@/components/media/CollectionHeader';
import EpisodeRow from '@/components/media/EpisodeRow';
import PlayButton from '@/components/media/PlayButton';
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States';
import { cleanDescription, pluralize } from '@/lib/format';
import { useInView } from '@/hooks/useInView';
import { useNowPlaying, usePlayFrom } from '@/hooks/usePlayback';
import { useShow } from '@/hooks/useCollections';

export default function PodcastPage() {
	const { query } = useRouter();
	const id = query.podcastId;
	const { show, episodes } = useShow(id);
	const playFrom = usePlayFrom();
	const now = useNowPlaying();
	const [expanded, setExpanded] = useState(false);
	const s = show.data;

	const list = useMemo(() => (episodes.data?.pages ?? []).flatMap((p) => p.items ?? []).filter(Boolean), [episodes.data]);
	const sentinel = useInView(() => episodes.hasNextPage && !episodes.isFetchingNextPage && episodes.fetchNextPage(), {
		enabled: Boolean(episodes.hasNextPage)
	});

	const onPlay = useCallback(
		(ep) => {
			const resume = ep.resume_point;
			const positionMs = !resume?.fully_played ? resume?.resume_position_ms : 0;
			playFrom({ contextUri: s?.uri }, ep, { positionMs });
		},
		[playFrom, s?.uri]
	);

	if (show.error) return <ErrorState error={show.error} onRetry={show.refetch} className="min-h-[60vh]" />;
	const isCurrent = s && now.contextUri === s.uri;
	const description = cleanDescription(s?.description);

	return (
		<>
			<Head>
				<title>{s ? `${s.name} · Antefy` : 'Podcast · Antefy'}</title>
			</Head>
			<CollectionHeader
				loading={show.isLoading}
				label="Podcast"
				title={s?.name}
				images={s?.images}
				coverType="show"
				seed={id}
				meta={
					s && (
						<>
							{s.publisher && (
								<>
									<span className="font-semibold">{s.publisher}</span>
									<Dot />
								</>
							)}
							<span>{pluralize(s.total_episodes ?? list.length, 'episode')}</span>
						</>
					)
				}
			/>
			{s && (
				<ActionBar>
					<PlayButton
						size="lg"
						playing={isCurrent && now.isPlaying}
						onClick={() => (list[0] ? onPlay(list[0]) : playFrom({ contextUri: s.uri }))}
						label="Play latest episode"
					/>
				</ActionBar>
			)}
			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<section aria-label="Episodes">
					<h2 className="px-4 pb-2 text-xl font-bold sm:px-6">All episodes</h2>
					{episodes.isLoading ? (
						<div className="flex justify-center py-12">
							<Spinner />
						</div>
					) : episodes.error ? (
						<ErrorState error={episodes.error} onRetry={episodes.refetch} />
					) : list.length === 0 ? (
						<EmptyState icon={Podcast} title="No episodes yet" />
					) : (
						<>
							{list.map((ep) => (
								<EpisodeRow key={ep.id} episode={ep} onPlay={onPlay} />
							))}
							{episodes.hasNextPage && (
								<div ref={sentinel} className="flex justify-center py-6">
									<Spinner />
								</div>
							)}
						</>
					)}
				</section>
				{description && (
					<aside className="order-first px-4 sm:px-6 lg:order-none lg:px-0 lg:pr-6">
						<h2 className="pb-2 text-xl font-bold">About</h2>
						<p className={expanded ? 'text-sm text-muted' : 'line-clamp-4 text-sm text-muted'}>{description}</p>
						{description.length > 240 && (
							<button
								type="button"
								onClick={() => setExpanded((v) => !v)}
								className="mt-1 text-sm font-semibold hover:underline"
							>
								{expanded ? 'Show less' : 'Show more'}
							</button>
						)}
					</aside>
				)}
			</div>
		</>
	);
}
