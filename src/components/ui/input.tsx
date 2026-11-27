import * as React from 'react';
import { cn } from '@/src/lib/utils';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-lg border border-zinc-200/90 bg-white px-3.5 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';
