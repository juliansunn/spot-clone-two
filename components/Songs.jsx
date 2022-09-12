
import { useEffect } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { playlistTrackState } from "../atoms/playlistAtom"
import { trackInfoState } from "../atoms/songAtom";
import Song from "./Song";

function Songs() {
    const playlistTracks = useRecoilValue(playlistTrackState);
    const setTrackInfo = useSetRecoilState(trackInfoState);

    useEffect(() => {
        setTrackInfo(playlistTracks?.map((track, i) => ({ position: i, uri: track.track.uri, id: track.track.id })))
    }, [])



    return (
        <div className="text-white px-8 flex flex-col spacy-y-1 pb-28">
            {playlistTracks?.map((track, i) => (
                <Song key={track.track?.id} track={track} order={i} />
            ))}
        </div>
    )
}

export default Songs