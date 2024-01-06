import Link from 'next/link';
import React from 'react';

function ArtistCard({ data }) {
	return (
		<Link href={`/artist/${data.id}`} key={data.id}>
			<div className="p-2 bg-zinc-200 dark:bg-zinc-900 cursor-pointer rounded-md flex flex-col justify-center items-center shadow-2xl hover:bg-zinc-300 dark:hover:bg-zinc-600 text-xs  ">
				<img
					src={data?.images?.[0]?.url}
					className="shadow-md shadow-neutral-500/50 object-contain rounded-lg"
					alt="No Image"
				/>
				<h3 className="text-zinc-800 dark:text-white truncate  pt-2 uppercase text-xs lg:text-sm ">
					{data?.name}
				</h3>
			</div>
		</Link>
	);
}

export default ArtistCard;
