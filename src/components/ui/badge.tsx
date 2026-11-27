import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-zinc-200/80 bg-zinc-50 text-zinc-700',
        featured:
          'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700',
        outline: 'border-zinc-200/80 bg-white text-zinc-700',
        dark: 'border-zinc-900 bg-zinc-900 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
