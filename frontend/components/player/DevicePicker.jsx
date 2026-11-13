import * as Popover from '@radix-ui/react-popover';
import { Laptop, MonitorSpeaker, Smartphone, Speaker, Tv, Gamepad2, Car, MonitorSmartphone } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/States';
import { cn } from '@/lib/cn';
import { useDevices, usePlaybackState, usePlayerControls } from '@/hooks/usePlayback';
import { useUiStore } from '@/lib/store';

const ICONS = {
	computer: Laptop,
	smartphone: Smartphone,
	speaker: Speaker,
	tv: Tv,
	castvideo: Tv,
	castaudio: Speaker,
	gameconsole: Gamepad2,
	automobile: Car
};

export function DeviceIcon({ type, className }) {
	const Icon = ICONS[type?.toLowerCase()] ?? MonitorSpeaker;
	return <Icon className={className} />;
}

export default function DevicePicker() {
	const open = useUiStore((s) => s.devicePickerOpen);
	const setOpen = useUiStore((s) => s.setDevicePickerOpen);
	const { data: devices, isLoading, refetch } = useDevices(open);
	const { data: playback } = usePlaybackState();
	const { transfer } = usePlayerControls();
	const activeId = playback?.device?.id ?? devices?.find((d) => d.is_active)?.id;

	return (
		<Popover.Root
			open={open}
			onOpenChange={(o) => {
				setOpen(o);
				if (o) refetch();
			}}
		>
			<Popover.Trigger asChild>
				<IconButton label="Connect to a device" active={Boolean(playback?.device && open)}>
					<MonitorSmartphone className="h-[18px] w-[18px]" />
				</IconButton>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					side="top"
					align="end"
					sideOffset={12}
					collisionPadding={12}
					className="z-[60] w-80 animate-fade-in rounded-xl border border-line bg-elevated p-2 text-sm shadow-2xl"
				>
					<div className="px-3 pb-2 pt-2">
						<h3 className="font-bold">Connect to a device</h3>
						{playback?.device && (
							<p className="mt-1 flex items-center gap-2 text-accent">
								<DeviceIcon type={playback.device.type} className="h-4 w-4" />
								<span className="truncate">Listening on {playback.device.name}</span>
							</p>
						)}
					</div>
					{isLoading ? (
						<div className="flex justify-center py-6">
							<Spinner />
						</div>
					) : devices?.length ? (
						<ul className="space-y-0.5">
							{devices.map((d) => {
								const active = d.id === activeId;
								return (
									<li key={d.id ?? d.name}>
										<button
											type="button"
											disabled={d.is_restricted || !d.id}
											onClick={() => {
												if (!active) transfer({ id: d.id, name: d.name, play: Boolean(playback?.is_playing) });
												setOpen(false);
											}}
											className={cn(
												'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50',
												active && 'text-accent'
											)}
										>
											<DeviceIcon type={d.type} className="h-5 w-5 shrink-0" />
											<span className="min-w-0 flex-1">
												<span className="block truncate font-medium">{d.name}</span>
												<span className="block text-xs text-muted">
													{active ? 'Current device' : d.is_restricted ? 'Restricted' : d.type}
												</span>
											</span>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<div className="space-y-2 px-3 pb-3 text-muted">
							<p>No devices found.</p>
							<p className="text-xs">
								Open the Spotify app on your phone, computer or speaker (Premium required), then come back. It will show
								up here automatically.
							</p>
						</div>
					)}
					<Popover.Arrow className="fill-elevated" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
