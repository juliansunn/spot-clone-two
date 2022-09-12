import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistTrackState, playlistTrackUrisState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout'
import Songs from '../components/Songs';
import useSpotify from '../hooks/useSpotify';

function Library() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const [playlistTracks, setPlaylistTracks] = useRecoilState(playlistTrackState);
    const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
    const getLibrary = async () => {

        const library = [];

        for (let i = 0; i < 5; ++i) {
            library.push(spotifyApi.getMySavedTracks({
                offset: i * 20,
            }));
        }

        Promise.all(library)
            .then((data) => {
                const d = data[0];
                for (let j = 1; j < data.length; j++) {
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
        getLibrary();
    }, [])

    return (
        <Layout>

            <div>
                <section className={`flex items-end space-x-7 bg-gradient-to-b to-black from-blue-300 h-60 padding-8 p-8`}>
                    <img src={session?.user?.image} className="h-44 w-44 shadow-2xl opacity-50" alt="no image" />
                    <div className='h-44'>
                        <h1 className='text-2xl nd:text-3xl xl:text-5xl'>My Library</h1>
                    </div>
                </section>
                <div>
                    <Songs />
                </div>
            </div>
        </Layout>
    )
}

export default Library