import { AudioLines, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import Skeleton from '../components/ui/Skeleton';
import { useApuntes } from '../hooks/useApuntes';
import { detectSubject } from '../lib/subjects';
import { relativeTime } from '../lib/format';

export default function MisAudios() {
  const { items, loading } = useApuntes();
  const ready = items.filter((a) => a.status === 'ready');

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-center gap-2 mb-8">
        <AudioLines className="h-5 w-5 text-neutral-500" />
        <h1 className="text-xl font-semibold">Mis audios</h1>
        <span className="text-sm text-neutral-400">· {ready.length} apuntes</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : ready.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 mb-4">Aún no tienes apuntes con audio disponible.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">Forjar tu primer apunte →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ready.map((a) => {
            const subject = detectSubject(a);
            const langs = Object.keys(a.ttsPaths ?? {});
            return (
              <Link
                key={a.id}
                to={`/audios/${a.id}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue rounded-2xl"
              >
                <Card interactive className="h-full flex flex-col">
                  {subject ? <Pill subject={subject} showDot /> : <Pill>Apunte</Pill>}
                  <h3 className="text-base font-semibold leading-snug line-clamp-2 mt-3">{a.title}</h3>
                  <div className="mt-auto pt-6 flex items-center justify-between text-xs text-neutral-500">
                    <span>{relativeTime(a.createdAt)}</span>
                    {langs.length > 0 && <span>{langs.map((l) => l.toUpperCase()).join(' · ')}</span>}
                  </div>
                  <div className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    <PlayCircle className="w-4 h-4" /> Escuchar
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}