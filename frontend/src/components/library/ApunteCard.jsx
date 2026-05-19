import { Link } from 'react-router-dom';
import { Trash2, Globe, Lock } from 'lucide-react';
import Card from '../ui/Card';
import Pill from '../ui/Pill';
import IconButton from '../ui/IconButton';
import { detectSubject } from '../../lib/subjects';
import { relativeTime } from '../../lib/format';

function sourcesSummary(sources = []) {
  const counts = sources.reduce((acc, s) => { acc[s.type] = (acc[s.type] ?? 0) + 1; return acc; }, {});
  const parts = [];
  if (counts.image) parts.push(`${counts.image} pág`);
  if (counts.audio) parts.push('audio');
  if (counts.text)  parts.push('texto');
  return parts.join(' · ') || '—';
}

export default function ApunteCard({ apunte, onDelete, onToggleVisibility }) {
  const subject = detectSubject(apunte);
  return (
    <Link
      to={`/apuntes/${apunte.id}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue rounded-2xl"
    >
      <Card interactive className="h-full">
        <div className="flex items-start justify-between gap-2 mb-3">
          {subject ? <Pill subject={subject} showDot /> : <Pill>Apunte</Pill>}
          <div className="flex gap-0.5">
            <IconButton
              aria-label={apunte.isPublic ? 'Hacer privado' : 'Publicar'}
              size="sm"
              onClick={(e) => { e.preventDefault(); onToggleVisibility?.(apunte); }}
            >
              {apunte.isPublic ? <Globe className="text-forge-blue" /> : <Lock />}
            </IconButton>
            <IconButton
              aria-label="Eliminar"
              size="sm"
              onClick={(e) => { e.preventDefault(); onDelete?.(apunte); }}
              className="hover:!text-red-600 hover:!bg-red-50"
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
        <h3 className="text-base font-semibold leading-snug line-clamp-2 mb-6">{apunte.title}</h3>
        <div className="text-xs text-neutral-500 space-y-1">
          <div>{sourcesSummary(apunte.sources)}</div>
          <div className="flex items-center justify-between">
            <span>{relativeTime(apunte.createdAt)}</span>
            {apunte.status === 'forging' && (
              <span className="inline-flex items-center gap-1 text-forge-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-forge-blue animate-pulse" />
                Forjando
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}