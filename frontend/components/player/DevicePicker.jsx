import * as Popover from '@radix-ui/react-popover';
import { Laptop, MonitorSpeaker, Smartphone, Speaker, Tv, Gamepad2, Car, MonitorSmartphone } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/States';
import { cn } from '@/lib/cn';
import { useDevices, usePlaybackState, usePlayerControls } from '@/hooks/usePlayback';
import { useUiStore } from '@/lib/store';
import { signIn } from 'next-auth/react';
import { WEB_PLAYER_NAME } from '@/lib/webPlayer';

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
	const webPlayer = useUiStore((s) => s.webPlayer);
	const webActive = webPlayer.deviceId && webPlayer.deviceId === activeId;
	// The web player is listed separately at the top as "This computer".
	const others = (devices ?? []).filter((d) => d.id !== webPlayer.deviceId && d.name !== WEB_PLAYER_NAME);

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
					className="z-[60] w-80 animate-fade-in rounded-xl border border-line bg-elevated outline-none focus-visible:ring-0 p-2 text-sm shadow-2xl"
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
					<ThisComputer
						webPlayer={webPlayer}
						active={webActive}
						onSelect={() => {
							if (!webActive) transfer({ id: webPlayer.deviceId, name: 'this computer', play: Boolean(playback?.is_playing) });
							setOpen(false);
						}}
					/>
					<div className="mx-3 my-2 h-px bg-line" />
					<p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-subtle">Other devices</p>
					{isLoading ? (
						<div className="flex justify-center py-6">
							<Spinner />
						</div>
					) : others.length ? (
						<ul className="space-y-0.5">
							{others.map((d) => {
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
						<p className="px-3 pb-3 text-xs text-muted">
							Open the Spotify app on your phone, desktop or a speaker and it will appear here.
						</p>
					)}
					<Popover.Arrow className="fill-elevated" />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}

const WEB_STATUS = {
	idle: 'Starting…',
	loading: 'Connecting…',
	unsupported: 'This browser can’t play Spotify audio',
	'premium-required': 'Requires Spotify Premium',
	error: 'Couldn’t start the web player'
};

function ThisComputer({ webPlayer, active, onSelect }) {
	const { status, message } = webPlayer;
	if (status === 'needs-reauth') {
		return (
			<div className="mx-1 rounded-lg bg-hover/60 p-3">
				<p className="flex items-center gap-2 font-medium">
					<Laptop className="h-5 w-5" /> This computer
				</p>
				<p className="mt-1 text-xs text-muted">Sign in again to allow playback in this browser.</p>
				<button
					type="button"
					onClick={() => signIn('spotify', { callbackUrl: window.location.href })}
					className="mt-2 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg hover:brightness-110"
				>
					Re-authorize Spotify
				</button>
			</div>
		);
	}
	const ready = status === 'ready' && webPlayer.deviceId;
	return (
		<button
			type="button"
			disabled={!ready}
			onClick={onSelect}
			title={!ready ? message ?? undefined : undefined}
			className={cn(
				'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60',
				active && 'text-accent'
			)}
		>
			<Laptop className="h-5 w-5 shrink-0" />
			<span className="min-w-0 flex-1">
				<span className="block truncate font-medium">This computer</span>
				<span className="block text-xs text-muted">
					{active ? 'Playing here' : ready ? 'Antefy web player' : WEB_STATUS[status] ?? 'Unavailable'}
				</span>
			</span>
			{!ready && (status === 'idle' || status === 'loading') && <Spinner className="h-4 w-4" />}
		</button>
	);
}
