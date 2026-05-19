import Card from '../ui/Card';

function Stat({ label, value, hint }) {
  return (
    <Card>
      <div className="text-xs text-neutral-500 mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{hint}</div>
    </Card>
  );
}

export default function StatsGrid({ items = [] }) {
  const ready = items.filter((i) => i.status === 'ready');
  const withTTS = items.filter((i) => i.ttsPaths && Object.keys(i.ttsPaths).length > 0);
  const totalSources = items.reduce((acc, i) => acc + (i.sources?.length ?? 0), 0);
  const ocrPages = items.reduce((acc, i) => acc + (i.sources?.filter((s) => s.type === 'image').length ?? 0), 0);

  return (
    <section className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Apuntes forjados" value={ready.length} hint={`${items.length} total`} />
      <Stat label="Fuentes procesadas" value={totalSources} hint="imágenes + audios + textos" />
      <Stat label="Audios TTS" value={withTTS.length} hint="es / ca / en" />
      <Stat label="Páginas OCR" value={ocrPages} hint="Cloud Vision" />
    </section>
  );
}