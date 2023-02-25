import { ClockIcon } from '@heroicons/react/outline';
import Song from './Song';

function SongTable({ songs, type, headers }) {
	return (
		<div className="px-1 flex flex-col spacy-y-1 pb-28">
			<table className="min-w-full table-auto [border-spacing:0.50rem] lg:[border-spaceing:0.70rem]">
				<thead className="border-b border-gray-500 sticky top-14">
					<tr>
						{headers.map((item, idx) => (
							<th scope="col-2" className={item.style} key={idx}>
								{item?.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{/* id, uri, name, album, artist, duration, order, addedAt */}
					{type === 'playlist' &&
						songs?.map((track, i) => (
							<Song
								key={i}
								id={track?.track?.id}
								uri={track?.track?.uri}
								name={track?.track?.name}
								album={track?.track?.album}
								artist={track?.track?.artists}
								duration={track?.track?.duration_ms}
								order={i}
								addedAt={track.added_at}
							/>
						))}

					{type === 'album' &&
						songs?.map((track, i) => (
							<Song
								key={i}
								id={track?.id}
								uri={track?.uri}
								name={track?.name}
								artist={track?.artists}
								duration={track?.duration_ms}
								order={i}
							/>
						))}

					{type === 'history' &&
						songs.map((track, i) => (
							<Song
								key={i}
								id={track?.track?.spotify_id}
								uri={track?.track?.uri}
								name={track?.track?.name}
								album={track?.track?.album}
								artist={track?.track?.artists}
								duration={track?.track?.duration_ms}
								order={i}
								addedAt={track?.played_at}
							/>
						))}
				</tbody>
			</table>
		</div>
	);
}

export default SongTable;
