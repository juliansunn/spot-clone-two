import Link from 'next/link';
import React from 'react'
import { useRecoilState } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';


function PlaylistCard({ data }) {
  const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);
  // const [playlist, setPlaylist] = useRecoilState(playlistState);


  return (
    <Link href="/playlist" key={data.id}>
      <div
        onClick={() => setPlaylistId(data.id)}
        className=' p-2 bg-gray-200 dark:bg-gray-800 cursor-pointer rounded-md items-center shadow-2xl hover:bg-gray-300 dark:hover:bg-gray-600 text-xs '
      >
        <img
          src={data?.images?.[0]?.url}
          className="shadow-md shadow-neutral-500/50 mx-auto rounded-md" alt="No Image" />
        <h3 className='text-gray-800 dark:text-white truncate'>{data?.name}</h3>
        <p className='flex-wrap truncate text-gray-500'>{data?.description}</p>
        <p className='truncatetext-gray-500'>By {data?.owner?.display_name}</p>
      </div>
    </Link>
  )
}

export default PlaylistCard