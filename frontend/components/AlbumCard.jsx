import Link from 'next/link'
import React from 'react'
import { useRecoilState } from 'recoil'
import { albumIdState } from '../atoms/albumAtom'

function AlbumCard({ data }) {
    const [albumId, setAlbumId] = useRecoilState(albumIdState);

    return (
        <Link href={`/album/${data.id}`} key={data.id} >

            <div
                onClick={() => setAlbumId(data.id)}
                className=' p-2 bg-gray-200 dark:bg-gray-800 cursor-pointer rounded-md items-center shadow-2xl hover:bg-gray-300 dark:hover:bg-gray-600 text-xs '
            >
                <img
                    src={data?.images?.[0]?.url}
                    className="shadow-md shadow-neutral-500/50 mx-auto rounded-md" alt="No Image" />
                <h3 className='text-gray-800 dark:text-white truncate'>{data?.name}</h3>
                <p className='text-gray-500'>{data?.artists?.[0].name}</p>

            </div>
        </Link>
    )
}

export default AlbumCard