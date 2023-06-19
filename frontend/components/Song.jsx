import { useRecoilValue, useSetRecoilState } from 'recoil';
import useSpotify from '../hooks/useSpotify';
import { millisToMinutesAndSeconds } from '../lib/utility';
import { PauseIcon, PlayIcon, PlusIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { albumState } from '../atoms/albumAtom';
import useSongControls from '../hooks/useSongControls';
import useSongs from '../hooks/useSongs';
import { isPlayingState } from '../atoms/songAtom';

function Song({ track, order, addedAt }) {
	const { spotifyApi } = useSpotify();
	const { handlePlayPause, playSong, currentTrackId, likeSong } =
		useSongControls();
	const isPlaying = useRecoilValue(isPlayingState);
	const { setSongs } = useSongs();
	const setAlbum = useSetRecoilState(albumState);

	const handleAlbum = () => {
		spotifyApi
			.getAlbum(
				track?.album?.spotify_id ? track?.album?.spotify_id : track?.album?.id
			)
			.then((data) => {
				setAlbum(data.body);
				setSongs(data.body?.tracks?.items);
			});
	};
	return (
		<tr
			className={
				'text-zinc-800 dark:text-zinc-200 mb-3 py-4 px-5 hover:bg-gradient-to-b to-zinc-100 dark:to-zinc-900 from-zinc-200 dark:from-zinc-700 text-sm h-10' +
				(track?.id === currentTrackId ? (isPlaying ? ' animate-pulse ' : '') : '')
			}
			onDoubleClick={() => playSong(track, order)}
		>
			<td>
				<div className="flex flex-row items-right justify-evenly">
					{track?.id === currentTrackId ? (
						<div>
							{isPlaying ? (
								<PauseIcon
									onClick={handlePlayPause}
									className="button stroke-green-400 animate-bounce"
								/>
							) : (
								<PlayIcon
									onClick={handlePlayPause}
									className="button stroke-green-400 animate-bounce"
								/>
							)}
						</div>
					) : (
						<p>{order + 1}</p>
					)}
				</div>
			</td>

			<td className="flex items-center space-x-4 text-zinc-800 dark:text-zinc-500">
				{track?.album && (
					<img
						className="h-10 w-10"
						src={track.album?.images[0]?.url}
						alt={track.album?.name}
					/>
				)}

				<div>
					<p className="w-36 lg:w-64 truncate font-semibold dark:font-normal text-zinc-800 dark:text-white">
						{track?.name}
					</p>
					<div className="flex space-x-2">
						{track?.artist?.map((a) => (
							<Link
								key={a.id}
								href={`/artist/${a.id}`}
								className="truncate cursor-pointer tranistion"
							>
								{a?.name}
							</Link>
						))}
					</div>
				</div>
			</td>
			{track?.album && (
				<td>
					<Link
						href={`/album/${
							track.album.spotify_id ? track.album.spotify_id : track.album.id
						}`}
						key={track.album.id}
						className="flex items-center justify-between ml-auto md:ml-0 cursor-pointer"
						onClick={handleAlbum}
					>
						<>
							<p className="w-40 truncate">{track?.album?.name}</p>
						</>
					</Link>
				</td>
			)}

			{addedAt && (
				<td>
					<p>{addedAt}</p>
				</td>
			)}

			<td>
				<div>
					<p>{millisToMinutesAndSeconds(track?.duration_ms)}</p>
				</div>
			</td>
			<td>
				<PlusIcon
					className="button hover:text-green-500"
					onClick={() => likeSong(track?.id)}
				/>
			</td>
		</tr>
	);
}

export default Song;
