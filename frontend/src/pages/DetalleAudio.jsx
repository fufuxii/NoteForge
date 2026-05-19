import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AudioLines, Play, Pause, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Pill from '../components/ui/Pill';
import { getApunte, fetchTTS } from '../lib/api';
import { detectSubject } from '../lib/subjects';

const LANGS = [
  { code: 'es', label: 'ES', name: 'Castellano' },
  { code: 'ca', label: 'CA', name: 'Català' },
  { code: 'en', label: 'EN', name: 'English' },
];

export default function DetalleAudio() {
  const { id } = useParams();
  const [apunte, setApunte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState('es');
  const [audioUrls, setAudioUrls] = useState({});
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    getApunte(id).then((a) => { setApunte(a); setActiveLang(a.language || 'es'); }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
    }
  }, [activeLang]);

  const audioUrl = audioUrls[activeLang] || null;

  const handlePlay = async () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    if (audioUrl) { audioRef.current?.play(); setPlaying(true); return; }
    setGenerating(true);
    try {
      const blob = await fetchTTS(id, activeLang);
      const url = URL.createObjectURL(blob);
      setAudioUrls((prev) => ({ ...prev, [activeLang]: url }));
      setTimeout(() => { audioRef.current?.play(); setPlaying(true); }, 100);
    } catch (e) {
      alert('Error cargando audio: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Cargando…</div>;
  if (!apunte) return <div className="text-center py-20 text-neutral-400">No encontrado.</div>;

  const subject = detectSubject(apunte);

  return (
    <div className="max-w-2xl mx-auto px-8 py-10">
      <Link to="/audios" className="inline-flex items-center gap-1 text-sm text-neutral-500 mb-8 hover:text-forge-blue">
        <ChevronLeft className="w-4 h-4" /> Mis audios
      </Link>

      <div className="flex items-center gap-2 mb-3">
        {subject && <Pill subject={subject} showDot />}
      </div>

      <h1 className="text-3xl font-bold mb-6">{apunte.title}</h1>

      {apunte.summary && (
        <p className="text-sm text-neutral-700 leading-relaxed mb-8 border-l-2 border-forge-blue pl-4">
          {apunte.summary}
        </p>
      )}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Idioma</p>
        <div className="flex gap-2">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setActiveLang(l.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2 ${
                activeLang === l.code ? 'bg-forge-blue text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col items-center gap-4 py-8">
        <button
          onClick={handlePlay}
          disabled={generating}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="w-16 h-16 rounded-full bg-forge-blue text-white flex items-center justify-center hover:bg-forge-blue-hover disabled:opacity-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2"
        >
          {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>

        <p className="text-sm text-neutral-500">
          {generating ? 'Generando audio…' : playing ? 'Reproduciendo' : `Voz · ${LANGS.find((l) => l.code === activeLang)?.name}`}
        </p>

        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="w-full mt-2" controls />
        )}
      </Card>

      <div className="mt-6 text-center">
        <Link to={`/apuntes/${id}`} className="text-sm text-forge-blue hover:underline">
          <AudioLines className="w-3.5 h-3.5 inline mr-1" /> Ver apunte completo →
        </Link>
      </div>
    </div>
  );
}