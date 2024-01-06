import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../components/Layout';
import ListHeader from '../../components/listHeader';
import usePodcast from '../../hooks/usePodcast';
import Show from '../../components/Show';

const PodcastDetails = () => {
	const router = useRouter();
	const { podcastId } = router.query;
	const { podcast, loading } = usePodcast(podcastId);
	return (
		<Layout>
			<ListHeader data={podcast} audioType="PODCAST" />
			<div className="pb-28">
				{podcast?.items?.map((show, idx) => (
					<Show show={show} key={idx} />
				))}
			</div>
		</Layout>
	);
};

export default PodcastDetails;
