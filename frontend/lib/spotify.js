import { getSession } from 'next-auth/react';

/**
 * Minimal, dependency-free Spotify Web API client for the browser.
 *
 * - The access token comes from the NextAuth session (refreshed server-side).
 * - On 401 it forces a session refresh and retries once.
 * - On 429 it honours Retry-After (up to two retries).
 * - Errors are thrown as SpotifyApiError with `status` and Spotify's `reason`.
 *
 * Spotify's February 2026 Development Mode changes renamed/removed several
 * endpoints. Apps created before then (and Extended Quota apps) still use the
 * old ones, so a few helpers try the new endpoint and fall back to the old one.
 */

const API = 'https://api.spotify.com/v1';

let accessToken = null;
let refreshing = null;

export function setAccessToken(token) {
	accessToken = token ?? null;
}

export class SpotifyApiError extends Error {
	constructor(status, message, reason) {
		super(message || `Spotify request failed (${status})`);
		this.name = 'SpotifyApiError';
		this.status = status;
		this.reason = reason;
	}
}

async function refreshToken() {
	if (!refreshing) {
		refreshing = getSession()
			.then((s) => {
				setAccessToken(s?.accessToken);
				return s;
			})
			.finally(() => {
				refreshing = null;
			});
	}
	return refreshing;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildUrl(path, query) {
	const url = new URL(path.startsWith('http') ? path : `${API}${path}`);
	if (query) {
		for (const [k, v] of Object.entries(query)) {
			if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
		}
	}
	return url.toString();
}

export async function spotifyFetch(path, { method = 'GET', query, body, signal } = {}, attempt = 0) {
	if (!accessToken) await refreshToken();
	if (!accessToken) throw new SpotifyApiError(401, 'Not signed in');

	const res = await fetch(buildUrl(path, query), {
		method,
		signal,
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
		},
		body: body !== undefined ? JSON.stringify(body) : undefined
	});

	if (res.status === 401 && attempt === 0) {
		await refreshToken();
		return spotifyFetch(path, { method, query, body, signal }, attempt + 1);
	}
	if (res.status === 429 && attempt < 2) {
		const retryAfter = Number(res.headers.get('Retry-After')) || 1;
		await sleep(Math.min(retryAfter, 10) * 1000);
		return spotifyFetch(path, { method, query, body, signal }, attempt + 1);
	}

	if (res.status === 204 || res.status === 202) return null;

	const text = await res.text();
	let data = null;
	if (text) {
		try {
			data = JSON.parse(text);
		} catch {
			data = text;
		}
	}

	if (!res.ok) {
		const err = data?.error;
		throw new SpotifyApiError(
			res.status,
			typeof err === 'string' ? err : err?.message,
			typeof err === 'object' ? err?.reason : undefined
		);
	}
	return data;
}

/** Endpoint missing for this app (removed/renamed), so a fallback is worth trying. */
const isUnsupported = (e) => e instanceof SpotifyApiError && [403, 404, 410].includes(e.status);

/** Remember which variant works for this session so we only probe once. */
const variantCache = new Map();
async function withFallback(key, modern, legacy) {
	const known = variantCache.get(key);
	if (known === 'legacy') return legacy();
	try {
		const result = await modern();
		variantCache.set(key, 'modern');
		return result;
	} catch (e) {
		if (known === 'modern' || !isUnsupported(e)) throw e;
		const result = await legacy();
		variantCache.set(key, 'legacy');
		return result;
	}
}

const chunk = (arr, size) =>
	Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

const idFromUri = (uri) => String(uri).split(':').pop();

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export const getMe = () => spotifyFetch('/me');

export const getTopItems = (type, { timeRange = 'medium_term', limit = 20 } = {}) =>
	spotifyFetch(`/me/top/${type}`, { query: { time_range: timeRange, limit } });

export const getRecentlyPlayed = (limit = 50, before) =>
	spotifyFetch('/me/player/recently-played', { query: { limit, before } });

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------
export const getMyPlaylists = (offset = 0, limit = 50) =>
	spotifyFetch('/me/playlists', { query: { offset, limit } });

export const getSavedTracks = (offset = 0, limit = 50) =>
	spotifyFetch('/me/tracks', { query: { offset, limit } });

export const getSavedAlbums = (offset = 0, limit = 50) =>
	spotifyFetch('/me/albums', { query: { offset, limit } });

export const getSavedShows = (offset = 0, limit = 50) =>
	spotifyFetch('/me/shows', { query: { offset, limit } });

export const getFollowedArtists = (after, limit = 50) =>
	spotifyFetch('/me/following', { query: { type: 'artist', after, limit } });

/** Returns a boolean per URI. Accepts track or episode URIs. */
export async function libraryContains(uris) {
	const results = [];
	for (const group of chunk(uris, 40)) {
		const res = await withFallback(
			'library-contains',
			() => spotifyFetch('/me/library/contains', { query: { uris: group.join(',') } }),
			() => {
				const type = group[0]?.split(':')[1] === 'episode' ? 'episodes' : 'tracks';
				return spotifyFetch(`/me/${type}/contains`, { query: { ids: group.map(idFromUri).join(',') } });
			}
		);
		results.push(...(Array.isArray(res) ? res : group.map(() => false)));
	}
	return results;
}

export function saveToLibrary(uris) {
	return withFallback(
		'library-write',
		() => spotifyFetch('/me/library', { method: 'PUT', query: { uris: uris.join(',') } }),
		() => spotifyFetch('/me/tracks', { method: 'PUT', body: { ids: uris.map(idFromUri) } })
	);
}

export function removeFromLibrary(uris) {
	return withFallback(
		'library-write',
		() => spotifyFetch('/me/library', { method: 'DELETE', query: { uris: uris.join(',') } }),
		() => spotifyFetch('/me/tracks', { method: 'DELETE', body: { ids: uris.map(idFromUri) } })
	);
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

/** Playlists moved `tracks` -> `items` and `item.track` -> `item.item` in 2026. */
export function normalizePlaylist(p) {
	if (!p) return p;
	const page = p.items ?? p.tracks ?? null;
	return { ...p, tracksPage: page, total: page?.total ?? 0 };
}

export function normalizePlaylistItem(entry) {
	if (!entry) return entry;
	return { ...entry, track: entry.track ?? entry.item ?? null };
}

export async function getPlaylist(id) {
	const p = await spotifyFetch(`/playlists/${id}`);
	const normalized = normalizePlaylist(p);
	if (normalized.tracksPage?.items) {
		normalized.tracksPage = {
			...normalized.tracksPage,
			items: normalized.tracksPage.items.map(normalizePlaylistItem)
		};
	}
	return normalized;
}

export async function getPlaylistItems(id, offset = 0, limit = 100) {
	const page = await withFallback(
		'playlist-items',
		() => spotifyFetch(`/playlists/${id}/items`, { query: { offset, limit } }),
		() => spotifyFetch(`/playlists/${id}/tracks`, { query: { offset, limit } })
	);
	return { ...page, items: (page?.items ?? []).map(normalizePlaylistItem) };
}

export const getAlbum = (id) => spotifyFetch(`/albums/${id}`);
export const getAlbumTracks = (id, offset = 0, limit = 50) =>
	spotifyFetch(`/albums/${id}/tracks`, { query: { offset, limit } });

export const getArtist = (id) => spotifyFetch(`/artists/${id}`);
export const getArtistAlbums = (id, { groups = 'album,single', offset = 0, limit = 30 } = {}) =>
	spotifyFetch(`/artists/${id}/albums`, { query: { include_groups: groups, offset, limit } });

/**
 * Top tracks was removed for new Development Mode apps. Fall back to a search
 * scoped to the artist so the "Popular" section still has something useful.
 */
export async function getArtistTopTracks(artist) {
	try {
		const res = await spotifyFetch(`/artists/${artist.id}/top-tracks`, { query: { market: 'from_token' } });
		return res?.tracks ?? [];
	} catch (e) {
		if (!isUnsupported(e) && e?.status !== 400) throw e;
		const res = await search(`artist:"${artist.name}"`, ['track'], { limit: 10 });
		return (res?.tracks?.items ?? []).filter((t) => t?.artists?.some((a) => a.id === artist.id));
	}
}

export const getShow = (id) => spotifyFetch(`/shows/${id}`, { query: { market: 'from_token' } });
export const getShowEpisodes = (id, offset = 0, limit = 50) =>
	spotifyFetch(`/shows/${id}/episodes`, { query: { offset, limit, market: 'from_token' } });

/** Dev Mode apps are capped at limit=10 per type; keep requests within that. */
export const search = (q, types = ['track', 'artist', 'album', 'playlist', 'show'], { limit = 10, offset = 0 } = {}) =>
	spotifyFetch('/search', { query: { q, type: types.join(','), limit: Math.min(limit, 10), offset } });

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------
export const getPlaybackState = () =>
	spotifyFetch('/me/player', { query: { additional_types: 'track,episode' } });

export const getDevices = () => spotifyFetch('/me/player/devices');

export const getQueue = () => spotifyFetch('/me/player/queue');

/**
 * @param {{ deviceId?: string, contextUri?: string, uris?: string[], offset?: {position?: number, uri?: string}, positionMs?: number }} opts
 */
export function play({ deviceId, contextUri, uris, offset, positionMs } = {}) {
	const body = {};
	if (contextUri) body.context_uri = contextUri;
	if (uris?.length) body.uris = uris;
	if (offset && (contextUri || uris?.length)) body.offset = offset;
	if (positionMs) body.position_ms = positionMs;
	return spotifyFetch('/me/player/play', {
		method: 'PUT',
		query: { device_id: deviceId },
		body: Object.keys(body).length ? body : undefined
	});
}

export const pause = (deviceId) => spotifyFetch('/me/player/pause', { method: 'PUT', query: { device_id: deviceId } });
export const skipNext = (deviceId) => spotifyFetch('/me/player/next', { method: 'POST', query: { device_id: deviceId } });
export const skipPrevious = (deviceId) =>
	spotifyFetch('/me/player/previous', { method: 'POST', query: { device_id: deviceId } });
export const seek = (ms, deviceId) =>
	spotifyFetch('/me/player/seek', { method: 'PUT', query: { position_ms: Math.max(0, Math.round(ms)), device_id: deviceId } });
export const setShuffle = (state, deviceId) =>
	spotifyFetch('/me/player/shuffle', { method: 'PUT', query: { state, device_id: deviceId } });
/** @param {'off'|'context'|'track'} state */
export const setRepeat = (state, deviceId) =>
	spotifyFetch('/me/player/repeat', { method: 'PUT', query: { state, device_id: deviceId } });
export const setVolume = (percent, deviceId) =>
	spotifyFetch('/me/player/volume', {
		method: 'PUT',
		query: { volume_percent: Math.max(0, Math.min(100, Math.round(percent))), device_id: deviceId }
	});
export const transferPlayback = (deviceId, startPlaying = false) =>
	spotifyFetch('/me/player', { method: 'PUT', body: { device_ids: [deviceId], play: startPlaying } });
export const addToQueue = (uri, deviceId) =>
	spotifyFetch('/me/player/queue', { method: 'POST', query: { uri, device_id: deviceId } });

/** Human-friendly message for errors surfaced in toasts. */
export function describeError(error) {
	if (!(error instanceof SpotifyApiError)) return error?.message || 'Something went wrong';
	if (error.reason === 'PREMIUM_REQUIRED') return 'Playback control requires Spotify Premium.';
	if (error.reason === 'NO_ACTIVE_DEVICE' || (error.status === 404 && /device/i.test(error.message)))
		return 'No active device. Open Spotify on a device, then pick it from the device menu.';
	if (error.status === 403 && /restriction/i.test(error.message)) return "That action isn't allowed right now.";
	if (error.status === 429) return 'Spotify is rate limiting requests. Try again in a moment.';
	if (error.status === 401) return 'Your session expired. Please sign in again.';
	return error.message;
}
