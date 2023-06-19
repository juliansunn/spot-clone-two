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

function Search() {
	const { data: session } = useSession();
	const { spotifyApi, loading: spotifyLoading } = useSpotify();
	const searchQuery = useRecoilValue(searchQueryState);
	const [albumIds, setAlbumIds] = useRecoilState(albumIdsState);
	const setArtistIds = useSetRecoilState(artistIdsState);
	const [tracks, setTracks] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [artists, setArtists] = useState([]);

	const getSearchTracks = () => {
		spotifyApi
			.searchTracks(`track:${searchQuery}`)
			.then((data) => {
				setTracks(data.body.items);
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

	useEffect(() => {
		getSearchTracks();
		getSearchAlbums();
		getSearchArtists();
	}, [searchQuery]);
	return (
		<Layout>
			<div>
				{/* Lib center */}
				<div className="py-24">
					<h1 className="text-lg md:text-xl xl:text-2xl text-white">
						ARTIST Results
					</h1>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
						{artists?.map((artist) =>
							artist.popularity > 5 ? (
								<ArtistCard key={artist.id} data={artist} />
							) : (
								console.log('pop: ', artist.popularity, artist.name)
							)
						)}
					</div>
					<h1 className="text-lg md:text-xl xl:text-2xl text-white">
						ALBUM Results
					</h1>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
						{albums?.map((album) => (
							<AlbumCard key={album?.id} data={album} />
						))}
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default Search;
