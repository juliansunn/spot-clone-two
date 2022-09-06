import { useRecoilValue } from "recoil"
import { playlistAtomState } from "../atoms/playlistAtom"
import Song from "./Song";

function Songs() {
    const playlist = useRecoilValue(playlistAtomState);

    return (
        <div className="text-white px-8 flex flex-col spacy-y-1 pb-28">
            {playlist?.tracks.items.map((track, i) => (
                // <div>{track.track.name}</div>
                // <div>
                <Song key={track.track?.id} track={track} order={i} />
                // </div>

            ))}
        </div>
    )
}

export default Songs