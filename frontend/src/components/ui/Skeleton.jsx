import { cn } from '../../lib/cn';
export default function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-neutral-200', className)} aria-hidden="true" {...props} />;
}