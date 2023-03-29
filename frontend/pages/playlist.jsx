import React from 'react';
import Layout from '../components/Layout';

import ListHeader from '../components/listHeader';
import SongTable from '../components/SongTable';
import usePlaylist from '../hooks/usePlaylist';
import { playlistHeaders } from '../lib/utility';

function Playlist() {
	const { playlist } = usePlaylist();

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
}

export default Playlist;
