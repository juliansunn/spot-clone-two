import { PauseIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/outline';
import React from 'react';
import { useRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackTypeState,
	isPlayingState,
	manualChangeState
} from '../atoms/songAtom';
import useSpotify from '../hooks/useSpotify';

function Show({ show }) {
	const { spotifyApi } = useSpotify();
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [currentTrackType, setCurrentTrackType] = useRecoilState(
		currentTrackTypeState
	);

	const playShow = () => {
		setCurrentTrackId(show.id);
		setCurrentTrackType(show.episode);
		setIsPlaying(true);
		setManualChange(true);
		spotifyApi.play({
			uris: [show.uri],
			position_ms: !show.resume_point.fully_played
				? show.resume_point.resume_position_ms
				: 0
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
		<div
			onClick={playShow}
			className="cursor-pointer grid-container grid grid-cols-8 space-x-3 px-8  border-zinc-700 p-5 m-5 hover:bg-gradient-to-b to-zinc-200 dark:to-zinc-900 from-zinc-300 dark:from-zinc-800 rounded-lg"
		>
			<div className="col-span-1 flex items-start justify-start">
				<img
					className="mx-auto hidden md:inline rounded-md"
					src={show.images[0].url}
					alt="No Image"
				/>
			</div>
			<div className="col-span-7">
				<div className="flex space-x-3">
					{show.resume_point.fully_played && (
						<CheckCircleIcon className="button stroke-green-400" />
					)}
					<h3 className="text-lg text-zinc-800 dark:text-zinc-200">{show.name}</h3>
					{show.id === currentTrackId && (
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
					)}
				</div>
				<p className="text-zinc-700 dark:text-zinc-400 overflow-hidden h-24 ">
					{show.description}
				</p>
			</div>
		</div>
	);
}

export default Show;
