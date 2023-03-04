import Song from './Song';

function SongTable({ songs, type, headers }) {
	return (
		<div className="px-1 flex flex-col spacy-y-1 pb-28">
			<table className="min-w-full table-auto [border-spacing:0.50rem] lg:[border-spaceing:0.70rem] ">
				<thead className="border-b border-gray-500 sticky top-14">
					<tr>
						{headers.map((item, idx) => (
							<th className={item.style + ' text-left'} key={idx}>
								{item?.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{type === 'playlist' &&
						songs?.map((track, i) => (
							<Song key={i} track={track?.track} order={i} addedAt={track.added_at} />
						))}

					{type === 'album' &&
						songs?.map((track, i) => (
							<Song key={i} id={track?.id} track={track} order={i} />
						))}

					{type === 'history' &&
						songs.map((track, i) => (
							<Song
								key={i}
								track={track?.track}
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
