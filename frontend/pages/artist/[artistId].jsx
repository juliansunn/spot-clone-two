import React from 'react';
import { useRouter } from 'next/router';
import useArtist from '../../hooks/useArtist';
import Layout from '../../components/Layout';
import ListHeader from '../../components/listHeader';
import AlbumCard from '../../components/AlbumCard';

const Artist = () => {
	const router = useRouter();
	const { artistId } = router.query;
	const { artist, artistAlbums, topArtistSongs, loading } = useArtist(artistId);
	return (
		<Layout>
			<ListHeader data={artist} type="artist" />
			<div className="px-10 mt-20">
				<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4  pb-24 pt-3">
					{artistAlbums?.map((album) => (
						<AlbumCard key={album?.id} data={album} />
					))}
				</div>
			</div>
		</Layout>
	);
};

export default Artist;
