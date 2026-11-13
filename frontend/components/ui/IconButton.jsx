import { forwardRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/cn';

/** Accessible icon button with an optional tooltip (label doubles as aria-label). */
const IconButton = forwardRef(function IconButton(
	{ label, tooltip = true, active = false, size = 'md', className, children, ...props },
	ref
) {
	const button = (
		<button
			ref={ref}
			type="button"
			aria-label={label}
			className={cn(
				'inline-flex shrink-0 items-center justify-center rounded-full text-muted transition',
				'hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40',
				size === 'sm' && 'h-8 w-8',
				size === 'md' && 'h-9 w-9',
				size === 'lg' && 'h-11 w-11',
				active && 'text-accent hover:text-accent',
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
	if (!tooltip || !label) return button;
	return (
		<Tooltip.Root>
			<Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
			<Tooltip.Portal>
				<Tooltip.Content
					sideOffset={6}
					className="z-[70] rounded-md bg-elevated px-2 py-1 text-xs font-medium text-fg shadow-lg ring-1 ring-line"
				>
					{label}
				</Tooltip.Content>
			</Tooltip.Portal>
		</Tooltip.Root>
	);
});

export default IconButton;
