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
                className='flex flex-col justify-center items-center p-2 bg-slate-800 cursor-pointer rounded-md shadow-2xl hover:bg-slate-700 text-xs '
            >
                <div>
                    <img
                        src={data?.images?.[0]?.url}
                        className="shadow-md shadow-neutral-500/50 object-contain rounded-lg" alt="No Image" />
                </div>
                <h3 className='text-white truncate pt-2 uppercase  hidden  md:inline text-xs lg:text-sm '>{data?.name}</h3>

            </div>
        </Link>
    )
}

export default ArtistCard