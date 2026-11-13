import { useEffect, useRef, useState } from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import Slider from '@/components/ui/Slider';
import { usePlaybackState, usePlayerControls } from '@/hooks/usePlayback';
import { useUiStore } from '@/lib/store';

export default function VolumeControl() {
	const { data } = usePlaybackState();
	const device = data?.device;
	const remote = device?.volume_percent ?? null;
	const { setVolume } = usePlayerControls();
	const volumeBeforeMute = useUiStore((s) => s.volumeBeforeMute);
	const setVolumeBeforeMute = useUiStore((s) => s.setVolumeBeforeMute);
	const [local, setLocal] = useState(null);
	const timer = useRef(null);
	const supported = device && device.supports_volume !== false;
	const value = local ?? remote ?? 0;

	useEffect(() => () => clearTimeout(timer.current), []);

	// Throttle while dragging so we don't hit the rate limit.
	const commit = (v, immediate = false) => {
		clearTimeout(timer.current);
		const run = () => {
			setVolume(v);
			setLocal(null);
		};
		if (immediate) run();
		else timer.current = setTimeout(run, 250);
	};

	const muted = value === 0;
	const Icon = muted ? VolumeX : value < 33 ? Volume : value < 66 ? Volume1 : Volume2;

	return (
		<div className="flex w-36 items-center gap-1 lg:w-40">
			<IconButton
				label={muted ? 'Unmute' : 'Mute'}
				disabled={!supported}
				onClick={() => {
					if (muted) {
						commit(volumeBeforeMute || 50, true);
					} else {
						setVolumeBeforeMute(value);
						commit(0, true);
					}
				}}
			>
				<Icon className="h-[18px] w-[18px]" />
			</IconButton>
			<Slider
				label="Volume"
				disabled={!supported}
				min={0}
				max={100}
				step={1}
				value={[value]}
				onValueChange={([v]) => {
					setLocal(v);
					commit(v);
				}}
				onValueCommit={([v]) => commit(v, true)}
			/>
		</div>
	);
}
