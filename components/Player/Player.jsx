import { ReplyIcon, SwitchHorizontalIcon, VolumeUpIcon, VolumeOffIcon } from "@heroicons/react/outline";
import { RewindIcon, PlayIcon, FastForwardIcon, PauseIcon, DeviceMobileIcon, DesktopComputerIcon } from "@heroicons/react/solid";
import ReactModal from "react-modal";
import { debounce, shuffle } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState, isRepeatState, isShuffleState } from "../../atoms/songAtom";
import { currentDeviceState, myDevicesState } from "../../atoms/deviceAtom";
import useSongInfo from "../../hooks/useSongInfo";
import useSpotify from "../../hooks/useSpotify"
import { playlistState, playlistTrackUrisState } from "../../atoms/playlistAtom";
import { HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@chakra-ui/react";
import { PlayerControl } from "./PlayerControl";
import { MdGraphicEq } from 'react-icons/md';
import { millisToMinutesAndSeconds } from "../../lib/time";



function Player() {
    const spotifyApi = useSpotify();
    const { data: session } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [myDevices, setMyDevices] = useRecoilState(myDevicesState)
    const [currentDevice, setCurrentDevice] = useRecoilState(currentDeviceState);
    const [isShuffle, setIsShuffle] = useRecoilState(isShuffleState);
    const [repeat, setRepeat] = useRecoilState(isRepeatState);
    const [volume, setVolume] = useState(50);
    const [muted, setMuted] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [playlistTrackUris, setPlaylistTrackUris] = useRecoilState(playlistTrackUrisState);
    const [playlist, setPlaylist] = useRecoilState(playlistState);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);



    const toggleDeviceModal = () => {
        setIsOpen(prevState => !prevState)
    }

    const toggleShuffle = () => {
        if (!shuffle) {
            setPlaylistTrackUris(playlist.body?.items.map((track) => track.track.uri));
        } else {
            setPlaylistTrackUris(shuffle(playlistTrackUris));
        }

        setIsShuffle(prevState => !prevState)
    }

    const toggleRepeat = () => {
        setRepeat(prevState => !prevState)
    }

    const songInfo = useSongInfo();

    const fetchCurrentSong = () => {
        if (!songInfo) {
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing);
                })
            })
        }
    }

    const getCurrentDevices = () => {
        spotifyApi.getMyDevices().then((data) => {
            const devices = data.body.devices;
            const deviceToActivate = devices[0]
            setMyDevices(devices);
            spotifyApi.transferMyPlayback([deviceToActivate?.id]).then((data) => {
                setCurrentDevice(
                    deviceToActivate
                )
            })

        }).catch((e) => { console.log("There was an error getting your devices: ", e) })
    }

    const activateDevice = ({ device }) => {
        spotifyApi.transferMyPlayback([device?.id]).then((data) => {
            setCurrentDevice(device)
        })
    }

    const muteOrUnMute = () => {
        if (!muted) {
            setMuted(true);
            // setVolume(0);
            spotifyApi.setVolume(0)
        } else {
            setMuted(false);
            // setVolume(50);
            spotifyApi.setVolume(volume);
        }
    }

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if (data?.body?.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (!seeking)
                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setDuration(data.body?.item.duration_ms);
                    setProgress(data.body?.progress_ms);
                });
        }, 500);
        return () => clearInterval(interval);
    }, [seeking]);


    const debouncedAdjustProgress = useCallback(
        debounce((progress) => {
            console.log(progress)
            spotifyApi.seek(progress).catch((e) => { console.log("Adjusting Progress Error: ", e) });
        }, 200),
        [progress]
    );


    useEffect(() => {
        if (volume > 0 && volume < 100) {
            setMuted(false);
            debouncedAdjustVolume(volume);
        }
    }, [volume])

    const debouncedAdjustVolume = useCallback(
        debounce((volume) => {
            spotifyApi.setVolume(volume);
        }, 200),
        []
    )


    useEffect(() => {
        if (spotifyApi.getAccessToken() && !currentTrackId) {
            fetchCurrentSong();
            getCurrentDevices();

        }
    }, [currentTrackId, spotifyApi, session])

    useEffect(() => {
        setVolume(volume);
    }, [myDevices])

    const nextSong = () => {
        spotifyApi.skipToNext().then(() => {
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing);
                })
            })
        }

        )
    }
    console.log("Current track id", currentTrackId)
    return (
        <div className=" h-26 grid bg-gradient-to-b from-black to-gray-900 text-white grid-rows-2 " >

            <div className="text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8 row-span-3">
                {/* left side */}
                <div className="flex items-center space-x-4">
                    <img className="hidden md:inline h-20 w-20" src={songInfo?.album.images?.[0].url} alt="" />
                    <div>
                        <h3>{songInfo?.name}</h3>
                        <p>{songInfo?.artists?.[0]?.name}</p>
                    </div>
                </div>
                {/* center */}
                <div className="flex items-center justify-evenly">

                    {
                        isShuffle ? (
                            <SwitchHorizontalIcon
                                className="button stroke-green-400"
                                onClick={toggleShuffle}
                            />
                        )
                            : (<SwitchHorizontalIcon
                                className="button"
                                onClick={toggleShuffle}
                            />)
                    }
                    <RewindIcon
                        onClick={() => { spotifyApi.skipToPrevious() }}
                        className="button" />
                    {
                        isPlaying ? (<PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />)
                            : (<PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />)
                    }
                    <FastForwardIcon
                        onClick={nextSong}
                        className="button" />
                    {
                        repeat ? (
                            <ReplyIcon
                                className="button stroke-green-400"
                                onClick={toggleRepeat}
                            />
                        ) : (
                            <ReplyIcon
                                className="button"
                                onClick={toggleRepeat}
                            />
                        )
                    }


                </div>
                {/* Right side*/}
                <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
                    <DeviceMobileIcon className="button" onClick={toggleDeviceModal} />
                    <ReactModal
                        ariaHideApp={false}
                        contentLabel="Change Playback Device"
                        className="h-30 w-30 bg-black absolute bottom-20 right-40 p-5 rounded"
                        onRequestClose={toggleDeviceModal}
                        isOpen={modalIsOpen}>
                        <div className="flex  space-x-2">
                            <DesktopComputerIcon className="button fill-white" />
                            <h4 className="text-white pb-3">Current Device: {currentDevice ? currentDevice.name : "No Active Device"}</h4>
                        </div>
                        <hr className='border-t-[0.1px] border-gray-900' />
                        <div>
                            {myDevices?.map((device) => (
                                <div
                                    key={device.id}
                                    onClick={() => activateDevice({ device })}
                                    className="flex text-gray-500 hover:text-white cursor-pointer justify-evenly items-center p-2">
                                    <p>{device.name}</p>
                                    <p>|</p>
                                    <p>{device.type}</p>
                                </div>
                            ))}
                        </div>
                    </ReactModal>

                    {muted ? (
                        <VolumeOffIcon
                            className="button"
                            onClick={muteOrUnMute}
                        />
                    ) : (
                        <VolumeUpIcon
                            onClick={muteOrUnMute}
                            className="button"
                        />
                    )}

                    <input
                        className="w-14 h-1 text-xs md:w-28 accent-green-500 hover:accent-green-300"
                        type="range"
                        onChange={(e) => { setVolume(Number(e.target.value)) }}
                        value={volume}
                        min={0}
                        max={100} />
                </div>

            </div>
            <div className="flex items-center justify-items-center  justify-center row-span-2 pb-2 ">
                <p className="text-gray-500">
                    {millisToMinutesAndSeconds(progress)}
                </p>
                <input
                    className="w-5/12 h-1 text-xs accent-green-500 hover:accent-green-300 mx-2 "
                    type="range"
                    value={progress}
                    min={0}
                    max={duration}
                    onChange={
                        (e) => {
                            setSeeking(true);
                            setProgress(Number(e.target.value));
                            setTimeout(() => {
                                setSeeking(false);
                            }, 3000);
                            debouncedAdjustProgress(e.target.value);
                        }} />
                <p className="text-gray-500">
                    {millisToMinutesAndSeconds(duration)}
                </p>
            </div>
        </div>
    )
}

export default Player