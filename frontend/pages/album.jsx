import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { albumIdState, albumState } from '../atoms/albumAtom';
import { songListState } from '../atoms/songAtom';
import Layout from '../components/Layout';
import ListHeader from '../components/listHeader';
import SongTable from '../components/SongTable';
import spotifyApi from '../lib/spotify';
import { albumHeaders } from '../lib/utility';

function Album() {
	const album = useRecoilValue(albumState);
	const songs = useRecoilValue(songListState);
	console.log('album', album);
	console.log('songs', songs);

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
