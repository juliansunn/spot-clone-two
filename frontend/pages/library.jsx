import React, { useState } from 'react';

import Layout from '../components/Layout';
import Loading from '../components/Loading';
import PlaylistCard from '../components/PlaylistCard';
import PodcastCard from '../components/PodcastCard';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import usePlaylists from '../hooks/usePlaylists';
import useArtists from '../hooks/useArtists';
import useAlbums from '../hooks/useAlbums';
import useShows from '../hooks/useShows';

function Library() {
	const [contentType, setContentType] = useState(0);

	const contentList = ['Playlists', 'Podcasts', 'Artists', 'Albums'];
	const { playlists, loading: playlistLoading } = usePlaylists();
	const { artists, loading: artistLoading } = useArtists();
	const { albums, loading: albumLoading } = useAlbums();
	const { shows, loading: showLoading } = useShows();
	return (
		<Layout>
			<div className="px-10 mt-20">
				<div className=" flex items-center justify-start px-20 w-full h-20 text-white">
					{contentList.map((content, i) => (
						<button
							key={i}
							onClick={() => {
								setContentType(i);
							}}
							className={`hover:bg-zinc-600 dark:hover:bg-zinc-600 p-3 mx-1 rounded ${
								contentType == i
									? 'bg-zinc-500 dark:bg-zinc-500'
									: 'bg-zinc-300 dark:bg-zinc-800'
							} cursor-pointer`}
						>
							{content}
						</button>
					))}
				</div>
				<h1 className="text-lg md:text-xl xl:text-2xl text-zinc-800 dark:text-white">
					{contentList[contentType]}
				</h1>
				{playlistLoading ? (
					<Loading />
				) : (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4  pb-24 pt-3">
						{contentType === 0 &&
							playlists?.map((playlist) => (
								<PlaylistCard key={playlist.id} data={playlist} />
							))}
						{contentType === 1 &&
							shows?.map((show) => (
								<PodcastCard key={show.show?.id} data={show.show} />
							))}
						{contentType === 2 &&
							artists.map((artist) => <ArtistCard key={artist.id} data={artist} />)}
						{contentType === 3 &&
							albums?.map((album) => (
								<AlbumCard key={album?.album.id} data={album?.album} />
							))}
					</div>
				)}
			</div>
		</Layout>
	);
}

export default Library;
