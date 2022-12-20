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

function Song({ track, order, addedAt }) {
	const spotifyApi = useSpotify();

	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

	const setCurrentTrackLocState = useSetRecoilState(currentTrackLocState);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
	const setManualChange = useSetRecoilState(manualChangeState);
	const songs = useRecoilValue(songListState);

	function handleTracks() {
		const tracks = songs.map((track, i) => ({
			position: i,
			uri: track.track ? track.track.uri : track.uri,
			id: track.track ? track.track.id : track.id
		}));
		setTrackInfo(tracks);
		return tracks;
	}

	const playSong = () => {
		handleTracks();
		setCurrentTrackId(track.id);
		setCurrentTrackLocState(order);
		setIsPlaying(true);
		setManualChange(true);
		spotifyApi.play({
			uris: handleTracks().map(({ uri }) => uri),
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
				'text-gray-800 dark:text-gray-200 mb-3 py-4 px-5 hover:bg-gradient-to-b to-gray-100 dark:to-gray-900 from-gray-200 dark:from-gray-700 text-sm lg:text-lg cursor-pointer' +
				(track?.id === currentTrackId ? (isPlaying ? ' animate-pulse ' : '') : '')
			}
			onClick={playSong}
		>
			<td>
				<div className="flex flex-row items-center justify-evenly">
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
				<img
					className="h-10 w-10"
					src={track?.album?.images[0]?.url}
					alt={track?.album?.name}
				/>
				<div>
					<p className="w-36 lg:w-64 truncate font-semibold dark:font-normal text-gray-800 dark:text-white">
						{track?.name}
					</p>
					<p className="truncate">
						{track?.artists ? track.artists[0]?.name : null}
					</p>
				</div>
			</td>
			<td>
				<div className="flex items-center justify-between ml-auto md:ml-0">
					<p className="hidden md:inline w-40 md:truncate">{track?.album?.name}</p>
				</div>
			</td>
			<td>
				<p className="hidden md:inline">{parseDate(addedAt)}</p>
			</td>
			<td>
				<div className="flex justify-center">
					<p>{millisToMinutesAndSeconds(track?.duration_ms)}</p>
				</div>
			</td>
		</tr>
	);
}

export default Song;
