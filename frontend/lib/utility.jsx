import { ClockIcon } from '@heroicons/react/solid';

export function millisToMinutesAndSeconds(millis) {
	const minutes = Math.floor(millis / 60000);
	const seconds = ((millis % 60000) / 1000).toFixed(0);
	return seconds == 60
		? minutes + 1 + ':00'
		: minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

const nth = function (d) {
	if (d > 3 && d < 21) return 'th';
	switch (d % 10) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
};

export function parseDate(string) {
	var d = new Date(string);
	var date = d.getDate();
	var year = d.getFullYear();
	var month = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	][d.getMonth()];
	return `${month} ${date}${nth(date)}, ${year}`;
}

export function parseDateTime(string) {
	const d = new Date(string);
	const date = d.getDate();
	const year = d.getFullYear();
	const month = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	][d.getMonth()];
	const hours = d.getHours();
	const minutes = d.getMinutes();
	const timeZone = d
		.toLocaleTimeString('en-us', { timeZoneName: 'short' })
		.split(' ')[2];
	const ampm = hours >= 12 ? 'PM' : 'AM';
	const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
	const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
	const timeString = `${formattedHours}:${formattedMinutes} ${ampm} ${timeZone}`;

	return `${month} ${date}${nth(date)}, ${year} ${timeString}`;
}

export function getPageList(totalPages, page, maxLength) {
	if (maxLength < 5) throw 'maxLength must be at least 5';

	function range(start, end) {
		return Array.from(Array(end - start + 1), (_, i) => i + start);
	}

	var sideWidth = maxLength < 9 ? 1 : 2;
	var leftWidth = (maxLength - sideWidth * 2 - 3) >> 1;
	var rightWidth = (maxLength - sideWidth * 2 - 2) >> 1;
	if (totalPages <= maxLength) {
		// no breaks in list
		return range(1, totalPages);
	}
	if (page <= maxLength - sideWidth - 1 - rightWidth) {
		// no break on left of page
		return range(1, maxLength - sideWidth - 1).concat(
			0,
			range(totalPages - sideWidth + 1, totalPages)
		);
	}
	if (page >= totalPages - sideWidth - 1 - rightWidth) {
		// no break on right of page
		return range(1, sideWidth).concat(
			0,
			range(totalPages - sideWidth - 1 - rightWidth - leftWidth, totalPages)
		);
	}
	// Breaks on both sides
	return range(1, sideWidth).concat(
		0,
		range(page - leftWidth, page + rightWidth),
		0,
		range(totalPages - sideWidth + 1, totalPages)
	);
}

const defaultStyle =
	'text-sm font-medium bg-zinc-200 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-500 py-4';

export const playlistHeaders = [
	{ name: '#', style: defaultStyle },
	{ name: 'TITLE', style: defaultStyle },
	{
		name: 'ALBUM NAME',
		style: defaultStyle
	},
	{
		name: 'DATE ADDED',
		style: defaultStyle
	},
	{
		name: <ClockIcon className="button" />,
		style: defaultStyle
	}
];
export const albumHeaders = [
	{ name: '#', style: defaultStyle },
	{ name: 'TITLE', style: defaultStyle },
	{
		name: <ClockIcon className="button" />,
		style: defaultStyle
	}
];
export const historyHeaders = [
	{ name: '#', style: defaultStyle },
	{ name: 'TITLE', style: defaultStyle },
	{
		name: 'ALBUM NAME',
		style: defaultStyle
	},
	{
		name: 'LAST PLAYED',
		style: defaultStyle
	},
	{
		name: <ClockIcon className="button" />,
		style: defaultStyle
	}
];

export const mapSongsForQueue = (songArray) => {
	return songArray?.map((track, i) => ({
		position: i,
		uri: track.track ? track.track.uri : track.uri,
		id: track.track ? track.track.id : track.spotify_id
	}));
};
