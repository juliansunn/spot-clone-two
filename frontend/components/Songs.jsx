
import { ClockIcon } from "@heroicons/react/outline";
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
        <div className="px-8 flex flex-col spacy-y-1 pb-28">
            <table className="min-w-full table-auto [border-spacing:0.50rem] md:[border-spaceing:0.70rem]">
                <thead className="border-b border-slate-500 sticky top-10">
                    <tr>
                        <th scope="col" className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left  w-1">
                            #
                        </th>
                        <th scope="col" className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left">
                            TITLE
                        </th>
                        <th scope="col" className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left hidden md:table-cell">
                            ALBUM
                        </th>
                        <th scope="col" className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left hidden md:table-cell">
                            DATE ADDED
                        </th>
                        <th scope="col" className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 flex justify-center">
                            <ClockIcon className="button" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {playlistTracks?.map((track, i) => (
                        <Song key={track.track?.id + i} track={track} order={i} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Songs