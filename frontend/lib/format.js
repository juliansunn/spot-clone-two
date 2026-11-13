import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

export function formatDuration(ms) {
	if (!Number.isFinite(ms) || ms < 0) return '0:00';
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = String(totalSeconds % 60).padStart(2, '0');
	return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/** "1 hr 23 min" style used in collection headers */
export function formatLongDuration(ms) {
	if (!Number.isFinite(ms) || ms <= 0) return '';
	const totalMinutes = Math.round(ms / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes} min`;
	return `${hours} hr${minutes ? ` ${minutes} min` : ''}`;
}

function toDate(value) {
	if (!value) return null;
	const d = value instanceof Date ? value : parseISO(String(value));
	return isValid(d) ? d : null;
}

export function formatDate(value) {
	const d = toDate(value);
	return d ? format(d, 'MMM d, yyyy') : '';
}

export function formatDateTime(value) {
	const d = toDate(value);
	return d ? format(d, 'MMM d, yyyy · h:mm a') : '';
}

/** Spotify release dates can be "2020", "2020-05" or "2020-05-17". */
export function formatReleaseDate(value, precision) {
	if (!value) return '';
	if (precision === 'year' || /^\d{4}$/.test(value)) return value.slice(0, 4);
	if (precision === 'month' || /^\d{4}-\d{2}$/.test(value)) {
		const d = toDate(`${value}-01`);
		return d ? format(d, 'MMM yyyy') : value;
	}
	return formatDate(value);
}

export function releaseYear(value) {
	return value ? String(value).slice(0, 4) : '';
}

/** "12 min ago" within the last day, otherwise date + time. */
export function formatPlayedAt(value) {
	const d = toDate(value);
	if (!d) return '';
	return Date.now() - d.getTime() < 86400000
		? formatDistanceToNowStrict(d, { addSuffix: true })
		: format(d, 'MMM d · h:mm a');
}

/** Show "3 days ago" for recent dates and a calendar date otherwise. */
export function formatAddedAt(value) {
	const d = toDate(value);
	if (!d) return '';
	const ageDays = (Date.now() - d.getTime()) / 86400000;
	if (ageDays < 1) return 'Today';
	return ageDays < 30 ? formatDistanceToNowStrict(d, { addSuffix: true, unit: 'day', roundingMethod: 'floor' }) : format(d, 'MMM d, yyyy');
}

export function formatNumber(n) {
	if (!Number.isFinite(n)) return '';
	return new Intl.NumberFormat('en-US').format(n);
}

export function formatCompact(n) {
	if (!Number.isFinite(n)) return '';
	return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function pluralize(count, singular, plural = `${singular}s`) {
	return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

/** Spotify playlist descriptions contain HTML entities and anchor tags. */
export function cleanDescription(html) {
	if (!html) return '';
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;|&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&nbsp;/g, ' ')
		.trim();
}

export function greeting(date = new Date()) {
	const h = date.getHours();
	if (h < 5) return 'Good night';
	if (h < 12) return 'Good morning';
	if (h < 18) return 'Good afternoon';
	return 'Good evening';
}

export function pickImage(images, minWidth = 0) {
	if (!images?.length) return null;
	// Spotify returns images largest-first; choose the smallest that is >= minWidth.
	const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
	return (sorted.find((i) => (i.width ?? 640) >= minWidth) ?? sorted[sorted.length - 1])?.url ?? null;
}
