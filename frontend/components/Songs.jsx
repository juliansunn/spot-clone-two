import { ClockIcon } from '@heroicons/react/outline';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { trackInfoState } from '../atoms/songAtom';
import Song from './Song';

function Songs(props) {

	return (
		<div className="px-8 flex flex-col spacy-y-1 pb-28">
			<table className="min-w-full table-auto [border-spacing:0.50rem] md:[border-spaceing:0.70rem]">
				<thead className="border-b border-slate-500 sticky top-10">
					<tr>
						<th
							scope="col"
							className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left  w-1"
						>
							#
						</th>
						<th
							scope="col"
							className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left"
						>
							TITLE
						</th>
						<th
							scope="col"
							className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left hidden md:table-cell"
						>
							ALBUM
						</th>
						<th
							scope="col"
							className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 text-left hidden md:table-cell"
						>
							DATE ADDED
						</th>
						<th
							scope="col"
							className=" bg-gray-900 text-sm font-medium text-gray-500 px-6 py-4 flex justify-center"
						>
							<ClockIcon className="button" />
						</th>
					</tr>
				</thead>
				<tbody>
					{props.playlist?.tracks?.items?.map((track, i) => (
						<Song
							key={track.track ? track.track.id + i : track.id + i}
							track={track.track ? track : { track: track }}
							order={i}
							{...props}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default Songs;
