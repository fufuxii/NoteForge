import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Mic, FileText, FileSearch } from 'lucide-react';
import { searchApuntes } from '../../lib/api';
import { detectSubject } from '../../lib/subjects';
import Pill from '../ui/Pill';

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => { if (!open) { setQ(''); setResults([]); } }, [open]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      searchApuntes(q).then((d) => setResults(d.items ?? [])).catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const go = (path) => { onClose(); navigate(path); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
        <Command label="Búsqueda y acciones" className="bg-white rounded-2xl shadow-[var(--shadow-popover)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
            <Search className="h-4 w-4 text-neutral-400" />
            <Command.Input
              value={q}
              onValueChange={setQ}
              autoFocus
              placeholder="Busca apuntes o ejecuta acciones…"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-neutral-400"
            />
            <kbd className="text-xs text-neutral-400 px-1.5 py-0.5 border border-neutral-200 rounded">esc</kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2">
            <Command.Empty className="px-4 py-6 text-center text-sm text-neutral-400">
              {q ? 'Sin resultados.' : 'Empieza a escribir…'}
            </Command.Empty>

            <Command.Group heading="Acciones" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
              <CmdItem icon={Plus} label="Nuevo apunte desde imagen" kbd="⌘I" onSelect={() => go('/nuevo')} />
              <CmdItem icon={Mic} label="Grabar audio ahora" kbd="⌘R" onSelect={() => go('/nuevo')} />
              <CmdItem icon={FileText} label="Pegar texto y forjar" kbd="⌘V" onSelect={() => go('/nuevo')} />
            </Command.Group>

            {results.length > 0 && (
              <Command.Group heading="Apuntes coincidentes" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                {results.map((a) => {
                  const subject = detectSubject(a);
                  return (
                    <Command.Item
                      key={a.id}
                      value={a.title}
                      onSelect={() => go(`/apuntes/${a.id}`)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-neutral-100"
                    >
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{a.title}</div>
                        <div className="text-xs text-neutral-400">{(a.sources?.length ?? 0)} fuentes</div>
                      </div>
                      {subject && <Pill subject={subject} />}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

            {q && (
              <Command.Group heading="Preguntar a NoteForge" className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                <CmdItem icon={FileSearch} label={`Preguntar a la IA: "${q}"`} disabled />
              </Command.Group>
            )}
          </Command.List>

          <div className="px-4 py-2 border-t border-neutral-100 text-xs text-neutral-400 flex items-center justify-between">
            <span>↑↓ navegar · ↵ abrir</span>
            <span>NoteForge · ⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function CmdItem({ icon: Icon, label, kbd, onSelect, disabled }) {
  return (
    <Command.Item
      onSelect={disabled ? undefined : onSelect}
      disabled={disabled}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${disabled ? 'opacity-50' : 'cursor-pointer aria-selected:bg-neutral-100'}`}
    >
      <Icon className="h-4 w-4 text-neutral-400" />
      <span className="flex-1 text-sm">{label}</span>
      {kbd && <kbd className="text-xs text-neutral-400 px-1.5 py-0.5 border border-neutral-200 rounded">{kbd}</kbd>}
    </Command.Item>
  );
}