import React from 'react'
import Head from "next/head";
import Sidebar from "./Sidebar";
import Player from './Player';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import SearchBar from './SearchBar';

function Layout({ children }) {
    const { data: session } = useSession();
    return (
        <div className="bg-gray-900 h-screen overflow-hidden ">
            <Head>
                <title>Spotify 2.0</title>
            </Head>
            <main className="flex">
                <Sidebar />
                <div className="flex-grow h-screen overflow-y-scroll overflow-hidden scrollbar-hide text-white w-full">
                    {/* <header className='absolute z-40 top-5 right-8'>
                        <div className='flex items-center sticky top-0 bg-gray-900 space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2' onClick={signOut}>
                            <img className="rounded-full w-6 h-6" src={session?.user.image} alt="user_profile_pic" />
                            <h2>{session?.user.name}</h2>
                            <ChevronDownIcon className='h-5 w-5' />
                        </div>
                    </header> */}

                    <header className='flex w-4/5 justify-between absolute z-40 pt-2'>

                        <div></div>
                        <div className='w-3/4 md:w-5/12 '>

                            <SearchBar />
                        </div>
                        <div className='right-8 hidden md:inline'>
                            <div className='flex items-center sticky top-0 bg-gray-900 space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2' onClick={signOut}>
                                <img className="rounded-full w-6 h-6" src={session?.user.image} alt="user_profile_pic" />
                                <h2>{session?.user.name}</h2>
                                <ChevronDownIcon className='h-5 w-5' />
                            </div>
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