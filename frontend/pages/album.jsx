import React from 'react';
import { useRecoilValue } from 'recoil';
import { albumState } from '../atoms/albumAtom';
import { songListState } from '../atoms/songAtom';
import Layout from '../components/Layout';
import ListHeader from '../components/listHeader';
import SongTable from '../components/SongTable';
import { albumHeaders } from '../lib/utility';

function Album() {
	const album = useRecoilValue(albumState);
	const songs = useRecoilValue(songListState);

	return (
		<Layout>
			<ListHeader data={album} audioType="ALBUM" />
			<div>
				<SongTable type="album" songs={songs} headers={albumHeaders} />
			</div>
		</Layout>
	);
}

export default Album;
