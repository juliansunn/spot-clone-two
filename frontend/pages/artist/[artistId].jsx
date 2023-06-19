import React from 'react';
import { useRouter } from 'next/router';
import useArtist from '../../hooks/useArtist';
import Layout from '../../components/Layout';
import ListHeader from '../../components/listHeader';
import AlbumCard from '../../components/AlbumCard';
import Loading from '../../components/Loading';
import SongTable from '../../components/SongTable';
import { albumHeaders, artistSongHeaders } from '../../lib/utility';

const Artist = () => {
	const router = useRouter();
	const { artistId } = router.query;
	const { artist, artistAlbums, topArtistSongs, loading } = useArtist(artistId);

	return (
		<Layout>
			<ListHeader data={artist} audioType="ARTIST" />
			<div className="px-10">
				<h2 className="tracking-[10px] text-zinc-900 dark:text-zinc-200 text-xl bg-zinc-200 dark:bg-zinc-900">
					POPULAR
				</h2>
				<SongTable
					type="artist"
					songs={topArtistSongs}
					headers={artistSongHeaders}
				/>
			</div>
			{loading ? (
				<Loading />
			) : (
				<div className="px-10">
					<h2 className="tracking-[10px] text-zinc-900 dark:text-zinc-200 text-xl sticky bg-zinc-200 dark:bg-zinc-900">
						ALBUMS
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4  pb-24 pt-3">
						{artistAlbums?.map((album) => (
							<AlbumCard key={album?.id} data={album} />
						))}
					</div>
				</div>
			)}
		</Layout>
	);
};

export default Artist;
