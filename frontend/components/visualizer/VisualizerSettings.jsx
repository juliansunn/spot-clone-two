import { useId } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Mic, MicOff, RotateCcw, SlidersHorizontal } from 'lucide-react';
import IconButton from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';
import { PRESETS, SLIDERS, STYLES } from '@/lib/visualizer/config';
import { disableMic, enableMic } from '@/lib/visualizer/control';
import { prefersReduced } from '@/lib/visualizer/engine';
import { useVisualizerStore } from '@/lib/visualizer/store';

function Switch({ checked, onChange, label, children }) {
	return (
		<label className="flex cursor-pointer items-center justify-between gap-3">
			{children}
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={() => onChange(!checked)}
				className={cn(
					'relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-150',
					checked ? 'bg-accent' : 'bg-hover'
				)}
			>
				<span
					className={cn(
						'absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]',
						checked && 'translate-x-4'
					)}
				/>
			</button>
		</label>
	);
}

function Range({ name }) {
	const id = useId();
	const cfg = SLIDERS[name];
	const value = useVisualizerStore((s) => s[name]);
	const set = useVisualizerStore((s) => s.set);
	return (
		<div className="grid gap-1.5">
			<label htmlFor={id} className="flex justify-between text-[13px] font-semibold">
				{cfg.label}
				<output htmlFor={id} className="font-mono text-[11px] font-normal text-subtle">
					{cfg.show(value)}
				</output>
			</label>
			<input
				id={id}
				type="range"
				min={cfg.min ?? 0}
				max={cfg.max ?? 100}
				value={value}
				onChange={(e) => set({ [name]: Number(e.target.value) })}
				className="w-full accent-accent"
			/>
			<div className="flex justify-between text-[11px] text-subtle">
				<span>{cfg.ends[0]}</span>
				<span>{cfg.ends[1]}</span>
			</div>
		</div>
	);
}

function Chips({ items, value, onChange, label }) {
	return (
		<div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
			{items.map((it) => (
				<button
					key={it.id}
					type="button"
					aria-pressed={value === it.id}
					onClick={() => onChange(it.id)}
					className={cn(
						'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
						value === it.id ? 'border-transparent bg-accent text-accent-fg' : 'border-line bg-elevated text-muted hover:text-fg'
					)}
				>
					{it.label}
				</button>
			))}
		</div>
	);
}

const Heading = ({ children }) => <h3 className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{children}</h3>;

function Listening() {
	const mic = useVisualizerStore((s) => s.mic);
	const micEnabled = useVisualizerStore((s) => s.micEnabled);

	if (mic === 'unsupported') {
		return <p className="text-xs text-muted">This browser can’t share the microphone, so the visualizer stays still.</p>;
	}
	if (mic === 'denied') {
		return (
			<div className="grid gap-2 text-xs text-muted">
				<p>Microphone is blocked. Allow it for this site in your browser’s settings, then try again.</p>
				<button type="button" onClick={() => enableMic()} className="justify-self-start font-semibold text-accent hover:underline">
					Try again
				</button>
			</div>
		);
	}
	if (!micEnabled) {
		return (
			<div className="grid gap-2">
				<p className="text-xs leading-relaxed text-muted">
					Antefy listens through your microphone so the lights move with whatever’s playing, on any speaker. Audio
					never leaves this device.
				</p>
				<button
					type="button"
					onClick={() => enableMic()}
					className="inline-flex items-center gap-2 justify-self-start rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-fg"
				>
					<Mic className="h-3.5 w-3.5" /> Turn on listening
				</button>
			</div>
		);
	}
	return (
		<div className="flex items-center justify-between gap-2 text-xs">
			<span className="flex items-center gap-2 text-muted">
				<span className={cn('h-2 w-2 rounded-full', mic === 'listening' ? 'bg-accent' : 'bg-subtle')} />
				{mic === 'listening' ? 'Listening' : mic === 'starting' ? 'Starting…' : mic === 'error' ? 'Couldn’t open the microphone' : 'Starts when music plays'}
			</span>
			<button type="button" onClick={disableMic} className="inline-flex items-center gap-1 font-semibold text-muted hover:text-fg">
				<MicOff className="h-3.5 w-3.5" /> Stop listening
			</button>
		</div>
	);
}

function Panel() {
	const s = useVisualizerStore();
	const { set } = s;
	const style = STYLES.find((x) => x.id === s.style) ?? STYLES[0];
	const reduce = prefersReduced(s);

	return (
		<div className="grid gap-5">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-bold">Visualizer</h2>
				<button
					type="button"
					onClick={s.reset}
					className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-fg"
				>
					<RotateCcw className="h-3.5 w-3.5" /> Reset
				</button>
			</div>

			<div className="grid gap-3 rounded-xl border border-line bg-surface/60 p-3">
				<Switch checked={s.enabled} onChange={(v) => set({ enabled: v })} label="Northern lights">
					<span className="grid gap-0.5">
						<span className="text-sm font-semibold">Northern lights</span>
						<span className="text-xs text-muted">Off removes the lights and glass and stops listening.</span>
					</span>
				</Switch>
				{s.enabled && <Listening />}
			</div>

			<div className={cn('grid gap-5 transition-opacity', !s.enabled && 'pointer-events-none opacity-40')} inert={!s.enabled}>
				<section className="grid gap-3.5">
					<Heading>Style</Heading>
					<div className="grid gap-3.5">
						<div className="grid gap-2">
							<Chips items={STYLES} value={s.style} onChange={(v) => set({ style: v })} label="Aurora style" />
							<p className="text-xs leading-relaxed text-muted">{style.note}</p>
						</div>
						<div className="grid gap-2">
							<div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Aurora colors">
								{PRESETS.map((p) => (
									<button
										key={p.id}
										type="button"
										title={p.label}
										aria-label={p.label}
										aria-pressed={s.colorMode === 'preset' && s.presetId === p.id}
										onClick={() => set({ colorMode: 'preset', presetId: p.id })}
										style={{ background: `linear-gradient(160deg, ${p.colors[2]}, ${p.colors[1]} 45%, ${p.colors[0]})` }}
										className="h-7 w-7 rounded-full ring-offset-2 ring-offset-elevated aria-pressed:ring-2 aria-pressed:ring-fg"
									/>
								))}
								<button
									type="button"
									title="Match album art"
									aria-pressed={s.colorMode === 'album'}
									onClick={() => set({ colorMode: 'album' })}
									className="h-7 rounded-full border border-line px-2.5 text-xs font-semibold text-muted ring-offset-2 ring-offset-elevated hover:text-fg aria-pressed:ring-2 aria-pressed:ring-fg"
								>
									Album
								</button>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted">
								Custom
								{[0, 1, 2].map((i) => (
									<input
										key={i}
										type="color"
										aria-label={`Custom color ${i + 1}`}
										value={s.customColors[i]}
										onChange={(e) => {
											const next = s.customColors.slice();
											next[i] = e.target.value;
											set({ colorMode: 'custom', customColors: next });
										}}
										className={cn(
											'h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-moz-color-swatch]:rounded-full [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0',
											s.colorMode === 'custom' && 'ring-2 ring-fg ring-offset-1 ring-offset-elevated'
										)}
									/>
								))}
							</div>
						</div>
						<Range name="brightness" />
						<Range name="reactivity" />
						<Range name="speed" />
						<Range name="bassDelay" />
						<label className="flex items-center gap-2 text-[13px] font-semibold">
							<input type="checkbox" checked={s.stars} onChange={(e) => set({ stars: e.target.checked })} className="accent-accent" />
							Stars (dark mode)
						</label>
					</div>
				</section>

				<section className="grid gap-3.5">
					<Heading>Glass</Heading>
					<Range name="glass" />
				</section>

				<label className="flex items-center gap-2 text-[13px] font-semibold">
					<input type="checkbox" checked={reduce} onChange={(e) => set({ reduceMotion: e.target.checked })} className="accent-accent" />
					Reduce motion (still lights)
				</label>
			</div>
		</div>
	);
}

/** Player-bar button that opens the visualizer settings. */
export default function VisualizerSettings() {
	const listening = useVisualizerStore((s) => s.mic === 'listening' && s.enabled);
	return (
		<Popover.Root>
			<Popover.Trigger asChild>
				<IconButton label="Visualizer settings" active={listening}>
					<SlidersHorizontal className="h-[18px] w-[18px]" />
				</IconButton>
			</Popover.Trigger>
			<Popover.Portal>
				<Popover.Content
					side="top"
					align="end"
					sideOffset={12}
					collisionPadding={12}
					className="z-[60] max-h-[min(72vh,680px)] w-[340px] max-w-[calc(100vw-24px)] animate-fade-in overflow-y-auto rounded-xl border border-line bg-elevated p-4 text-sm shadow-2xl outline-none focus-visible:ring-0"
				>
					<Panel />
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
