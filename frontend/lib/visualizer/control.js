import { startListening, stopListening } from './audio';
import { kick } from './engine';
import { useVisualizerStore } from './store';

const store = () => useVisualizerStore.getState();

/** Opt in to listening. Call from a click so the browser allows audio to start. */
export async function enableMic() {
	store().set({ micEnabled: true, micHintShown: true, mic: 'starting' });
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

/** Turn listening on/off to follow playback (only when the user has opted in). */
export async function syncListening(want) {
	if (!want) {
		stopListening();
		if (store().mic === 'listening') store().set({ mic: 'off' });
		kick();
		return;
	}
	if (store().mic === 'listening' || store().mic === 'starting') return;
	store().set({ mic: 'starting' });
	const status = await startListening();
	store().set({ mic: status });
	kick();
}
