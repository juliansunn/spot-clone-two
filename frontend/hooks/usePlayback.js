import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import * as spotify from '@/lib/spotify';
import { useUiStore } from '@/lib/store';

export const PLAYBACK_KEY = ['playback'];

/**
 * Single source of truth for what Spotify is playing. Polled rather than
 * simulated locally – the old implementation tried to mirror Spotify's queue
 * in the browser, which drifted out of sync on every skip/shuffle/track end.
 */
export function usePlaybackState(select) {
	const { status } = useSession();
	return useQuery({
		queryKey: PLAYBACK_KEY,
		queryFn: spotify.getPlaybackState,
		enabled: status === 'authenticated',
		select,
		staleTime: 0,
		refetchOnWindowFocus: true,
		refetchIntervalInBackground: false,
		refetchInterval: (query) => {
			if (query.state.error) return 15000;
			return query.state.data?.is_playing ? 3000 : 8000;
		}
	});
}

const selectNowPlaying = (d) =>
	d
		? {
				id: d.item?.id ?? null,
				uri: d.item?.uri ?? null,
				contextUri: d.context?.uri ?? null,
				isPlaying: Boolean(d.is_playing)
			}
		: { id: null, uri: null, contextUri: null, isPlaying: false };

/** Lightweight subscription for rows/buttons that only need "is this playing?". */
export function useNowPlaying() {
	return usePlaybackState(selectNowPlaying).data ?? selectNowPlaying(null);
}

/**
 * Smoothly interpolated playback position between polls. When the track should
 * have ended, trigger a refetch so the next track shows up promptly.
 */
export function useProgress() {
	const queryClient = useQueryClient();
	const { data, dataUpdatedAt } = usePlaybackState();
	const [now, setNow] = useState(() => Date.now());
	const isPlaying = Boolean(data?.is_playing);
	const duration = data?.item?.duration_ms ?? 0;
	const base = data?.progress_ms ?? 0;
	const progress = Math.min(duration, base + (isPlaying ? Math.max(0, now - dataUpdatedAt) : 0));
	const endedRef = useRef(null);

	useEffect(() => {
		if (!isPlaying) return undefined;
		const id = setInterval(() => setNow(Date.now()), 250);
		return () => clearInterval(id);
	}, [isPlaying]);

	useEffect(() => {
		if (isPlaying && duration && progress >= duration && endedRef.current !== data?.item?.id) {
			endedRef.current = data?.item?.id;
			const t = setTimeout(() => queryClient.invalidateQueries({ queryKey: PLAYBACK_KEY }), 600);
			return () => clearTimeout(t);
		}
		return undefined;
	}, [isPlaying, duration, progress, data?.item?.id, queryClient]);

	return { progress, duration, isPlaying };
}

export function useDevices(enabled = true) {
	const { status } = useSession();
	return useQuery({
		queryKey: ['devices'],
		queryFn: spotify.getDevices,
		enabled: enabled && status === 'authenticated',
		select: (d) => d?.devices ?? [],
		staleTime: 5000,
		refetchInterval: enabled ? 10000 : false
	});
}

const isNoDevice = (e) =>
	e instanceof spotify.SpotifyApiError &&
	(e.reason === 'NO_ACTIVE_DEVICE' || (e.status === 404 && /device/i.test(e.message ?? '')));

/**
 * All playback commands. Each applies an optimistic update, then re-syncs with
 * Spotify shortly after (Spotify's state lags commands by a few hundred ms).
 */
export function usePlayerControls() {
	const queryClient = useQueryClient();
	const setDevicePickerOpen = useUiStore((s) => s.setDevicePickerOpen);
	const lastDeviceId = useUiStore((s) => s.lastDeviceId);
	const setLastDeviceId = useUiStore((s) => s.setLastDeviceId);
	const syncTimer = useRef(null);

	const getState = () => queryClient.getQueryData(PLAYBACK_KEY);
	/**
	 * setQueryData resets dataUpdatedAt (the interpolation base), so roll
	 * progress forward to "now" before applying the change.
	 */
	const patch = (fn) => {
		const prev = getState();
		if (prev) {
			const updatedAt = queryClient.getQueryState(PLAYBACK_KEY)?.dataUpdatedAt ?? Date.now();
			const rolled = { ...prev, progress_ms: interpolatedProgress(prev, updatedAt) };
			queryClient.setQueryData(PLAYBACK_KEY, fn(rolled));
		}
		return prev;
	};
	const resync = useCallback(
		(delay = 400) => {
			clearTimeout(syncTimer.current);
			syncTimer.current = setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: PLAYBACK_KEY });
			}, delay);
		},
		[queryClient]
	);

	/**
	 * Run a command; if Spotify says there's no active device, wake one up
	 * (last used, else the first available) and retry once. If there are no
	 * devices at all, open the device picker with guidance.
	 */
	const withDevice = async (command) => {
		try {
			return await command(undefined);
		} catch (e) {
			if (!isNoDevice(e)) throw e;
			const devices = (await spotify.getDevices().catch(() => null))?.devices ?? [];
			const target =
				devices.find((d) => d.id === lastDeviceId && !d.is_restricted) ??
				devices.find((d) => !d.is_restricted);
			if (!target) {
				setDevicePickerOpen(true);
				throw e;
			}
			setLastDeviceId(target.id);
			return command(target.id);
		}
	};

	const onSettled = () => resync();
	const rollback = (_e, _v, prev) => {
		if (prev) queryClient.setQueryData(PLAYBACK_KEY, prev);
	};

	const playMutation = useMutation({
		mutationFn: (opts) => withDevice((deviceId) => spotify.play({ ...opts, deviceId: opts?.deviceId ?? deviceId })),
		onMutate: () => patch((s) => ({ ...s, is_playing: true })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled: () => resync(500)
	});

	const pauseMutation = useMutation({
		mutationFn: () => spotify.pause(),
		onMutate: () => patch((s) => ({ ...s, is_playing: false })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled
	});

	const skipMutation = useMutation({
		mutationFn: (direction) =>
			withDevice((deviceId) => (direction > 0 ? spotify.skipNext(deviceId) : spotify.skipPrevious(deviceId))),
		onError: (e) => toast.error(spotify.describeError(e)),
		onSettled: () => resync(500)
	});

	const seekMutation = useMutation({
		mutationFn: (ms) => spotify.seek(ms),
		onMutate: (ms) => patch((s) => ({ ...s, progress_ms: ms })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled: () => resync(800)
	});

	const shuffleMutation = useMutation({
		mutationFn: (state) => spotify.setShuffle(state),
		onMutate: (state) => patch((s) => ({ ...s, shuffle_state: state })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled
	});

	const repeatMutation = useMutation({
		mutationFn: (state) => spotify.setRepeat(state),
		onMutate: (state) => patch((s) => ({ ...s, repeat_state: state })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled
	});

	const volumeMutation = useMutation({
		mutationFn: (pct) => spotify.setVolume(pct),
		onMutate: (pct) => patch((s) => ({ ...s, device: s.device ? { ...s.device, volume_percent: pct } : s.device })),
		onError: (e, v, prev) => {
			rollback(e, v, prev);
			toast.error(spotify.describeError(e));
		},
		onSettled: () => resync(1200)
	});

	const transferMutation = useMutation({
		mutationFn: ({ id, play }) => spotify.transferPlayback(id, play),
		onSuccess: (_d, { id, name }) => {
			setLastDeviceId(id);
			toast.success(`Playing on ${name ?? 'device'}`);
			queryClient.invalidateQueries({ queryKey: ['devices'] });
		},
		onError: (e) => toast.error(spotify.describeError(e)),
		onSettled: () => resync(800)
	});

	const { mutate: pauseMutate } = pauseMutation;
	const { mutate: playMutate } = playMutation;
	const togglePlay = useCallback(() => {
		const s = queryClient.getQueryData(PLAYBACK_KEY);
		if (s?.is_playing) pauseMutate();
		else playMutate({});
	}, [queryClient, pauseMutate, playMutate]);

	return {
		play: playMutate,
		pause: pauseMutate,
		togglePlay,
		next: () => skipMutation.mutate(1),
		previous: () => skipMutation.mutate(-1),
		seek: seekMutation.mutate,
		setShuffle: shuffleMutation.mutate,
		setRepeat: repeatMutation.mutate,
		setVolume: volumeMutation.mutate,
		transfer: transferMutation.mutate,
		isPending: playMutation.isPending || pauseMutation.isPending || skipMutation.isPending
	};
}

function interpolatedProgress(s, updatedAt) {
	const base = s?.progress_ms ?? 0;
	const duration = s?.item?.duration_ms ?? Infinity;
	return s?.is_playing ? Math.min(duration, base + Math.max(0, Date.now() - updatedAt)) : base;
}

/**
 * Play a track from a list, or toggle it if it's already the current track.
 * `context` is one of:
 *   { contextUri }                 – playlist / album / show / liked songs collection
 *   { uris }                       – ad-hoc list (search results, top tracks, history)
 */
export function usePlayFrom() {
	const queryClient = useQueryClient();
	const { play, togglePlay } = usePlayerControls();

	// Reads the latest playback snapshot at call time instead of subscribing,
	// so the returned callback stays stable and memoised rows don't re-render.
	return useCallback(
		(context, item, { positionMs } = {}) => {
			const now = selectNowPlaying(queryClient.getQueryData(PLAYBACK_KEY));
			if (item && now.uri === item.uri) {
				togglePlay();
				return;
			}
			if (!item && context.contextUri && now.contextUri === context.contextUri) {
				togglePlay();
				return;
			}
			if (context.contextUri) {
				play({
					contextUri: context.contextUri,
					offset: item ? { uri: item.uri } : undefined,
					positionMs
				});
			} else if (context.uris?.length) {
				// The play endpoint caps the uris array; send a window around the chosen track.
				const all = context.uris;
				const idx = item ? Math.max(0, all.indexOf(item.uri)) : 0;
				const start = Math.max(0, idx - 50);
				const uris = all.slice(start, start + 100);
				play({ uris, offset: { position: idx - start }, positionMs });
			}
		},
		[queryClient, play, togglePlay]
	);
}
