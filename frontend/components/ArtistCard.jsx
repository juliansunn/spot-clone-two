import Link from 'next/link';
import React from 'react'
import { useRecoilState } from 'recoil';
import { artistIdState } from '../atoms/artistAtom';

function ArtistCard({ data }) {
    const [artistId, setArtistId] = useRecoilState(artistIdState);
    return (
        <Link href="/artist" key={data.id} >

            <div
                onClick={() => setArtistId(data.id)}
                className='p-2 bg-gray-200 dark:bg-gray-800 cursor-pointer rounded-md flex flex-col justify-center items-center shadow-2xl hover:bg-gray-300 dark:hover:bg-gray-600 text-xs  '
            >
              
                    <img
                        src={data?.images?.[0]?.url}
                        className="shadow-md shadow-neutral-500/50 object-contain rounded-lg" alt="No Image" />
                    <h3 className='text-gray-800 dark:text-white truncate  pt-2 uppercase text-xs lg:text-sm '>{data?.name}</h3>
         

            </div>
        </Link>
    )
}

export default ArtistCard