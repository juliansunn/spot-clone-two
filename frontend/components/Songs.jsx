import { ClockIcon } from '@heroicons/react/outline';
import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { trackInfoState } from '../atoms/songAtom';
import Song from './Song';


function Songs(props) {
	const defaultStyle = "text-sm font-medium bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-500 px-6 py-4 "
	const columnItems = [
		{name:'#', style: defaultStyle + "text-left w-1",},
		{name:'TITLE', style: defaultStyle + "text-left",},
		{name:'ALBUM NAME', style: defaultStyle + "text-left hidden lg:table-cell",},
		{name:'DATE ADDED', style: defaultStyle + "text-left hidden lg:table-cell",},
		{name: <ClockIcon className="button" />, style: defaultStyle + "flex justify-center"},
	]

	return (
		<div className="px-8 flex flex-col spacy-y-1 pb-28">
			<table className="min-w-full table-auto [border-spacing:0.50rem] lg:[border-spaceing:0.70rem]">
				<thead className="border-b border-gray-500 sticky top-14">
					<tr>
						{columnItems.map(item => (
							<th
								scope="col"
								className={item.style}
							>
								{item?.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
                    {props.type === "playlist" &&
                    props.playlist?.tracks?.items?.map((track, i) => (
						<Song
							key={track.track ? track.track.id + i : track.id + i}
							track={track.track ? track : { track: track }}
							order={i}
							{...props}
						/>
					))
                    }

                    {props.type === "album" &&
                    props?.songs?.tracks?.items.map((track, i) => {
                        <Song  
                            key={track?.id + i}
                            track={track}
                            order={i} 
                        />
                    })
                    }
					
				</tbody>
			</table>
		</div>
	);
}

export default Songs;
