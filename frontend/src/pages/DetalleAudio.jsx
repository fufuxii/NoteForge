import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, AudioLines, Play, Pause, Loader2 } from "lucide-react";
import { getApunte, fetchTTS } from "../lib/api";

const LANGS = [
  { code: "es", label: "ES", name: "Castellano" },
  { code: "ca", label: "CA", name: "Català" },
  { code: "en", label: "EN", name: "English" },
];

export default function DetalleAudio() {
  const { id } = useParams();
  const [apunte, setApunte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState("es");
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const [generando, setGenerando] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    getApunte(id)
      .then((a) => {
        setApunte(a);
        setActiveLang(a.language || "es");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      setAudioUrl(audioUrls[activeLang] || null);
    }
  }, [activeLang]);

  const handleLang = (lang) => {
    if (lang === activeLang) return;
    setActiveLang(lang);
  };

  const handlePlay = async () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (audioUrl) {
      audioRef.current?.play();
      setPlaying(true);
      return;
    }

    setGenerando(true);
    try {
      const blob = await fetchTTS(id, activeLang);
      const url = URL.createObjectURL(blob);
      setAudioUrls((prev) => ({ ...prev, [activeLang]: url }));
      setAudioUrl(url);
      setTimeout(() => {
        audioRef.current?.play();
        setPlaying(true);
      }, 100);
    } catch (e) {
      alert("Error cargando audio: " + e.message);
    } finally {
      setGenerando(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Cargando…</div>;
  if (!apunte) return <div className="text-center py-20 text-neutral-400">No encontrado.</div>;

  return (
    <div className="max-w-2xl mx-auto px-10 py-10">
      <Link to="/audios" className="inline-flex items-center gap-1 text-sm text-neutral-500 mb-8 hover:text-forge-blue">
        <ChevronLeft className="w-4 h-4" /> Mis audios
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <AudioLines className="w-5 h-5 text-forge-blue" />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Audio del apunte</span>
      </div>

      <h1 className="text-3xl font-bold mb-6">{apunte.title}</h1>

      {apunte.summary && (
        <p className="text-sm text-neutral-600 leading-relaxed mb-8 border-l-2 border-forge-blue pl-4">
          {apunte.summary}
        </p>
      )}

      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Idioma</p>
        <div className="flex gap-2">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLang(l.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeLang === l.code
                  ? "bg-forge-blue text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-neutral-200 rounded-2xl p-6 flex flex-col items-center gap-4">
        <button
          onClick={handlePlay}
          disabled={generando}
          className="w-16 h-16 rounded-full bg-forge-blue text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {generando ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : playing ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </button>

        <p className="text-sm text-neutral-500">
          {generando ? "Generando audio…" : playing ? "Reproduciendo" : "Pulsa para escuchar"}
        </p>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setPlaying(false)}
            className="w-full mt-2"
            controls
          />
        )}

      </div>

      <div className="mt-6 text-center">
        <Link to={`/apuntes/${id}`} className="text-sm text-forge-blue hover:underline">
          Ver apunte completo →
        </Link>
      </div>
    </div>
  );
}