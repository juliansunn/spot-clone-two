import * as spotify from '@/lib/spotify';

/**
 * Build a "radio" mix of songs similar to a seed track.
 *
 * Spotify's /recommendations endpoint is the ideal source, but it was shut off
 * for most apps in Nov 2024. We try it once per session and otherwise build a
 * mix from search: tracks in the seed artist's genres, plus a capped number of
 * tracks by the seed artist and any featured artists. Search is limited to 10
 * results per request in Development Mode, so we page with offsets.
 */

const TARGET_SIZE = 50;
const ARTIST_SHARE = 0.3; // keep the mix from being all one artist

let recommendationsAvailable = null;

async function fromRecommendations(seed) {
	if (recommendationsAvailable === false) return null;
	try {
		const res = await spotify.spotifyFetch('/recommendations', {
			query: { seed_tracks: seed.id, limit: TARGET_SIZE, market: 'from_token' }
		});
		recommendationsAvailable = true;
		return res?.tracks?.filter(Boolean) ?? [];
	} catch (e) {
		if (e instanceof spotify.SpotifyApiError && [403, 404, 410].includes(e.status)) {
			recommendationsAvailable = false;
			return null;
		}
		throw e;
	}
}

/** Small seeded PRNG so "New mix" reshuffles but each mix is reproducible. */
function rng(seed) {
	let t = seed >>> 0;
	return () => {
		t += 0x6d2b79f5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

function shuffle(list, random) {
	const a = [...list];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

const searchTracks = (q, offset) =>
	spotify
		.search(q, ['track'], { limit: 10, offset })
		.then((r) => (r?.tracks?.items ?? []).filter(Boolean))
		.catch(() => []);

async function fromSearch(seed, variant) {
	const random = rng(variant * 7919 + seed.id.length);
	const primary = seed.artists?.[0];
	const featured = (seed.artists ?? []).slice(1, 3);
	const artist = primary?.id ? await spotify.getArtist(primary.id).catch(() => null) : null;
	const genres = shuffle(artist?.genres ?? [], random).slice(0, 4);
	// Different offsets per variant so "New mix" surfaces different songs.
	const page = (n) => (variant % 3) * 20 + n * 10;

	const [genreBuckets, artistTracks, featuredTracks] = await Promise.all([
		Promise.all(
			genres.map((g) =>
				Promise.all([searchTracks(`genre:"${g}"`, page(0)), searchTracks(`genre:"${g}"`, page(1))]).then((r) =>
					r.flat()
				)
			)
		),
		primary?.name
			? Promise.all([searchTracks(`artist:"${primary.name}"`, 0), searchTracks(`artist:"${primary.name}"`, 10)]).then(
					(r) => r.flat().filter((t) => t.artists?.some((a) => a.id === primary.id))
				)
			: [],
		Promise.all(featured.map((a) => searchTracks(`artist:"${a.name}"`, 0))).then((r) => r.flat())
	]);

	const artistCap = Math.round(TARGET_SIZE * ARTIST_SHARE);
	const buckets = [
		...genreBuckets.map((b) => shuffle(b, random)),
		shuffle(artistTracks, random).slice(0, artistCap),
		shuffle(featuredTracks, random).slice(0, 8)
	].filter((b) => b.length);

	// Round-robin across buckets for variety.
	const out = [];
	while (buckets.some((b) => b.length) && out.length < TARGET_SIZE * 2) {
		for (const b of buckets) if (b.length) out.push(b.shift());
	}
	return out;
}

function dedupe(seed, tracks) {
	const seen = new Set([seed.id, key(seed)]);
	const out = [];
	for (const t of tracks) {
		if (!t?.id || !t.uri?.startsWith('spotify:track:') || t.is_playable === false) continue;
		const k = key(t);
		if (seen.has(t.id) || seen.has(k)) continue;
		seen.add(t.id);
		seen.add(k);
		out.push(t);
	}
	return out;
}

// Same song on a different release (single vs album) shouldn't appear twice.
function key(t) {
	return `${t.name?.toLowerCase().replace(/\s*[-(].*$/, '')}|${t.artists?.[0]?.id}`;
}

/** @returns {Promise<{ tracks: object[], source: 'recommendations' | 'mix' }>} */
export async function buildRadio(seed, variant = 0) {
	// /recommendations already varies between calls, so use it for every mix when available.
	const recs = await fromRecommendations(seed);
	if (recs?.length) {
		return { tracks: [seed, ...dedupe(seed, recs)].slice(0, TARGET_SIZE + 1), source: 'recommendations' };
	}
	const mixed = await fromSearch(seed, variant);
	return { tracks: [seed, ...dedupe(seed, mixed)].slice(0, TARGET_SIZE + 1), source: 'mix' };
}
