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
import { useCallback, useEffect, useState } from 'react';

import useSongInfo from '../hooks/useSongInfo';
import useSpotify from '../hooks/useSpotify';
import { millisToMinutesAndSeconds } from '../lib/utility';
import useVolume from '../hooks/useVolume';
import useDevice from '../hooks/useDevice';
import useSongControls from '../hooks/useSongControls';
import Image from 'next/image';
import useDidMountEffect from '../hooks/useDidMountEffect';

function Player() {
	const spotifyApi = useSpotify();
	const { currentDevice, myDevices, activateDevice } = useDevice();
	const { volume, adjustVolume, muted, toggleMute } = useVolume();
	const songInfo = useSongInfo();
	const {
		isShuffle,
		isRepeat,
		toggleShuffle,
		toggleRepeat,
		changeSong,
		manualChange,
		setManualChange,
		isPlaying,
		handlePlayPause
	} = useSongControls();
	const [modalIsOpen, setIsOpen] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [seeking, setSeeking] = useState(false);

	const toggleDeviceModal = () => {
		setIsOpen((prevState) => !prevState);
	};

	useEffect(() => {
		const interval = setInterval(() => {
			if (!seeking) {
				spotifyApi.getMyCurrentPlayingTrack().then((data) => {
					setDuration(data.body?.item?.duration_ms);
					setProgress(data.body?.progress_ms);
				});
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [seeking]);

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
		<div className="h-26 text-white grid grid-cols-5 text-xs md:text-base px-2 md:px-8 bg-gradient-to-b from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900  drop-shadow">
			{/* left side */}
			<div className="flex items-start space-x-4">
				{songInfo && (
					<Image
						className="max-h-20 max-w-20"
						src={
							songInfo?.album
								? songInfo?.album.images?.[0].url
								: songInfo?.images?.[0].url
						}
						alt=""
						height={80}
						width={80}
					/>
				)}
				<div>
					<h3 className="self-start flex text-sm md:text-lg truncate text-gray-900 dark:text-white font-semibold dark:font-normal">
						{songInfo?.name}
					</h3>

					<p className="test-xs md:text:sm text-gray-900 dark:text-gray-500">
						{songInfo?.artists?.[0]?.name}
					</p>
				</div>
			</div>
			{/* center */}
			<div className="col-span-3">
				<div className="grid grid-row">
					<div className="flex items-center justify-center gap-x-4">
						<SwitchHorizontalIcon
							className={`button ${
								isShuffle ? 'stroke-green-400' : 'stroke-gray-700 dark:stroke-white'
							}`}
							onClick={toggleShuffle}
						/>

						<RewindIcon
							onClick={() => {
								changeSong(-1, true);
							}}
							className="button fill-gray-700 dark:fill-white"
						/>
						{isPlaying ? (
							<PauseIcon
								onClick={() => handlePlayPause()}
								className="button w-10 h-10 fill-gray-700 dark:fill-white"
							/>
						) : (
							<PlayIcon
								onClick={() => handlePlayPause()}
								className="button w-10 h-10 fill-gray-700 dark:fill-white"
							/>
						)}
						<FastForwardIcon
							onClick={() => {
								changeSong(1, true);
							}}
							className="button fill-gray-700 dark:fill-white"
						/>

						<ReplyIcon
							className={`button ${
								isRepeat ? 'stroke-green-400 ' : 'stroke-gray-700 dark:stroke-white'
							} `}
							onClick={toggleRepeat}
						/>
					</div>
					<div className="flex items-center justify-center pb-2d">
						<p className="text-gray-500">{millisToMinutesAndSeconds(progress)}</p>
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
						<p className="text-gray-500">{millisToMinutesAndSeconds(duration)}</p>
					</div>
				</div>
			</div>
			{/* Right side*/}
			<div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
				<DeviceMobileIcon
					className="button fill-gray-700 dark:fill-white"
					onClick={toggleDeviceModal}
				/>
				<ReactModal
					ariaHideApp={false}
					contentLabel="Change Playback Device"
					className="h-30 w-30 bg-gray-900 absolute bottom-20 right-40 p-5 rounded"
					onRequestClose={toggleDeviceModal}
					isOpen={modalIsOpen}
				>
					<div className="flex justify-start  space-x-2">
						<DesktopComputerIcon className="button fill-white" />
						<h4 className="text-white pb-3">
							Current Device: {currentDevice ? currentDevice.name : 'No Active Device'}
						</h4>
					</div>
					<hr className="border-t-[0.1px] border-gray-900" />
					<div>
						{myDevices?.map((device) => (
							<div
								key={device.id}
								onClick={() => activateDevice({ device })}
								className="flex text-gray-500 hover:text-white cursor-pointer justify-evenly items-center p-2"
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
						className="button stroke-gray-700 dark:stroke-white"
						onClick={toggleMute}
					/>
				) : (
					<VolumeUpIcon
						onClick={toggleMute}
						className="button stroke-gray-700 dark:stroke-white"
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
	);
}

export default Player;
