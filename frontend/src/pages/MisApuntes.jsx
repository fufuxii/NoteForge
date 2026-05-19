import { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import FilterChips, { applyFilter } from '../components/library/FilterChips';
import SortMenu, { applySort } from '../components/library/SortMenu';
import ViewToggle from '../components/library/ViewToggle';
import ApunteCard from '../components/library/ApunteCard';
import Skeleton from '../components/ui/Skeleton';
import { useApuntes } from '../hooks/useApuntes';
import { deleteApunte, setVisibility } from '../lib/api';

export default function MisApuntes() {
  const { items, loading, refresh } = useApuntes();
  const [filter, setFilter] = useState('all');
  const [sort, setSort]     = useState('recent');
  const [view, setView]     = useState('grid');

  const visible = useMemo(() => {
    return applySort(applyFilter(items, filter), sort);
  }, [items, filter, sort]);

  const handleDelete = async (a) => {
    if (!confirm('¿Eliminar este apunte? Esta acción no se puede deshacer.')) return;
    await deleteApunte(a.id);
    refresh();
  };

  const handleToggleVisibility = async (a) => {
    await setVisibility(a.id, !a.isPublic);
    refresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-neutral-500" />
          <h1 className="text-xl font-semibold">Mis apuntes</h1>
          <span className="text-sm text-neutral-400">· {items.length} documentos</span>
        </div>
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-cmdk'))}
          className="h-9 w-72 pl-9 pr-12 bg-white border border-neutral-200 rounded-lg text-sm text-left text-neutral-500 relative hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          Buscar en apuntes…
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">⌘K</kbd>
        </button>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <FilterChips value={filter} onChange={setFilter} />
        <div className="flex items-center gap-2">
          <SortMenu value={sort} onChange={setSort} />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p className="mb-2">No hay apuntes que coincidan.</p>
          <p className="text-sm">Prueba a cambiar los filtros.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((a) => (
            <ApunteCard
              key={a.id}
              apunte={a}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-2xl bg-white">
          {visible.map((a) => (
            <a key={a.id} href={`/apuntes/${a.id}`} className="px-4 py-3 flex items-center gap-4 hover:bg-neutral-50">
              <span className="font-medium flex-1 truncate">{a.title}</span>
              <span className="text-xs text-neutral-400">{(a.sources?.length ?? 0)} fuentes</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}