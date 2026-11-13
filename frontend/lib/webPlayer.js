import { getAccessToken } from '@/lib/spotify';
import { useUiStore } from '@/lib/store';

/**
 * Spotify Web Playback SDK wrapper: turns this browser tab into a Spotify
 * Connect device ("Antefy Web Player"). Requires Premium and the `streaming`
 * scope. One player per page, created lazily and kept for the page's lifetime
 * (so React strict-mode double mounts don't spawn duplicate devices).
 */

export const WEB_PLAYER_NAME = 'Antefy Web Player';
const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';

let player = null;
let starting = null;
const listeners = new Set();

const setState = (patch) => useUiStore.getState().setWebPlayer(patch);

function loadSdk() {
	if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
	if (window.Spotify?.Player) return Promise.resolve(window.Spotify);
	return new Promise((resolve, reject) => {
		const prev = window.onSpotifyWebPlaybackSDKReady;
		window.onSpotifyWebPlaybackSDKReady = () => {
			prev?.();
			resolve(window.Spotify);
		};
		if (!document.querySelector(`script[src="${SDK_URL}"]`)) {
			const script = document.createElement('script');
			script.src = SDK_URL;
			script.async = true;
			script.onerror = () => reject(new Error('Could not load the Spotify player script.'));
			document.body.appendChild(script);
		}
	});
}

/** Subscribe to SDK state changes (track change, pause, seek…). */
export function onWebPlayerStateChange(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}

export function startWebPlayer() {
	if (player || starting) return starting ?? Promise.resolve(player);
	setState({ status: 'loading', message: null });

	starting = loadSdk()
		.then((Spotify) => {
			const p = new Spotify.Player({
				name: WEB_PLAYER_NAME,
				volume: 0.6,
				getOAuthToken: (cb) => {
					getAccessToken().then((t) => t && cb(t));
				}
			});

			p.addListener('ready', ({ device_id }) => setState({ status: 'ready', deviceId: device_id, message: null }));
			p.addListener('not_ready', () => setState({ status: 'loading', deviceId: null }));
			p.addListener('player_state_changed', (state) => listeners.forEach((fn) => fn(state)));
			p.addListener('initialization_error', ({ message }) =>
				setState({ status: 'unsupported', deviceId: null, message: message || 'This browser can’t play Spotify audio.' })
			);
			p.addListener('authentication_error', ({ message }) =>
				// Usually a session created before the `streaming` scope was added.
				setState({ status: 'needs-reauth', deviceId: null, message })
			);
			p.addListener('account_error', ({ message }) =>
				setState({ status: 'premium-required', deviceId: null, message })
			);
			p.addListener('playback_error', ({ message }) => console.warn('[web player] playback error:', message));

			player = p;
			return p.connect().then((ok) => {
				if (!ok) setState({ status: 'error', message: 'Could not connect the web player.' });
				return p;
			});
		})
		.catch((e) => {
			setState({ status: 'error', message: e.message });
			return null;
		})
		.finally(() => {
			starting = null;
		});

	return starting;
}

/**
 * Browsers block audio until the user interacts with the page. Call this from
 * a click handler before starting playback on the web player.
 */
export function activateWebPlayer() {
	try {
		player?.activateElement?.();
	} catch {
		/* older SDKs don't have activateElement */
	}
}

export function stopWebPlayer() {
	player?.disconnect();
	player = null;
	setState({ status: 'idle', deviceId: null, message: null });
}
