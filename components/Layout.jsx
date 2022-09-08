import React from 'react'
import Head from "next/head";
import Sidebar from "./Sidebar";
// import Center from './Center';
import Player from './Player';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { ChevronDownIcon } from '@heroicons/react/outline';

function Layout({ children }) {
    const { data: session } = useSession();
    return (
        <div className="bg-black h-screen overflow-hidden ">
            <Head>
                <title>Spotify 2.0</title>
            </Head>
            <main className="flex">
                <Sidebar />
                <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide text-white">
                    <header className='absolute top-5 right-8'>
                        <div className='flex items-center sticky top-0 bg-black space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2' onClick={signOut}>
                            <img className="rounded-full w-10 h-10" src={session?.user.image} alt="user_profile_pic" />
                            <h2>{session?.user.name}</h2>
                            <ChevronDownIcon className='h-5 w-5' />
                        </div>
                    </header>
                    {children}
                </div>

            </main>
            <div className="sticky bottom-0">
                <Player />
            </div>

        </div>
    )
}

export default Layout