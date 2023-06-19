import { useSession } from 'next-auth/react';

import Layout from '../components/Layout';
import Loading from '../components/Loading';
import SongTable from '../components/SongTable';
import useLikedSongs from '../hooks/useLikedSongs';
import { getRandomInt, historyHeaders } from '../lib/utility';

function LikedSongs() {
	const { data: session } = useSession();
	const backgroundImg = getRandomInt(1, 14);
	const { likedSongs } = useLikedSongs();
	const loading = !likedSongs?.length;

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
				{loading ? (
					<Loading />
				) : (
					<SongTable songs={likedSongs} type="playlist" headers={historyHeaders} />
				)}
			</div>
		</Layout>
	);
}

export default LikedSongs;
