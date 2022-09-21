import React, { useEffect, useState } from 'react'
import Songs from './Songs';
import { shuffle } from 'lodash';
import { getRandomInt } from '../lib/utility';

const colors = [
    'to-indigo-100',
    'to-blue-100',
    'to-green-100',
    'to-red-100',
    'to-yellow-100',
    'to-pink-100',
    'to-purple-100',
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
            <div className={`bg-gradient-to-l ${color} from-slate-400 min-h-64 w-full relative`}>
                {/* <div className={`bg-gradient-to-tl from-${color} to-gray-100 h-64 w-full relative`}> */}
                <img src={`/img/${backgroundImg}.jpg`} className='h-full w-full object-cover absolute mix-blend-overlay grayscale' alt="cant find the photo" />
                <div className=" flex items-center gap-x-2 p-5 relative">

                    <img src={playlist?.images?.[0]?.url} className="h-52 w-52 shadow-2xl shadow-black rounded-md" alt="no image" />
                    <div className='w-1/2'>
                        <p className='tracking-[15px] text-gray-900 text-3xl'>PLAYLIST</p>
                        <h1 className='text-2xl md:text-4xl xl:text-6xl  font-bold text-gray-900 drop-shadow-lg truncate pb-5'>{playlist?.name}</h1>
                        {/* <p className="text-xs text-gray-900">Description: {!playlist?.description === "" ? playlist.description : "-"}</p> */}
                        <p className="text-sm text-gray-700 tracking-widest font-semibold flex-wrap">Description: {playlist?.description}</p>
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