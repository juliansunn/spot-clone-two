import React from 'react';
import { useRecoilValue } from 'recoil';
import { playlistIdState } from '../atoms/playlistAtom';

import ListHeader from './listHeader';
import SongTable from './SongTable';
import { playlistHeaders } from '../lib/utility';
import usePlaylist from '../hooks/usePlaylist';

function Center() {
	const playlistId = useRecoilValue(playlistIdState);
	const { playlist } = usePlaylist(playlistId);

	return (
		<div>
			<ListHeader data={playlist} audioType="PLAYLIST" />
			<div>
				<SongTable
					songs={playlist?.tracks?.items}
					type="playlist"
					headers={playlistHeaders}
				/>
			</div>
		</div>
	);
}

export default Center;
