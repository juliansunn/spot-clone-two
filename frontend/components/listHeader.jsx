import React, { useEffect, useState } from 'react';
import { shuffle } from 'lodash';
import { getRandomInt, parseDate } from '../lib/utility';
import Link from 'next/link';

const colors = [
	'to-indigo-100',
	'to-blue-100',
	'to-green-100',
	'to-red-100',
	'to-yellow-100',
	'to-pink-100',
	'to-purple-100'
];

function PlaylistDetails({ data }) {
	return (
		<>
			<div className="flex flex-row space-x-2 text-zinc-800 dark:text-zinc-200">
				<a href="#">{data?.owner?.display_name}</a>
				<p className="whitespace-nowrap">{data?.followers?.total} Likes</p>
				<p className="whitespace-nowrap">{data?.tracks?.total} Songs</p>
			</div>
			{data?.description && (
				<p className="text-sm text-zinc-700 dark:text-zinc-200 tracking-widest font-semibold flex-wrap">
					Description: {data?.description}
				</p>
			)}
		</>
	);
}
function AlbumDetails({ data }) {
	return (
		<>
			<p className="tracking-[10px] text-zinc-800 dark:text-zinc-400 text-xl">
				ARTIST:
			</p>
			<div className="flex row">
				{data?.artists?.map((artist) => (
					<Link
						href={`/artist/${artist.id}`}
						className="text-xl font-bold text-zinc-600 dark:text-zinc-200 drop-shadow-lg truncate pb-5"
					>
						{artist.name}
					</Link>
				))}
			</div>
			<p className="text-zinc-800 dark:text-zinc-300">
				Release Date: {parseDate(data?.release_date)}
			</p>
		</>
	);
}

function ListHeader({ data, audioType }) {
	const [color, setColor] = useState(null);
	const [backgroundImg, setBackgroundImg] = useState(null);

	useEffect(() => {
		setColor(shuffle(colors).pop());
		setBackgroundImg(getRandomInt(1, 14));
	}, []);
	return (
		<div
			className={`bg-gradient-to-l ${color} from-zinc-400 dark:from-zinc-900 h-72 mt-10 flex flex-row justify-start w-full relative`}
		>
			<img
				src={`/img/${backgroundImg}.jpg`}
				className="h-full w-full object-cover absolute mix-blend-overlay zincscale"
				alt="cant find the photo"
			/>
			<div className=" flex items-center gap-x-2 p-5 relative">
				<img
					src={data?.images?.[0]?.url}
					className="h-52 w-52 shadow-2xl shadow-black rounded-md"
					alt="no image"
				/>
				<div className="w-1/2">
					<p className="tracking-[15px] text-zinc-800 dark:text-zinc-400 text-3xl">
						{audioType}
					</p>
					<h1 className="text-2xl md:text-4xl  font-bold text-zinc-900 dark:text-zinc-200 drop-shadow-lg truncate pb-5">
						{data?.name}
					</h1>
					{audioType === 'PLAYLIST' && <PlaylistDetails data={data} />}
					{audioType === 'ALBUM' && <AlbumDetails data={data} />}
				</div>
			</div>
		</div>
	);
}

export default ListHeader;
