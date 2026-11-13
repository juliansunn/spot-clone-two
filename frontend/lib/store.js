import { create } from 'zustand';

const read = (key) => {
	try {
		return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
	} catch {
		return null;
	}
};
const write = (key, value) => {
	try {
		if (value == null) window.localStorage.removeItem(key);
		else window.localStorage.setItem(key, value);
	} catch {
		/* storage unavailable (private mode) – non-critical */
	}
};

/** UI-only state. Server state (playback, library, etc.) lives in react-query. */
export const useUiStore = create((set) => ({
	sidebarOpen: false,
	setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

	devicePickerOpen: false,
	setDevicePickerOpen: (devicePickerOpen) => set({ devicePickerOpen }),

	lastDeviceId: read('antefy-last-device'),
	setLastDeviceId: (lastDeviceId) => {
		write('antefy-last-device', lastDeviceId);
		set({ lastDeviceId });
	},

	// Volume to restore after unmuting.
	volumeBeforeMute: null,
	setVolumeBeforeMute: (volumeBeforeMute) => set({ volumeBeforeMute })
}));

export function getStoredTheme() {
	return read('antefy-theme') === 'light' ? 'light' : 'dark';
}

export function storeTheme(theme) {
	write('antefy-theme', theme);
}
