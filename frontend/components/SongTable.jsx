import { useEffect } from 'react';
import useSongs from '../hooks/useSongs';
import { parseDate, parseDateTime } from '../lib/utility';
import Song from './Song';

function SongTable({ songs, type, headers }) {
	const { setSongs } = useSongs();
	useEffect(() => {
		setSongs(songs);
	}, [songs]);
	return (
		<div className="flex flex-col spacy-y-1 pb-28">
			<table className="w-full table-auto [border-spacing:0.50rem] lg:[border-spaceing:0.70rem] ">
				<thead className="border-b sticky top-16">
					<tr>
						{headers.map((item, idx) => (
							<th
								className={item.style + `${item?.name !== '#' ? ' text-left' : ''}`}
								key={idx}
							>
								{item?.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{type === 'playlist' &&
						songs?.map((track, i) => (
							<Song
								key={i}
								track={track?.track}
								order={i}
								addedAt={parseDate(track.added_at)}
							/>
						))}

					{type === 'album' &&
						songs?.map((track, i) => (
							<Song key={i} id={track?.id} track={track} order={i} />
						))}
					{type === 'artist' &&
						songs?.map((track, i) => (
							<Song key={i} id={track?.id} track={track} order={i} />
						))}

					{type === 'history' &&
						songs?.map((track, i) => (
							<Song
								key={i}
								track={track}
								order={i}
								addedAt={parseDateTime(track?.last_play)}
								playCount={track?.play_cnt}
							/>
						))}
				</tbody>
			</table>
		</div>
	);
}

export default SongTable;
