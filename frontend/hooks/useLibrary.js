import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import * as spotify from '@/lib/spotify';

const MAX_ITEMS = 2000;

function useAuthed() {
	return useSession().status === 'authenticated';
}

/** Fetch every page of an offset-paginated endpoint (capped to stay polite). */
async function fetchAllOffset(fetchPage, pageSize = 50) {
	const items = [];
	let offset = 0;
	let total = Infinity;
	while (offset < total && offset < MAX_ITEMS) {
		const page = await fetchPage(offset, pageSize);
		const batch = page?.items ?? [];
		items.push(...batch);
		total = page?.total ?? 0;
		if (!page?.next || batch.length === 0) break;
		offset += batch.length;
	}
	return items;
}

export function useMe() {
	const enabled = useAuthed();
	return useQuery({ queryKey: ['me'], queryFn: spotify.getMe, enabled, staleTime: 30 * 60 * 1000 });
}

export function useMyPlaylists() {
	const enabled = useAuthed();
	return useQuery({
		queryKey: ['library', 'playlists'],
		queryFn: () => fetchAllOffset(spotify.getMyPlaylists).then((items) => items.filter(Boolean)),
		enabled,
		staleTime: 5 * 60 * 1000
	});
}

export function useSavedAlbums() {
	const enabled = useAuthed();
	return useQuery({
		queryKey: ['library', 'albums'],
		queryFn: () => fetchAllOffset(spotify.getSavedAlbums).then((items) => items.map((i) => i.album).filter(Boolean)),
		enabled,
		staleTime: 5 * 60 * 1000
	});
}

export function useSavedShows() {
	const enabled = useAuthed();
	return useQuery({
		queryKey: ['library', 'shows'],
		queryFn: () => fetchAllOffset(spotify.getSavedShows).then((items) => items.map((i) => i.show).filter(Boolean)),
		enabled,
		staleTime: 5 * 60 * 1000
	});
}

export function useFollowedArtists() {
	const enabled = useAuthed();
	return useQuery({
		queryKey: ['library', 'artists'],
		queryFn: async () => {
			// Cursor-paginated. The old code crashed on an empty page (items[-1].id).
			const items = [];
			let after;
			while (items.length < MAX_ITEMS) {
				const res = await spotify.getFollowedArtists(after);
				const page = res?.artists;
				const batch = page?.items ?? [];
				items.push(...batch);
				after = page?.cursors?.after;
				if (!after || batch.length === 0) break;
			}
			return items;
		},
		enabled,
		staleTime: 5 * 60 * 1000
	});
}

export function useLikedSongs() {
	const enabled = useAuthed();
	return useInfiniteQuery({
		queryKey: ['library', 'liked'],
		queryFn: ({ pageParam }) => spotify.getSavedTracks(pageParam, 50),
		initialPageParam: 0,
		getNextPageParam: (last) => (last?.next ? last.offset + last.items.length : undefined),
		enabled
	});
}

// ---------------------------------------------------------------------------
// Saved ("liked") status
// ---------------------------------------------------------------------------
// Page sizes are 50/100, so 25-URI chunks keep earlier chunk keys stable as
// more pages load (no refetching of already-known statuses).
const CHUNK = 25;
// Stable reference so react-query can memoise the combined result.
const mergeSaved = (results) => Object.assign({}, ...results.map((r) => r.data ?? {}));

export function useSavedStatus(uris, { assumeSaved = false } = {}) {
	const enabled = useAuthed() && !assumeSaved;
	const valid = useMemo(() => (uris ?? []).filter((u) => u && /^spotify:(track|episode):/.test(u)), [uris]);
	const chunks = useMemo(() => {
		const out = [];
		for (let i = 0; i < valid.length; i += CHUNK) out.push(valid.slice(i, i + CHUNK));
		return out;
	}, [valid]);

	const map = useQueries({
		queries: chunks.map((group) => ({
			queryKey: ['saved', group],
			queryFn: async () => {
				const flags = await spotify.libraryContains(group);
				return Object.fromEntries(group.map((u, i) => [u, Boolean(flags[i])]));
			},
			enabled,
			staleTime: 5 * 60 * 1000
		})),
		combine: mergeSaved
	});

	return useCallback((uri) => (assumeSaved ? map[uri] ?? true : Boolean(map[uri])), [map, assumeSaved]);
}

export function useToggleSaved() {
	const queryClient = useQueryClient();

	const setEverywhere = (uri, value) => {
		queryClient.setQueriesData({ queryKey: ['saved'] }, (old) =>
			old && uri in old ? { ...old, [uri]: value } : old
		);
	};

	return useMutation({
		mutationFn: ({ uri, saved }) => (saved ? spotify.removeFromLibrary([uri]) : spotify.saveToLibrary([uri])),
		onMutate: ({ uri, saved }) => {
			setEverywhere(uri, !saved);
			// Seed a single-item entry so the player bar's heart reflects it too.
			queryClient.setQueryData(['saved', [uri]], { [uri]: !saved });
		},
		onSuccess: (_d, { saved, name }) => {
			toast.success(saved ? `Removed${name ? ` “${name}”` : ''} from Liked Songs` : `Added${name ? ` “${name}”` : ''} to Liked Songs`);
			queryClient.invalidateQueries({ queryKey: ['library', 'liked'] });
		},
		onError: (e, { uri, saved }) => {
			setEverywhere(uri, saved);
			queryClient.setQueryData(['saved', [uri]], { [uri]: saved });
			toast.error(spotify.describeError(e));
		}
	});
}
