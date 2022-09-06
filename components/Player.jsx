import { ReplyIcon, SwitchHorizontalIcon, VolumeUpIcon, VolumeOffIcon } from "@heroicons/react/outline";
import { RewindIcon, PlayIcon, FastForwardIcon, PauseIcon, DeviceMobileIcon, DesktopComputerIcon } from "@heroicons/react/solid";
import ReactModal from "react-modal";
import { debounce, set, times } from "lodash";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import { currentDeviceState, myDevicesState } from "../atoms/deviceAtom";
import useSongInfo from "../hooks/useSongInfo";
import useSpotify from "../hooks/useSpotify"



function Player() {
    const spotifyApi = useSpotify();
    const { data: session } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [myDevices, setMyDevices] = useRecoilState(myDevicesState)
    const [currentDevice, setCurrentDevice] = useRecoilState(currentDeviceState);
    const [volume, setVolume] = useState(50);
    const [muted, setMuted] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);


    const toggleDeviceModal = () => {
        setIsOpen(prevState => !prevState)
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
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        })
    }

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
        console.log(myDevices, currentDevice)
        setVolume(50);
    }, [myDevices])

    const nextSong = () => {
        spotifyApi.skipToNext()
    }
    console.log("current track id -->", currentTrackId)
    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
            {/* left side */}
            <div className="flex items-center space-x-4">
                <img className="hidden md:inline h-20 w-20" src={songInfo?.album.images?.[0].url} alt="" />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="button" />
                <RewindIcon
                    onClick={nextSong}
                    className="button" />
                {
                    isPlaying ? (<PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />)
                        : (<PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />)
                }
                <FastForwardIcon
                    onClick={nextSong}
                    className="button" />
                <ReplyIcon className="button" />
            </div>
            {/* Right */}
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
                    className="w-14 md:w-28"
                    type="range"
                    onChange={(e) => { setVolume(Number(e.target.value)) }}
                    value={volume}
                    min={0}
                    max={100} />
            </div>
        </div>
    )
}

export default Player