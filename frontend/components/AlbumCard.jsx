import Link from 'next/link';
import React from 'react';
import { useRecoilState } from 'recoil';
import { albumIdState, albumState } from '../atoms/albumAtom';
import useSongs from '../hooks/useSongs';
import spotifyApi from '../lib/spotify';

function AlbumCard({ data }) {
	const [album, setAlbum] = useRecoilState(albumState);
	const { setSongs } = useSongs();

	const handleAlbum = (albumId) => {
		spotifyApi.getAlbum(albumId).then((data) => {
			setAlbum(data.body);
			setSongs(data.body?.tracks?.items);
		});
	};

	return (
		<Link href="/album" key={data.id}>
			<div
				onClick={() => handleAlbum(data.id)}
				className="p-2 bg-zinc-200 dark:bg-zinc-900 cursor-pointer rounded-md items-center shadow-2xl hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs"
			>
				<img
					src={data?.images?.[0]?.url}
					className="shadow-md shadow-neutral-500/50 mx-auto rounded-md"
					alt="No Image"
				/>
				<h3 className="text-zinc-800 dark:text-white truncate">{data?.name}</h3>
				<p className="text-zinc-500">{data?.artists?.[0].name}</p>
			</div>
		</Link>
	);
}

export default AlbumCard;
