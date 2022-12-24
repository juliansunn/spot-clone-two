import React from 'react';
import SongTable from './SongTable';
import ListHeader from './listHeader';
import { playlistHeaders } from '../lib/utility';

function Playlist({ playlist, type }) {
	return (
		<div>
			<ListHeader data={playlist} audioType={type.toUpperCase()} />
			<div>
				<SongTable
					songs={playlist?.tracks?.items}
					type={type}
					headers={playlistHeaders}
				/>
			</div>
		</div>
	);
}

export default Playlist;
