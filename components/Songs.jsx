import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { playlistTrackState, playlistTrackUrisState } from "../atoms/playlistAtom"
import Song from "./Song";

function Songs() {
    const setPlaylistTrackUris = useSetRecoilState(playlistTrackUrisState);
    const playlistTracks = useRecoilValue(playlistTrackState);
    // const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);

    useEffect(() => {
        setPlaylistTrackUris(playlistTracks?.map((track => track.track?.uri)))
    }, [])

    // useEffect(() => {
    //     setCurrentTrackId(currentTrackId);
    // }, [currentTrackId])


    return (
        <div className="text-white px-8 flex flex-col spacy-y-1 pb-28">
            {playlistTracks?.map((track, i) => (
                <Song key={track.track?.id} track={track} order={i} />
            ))}
        </div>
    )
}

export default Songs