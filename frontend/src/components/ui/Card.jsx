import { cn } from '../../lib/cn';

export default function Card({ as: Tag = 'div', className, children, padded = true, interactive = false, ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-neutral-200 bg-white shadow-[var(--shadow-card)]',
        padded && 'p-5',
        interactive && 'transition-shadow hover:shadow-md focus-within:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}