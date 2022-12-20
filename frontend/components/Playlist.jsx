import React from 'react';
import SongTable from './SongTable';
import ListHeader from './listHeader';

function Playlist({ playlist, type }) {
	return (
		<div>
			<ListHeader data={playlist} audioType={type.toUpperCase()} />
			<div>
				{/* <SongTable {...props}/> */}
				<SongTable songs={playlist?.tracks?.items} type={type} />
			</div>
		</div>
	);
}

export default Playlist;
