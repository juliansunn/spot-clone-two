import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState, currentTrackLocState, trackInfoState, manualChangeState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify"
import { millisToMinutesAndSeconds, parseDate } from "../lib/utility";
import { PauseIcon, PlayIcon } from "@heroicons/react/outline";
import { playlistState } from "../atoms/playlistAtom";



function Song(props) {
    const spotifyApi = useSpotify();

    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

    const setCurrentTrackLocState = useSetRecoilState(currentTrackLocState);
    const setTrackInfo = useSetRecoilState(trackInfoState);
    const setManualChange = useSetRecoilState(manualChangeState);
    
    const playlist = useRecoilValue(playlistState);

    
    function handleTracks () {
        const tracks = playlist?.tracks?.items?.map((track, i) => ({ position: i, uri: track.track.uri, id: track.track.id }))
        setTrackInfo(tracks)
        return tracks;
    }

    const playSong = () => {
        props.handleSongSelected();
        setCurrentTrackId(props.track.track.id);
        setCurrentTrackLocState(props.order);
        setIsPlaying(true);
        setManualChange(true);
        spotifyApi.play({
            uris: handleTracks().map(({ uri }) => uri),
            offset: { position: props.order },
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
            className={"text-gray-500 mb-3 py-4 px-5 hover:bg-gradient-to-b to-gray-900 from-slate-800 text-sm lg:text-lg cursor-pointer" + (props.track.track.id === currentTrackId ? (isPlaying ? " animate-pulse " : "") : "")}
            onClick={playSong}
        >
            <td>
                <div className="flex flex-row items-center justify-evenly">

                    {props.track.track?.id === currentTrackId ?
                        <div>
                            {isPlaying ? (<PauseIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)
                                : (<PlayIcon onClick={handlePlayPause} className="button stroke-green-400 animate-bounce" />)}
                        </div> : <p>{props.order + 1}</p>}
                </div>
            </td>

            <td className="flex items-center space-x-4 text-gray-500">

                <img
                    className="h-10 w-10"
                    src={props.track.track?.album?.images[0]?.url}
                    alt={props.track.track?.album?.name}
                />
                <div>
                    <p className="w-36 lg:w-64 truncate text-white">{props.track.track?.name}</p>
                    <p className="truncate">{props.track.track?.artists[0]?.name}</p>
                </div>
            </td>
            <td>
                <div className="flex items-center justify-between ml-auto md:ml-0">
                    <p className="hidden md:inline w-40 md:truncate">{props.track.track?.album?.name}</p>

                </div>
            </td>
            <td>
                <p className="hidden md:inline">{parseDate(props.track?.added_at)}</p>
            </td>
            <td>
                <div className="flex justify-center">
                    <p>{millisToMinutesAndSeconds(props.track.track?.duration_ms)}</p>
                </div>
            </td>
        </tr >
    )
}

export default Song
