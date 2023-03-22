import { PauseIcon, PlayIcon } from '@heroicons/react/outline';
import React from 'react';
import { useRecoilState } from 'recoil';
import { podcastShowIdState } from '../atoms/podcastAtom';
import {
	currentTrackIdState,
	isPlayingState,
	manualChangeState
} from '../atoms/songAtom';
import useSpotify from '../hooks/useSpotify';

function Show({ show }) {
	const spotifyApi = useSpotify();
	const [podcastShowId, setPodcastShowId] = useRecoilState(podcastShowIdState);
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);

	const playShow = () => {
		setPodcastShowId(show.id);
		setCurrentTrackId(show.id);

		// setCurrentTrackLocState(order);
		setIsPlaying(true);
		setManualChange(true);
		spotifyApi.play({
			uris: [show.uri]
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
			className="cursor-pointer grid-container grid grid-cols-8 space-x-3 px-8  hover:border-b border-zinc-700 p-5 m-5 hover:bg-gradient-to-b to-zinc-900 from-zinc-800 rounded-lg"
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
					<h3>{show.name}</h3>
					{show.id === podcastShowId && (
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
				<p className="text-zinc-500 overflow-hidden h-24 ">{show.description}</p>
			</div>
		</div>
	);
}

export default Show;
