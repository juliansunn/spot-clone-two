import { useState } from 'react';
import Slider from '@/components/ui/Slider';
import { formatDuration } from '@/lib/format';
import { useProgress, usePlayerControls } from '@/hooks/usePlayback';

export default function ProgressBar({ disabled }) {
	const { progress, duration } = useProgress();
	const { seek } = usePlayerControls();
	// While dragging, show the drag position instead of fighting the poller.
	const [dragValue, setDragValue] = useState(null);
	const value = dragValue ?? progress;

	return (
		<div className="flex w-full items-center gap-2 text-[11px] tabular-nums text-muted">
			<span className="w-10 text-right">{formatDuration(value)}</span>
			<Slider
				label="Seek"
				disabled={disabled || !duration}
				min={0}
				max={Math.max(duration, 1)}
				step={1000}
				value={[Math.min(value, duration || 0)]}
				onValueChange={([v]) => setDragValue(v)}
				onValueCommit={([v]) => {
					seek(v);
					setDragValue(null);
				}}
			/>
			<span className="w-10">{formatDuration(duration)}</span>
		</div>
	);
}
