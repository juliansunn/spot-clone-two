import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistTrackState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout'
import Songs from '../components/Songs';
import useSpotify from '../hooks/useSpotify';
import { getRandomInt } from '../lib/utility';

function Library() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const setPlaylistTracks = useSetRecoilState(playlistTrackState);
    const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
    const [contentType, setContentType] = useState(0);
    const contentList = ["Playlists", "Podcasts", "Artists", "Albums"]
    const getLibrary = async (offset) => {
        const library = [];
        for (let i = 0; i < 20; ++i) {
            library.push(spotifyApi.getMySavedTracks({
                offset: i * offset,
            }));
        }
        Promise.all(library)
            .then((data) => {
                const d = data[0];
                for (let j = 1; j < Math.ceil(d.body.total / offset); j++) {
                    d.body.items.push(...data[j].body.items)
                }
                setPlaylistTracks(d.body?.items);
                setTrackInfo(d.body?.items?.map((track, i) => ({ position: i, uri: track.track.uri, id: track.track.id })));
            })
            .catch((e) => {
                console.log("Error Fetching Library: ", e)
            });
    }

    useEffect(() => {
        getLibrary(20);
        // setBackgroundImg(getRandomInt(1, 14));

    }, [])

    return (
        <Layout>

            <div className='px-10'>
                {/* Top */}
                <div className=' flex items-center justify-start px-20 w-full h-20'>
                    {contentList.map((content, i) => (

                        <button
                            onClick={() => { setContentType(i) }}
                            className={`hover:bg-slate-600 p-3 mx-1 rounded ${contentType == i ? "bg-slate-600" : ""} cursor-pointer`}>
                            {content}
                        </button>

                    ))}
                </div>
                <h1 className='text-lg md:text-xl xl:text-2xl text-white'>{contentList[contentType]}</h1>
                {/* Lib center */}
            </div>
        </Layout >
    )
}

export default Library