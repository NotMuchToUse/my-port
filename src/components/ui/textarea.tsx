import * as React from 'react';
import { cn } from '@/src/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[110px] w-full rounded-lg border border-zinc-200/90 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
