import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePlaybackState } from '@/hooks/usePlayback';
import { useImageColor } from '@/hooks/useImageColor';
import { SLIDERS } from '@/lib/visualizer/config';
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
	const glass = useVisualizerStore((s) => s.glass);
	const micEnabled = useVisualizerStore((s) => s.micEnabled);
	const colorMode = useVisualizerStore((s) => s.colorMode);
	const presetId = useVisualizerStore((s) => s.presetId);
	const customColors = useVisualizerStore((s) => s.customColors);

	// Palette follows the chosen colors (or the current cover).
	useEffect(() => {
		setPalette(resolvePalette({ colorMode, presetId, customColors }, albumColor));
	}, [colorMode, presetId, customColors, albumColor]);

	// Layout surfaces turn to glass only while the lights are showing.
	useEffect(() => {
		const root = document.documentElement;
		if (enabled) root.dataset.aurora = 'on';
		else delete root.dataset.aurora;
		return () => {
			delete root.dataset.aurora;
		};
	}, [enabled]);

	// Glass strength → CSS variables (only on change, never per frame).
	useEffect(() => {
		const { alpha, blur } = SLIDERS.glass.map(glass);
		const root = document.documentElement.style;
		root.setProperty('--glass-alpha', alpha.toFixed(2));
		root.setProperty('--glass-blur', `${Math.round(blur)}px`);
	}, [glass]);

	// Listen only while music plays; close the mic a few seconds after pausing.
	const want = enabled && micEnabled && isPlaying;
	useEffect(() => {
		if (want) {
			syncListening(true);
			return undefined;
		}
		const t = setTimeout(() => syncListening(false), isPlaying ? 0 : 4000);
		return () => clearTimeout(t);
	}, [want, isPlaying]);

	// If the browser blocked the mic, say why the lights are still (once per page load).
	const mic = useVisualizerStore((s) => s.mic);
	useEffect(() => {
		if (mic !== 'denied' || !enabled) return;
		toast('The northern lights can’t hear the music', {
			id: 'visualizer-mic-denied',
			description: 'They react through your microphone, and it’s blocked. Allow it for this site in your browser settings. Audio never leaves this device.',
			duration: 12000,
			action: { label: 'Try again', onClick: () => enableMic() }
		});
	}, [mic, enabled]);

	return null;
}
