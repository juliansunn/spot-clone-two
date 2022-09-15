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
    const [backgroundImg, setBackgroundImg] = useState(null);
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
        setBackgroundImg(getRandomInt(1, 14));

    }, [])

    return (
        <Layout>

            <div>
                <div className={`flex items-end space-x-7 bg-gradient-to-r from-blue-300 to-gray-900  h-60 w-full relative`}>
                    <img src={`/img/${backgroundImg}.jpg`} className='h-full w-full object-cover mix-blend-overlay absolute grayscale' alt="cant find the photo" />
                    <div className=" flex items-center gap-x-2 p-5 relative">

                        <img src={session?.user?.image} className="h-44 w-44 shadow-2xl" alt="no image" />
                        {/* <div className='h-44'> */}
                        <div className='flex flex-col h-44'>
                            <h1 className='text-xl lg:text-3xl xl:text-5xl text-gray-900'>My Library</h1>
                        </div>
                        {/* </div> */}
                    </div>
                </div>
                <div>
                    <Songs />
                </div>
            </div>
        </Layout>
    )
}

export default Library