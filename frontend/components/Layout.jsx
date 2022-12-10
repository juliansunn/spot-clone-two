import React, { useState } from 'react'
import Head from "next/head";
import Sidebar from "./Sidebar";
import Player from './Player';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { ArrowsExpandIcon, ChevronDownIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/outline';
import SearchBar from './SearchBar';
import { ThemeProvider } from './Theme/ThemeContext';
import Background from './Theme/Background';
import Theme from './Theme/Toggle';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sidebarVisibilityState } from '../atoms/visibilityAtom';

function Layout({ children }) {
    const { data: session } = useSession();
    const [sidebarVisibility, setSidebarVisibility] = useRecoilState(sidebarVisibilityState);
    return (
        <ThemeProvider>
            <Background>
                <div className="bg-gray-200 dark:bg-gray-900 h-screen overflow-hidden">
                    <Head>
                        <title>Spotify 2.0</title>
                    </Head>
                    <main className="flex">
                        {sidebarVisibility && <Sidebar />}
                        
                        <div className="flex-grow h-screen overflow-y-scroll overflow-hidden scrollbar-hide text-gray-800 dark:text-white w-full">
                            {/* <div className='flex w-10/12 justify-between absolute z-40 p-2 bg-transparent dark:bg-transparent'> */}
                            <header className='sticky top-0 z-30 w-full p-2 bg-gray-200 dark:bg-gray-900 sm:px-4 shadow-xl flex justify-between'>
                                <button onClick={() => setSidebarVisibility(!sidebarVisibility)} >
                                    {sidebarVisibility ? (<ChevronLeftIcon className="h-5 w-5"/>) : <ChevronRightIcon className="h-5 w-5"/>}
                                    
                                </button>
                                <div className='w-3/4 md:w-5/12'>
                                    <SearchBar />
                                </div>
                                <div className='right-2 hidden md:inline-flex'>
                                    <div className='flex items-center sticky top-0 bg-gray-300 dark:bg-gray-700  space-x-3 opacity-90 hover:opacity-70 cursor-pointer rounded-full p-1 pr-2' onClick={signOut}>
                                        <img className="rounded-full w-6 h-6" src={session?.user.image} alt="user_profile_pic" />
                                        <h2>{session?.user.name}</h2>
                                        <ChevronDownIcon className='h-5 w-5' />
                                    </div>
                                <Theme />
                                </div>
                            </header>
                            {children}
                        </div>

                    </main>
                    <div className="sticky bottom-0">
                        <Player />
                    </div>
                </div>
        </Background>
    </ThemeProvider>
    )
}

export default Layout