import React, { useEffect, useState } from 'react'
import Songs from './Songs';
import { shuffle } from 'lodash';
import { getRandomInt } from '../lib/utility';

const colors = [
    'indigo-100',
    'blue-100',
    'green-100',
    'red-100',
    'yellow-100',
    'pink-100',
    'purple-100',
]


function Playlist({ playlist }) {
    const [color, setColor] = useState(null);
    const [backgroundImg, setBackgroundImg] = useState(null);

    useEffect(() => {
        setColor(shuffle(colors).pop());
        setBackgroundImg(getRandomInt(1, 14));
    }, [playlist])
    return (
        <div>
            <div className={`bg-gradient-to-r from-${color} to-gray-600 h-60 w-full relative `}>
                <img src={`/img/${backgroundImg}.jpg`} className='h-full w-full object-cover mix-blend-overlay absolute grayscale' alt="cant find the photo" />
                <div className=" flex items-center gap-x-2 p-5 relative">

                    <img src={playlist?.images?.[0]?.url} className="h-44 w-44 shadow-2xl " alt="no image" />
                    <div className='w-1/2'>
                        <p className='tracking-widest text-gray-900 text-3xl '>PLAYLISTS</p>
                        <h1 className='text-5xl nd:text-3xl xl:text-6xl mb-5 font-bold text-gray-900 drop-shadow-lg truncate'>{playlist?.name}</h1>
                        {/* <p className="text-xs text-gray-900">Description: {!playlist?.description === "" ? playlist.description : "-"}</p> */}
                        <p className="text-sm text-black tracking-widest font-bold flex-wrap">Description: {playlist?.description}</p>
                    </div>
                </div>
            </div>
            <div>
                <Songs />
            </div>
        </div>
    )
}

export default Playlist