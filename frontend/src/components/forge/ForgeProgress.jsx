import { useEffect, useState } from 'react';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const STEPS = [
  { key: 'vision',   title: 'Cloud Vision · OCR de imágenes',     duration: 2500, needs: 'images' },
  { key: 'speech',   title: 'Speech-to-Text · transcribiendo',    duration: 3000, needs: 'audios' },
  { key: 'gemini-1', title: 'Gemini · fusionando fuentes',        duration: 3500 },
  { key: 'gemini-2', title: 'Gemini · generando resumen y tags',  duration: 2000 },
];

function StepRow({ step, status, detail }) {
  return (
    <div
      aria-current={status === 'active' ? 'step' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        status === 'active' ? 'border-forge-blue bg-forge-blue-soft' : 'border-neutral-200 bg-white',
        status === 'pending' && 'opacity-50'
      )}
    >
      <div className={cn(
        'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
        status === 'done'   ? 'bg-forge-blue text-white' :
        status === 'active' ? 'border-2 border-forge-blue text-forge-blue' :
                              'bg-neutral-100 text-neutral-300'
      )}>
        {status === 'done' && <Check className="h-3.5 w-3.5" />}
        {status === 'active' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'pending' && <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{step.title}</div>
        {detail && <div className="text-xs text-neutral-500 font-mono">{detail}</div>}
      </div>
      {status === 'done' && <span className="text-xs text-neutral-400">OK</span>}
      {status === 'pending' && <span className="text-xs text-neutral-400">pendiente</span>}
    </div>
  );
}

export default function ForgeProgress({ counts = {} }) {
  const steps = STEPS.filter((s) => {
    if (s.needs === 'images') return (counts.images ?? 0) > 0;
    if (s.needs === 'audios') return (counts.audios ?? 0) > 0;
    return true;
  });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentIdx >= steps.length) return;
    const t = setTimeout(() => setCurrentIdx((i) => i + 1), steps[currentIdx].duration);
    return () => clearTimeout(t);
  }, [currentIdx, steps]);

  useEffect(() => {
    const total = steps.reduce((s, x) => s + x.duration, 0);
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 100;
      setProgress(Math.min(95, (elapsed / total) * 100));
    }, 100);
    return () => clearInterval(id);
  }, [steps]);

  const subtitle = [
    counts.images && `${counts.images} imagen${counts.images === 1 ? '' : 'es'}`,
    counts.audios && `${counts.audios} audio${counts.audios === 1 ? '' : 's'}`,
    counts.texts  && `${counts.texts} nota${counts.texts === 1 ? '' : 's'} de texto`,
  ].filter(Boolean).join(', ');

  return (
    <div
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-title"
      aria-live="polite"
    >
      <div className="max-w-xl w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-forge-blue flex items-center justify-center mb-4 animate-pulse">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 id="forge-title" className="text-2xl font-bold">Forjando tu apunte…</h2>
          <p className="text-sm text-neutral-500 mt-2">
            Fusionando {subtitle || 'tus fuentes'} en un solo documento.
          </p>
        </div>

        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-forge-blue transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-2">
          {steps.map((step, i) => (
            <StepRow
              key={step.key}
              step={step}
              status={i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending'}
              detail={i === currentIdx ? 'procesando…' : null}
            />
          ))}
        </div>

        <p className="text-xs text-center text-neutral-400 mt-6">
          ETA · ~{Math.max(1, Math.ceil((100 - progress) / 10))}s restantes
        </p>
      </div>
    </div>
  );
}