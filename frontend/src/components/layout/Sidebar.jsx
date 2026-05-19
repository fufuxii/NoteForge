import { NavLink } from 'react-router-dom';
import { Sparkles, FileText, Plus, AudioLines, Languages, Trash2, Search } from 'lucide-react';
import { SUBJECTS, getTone } from '../../lib/subjects';
import { cn } from '../../lib/cn';
import UserCard from './UserCard';

const NAV_PRIMARY = [
  { to: '/',         label: 'Inicio',           icon: Sparkles, end: true },
  { to: '/nuevo',    label: 'Nuevo apunte',     icon: Plus },
  { to: '/apuntes',  label: 'Mis apuntes',      icon: FileText },
  { to: '/audios',   label: 'Mis audios',       icon: AudioLines },
  { to: '/traducciones', label: 'Traducciones', icon: Languages, disabled: true },
  { to: '/papelera', label: 'Papelera',         icon: Trash2,    disabled: true },
];

function NavItem({ item, counts }) {
  const Icon = item.icon;
  const badge = counts?.[item.to];
  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 cursor-not-allowed select-none">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{item.label}</span>
      </div>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2',
        isActive ? 'bg-forge-blue-soft text-forge-blue font-medium' : 'text-neutral-700 hover:bg-neutral-100'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {badge != null && <span className="text-xs text-neutral-400">{badge}</span>}
    </NavLink>
  );
}

export default function Sidebar({ counts = {}, subjectCounts = {}, onOpenCmdK }) {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 bg-white flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <img src="/logo.png" alt="" className="h-7 w-auto" />
        <span className="font-bold text-lg">NoteForge</span>
        <button
          onClick={onOpenCmdK}
          aria-label="Abrir buscador (Cmd+K)"
          className="ml-auto text-xs text-neutral-400 px-1.5 py-0.5 border border-neutral-200 rounded hover:bg-neutral-50"
        >
          ⌘K
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={onOpenCmdK}
          className="w-full h-9 pl-9 pr-3 bg-neutral-100 rounded-lg text-sm text-left text-neutral-500 relative hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          Buscar en apuntes…
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" aria-label="Navegación principal">
        {NAV_PRIMARY.map((item) => <NavItem key={item.to} item={item} counts={counts} />)}

        <div className="pt-6 pb-2 px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Asignaturas
        </div>
        {SUBJECTS.map((s) => {
          const tone = getTone(s.tone);
          const n = subjectCounts[s.id] ?? 0;
          return (
            <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 text-sm cursor-pointer">
              <span className={cn('h-2 w-2 rounded-full', tone.dot)} aria-hidden="true" />
              <span className="text-neutral-700 truncate flex-1">{s.name}</span>
              {n > 0 && <span className="text-xs text-neutral-400">{n}</span>}
            </div>
          );
        })}
      </nav>

      <UserCard />
    </aside>
  );
}