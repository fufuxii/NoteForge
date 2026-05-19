import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '../components/apunte/Breadcrumbs';
import SummaryCard from '../components/apunte/SummaryCard';
import SectionRenderer from '../components/apunte/SectionRenderer';
import LanguageAside from '../components/apunte/LanguageAside';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import Skeleton from '../components/ui/Skeleton';
import Tooltip from '../components/ui/Tooltip';
import { detectSubject } from '../lib/subjects';
import { relativeTime } from '../lib/format';
import { getApunte, translateApunte } from '../lib/api';

export default function DetalleApunte() {
  const { id } = useParams();
  const [original, setOriginal] = useState(null);
  const [display, setDisplay] = useState(null);
  const [activeLang, setActiveLang] = useState('es');
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    getApunte(id).then((a) => {
      setOriginal(a);
      setDisplay(a);
      setActiveLang(a.language || 'es');
    }).finally(() => setLoading(false));
  }, [id]);

  const switchLang = async (lang) => {
    if (lang === activeLang) return;
    const originalLang = original.language || 'es';
    if (lang === originalLang) {
      setDisplay(original);
      setActiveLang(lang);
      return;
    }
    setTranslating(true);
    try {
      const translated = await translateApunte(id, lang);
      setDisplay(translated);
      setActiveLang(lang);
    } catch (e) {
      alert('Error traduciendo: ' + e.message);
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <Skeleton className="h-6 w-64 mb-4" />
          <Skeleton className="h-12 w-2/3 mb-6" />
          <Skeleton className="h-32 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!display) return <div className="text-center py-20 text-neutral-400">Apunte no encontrado.</div>;

  const subject = detectSubject(original);
  const structure = display.structure || {};
  const originalLang = original.language || 'es';

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
      <article>
        <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
          <Breadcrumbs items={[
            { label: 'Mis apuntes', to: '/apuntes' },
            ...(subject ? [{ label: subject.name }] : []),
            { label: display.title },
          ]} />
          <div className="flex items-center gap-2">
            <Tooltip text="Próximamente"><Button size="sm" disabled>Exportar</Button></Tooltip>
            <Tooltip text="Próximamente"><Button size="sm" variant="primary" disabled>Compartir</Button></Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {subject && <Pill subject={subject} showDot />}
          {display.tags?.map((t) => <Pill key={t}>{t}</Pill>)}
          <span className="ml-auto text-xs text-neutral-400">
            forjado {relativeTime(original.forgedAt ?? original.createdAt)} · {original.sources?.length ?? 0} fuente{original.sources?.length === 1 ? '' : 's'}
          </span>
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-8">{display.title}</h1>

        <SummaryCard summary={display.summary || structure.summary} />

        {structure.sections?.map((sec, i) => <SectionRenderer key={i} section={sec} index={i} />)}

        {(!structure.sections || structure.sections.length === 0) && (
          <p className="text-neutral-500 italic">El apunte no tiene secciones aún. Estado: {original.status}.</p>
        )}
      </article>

      <LanguageAside
        apunteId={id}
        activeLang={activeLang}
        originalLang={originalLang}
        translating={translating}
        onLangChange={switchLang}
      />
    </div>
  );
}