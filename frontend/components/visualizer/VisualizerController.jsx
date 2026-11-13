import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePlaybackState } from '@/hooks/usePlayback';
import { useImageColor } from '@/hooks/useImageColor';
import { enableMic, syncListening } from '@/lib/visualizer/control';
import { setPalette } from '@/lib/visualizer/engine';
import { resolvePalette } from '@/lib/visualizer/palette';
import { useVisualizerStore } from '@/lib/visualizer/store';

const selectNow = (d) => ({
	isPlaying: Boolean(d?.is_playing),
	cover: d?.item?.album?.images?.[0]?.url ?? d?.item?.images?.[0]?.url ?? d?.item?.show?.images?.[0]?.url ?? null,
	id: d?.item?.id ?? null
});

/** Wires playback, settings and the mic together. Renders nothing. */
export default function VisualizerController() {
	const { data } = usePlaybackState(selectNow);
	const isPlaying = data?.isPlaying ?? false;
	const albumColor = useImageColor(data?.cover, data?.id);

	const enabled = useVisualizerStore((s) => s.enabled);
	const lightsOn = useVisualizerStore((s) => s.lightsOn);
	const waveOn = useVisualizerStore((s) => s.waveOn);
	const micEnabled = useVisualizerStore((s) => s.micEnabled);
	const micHintShown = useVisualizerStore((s) => s.micHintShown);
	const colorMode = useVisualizerStore((s) => s.colorMode);
	const presetId = useVisualizerStore((s) => s.presetId);
	const customColors = useVisualizerStore((s) => s.customColors);
	const set = useVisualizerStore((s) => s.set);

	// Palette follows the chosen colors (or the current cover).
	useEffect(() => {
		setPalette(resolvePalette({ colorMode, presetId, customColors }, albumColor));
	}, [colorMode, presetId, customColors, albumColor]);

	// Let layout surfaces go translucent only while the lights are showing.
	useEffect(() => {
		const root = document.documentElement;
		if (enabled && lightsOn) root.dataset.aurora = 'on';
		else delete root.dataset.aurora;
		return () => {
			delete root.dataset.aurora;
		};
	}, [enabled, lightsOn]);

	// Listen only while music plays; close the mic a few seconds after pausing.
	const want = enabled && (lightsOn || waveOn) && micEnabled && isPlaying;
	useEffect(() => {
		if (want) {
			syncListening(true);
			return undefined;
		}
		const t = setTimeout(() => syncListening(false), isPlaying ? 0 : 4000);
		return () => clearTimeout(t);
	}, [want, isPlaying]);

	// One-time invitation the first time music plays.
	useEffect(() => {
		if (!isPlaying || !enabled || micEnabled || micHintShown) return;
		set({ micHintShown: true });
		toast('Make the background move with your music', {
			id: 'visualizer-mic',
			description: 'Antefy listens through your microphone, so it works on any speaker. Audio never leaves this device.',
			duration: 12000,
			action: { label: 'Turn on', onClick: () => enableMic() }
		});
	}, [isPlaying, enabled, micEnabled, micHintShown, set]);

	return null;
}
