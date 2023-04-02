import {
	ReplyIcon,
	SwitchHorizontalIcon,
	VolumeUpIcon,
	VolumeOffIcon
} from '@heroicons/react/outline';
import {
	RewindIcon,
	PlayIcon,
	FastForwardIcon,
	PauseIcon,
	DeviceMobileIcon,
	DesktopComputerIcon,
	CheckCircleIcon
} from '@heroicons/react/solid';
import ReactModal from 'react-modal';
import { debounce } from 'lodash';
import { useCallback, useState } from 'react';

import useSongInfo from '../hooks/useSongInfo';
import useSpotify from '../hooks/useSpotify';
import { millisToMinutesAndSeconds } from '../lib/utility';
import useVolume from '../hooks/useVolume';
import useSongControls from '../hooks/useSongControls';
import Image from 'next/image';
import useDidMountEffect from '../hooks/useDidMountEffect';
import useInterval from 'react-useinterval';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	durationState,
	isPlayingState,
	progressState
} from '../atoms/songAtom';
import useDevice from '../hooks/useDevice';

function Player() {
	const spotifyApi = useSpotify();
	const { volume, adjustVolume, muted, toggleMute } = useVolume();
	const { currentDevice, myDevices, activateDevice } = useDevice();
	const songInfo = useSongInfo();
	const {
		isShuffle,
		isRepeat,
		toggleShuffle,
		toggleRepeat,
		changeSong,
		manualChange,
		setManualChange,
		handlePlayPause
	} = useSongControls();
	const [modalIsOpen, setIsOpen] = useState(false);
	const isPlaying = useRecoilValue(isPlayingState);
	const [progress, setProgress] = useRecoilState(progressState);
	const [duration, setDuration] = useRecoilState(durationState);
	const [seeking, setSeeking] = useState(false);
	const [updated, setUpdated] = useState(false);
	const toggleDeviceModal = () => {
		setIsOpen((prevState) => !prevState);
	};
	const increaseProgress = (amount) => {
		const newProgress = progress + amount;
		if (newProgress < duration && !seeking && isPlaying) {
			setProgress(newProgress);
			setUpdated(false);
		} else {
			if (!updated) {
				spotifyApi.getMyCurrentPlayingTrack().then((data) => {
					setDuration(data.body?.item?.duration_ms);
					setProgress(data.body?.progress_ms);
					setUpdated(true);
				});
			}
		}
	};

	useInterval(increaseProgress, 1000, 1000);

	const debouncedAdjustProgress = useCallback(
		debounce((progress) => {
			spotifyApi.seek(progress).catch((e) => {
				console.log('Adjusting Progress Error: ', e);
			});
		}, 200),
		[]
	);

	useDidMountEffect(() => {
		if (!manualChange) {
			changeSong(1, false);
		}
		setManualChange(false);
	}, [duration]);

	return (
		<div className=" flex h-26 text-white text-xs md:text-base px-2 md:px-8 bg-gradient-to-b from-zinc-200 to-zinc-400 dark:from-zinc-900 dark:to-zinc-700  drop-shadow">
			{/* left side */}
			<div className="w-1/4">
				<div className="flex items-start space-x-4 ">
					{songInfo && (
						<>
							<Image
								className="max-h-20 max-w-20"
								src={
									songInfo?.album
										? songInfo?.album.images?.[0].url
										: songInfo?.images?.[0].url
								}
								alt="No Image"
								height={80}
								width={80}
							/>
							<div>
								<div className="flex overflow-x-hidden items-center justify-center">
									<div
										className={`flex ${
											songInfo?.name?.length > 15 ? 'animate-marquee2' : ''
										}`}
									>
										<h3 className="text-sm md:text-lg text-zinc-900 dark:text-white font-semibold dark:font-normal">
											{songInfo?.name}
										</h3>
									</div>
								</div>

								<p className="test-xs md:text:sm text-zinc-900 dark:text-zinc-500">
									{songInfo?.artists?.[0]?.name}
								</p>
							</div>
						</>
					)}
				</div>
			</div>
			{/* center */}
			<div className="w-1/2">
				<div className="grid grid-row">
					<div className="flex items-center justify-center gap-x-4">
						<SwitchHorizontalIcon
							className={`button ${
								isShuffle ? 'stroke-green-400' : 'stroke-zinc-700 dark:stroke-white'
							}`}
							onClick={toggleShuffle}
						/>

						<RewindIcon
							onClick={() => {
								changeSong(-1, true);
							}}
							className="button fill-zinc-700 dark:fill-white"
						/>
						{isPlaying ? (
							<PauseIcon
								onClick={() => handlePlayPause()}
								className="button w-10 h-10 fill-zinc-700 dark:fill-white"
							/>
						) : (
							<PlayIcon
								onClick={() => handlePlayPause()}
								className="button w-10 h-10 fill-zinc-700 dark:fill-white"
							/>
						)}
						<FastForwardIcon
							onClick={() => {
								changeSong(1, true);
							}}
							className="button fill-zinc-700 dark:fill-white"
						/>

						<ReplyIcon
							className={`button ${
								isRepeat ? 'stroke-green-400 ' : 'stroke-zinc-700 dark:stroke-white'
							} `}
							onClick={toggleRepeat}
						/>
					</div>
					<div className="flex items-center justify-center pb-2d">
						<p className="text-zinc-500">{millisToMinutesAndSeconds(progress)}</p>
						<input
							className="w-7/12 h-1 text-xs accent-green-500 hover:accent-green-300 mx-2 "
							type="range"
							value={progress}
							min={0}
							max={duration}
							onChange={(e) => {
								setSeeking(true);
								setProgress(Number(e.target.value));
								setTimeout(() => {
									setSeeking(false);
								}, 3000);
								debouncedAdjustProgress(e.target.value);
							}}
						/>
						<p className="text-zinc-500">{millisToMinutesAndSeconds(duration)}</p>
					</div>
				</div>
			</div>
			{/* Right side*/}
			<div className="flex items-center justify-end w-1/4">
				<div className="flex items-center space-x-3 md:space-x-4 justify-end">
					<DeviceMobileIcon
						className="button flex-none fill-zinc-700 dark:fill-white"
						onClick={toggleDeviceModal}
					/>
					<ReactModal
						ariaHideApp={false}
						contentLabel="Change Playback Device"
						className="h-30 w-30 bg-zinc-900 absolute bottom-20 right-40 p-5 rounded"
						onRequestClose={toggleDeviceModal}
						isOpen={modalIsOpen}
					>
						<div className="flex justify-start  space-x-2">
							<DesktopComputerIcon className="button fill-white" />
							<h4 className="text-white pb-3">
								Current Device:{' '}
								{currentDevice ? currentDevice.name : 'No Active Device'}
							</h4>
						</div>
						<hr className="border-t-[0.1px] border-zinc-900" />
						<div>
							{myDevices?.map((device) => (
								<div
									key={device.id}
									onClick={() => activateDevice({ device })}
									className="flex text-zinc-500 hover:text-white cursor-pointer justify-start items-center p-2"
								>
									{currentDevice?.id === device.id && (
										<CheckCircleIcon className="button fill-white" />
									)}
									<p>{device.name}</p>
									<p>|</p>
									<p>{device.type}</p>
									<p>|</p>
									<p>{device.is_active ? 'Active' : 'Not Active'}</p>
								</div>
							))}
						</div>
					</ReactModal>

					{muted ? (
						<VolumeOffIcon
							className="button flex-none stroke-zinc-700 dark:stroke-white"
							onClick={toggleMute}
						/>
					) : (
						<VolumeUpIcon
							onClick={toggleMute}
							className="button flex-none stroke-zinc-700 dark:stroke-white"
						/>
					)}

					<input
						className="w-14 h-1 text-xs md:w-28 accent-green-500 hover:accent-green-300"
						type="range"
						onChange={(e) => {
							adjustVolume(Number(e.target.value));
						}}
						value={volume}
						min={0}
						max={100}
					/>
				</div>
			</div>
		</div>
	);
}

export default Player;
