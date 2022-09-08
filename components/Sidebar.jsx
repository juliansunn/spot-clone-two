import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import useSpotify from '../hooks/useSpotify';
import {
    HomeIcon,
    SearchIcon,
    LibraryIcon,
    PlusCircleIcon,
    HeartIcon,
    RssIcon,
    LogoutIcon
} from "@heroicons/react/outline";
import { useRecoilState } from 'recoil';
import { playlistState, playlistIdState } from '../atoms/playlistAtom';

function Sidebar() {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [playlists, setPlaylists] = useState([]);
    const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistState);


    useEffect(() => {
        if (spotifyApi.getAccessToken()) {
            spotifyApi.getUserPlaylists().then((data) => {
                setPlaylists(data.body.items);
            })
        }
    }, [session, spotifyApi])
    return (
        <div className='text-gray-500 p-5 text-xs lg:text-sm border-r border-gray-900
        overflow-y-scroll h-screen scrollbar-hide sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex pb-36'>
            <div className='space-y-4'>

                <button className='flex items-center space-x-2 hover:text-white' onClick={() => signOut()} >
                    <LogoutIcon className="h-5 w-5" />
                    <p>Logout</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <HomeIcon className="h-5 w-5" />
                    <p>Home</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <SearchIcon className="h-5 w-5" />
                    <p>Search</p>
                </button>
                <Link href="/library">
                    <button
                        className='flex items-center space-x-2 hover:text-white'
                    // onClick={getLibrary}
                    >
                        <LibraryIcon className="h-5 w-5" />
                        <p>Library</p>
                    </button>
                </Link>
                <hr className='border-t-[0.1px] border-gray-900' />

                <button className='flex items-center space-x-2 hover:text-white'>
                    <PlusCircleIcon className="h-5 w-5" />
                    <p>Create Playlist</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <HeartIcon className="h-5 w-5" />
                    <p>Liked Songs</p>
                </button>
                <button className='flex items-center space-x-2 hover:text-white'>
                    <RssIcon className="h-5 w-5" />
                    <p>Your Episodes</p>
                </button>
                <hr className='border-t-[0.1px] border-gray-900' />

                {playlists.map((playlist) => (
                    <Link href="/">
                        <p key={playlist.id} onClick={() => setPlaylistId(playlist.id)} className="cursor-pointer hover:text-white">{playlist.name}</p>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Sidebar