import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

const VARIANTS = {
  primary:   'bg-forge-blue text-white hover:bg-forge-blue-hover shadow-sm',
  secondary: 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50',
  ghost:     'bg-transparent text-neutral-700 hover:bg-neutral-100',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const SIZES = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', className, children, leadingIcon, trailingIcon, ...props }, ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant], SIZES[size], className
      )}
      {...props}
    >
      {leadingIcon}{children}{trailingIcon}
    </button>
  );
});
export default Button;