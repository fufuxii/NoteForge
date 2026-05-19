import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  ghost:     'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  secondary: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50',
  primary:   'bg-forge-blue text-white hover:bg-forge-blue-hover shadow-sm',
};
const SIZES = {
  sm: 'h-7 w-7 [&_svg]:h-3.5 [&_svg]:w-3.5',
  md: 'h-9 w-9 [&_svg]:h-4 [&_svg]:w-4',
  lg: 'h-11 w-11 [&_svg]:h-5 [&_svg]:w-5',
};
const IconButton = forwardRef(function IconButton(
  { 'aria-label': ariaLabel, variant = 'ghost', size = 'md', className, children, ...props }, ref
) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant], SIZES[size], className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
export default IconButton;