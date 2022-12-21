import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { albumIdState, albumState } from '../atoms/albumAtom';
import Layout from '../components/Layout';
import ListHeader from '../components/listHeader';
import SongTable from '../components/SongTable';
import spotifyApi from '../lib/spotify';

function Album() {
	const albumId = useRecoilValue(albumIdState);
	const [album, setAlbum] = useRecoilState(albumState);
	useEffect(() => {
		if (albumId) {
			spotifyApi.getAlbum(albumId).then((data) => {
				setAlbum(data.body);
			});
		}
	}, [albumId]);
	return (
		<Layout>
			<ListHeader data={album} audioType="ALBUM" />
			<div>
				<SongTable type="album" album={album} />
			</div>
		</Layout>
	);
}

export default Album;
