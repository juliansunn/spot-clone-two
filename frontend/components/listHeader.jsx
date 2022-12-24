import React, { useEffect, useState } from 'react';
import { shuffle } from 'lodash';
import { getRandomInt } from '../lib/utility';

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
			<div className="flex flex-row space-x-2">
				<a href="#">{data?.owner?.display_name}</a>
				<p className="whitespace-nowrap">{data?.followers?.total} Likes</p>
				<p className="whitespace-nowrap">{data?.tracks?.total} Songs</p>
			</div>
			{data?.description && (
				<p className="text-sm text-gray-700 dark:text-gray-200 tracking-widest font-semibold flex-wrap">
					Description: {data?.description}
				</p>
			)}
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
			className={`bg-gradient-to-l ${color} from-gray-400 dark:from-gray-900 min-h-64 h-80 flex flex-row justify-start w-full relative`}
		>
			<img
				src={`/img/${backgroundImg}.jpg`}
				className="h-full w-full object-cover absolute mix-blend-overlay grayscale"
				alt="cant find the photo"
			/>
			<div className=" flex items-center gap-x-2 p-5 relative">
				<img
					src={data?.images?.[0]?.url}
					className="h-52 w-52 shadow-2xl shadow-black rounded-md"
					alt="no image"
				/>
				<div className="w-1/2">
					<p className="tracking-[15px] text-gray-900 dark:text-gray-200 text-3xl">
						{audioType}
					</p>
					<h1 className="text-2xl md:text-4xl  font-bold text-gray-900 dark:text-gray-200 drop-shadow-lg truncate pb-5">
						{data?.name}
					</h1>
					{audioType === 'PLAYLIST' && <PlaylistDetails data={data} />}
				</div>
			</div>
		</div>
	);
}

export default ListHeader;
