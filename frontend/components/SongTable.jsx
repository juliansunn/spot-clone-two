import { ClockIcon } from '@heroicons/react/outline';
import Song from './Song';

function SongTable({ songs, type }) {
	const defaultStyle =
		'text-sm font-medium bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-500 px-6 py-4 ';
	const columnItems = [
		{ name: '#', style: defaultStyle + 'text-left w-1' },
		{ name: 'TITLE', style: defaultStyle + 'text-left' },
		{
			name: 'ALBUM NAME',
			style: defaultStyle + 'text-left hidden lg:table-cell'
		},
		{
			name: type === 'history' ? 'LAST PLAYED' : 'DATE ADDED',
			style: defaultStyle + 'text-left hidden lg:table-cell'
		},
		{
			name: <ClockIcon className="button" />,
			style: defaultStyle + 'flex justify-center'
		}
	];
	return (
		<div className="px-1 flex flex-col spacy-y-1 pb-28">
			<table className="min-w-full table-auto [border-spacing:0.50rem] lg:[border-spaceing:0.70rem]">
				<thead className="border-b border-gray-500 sticky top-14">
					<tr>
						{columnItems.map((item, idx) => (
							<th scope="col" className={item.style} key={idx}>
								{item?.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{type === 'playlist' &&
						songs?.map((track, i) => (
							<Song key={i} track={track.track} order={i} addedAt={track.added_at} />
						))}

					{type === 'album' &&
						album?.tracks?.items.map((track, i) => (
							<Song key={track?.id + i} track={track} order={i} />
						))}

					{type === 'history' &&
						songs.map((track, i) => (
							<Song key={i} track={track.track} order={i} addedAt={track.played_at} />
						))}
				</tbody>
			</table>
		</div>
	);
}

export default SongTable;
