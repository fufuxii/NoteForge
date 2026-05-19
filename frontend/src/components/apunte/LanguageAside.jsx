import { useEffect, useRef, useState } from 'react';
import { Languages, Volume2, Play, Pause, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import { fetchTTS } from '../../lib/api';

const LANGS = [
  { code: 'es', label: 'ES', name: 'Castellano' },
  { code: 'ca', label: 'CA', name: 'Català' },
  { code: 'en', label: 'EN', name: 'English' },
];

export default function LanguageAside({ apunteId, activeLang, onLangChange, translating, originalLang }) {
  const audioRef = useRef(null);
  const [urls, setUrls] = useState({});
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);

  const audioUrl = urls[activeLang] || null;

  useEffect(() => {
    if (audioRef.current) { audioRef.current.pause(); setPlaying(false); }
  }, [activeLang]);

  const togglePlay = async () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    if (audioUrl) { audioRef.current?.play(); setPlaying(true); return; }
    setGenerating(true);
    try {
      const blob = await fetchTTS(apunteId, activeLang);
      const url = URL.createObjectURL(blob);
      setUrls((prev) => ({ ...prev, [activeLang]: url }));
      setTimeout(() => { audioRef.current?.play(); setPlaying(true); }, 100);
    } catch (e) {
      alert('Error generando audio: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="sticky top-20 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Languages className="w-4 h-4 text-forge-blue" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Idioma</span>
        </div>
        <div className="flex gap-1">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => onLangChange(l.code)}
              disabled={translating}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2 ${
                activeLang === l.code ? 'bg-forge-blue text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {translating && (
          <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Traduciendo con Cloud Translation…
          </p>
        )}
        {activeLang !== originalLang && !translating && (
          <p className="text-xs text-neutral-400 mt-2">Traducido del {originalLang.toUpperCase()}</p>
        )}
      </div>

      <div className="border-t border-neutral-100 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <Volume2 className="w-4 h-4 text-forge-blue" />
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Escucha este apunte</span>
        </div>
        <p className="text-sm text-neutral-700 mb-3">
          Voz · {LANGS.find((l) => l.code === activeLang)?.name} · TTS
        </p>
        <button
          onClick={togglePlay}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-2.5 rounded-lg hover:bg-forge-blue-hover disabled:opacity-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2"
        >
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando audio…</>
            : playing ? <><Pause className="w-4 h-4" /> Pausar</>
            : <><Play className="w-4 h-4" /> Reproducir</>}
        </button>
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} controls className="w-full mt-3" />
        )}
      </div>
    </Card>
  );
}