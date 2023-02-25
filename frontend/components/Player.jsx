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
	DesktopComputerIcon
} from '@heroicons/react/solid';
import ReactModal from 'react-modal';
import { debounce, shuffle } from 'lodash';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
	currentTrackIdState,
	currentTrackLocState,
	trackInfoState,
	isPlayingState,
	isRepeatState,
	isShuffleState,
	manualChangeState,
	songListState
} from '../atoms/songAtom';
import { currentDeviceState, myDevicesState } from '../atoms/deviceAtom';
import useSongInfo from '../hooks/useSongInfo';
import useSpotify from '../hooks/useSpotify';
import useDidMountEffect from '../hooks/useDidMountEffect';
import { playlistState } from '../atoms/playlistAtom';
import { millisToMinutesAndSeconds } from '../lib/utility';
import { podcastState } from '../atoms/podcastAtom';

function Player() {
	const spotifyApi = useSpotify();
	const { data: session } = useSession();
	const [currentTrackId, setCurrentTrackId] =
		useRecoilState(currentTrackIdState);
	const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
	const [myDevices, setMyDevices] = useRecoilState(myDevicesState);
	const [currentDevice, setCurrentDevice] = useRecoilState(currentDeviceState);
	const [isShuffle, setIsShuffle] = useRecoilState(isShuffleState);
	const [isRepeat, setIsRepeat] = useRecoilState(isRepeatState);
	const [volume, setVolume] = useState(50);
	const [muted, setMuted] = useState(false);
	const [modalIsOpen, setIsOpen] = useState(false);
	const [songs, setSongs] = useRecoilState(songListState);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [seeking, setSeeking] = useState(false);
	const [currentTrackLoc, setCurrentTrackLoc] =
		useRecoilState(currentTrackLocState);
	const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
	const [manualChange, setManualChange] = useRecoilState(manualChangeState);

	const toggleDeviceModal = () => {
		setIsOpen((prevState) => !prevState);
	};

	const toggleShuffle = () => {
		var info = songs?.map((track, i) => ({
			position: i,
			uri: track.track ? track.track.uri : track.uri,
			id: track.track ? track.track.id : track.id
		}));
		if (isShuffle) {
			setTrackInfo(info);
		} else {
			setTrackInfo(shuffle(info));
		}
		setIsShuffle((prevState) => !prevState);
	};

	const toggleRepeat = () => {
		setIsRepeat((prevState) => !prevState);
	};

	const songInfo = useSongInfo();

	const fetchCurrentSong = () => {
		if (!songInfo) {
			spotifyApi.getMyCurrentPlaybackState().then((data) => {
				setCurrentTrackId(data.body?.item?.id);
				setIsPlaying(data.body?.is_playing);
				setDuration(data.body?.item?.duration_ms);
				setProgress(data.body?.progress_ms);
			});
		}
	};

	const getCurrentDevices = () => {
		spotifyApi
			.getMyDevices()
			.then((data) => {
				const devices = data.body.devices;
				const deviceToActivate = devices[0];
				setMyDevices(devices);
				spotifyApi.transferMyPlayback([deviceToActivate?.id]).then((data) => {
					setCurrentDevice(deviceToActivate);
				});
			})
			.catch((e) => {
				console.log('There was an error getting your devices: ', e);
			});
	};

	const activateDevice = ({ device }) => {
		spotifyApi.transferMyPlayback([device?.id]).then((data) => {
			setCurrentDevice(device);
		});
	};

	const muteOrUnMute = () => {
		if (!muted) {
			setMuted(true);
			spotifyApi.setVolume(0);
		} else {
			setMuted(false);
			spotifyApi.setVolume(volume);
		}
	};

	const handlePlayPause = () => {
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

	useEffect(() => {
		if (volume > 0 && volume < 100 && myDevices) {
			setMuted(false);
			debouncedAdjustVolume(volume);
		}
	}, [volume]);

	const debouncedAdjustVolume = useCallback(
		debounce((volume) => {
			spotifyApi.setVolume(volume);
		}, 200),
		[]
	);

	useEffect(() => {
		if (spotifyApi.getAccessToken() && !currentTrackId) {
			fetchCurrentSong();
			getCurrentDevices();
		}
	}, [currentTrackId, spotifyApi, session]);

	useEffect(() => {
		setVolume(volume);
	}, [myDevices]);

	useDidMountEffect(() => {
		if (!manualChange) {
			changeSong(1, false);
		}
		setManualChange(false);
	}, [duration]);

	function changeSong(direction, manual = false) {
		const uris = trackInfo?.map(({ uri }) => uri);
		if (songs) {
			var newLoc = currentTrackLoc + direction;
			if (newLoc >= uris?.length) {
				if (isRepeat) {
					newLoc = 0;
				} else {
					console.log('We need to search and put new songs in the playlist queue');
					return;
				}
			}
			if (newLoc < 0) {
				if (isRepeat) {
					newLoc = uris?.length - 1;
				} else {
					newLoc = 0;
				}
			}
			if (manual) {
				spotifyApi.play({
					uris: uris,
					offset: { position: newLoc }
				});
				setManualChange(true);
			}
			setCurrentTrackLoc(newLoc);
			setCurrentTrackId(trackInfo[newLoc]?.id);
		}
	}

	return (
		<div className="h-26 text-white grid grid-cols-5 text-xs md:text-base px-2 md:px-8 bg-gradient-to-b from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900  drop-shadow">
			{/* left side */}
			<div className="flex items-start space-x-4">
				<img
					className="hidden md:inline h-20 w-20"
					src={
						songInfo?.album
							? songInfo?.album.images?.[0].url
							: songInfo?.images?.[0].url
					}
					alt=""
				/>
				<div>
					<h3 className="text-sm md:text-lg truncate text-gray-900 dark:text-white font-semibold dark:font-normal">
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
								onClick={handlePlayPause}
								className="button w-10 h-10 fill-gray-700 dark:fill-white"
							/>
						) : (
							<PlayIcon
								onClick={handlePlayPause}
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
					<div className="flex  space-x-2">
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
								<p>{device.name}</p>
								<p>|</p>
								<p>{device.type}</p>
							</div>
						))}
					</div>
				</ReactModal>

				{muted ? (
					<VolumeOffIcon
						className="button stroke-gray-700 dark:stroke-white"
						onClick={muteOrUnMute}
					/>
				) : (
					<VolumeUpIcon
						onClick={muteOrUnMute}
						className="button stroke-gray-700 dark:stroke-white"
					/>
				)}

				<input
					className="w-14 h-1 text-xs md:w-28 accent-green-500 hover:accent-green-300"
					type="range"
					onChange={(e) => {
						setVolume(Number(e.target.value));
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
