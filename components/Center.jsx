import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { ChevronDownIcon } from '@heroicons/react/outline';
import { useRecoilState } from 'recoil';
import { shuffle } from 'lodash';
import { playlistIdState, playlistAtomState } from '../atoms/playlistAtom';
import spotifyApi from '../lib/spotify';
import Songs from './Songs';
import { signOut } from 'next-auth/react';
// import  SpotifyPlayer  from 'react-spotify-web-playback';

const colors = [
    'from-indigo-500',
    'from-blue-500',
    'from-green-500',
    'from-red-500',
    'from-yellow-500',
    'from-pink-500',
    'from-purple-500',

]

function Center() {
    const { data: session } = useSession();
    const [color, setColor] = useState(null);
    const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistAtomState);

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [])

    useEffect(() => {

        spotifyApi.getPlaylist(playlistId).then((data) => {
            setPlaylist(data.body);
        }).catch(error => console.log("something went wrong: ", error))
    }, [spotifyApi, playlistId])


    return (
        <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide text-white">
            <header className='absolute top-5 right-8'>
                <div className='flex items-center bg-black space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2' onClick={signOut}>
                    <img className="rounded-full w-10 h-10" src={session?.user.image} alt="user_profile_pic" />
                    <h2>{session?.user.name}</h2>
                    <ChevronDownIcon className='h-5 w-5' />
                </div>
            </header>
            <section className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 padding-8 p-8`}>
                <img src={playlist?.images?.[1]?.url} className="h-44 w-44 shadow-2xl" alt="no image" />
                <div>
                    <p>PLAYLISTS</p>
                    <h1 className='text-2xl nd:text-3xl xl:text-5xl'>{playlist?.name}</h1>
                </div>
            </section>
            <div>
                <Songs />
            </div>
            <div>
                {/* <SpotifyPlayer token={session.token} /> */}
            </div>
        </div>
    )
}

export default Center