import React, { useEffect, useState } from 'react'
import Songs from './Songs';
import { shuffle } from 'lodash';

const colors = [
    'from-indigo-300',
    'from-blue-300',
    'from-green-300',
    'from-red-300',
    'from-yellow-300',
    'from-pink-300',
    'from-purple-300',
]

function Playlist({ playlist }) {
    const [color, setColor] = useState(null);

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [playlist])
    return (
        <div>
            <section className={`flex items-end space-x-7 bg-gradient-to-b to-black from red- ${color} h-60 padding-8 p-8`}>
                <img src={playlist?.images?.[1]?.url} className="h-44 w-44 shadow-2xl" alt="no image" />
                <div className="h-44">
                    <p className='tracking-widest text-black'>PLAYLISTS</p>
                    <h1 className='text-5xl nd:text-3xl xl:text-6xl mb-5 font-bold text-black drop-shadow-lg'>{playlist?.name}</h1>
                    <p className="text-xs">Description: {playlist?.description}</p>
                </div>
            </section>
            <div>
                <Songs />
            </div>
        </div>
    )
}

export default Playlist