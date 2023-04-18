import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import useSongInfo from '../hooks/useSongInfo';
import useSpotify from '../hooks/useSpotify';

function getIdFromUri(uri) {
	const uriArray = uri.split(':');
	return uriArray[uriArray.length - 1];
}

export default function Home() {
	const { songInfo, context } = useSongInfo();
	const { spotifyApi, loading } = useSpotify();
	const [currentlyPlaying, setCurrentlyPlaying] = useState();
	console.log('currentlyPlaying', currentlyPlaying);

	useEffect(() => {
		if (context && !loading) {
			console.log('context', context);
			if (context?.type === 'playlist')
				spotifyApi
					.getPlaylist(getIdFromUri(context?.uri))
					.then((res) => setCurrentlyPlaying(res.data));
		}
	}, [context]);

	return (
		<Layout>
			<div className="flex items-center justify-center h-screen text-zinc-300">
				{context?.type}
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const session = await getSession(context);
	return {
		props: {
			session
		}
	};
}
