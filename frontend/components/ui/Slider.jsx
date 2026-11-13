import * as RadixSlider from '@radix-ui/react-slider';
import { cn } from '@/lib/cn';

export default function Slider({ className, label, ...props }) {
	return (
		<RadixSlider.Root
			className={cn('group relative flex h-4 w-full touch-none select-none items-center', className)}
			{...props}
		>
			<RadixSlider.Track className="relative h-1 grow overflow-hidden rounded-full bg-fg/20">
				<RadixSlider.Range className="absolute h-full rounded-full bg-fg group-hover:bg-accent" />
			</RadixSlider.Track>
			<RadixSlider.Thumb
				aria-label={label}
				className="block h-3 w-3 rounded-full bg-fg opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
			/>
		</RadixSlider.Root>
	);
}
