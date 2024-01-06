import Link from 'next/link';
import React from 'react';
import { useRecoilState } from 'recoil';
import { podcastIdState, podcastState } from '../atoms/podcastAtom';

function PodcastCard({ data }) {
	const [podcastId, setPodcastId] = useRecoilState(podcastIdState);
	const [podcast, setPodcast] = useRecoilState(podcastState);
	return (
		<Link href={`/podcast/${data.id}`} key={data.id}>
			<div className=" p-2 bg-zinc-200 dark:bg-zinc-900 cursor-pointer rounded-md items-center shadow-2xl hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs ">
				<img
					src={data?.images?.[0]?.url}
					className="shadow-md shadow-neutral-500/50 mx-auto rounded-md"
					alt="No Image"
				/>
				<h3 className="text-zinc-800 dark:text-white truncate">{data?.name}</h3>
				<p className="flex-wrap truncate text-zinc-500">{data?.description}</p>
				<p className="truncate text-zinc-500">By {data?.publisher}</p>
			</div>
		</Link>
	);
}

export default PodcastCard;
