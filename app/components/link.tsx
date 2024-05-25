import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import {
	Link as RemixLink,
	LinkProps as RemixLinkProps,
} from '@remix-run/react';

import { cn } from '#app/utils/misc.tsx';
import { Button } from './ui/button';

const linkVariants = cva('text-2xl hover:underline');

export interface LinkProps
	extends RemixLinkProps,
		VariantProps<typeof linkVariants> {
	asChild?: boolean;
}

/**
 *
 * @remarks
 * The base of this component is [`Link`](https://remix.run/docs/en/main/components/link) component from `@remix-run/react`.
 */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : RemixLink;
		return (
			<Button asChild variant={'link'}>
				<Comp
					className={cn(linkVariants({ className }))}
					ref={ref}
					{...props}
				/>
			</Button>
		);
	},
);
Link.displayName = 'Link';

export { Link, linkVariants };
