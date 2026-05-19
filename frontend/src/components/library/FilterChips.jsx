import { useRef } from 'react';
import { cn } from '../../lib/cn';

const FILTERS = [
  { id: 'all',    label: 'Todas'       },
  { id: 'image',  label: 'Imagen'      },
  { id: 'audio',  label: 'Audio'       },
  { id: 'text',   label: 'Texto'       },
  { id: 'exam',   label: 'Examen'      },
  { id: 'week',   label: 'Esta semana' },
];

export default function FilterChips({ value, onChange }) {
  const refs = useRef([]);
  const onKey = (e, i) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % FILTERS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + FILTERS.length) % FILTERS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = FILTERS.length - 1;
    else return;
    e.preventDefault();
    refs.current[next]?.focus();
    onChange(FILTERS[next].id);
  };
  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="Filtros">
      <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mr-2">Filtros</span>
      {FILTERS.map((f, i) => (
        <button
          key={f.id}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          aria-selected={value === f.id}
          tabIndex={value === f.id ? 0 : -1}
          onClick={() => onChange(f.id)}
          onKeyDown={(e) => onKey(e, i)}
          className={cn(
            'px-3 h-8 rounded-full text-xs font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2',
            value === f.id ? 'bg-forge-blue-soft text-forge-blue' : 'text-neutral-600 hover:bg-neutral-100'
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function tsToMs(ts) {
  if (!ts) return 0;
  if (ts._seconds != null) return ts._seconds * 1000;
  return new Date(ts).getTime();
}

export function applyFilter(items, filter) {
  if (filter === 'all') return items;
  if (filter === 'image') return items.filter((i) => i.sources?.some((s) => s.type === 'image'));
  if (filter === 'audio') return items.filter((i) => i.sources?.some((s) => s.type === 'audio'));
  if (filter === 'text')  return items.filter((i) => i.sources?.some((s) => s.type === 'text'));
  if (filter === 'exam')  return items.filter((i) => i.tags?.some((t) => /examen|examan|test/i.test(t)));
  if (filter === 'week') {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return items.filter((i) => tsToMs(i.createdAt) > weekAgo);
  }
  return items;
}