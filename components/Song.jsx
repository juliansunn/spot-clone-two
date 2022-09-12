import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState, currentTrackLocState, trackInfoState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify"
import { millisToMinutesAndSeconds } from "../lib/time";
import { PauseIcon, PlayIcon } from "@heroicons/react/outline";



function Song({ track, order }) {
    const spotifyApi = useSpotify();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const setCurrentTrackLocState = useSetRecoilState(currentTrackLocState);
    const trackInfo = useRecoilValue(trackInfoState);

    const playSong = () => {
        setCurrentTrackId(track.track.id);
        setCurrentTrackLocState(order);
        setIsPlaying(true);
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
        <div
            className={"grid grid-cols-2 text-gray-500 py-4 px-5 hover:bg-gray-900 rounded-lg cursor-pointer" + (track.track.id === currentTrackId ? (isPlaying ? " animate-pulse " : "") : "")}
            onClick={playSong}
        >
            <div className="flex items-center space-x-4">
                <p>{order + 1}</p>
                {track.track.id === currentTrackId &&
                    <div>
                        {isPlaying ? (<PauseIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)
                            : (<PlayIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)}

                    </div>
                }
                <img
                    className="h-10 w-10"
                    src={track.track?.album?.images[0].url}
                    alt={track.track?.album?.name}
                />
                <div>
                    <p className="w-36 lg:w-64 truncate text-white">{track.track?.name}</p>
                    <p className="w-40 ">{track.track?.artists[0].name}</p>
                </div>
            </div>
            <div className="flex items-center justify-between ml-auto md:ml-0">
                <p className="hidden md:inline w-40 md:truncate">{track.track?.album.name}</p>
                <p>{millisToMinutesAndSeconds(track.track?.duration_ms)}</p>
            </div>
        </div>
    )
}

export default Song