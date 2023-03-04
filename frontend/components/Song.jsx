import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
	currentTrackIdState,
	isPlayingState,
	currentTrackLocState,
	trackInfoState,
	manualChangeState,
	songListState
} from '../atoms/songAtom';
import useSpotify from '../hooks/useSpotify';
import { millisToMinutesAndSeconds, parseDate } from '../lib/utility';
import { PauseIcon, PlayIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import { albumState } from '../atoms/albumAtom';

function Song({ id, track, order, addedAt }) {
	const spotifyApi = useSpotify();

	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

	const setCurrentTrackLocState = useSetRecoilState(currentTrackLocState);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
	const setManualChange = useSetRecoilState(manualChangeState);
	const [songs, setSongs] = useRecoilState(songListState);
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

	function handleTracks() {
		const tracks = songs.map((track, i) => ({
			position: i,
			uri: track.track ? track.track.uri : track.uri,
			id: track.track ? track.track.id : track.spotify_id
		}));
		setTrackInfo(tracks);
		return tracks;
	}

	const playSong = () => {
		handleTracks();
		setCurrentTrackId(track?.id);
		setCurrentTrackLocState(order);
		setIsPlaying(true);
		setManualChange(true);
		const uris = handleTracks().map(({ uri }) => uri);
		spotifyApi.play({
			uris: uris,
			offset: { position: order }
		});
	};

	const handlePlayPause = (event) => {
		event.stopPropagation();
		spotifyApi.getMyCurrentPlaybackState().then((data) => {
			if (data?.body?.is_playing) {
				spotifyApi.pause();
				setIsPlaying(false);
			} else {
				spotifyApi.play();
				setIsPlaying(true);
			}
		});
	};
	return (
		<tr
			className={
				'text-gray-800 dark:text-gray-200 mb-3 py-4 px-5 hover:bg-gradient-to-b to-gray-100 dark:to-gray-900 from-gray-200 dark:from-gray-700 text-sm' +
				(track?.id === currentTrackId ? (isPlaying ? ' animate-pulse ' : '') : '')
			}
			onDoubleClick={playSong}
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

			<td className="flex items-center space-x-4 text-gray-800 dark:text-gray-500">
				{track?.album && (
					<img
						className="h-10 w-10"
						src={track.album?.images[0]?.url}
						alt={track.album?.name}
					/>
				)}

				<div>
					<p className="w-36 lg:w-64 truncate font-semibold dark:font-normal text-gray-800 dark:text-white">
						{track?.name}
					</p>
					<div className="flex space-x-2">
						{track?.artist?.map((a) => (
							<Link
								key={a.id}
								href="/artist"
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
						href="/album"
						className="flex items-center justify-between ml-auto md:ml-0 cursor-pointer"
					>
						<a onClick={handleAlbum}>
							<p className="w-40 truncate">{track?.album?.name}</p>
						</a>
					</Link>
				</td>
			)}

			{addedAt && (
				<td>
					<p className="hidden md:inline">{parseDate(addedAt)}</p>
				</td>
			)}

			<td>
				<div>
					<p>{millisToMinutesAndSeconds(track?.duration_ms)}</p>
				</div>
			</td>
		</tr>
	);
}

export default Song;
