import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

const OPTIONS = [
  { id: 'recent', label: 'Recientes' },
  { id: 'title',  label: 'A–Z' },
];

export default function SortMenu({ value, onChange }) {
  const cur = OPTIONS.find((o) => o.id === value) ?? OPTIONS[0];
  const next = () => {
    const i = OPTIONS.findIndex((o) => o.id === value);
    onChange(OPTIONS[(i + 1) % OPTIONS.length].id);
  };
  return (
    <button
      onClick={next}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2'
      )}
    >
      Ordenar · {cur.label}
      <ChevronDown className="h-3.5 w-3.5" />
    </button>
  );
}

function tsToMs(ts) {
  if (!ts) return 0;
  if (ts._seconds != null) return ts._seconds * 1000;
  return new Date(ts).getTime();
}

export function applySort(items, sort) {
  const arr = [...items];
  if (sort === 'title') return arr.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
  return arr.sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt));
}