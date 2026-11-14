import { startListening, stopListening } from './audio';
import { kick } from './engine';
import { useVisualizerStore } from './store';

const store = () => useVisualizerStore.getState();

/** Opt in to listening. Call from a click so the browser allows audio to start. */
export async function enableMic() {
	store().set({ micEnabled: true, mic: 'starting' });
	const status = await startListening();
	store().set({ mic: status });
	kick();
	return status;
}

export function disableMic() {
	stopListening();
	store().set({ micEnabled: false, mic: 'off' });
	kick();
}

/** Turn listening on/off to follow playback (unless the user switched listening off). */
export async function syncListening(want) {
	if (!want) {
		stopListening();
		if (store().mic === 'listening') store().set({ mic: 'off' });
		kick();
		return;
	}
	// Already on, or blocked/unsupported: retrying only re-shows the same failure (Try again does that).
	if (['listening', 'starting', 'denied', 'unsupported'].includes(store().mic)) return;
	store().set({ mic: 'starting' });
	const status = await startListening();
	store().set({ mic: status });
	kick();
}
