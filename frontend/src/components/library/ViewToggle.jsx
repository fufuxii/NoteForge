import { LayoutGrid, List } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex border border-neutral-200 rounded-lg overflow-hidden">
      {[
        { id: 'grid', icon: LayoutGrid, label: 'Cuadrícula' },
        { id: 'list', icon: List, label: 'Lista' },
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          aria-label={label}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={cn(
            'h-8 px-3 inline-flex items-center gap-1.5 text-xs',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2',
            value === id ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:bg-neutral-50'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}