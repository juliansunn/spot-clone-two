import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULTS, STORAGE_KEY } from './config';

/**
 * Visualizer settings (persisted per browser) plus live mic status (not persisted).
 * mic: 'off' | 'starting' | 'listening' | 'denied' | 'unsupported' | 'error'
 */
export const useVisualizerStore = create(
	persist(
		(set) => ({
			...DEFAULTS,
			mic: 'off',
			set: (patch) => set(patch),
			// Keeps the mic opt-in: resetting looks shouldn't silently stop listening.
			reset: () => set((s) => ({ ...DEFAULTS, micEnabled: s.micEnabled, micHintShown: true }))
		}),
		{
			name: STORAGE_KEY,
			version: 1,
			storage: createJSONStorage(() => localStorage),
			partialize: ({ mic, set: _set, reset: _reset, ...rest }) => rest,
			merge: (persisted, current) => ({ ...current, ...(persisted ?? {}) })
		}
	)
);

/** Non-reactive read for the render loop (no React re-renders per frame). */
export const getVisualizer = () => useVisualizerStore.getState();
