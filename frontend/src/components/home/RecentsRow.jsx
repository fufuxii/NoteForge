import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Pill from '../ui/Pill';
import Skeleton from '../ui/Skeleton';
import { detectSubject } from '../../lib/subjects';
import { relativeTime } from '../../lib/format';

export default function RecentsRow({ items = [], loading }) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Recientes</h2>
        <Link to="/apuntes" className="text-sm text-neutral-500 hover:text-forge-blue">Ver todos →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          : items.slice(0, 3).map((a) => {
            const subject = detectSubject(a);
            return (
              <Link key={a.id} to={`/apuntes/${a.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue rounded-2xl">
                <Card interactive className="h-full">
                  {subject ? <Pill subject={subject} showDot /> : <Pill>Apunte</Pill>}
                  <h3 className="text-base font-semibold mt-3 leading-snug line-clamp-2">{a.title}</h3>
                  <div className="mt-4 text-xs text-neutral-500 flex items-center justify-between">
                    <span>{(a.sources?.length ?? 0)} fuente{a.sources?.length === 1 ? '' : 's'}</span>
                    <span>{relativeTime(a.createdAt)}</span>
                  </div>
                  {a.status === 'forging' && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-xs text-forge-blue mb-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-forge-blue animate-pulse" />
                        Forjando con Gemini…
                      </div>
                      <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-forge-blue w-1/2 animate-pulse" />
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
      </div>
    </section>
  );
}