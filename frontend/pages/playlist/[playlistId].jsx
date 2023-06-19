import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ListHeader from '../../components/listHeader';
import usePlaylist from '../../hooks/usePlaylist';
import { playlistHeaders } from '../../lib/utility';
import SongTable from '../../components/SongTable';

const Playlist = () => {
	const router = useRouter();
	const { playlistId } = router.query;
	const { playlist } = usePlaylist(playlistId);

	return (
		<Layout>
			<ListHeader data={playlist} audioType="PLAYLIST" />
			<SongTable
				songs={playlist?.tracks?.items}
				type="playlist"
				headers={playlistHeaders}
			/>
		</Layout>
	);
};

export default Playlist;
