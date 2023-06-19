import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../components/Layout';
import ListHeader from '../../components/listHeader';
import SongTable from '../../components/SongTable';
import useAlbum from '../../hooks/useAlbum';
import Loading from '../../components/Loading';
import { albumHeaders } from '../../lib/utility';

const AlbumDetails = () => {
	const router = useRouter();
	const { albumId } = router.query;
	const { album, loading } = useAlbum(albumId);
	return (
		<Layout>
			<ListHeader data={album} audioType="ALBUM" />

			{loading ? (
				<Loading />
			) : (
				<div>
					<SongTable
						type="album"
						songs={album?.tracks?.items}
						headers={albumHeaders}
					/>
				</div>
			)}
		</Layout>
	);
};

export default AlbumDetails;
