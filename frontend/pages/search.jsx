import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { albumIdsState } from '../atoms/albumAtom';
import { artistIdsState } from '../atoms/artistAtom';
import { searchQueryState } from '../atoms/searchAtom';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import Layout from '../components/Layout';
import PlaylistCard from '../components/PlaylistCard';
import PodcastCard from '../components/PodcastCard';
import useSpotify from '../hooks/useSpotify';
import SongTable from '../components/SongTable';
import { albumHeaders, playlistHeaders } from '../lib/utility';

function Search() {
	const { data: session } = useSession();
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const searchQuery = useRecoilValue(searchQueryState);
	const [albumIds, setAlbumIds] = useRecoilState(albumIdsState);
	const setArtistIds = useSetRecoilState(artistIdsState);
	const [tracks, setTracks] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [artists, setArtists] = useState([]);
	const [podcasts, setPodcasts] = useState([]);
	const [podcastsIds, setPodcastIds] = useState([]);

	const getSearchTracks = () => {
		spotifyApi
			.searchTracks(`track:${searchQuery}`)
			.then((data) => {
				setTracks(data.body.tracks.items);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const getSearchAlbums = () => {
		spotifyApi
			.searchAlbums(`album:${searchQuery}`)
			.then((data) => {
				setAlbums(data.body.albums?.items);
				setAlbumIds(
					data.body.albums?.items.map((album) => {
						return album.id;
					})
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const getSearchArtists = () => {
		spotifyApi
			.searchArtists(`artist:${searchQuery}`)
			.then((data) => {
				setArtists(data.body.artists?.items);
				setArtistIds(
					data.body.artists?.items.map((artist) => {
						return artist.id;
					})
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};
	const getSearchPodcasts = () => {
		spotifyApi
			.searchEpisodes(`episode:${searchQuery}`)
			.then((data) => {
				console.log('data', data);
				setPodcasts(data.body.episodes?.items);
				setPodcastIds(
					data.body.episodes?.items.map((episode) => {
						return episode.id;
					})
				);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	useEffect(() => {
		getSearchTracks();
		getSearchAlbums();
		getSearchArtists();
		getSearchPodcasts();
	}, [searchQuery]);
	return (
		<Layout>
			<div className="px-5">
				{/* Lib center */}
				<div className="py-24 space-y-2">
					<div className="px-10 py-5 bg-gradient-to-t from-zinc-200 dark:from-zinc-900 to-zinc-300 dark:to-zinc-800 rounded-xl">
						<h1 className="text-lg md:text-xl xl:text-2xl text-zinc-800 dark:text-zinc-300">
							Artist Results
						</h1>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-3">
							{artists?.map((artist) =>
								artist.popularity > 5 ? (
									<ArtistCard key={artist.id} data={artist} />
								) : (
									console.log('pop: ', artist.popularity, artist.name)
								)
							)}
						</div>
					</div>
					<div className="px-10 py-5 bg-gradient-to-t from-zinc-200 dark:from-zinc-900 to-zinc-300 dark:to-zinc-800 rounded-xl">
						<h1 className="text-lg md:text-xl xl:text-2xl text-zinc-800 dark:text-zinc-300">
							Album Results
						</h1>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-3">
							{albums?.map((album) => (
								<AlbumCard key={album?.id} data={album} />
							))}
						</div>
					</div>
					<div className="px-10 py-5 bg-gradient-to-t from-zinc-200 dark:from-zinc-900 to-zinc-300 dark:to-zinc-800 rounded-xl">
						<h1 className="text-lg md:text-xl xl:text-2xl text-zinc-800 dark:text-zinc-300">
							Podcast Results
						</h1>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-3">
							{podcasts?.map((podcast) => (
								<PodcastCard key={podcast?.id} data={podcast} />
							))}
						</div>
					</div>
					<div className="px-10 py-5">
						<h1 className="text-lg md:text-xl xl:text-2xl text-zinc-800 dark:text-zinc-300">
							Song Results
						</h1>
						<div className="pt-3">
							{tracks && (
								<SongTable type="album" songs={tracks} headers={playlistHeaders} />
							)}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default Search;
