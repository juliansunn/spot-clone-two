import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { songListState } from '../atoms/songAtom';
import Layout from '../components/Layout';
import SongTable from '../components/SongTable';
import useSpotify from '../hooks/useSpotify';
import { getRandomInt, historyHeaders } from '../lib/utility';

function LikedSongs() {
	const { data: session } = useSession();
	const spotifyApi = useSpotify();
	const [songs, setSongs] = useRecoilState(songListState);

	const [backgroundImg, setBackgroundImg] = useState(null);

	const getLikedSongs = async (offset) => {
		const likedSongs = [];
		for (let i = 0; i < 20; ++i) {
			likedSongs.push(
				spotifyApi.getMySavedTracks({
					offset: i * offset
				})
			);
		}
		Promise.all(likedSongs)
			.then((data) => {
				const d = data[0];
				for (let j = 1; j < Math.ceil(d.body.total / offset); j++) {
					d.body.items.push(...data[j].body.items);
				}
				setSongs(d.body?.items);
			})
			.catch((e) => {
				console.log('Error Fetching LikedSongs: ', e);
			});
	};

	useEffect(() => {
		getLikedSongs(20);
		setBackgroundImg(getRandomInt(1, 14));
	});

	return (
		<Layout>
			<div
				className={`flex items-end  bg-gradient-to-l to-blue-100 from-zinc-400  min-h-64 w-full relative pt-16`}
			>
				<img
					src={`/img/${backgroundImg}.jpg`}
					className="h-full w-full object-cover mix-blend-overlay absolute zincscale"
					alt="cant find the photo"
				/>
				<div className=" flex items-center gap-x-2 p-5 relative">
					<img
						src={session?.user?.image}
						className="h-52 w-52 shadow-2xl shadow-black rounded-md"
						alt="no image"
					/>
					<div className="flex flex-col h-44">
						<h1 className="text-5xl md:text-3xl xl:text-6xl mb-5 text-zinc-900 drop-shadow-lg truncate pb-5 capitalize tracking-[0.5rem]">
							MY LIKED SONGS
						</h1>
					</div>
				</div>
			</div>
			<div>
				<SongTable songs={songs} type="playlist" headers={historyHeaders} />
			</div>
		</Layout>
	);
}

export default LikedSongs;
