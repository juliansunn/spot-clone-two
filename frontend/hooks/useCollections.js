import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import * as spotify from '@/lib/spotify';

const nextOffset = (last) => (last?.next ? (last.offset ?? 0) + (last.items?.length ?? 0) : undefined);

function useEnabled(id) {
	return useSession().status === 'authenticated' && typeof id === 'string' && id.length > 0;
}

export function usePlaylist(id) {
	const enabled = useEnabled(id);
	const playlist = useQuery({ queryKey: ['playlist', id], queryFn: () => spotify.getPlaylist(id), enabled });
	const items = useInfiniteQuery({
		queryKey: ['playlist-items', id],
		queryFn: ({ pageParam }) => spotify.getPlaylistItems(id, pageParam, 100),
		initialPageParam: 0,
		getNextPageParam: nextOffset,
		enabled
	});
	return { playlist, items };
}

export function useAlbum(id) {
	const enabled = useEnabled(id);
	const [wantMore, setWantMore] = useState(false);
	const album = useQuery({ queryKey: ['album', id], queryFn: () => spotify.getAlbum(id), enabled });
	// The album response embeds the first page of tracks; continue from there
	// only once the user scrolls past it.
	const firstPage = album.data?.tracks;
	const start = firstPage ? nextOffset(firstPage) : undefined;
	const more = useInfiniteQuery({
		queryKey: ['album-tracks', id, start],
		queryFn: ({ pageParam }) => spotify.getAlbumTracks(id, pageParam, 50),
		initialPageParam: start ?? 0,
		getNextPageParam: nextOffset,
		enabled: enabled && wantMore && start !== undefined
	});
	const hasMore = more.data ? Boolean(more.hasNextPage) : start !== undefined;
	const loadMore = () => (more.data ? more.fetchNextPage() : setWantMore(true));
	return { album, firstPage, more, hasMore, loadMore, loadingMore: more.isFetching };
}

export function useArtist(id) {
	const enabled = useEnabled(id);
	const artist = useQuery({ queryKey: ['artist', id], queryFn: () => spotify.getArtist(id), enabled });
	const topTracks = useQuery({
		queryKey: ['artist-top', id],
		queryFn: () => spotify.getArtistTopTracks(artist.data),
		enabled: Boolean(artist.data)
	});
	const albums = useQuery({
		queryKey: ['artist-albums', id],
		queryFn: async () => {
			const [main, appears] = await Promise.all([
				spotify.getArtistAlbums(id, { groups: 'album,single,compilation', limit: 50 }),
				spotify.getArtistAlbums(id, { groups: 'appears_on', limit: 20 }).catch(() => null)
			]);
			return { releases: main?.items ?? [], appearsOn: appears?.items ?? [] };
		},
		enabled
	});
	return { artist, topTracks, albums };
}

export function useShow(id) {
	const enabled = useEnabled(id);
	const show = useQuery({ queryKey: ['show', id], queryFn: () => spotify.getShow(id), enabled });
	const episodes = useInfiniteQuery({
		queryKey: ['show-episodes', id],
		queryFn: ({ pageParam }) => spotify.getShowEpisodes(id, pageParam, 50),
		initialPageParam: 0,
		getNextPageParam: nextOffset,
		enabled
	});
	return { show, episodes };
}
