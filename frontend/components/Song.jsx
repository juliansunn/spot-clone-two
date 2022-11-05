import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState, currentTrackLocState, trackInfoState, manualChangeState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify"
import { millisToMinutesAndSeconds, parseDate } from "../lib/utility";
import { PauseIcon, PlayIcon } from "@heroicons/react/outline";



function Song({ track, order, }) {
    const spotifyApi = useSpotify();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const setCurrentTrackLocState = useSetRecoilState(currentTrackLocState);
    const trackInfo = useRecoilValue(trackInfoState);
    const [manualChange, setManualChange] = useRecoilState(manualChangeState);


    const playSong = () => {
        setCurrentTrackId(track.track.id);
        setCurrentTrackLocState(order);
        setIsPlaying(true);
        setManualChange(true);
        spotifyApi.play({
            uris: trackInfo.map(({ uri }) => uri),
            offset: { position: order },
        })
    }

    const handlePlayPause = (event) => {
        event.stopPropagation()
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

    return (

        <tr
            className={"text-gray-500 mb-3 py-4 px-5 hover:bg-gradient-to-b to-gray-900 from-slate-800 text-sm lg:text-lg cursor-pointer" + (track.track.id === currentTrackId ? (isPlaying ? " animate-pulse " : "") : "")}
            onClick={playSong}
        >
            <td>
                <div className="flex flex-row items-center justify-evenly">

                    {track.track?.id === currentTrackId ?
                        <div>
                            {isPlaying ? (<PauseIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)
                                : (<PlayIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)}
                        </div> : <p>{order + 1}</p>}
                </div>
            </td>

            <td className="flex items-center space-x-4 text-gray-500">

                <img
                    className="h-10 w-10"
                    src={track.track?.album?.images[0]?.url}
                    alt={track.track?.album?.name}
                />
                <div>
                    <p className="w-36 lg:w-64 truncate text-white">{track.track?.name}</p>
                    <p className="truncate">{track.track?.artists[0]?.name}</p>
                </div>
            </td>
            <td>
                <div className="flex items-center justify-between ml-auto md:ml-0">
                    <p className="hidden md:inline w-40 md:truncate">{track.track?.album?.name}</p>

                </div>
            </td>
            <td>
                <p className="hidden md:inline">{parseDate(track?.added_at)}</p>
            </td>
            <td>
                <div className="flex justify-center">
                    <p>{millisToMinutesAndSeconds(track.track?.duration_ms)}</p>
                </div>
            </td>
        </tr >
    )
}

export default Song
