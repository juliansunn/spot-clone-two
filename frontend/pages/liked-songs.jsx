import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil';
import { playlistTrackState } from '../atoms/playlistAtom';
import { trackInfoState } from '../atoms/songAtom';
import Layout from '../components/Layout'
import Songs from '../components/Songs';
import useSpotify from '../hooks/useSpotify';
import { getRandomInt } from '../lib/utility';

function LikedSongs() {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const [playlistTracks, setPlaylistTracks] = useRecoilState(playlistTrackState);
    const [trackInfo, setTrackInfo] = useRecoilState(trackInfoState);
    const [backgroundImg, setBackgroundImg] = useState(null);
    const getLikedSongs = async (offset) => {
        const likedSongs = [];
        for (let i = 0; i < 20; ++i) {
            likedSongs.push(spotifyApi.getMySavedTracks({
                offset: i * offset,
            }));
        }
        Promise.all(likedSongs)
            .then((data) => {
                const d = data[0];
                for (let j = 1; j < Math.ceil(d.body.total / offset); j++) {
                    d.body.items.push(...data[j].body.items)
                }
                setPlaylistTracks(d.body?.items);
                setTrackInfo(d.body?.items?.map((track, i) => ({ position: i, uri: track.track.uri, id: track.track.id })));
            })
            .catch((e) => {
                console.log("Error Fetching LikedSongs: ", e)
            });
    }

    useEffect(() => {
        getLikedSongs(20);
        setBackgroundImg(getRandomInt(1, 14));

    }, [])

    return (
        <Layout>

            <div>
                <div className={`flex items-end  bg-gradient-to-l to-blue-100 from-slate-400  min-h-64 w-full relative`}>
                    <img src={`/img/${backgroundImg}.jpg`} className='h-full w-full object-cover mix-blend-overlay absolute grayscale' alt="cant find the photo" />
                    <div className=" flex items-center gap-x-2 p-5 relative">

                        <img src={session?.user?.image} className="h-52 w-52 shadow-2xl shadow-black rounded-md" alt="no image" />
                        <div className='flex flex-col h-44'>
                            <h1 className='text-5xl md:text-3xl xl:text-6xl mb-5 text-gray-900 drop-shadow-lg truncate pb-5 capitalize tracking-[0.5rem]'>MY LIKED SONGS</h1>
                        </div>
                    </div>
                </div>
                <div>
                    <Songs songs={playlistTracks} />
                </div>
            </div>
        </Layout>
    )
}

export default LikedSongs