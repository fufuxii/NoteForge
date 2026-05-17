import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Sparkles, FileText, Volume2, Loader2, Play, Languages } from "lucide-react";
import { getApunte, fetchTTS, translateApunte } from "../lib/api";

const LANGS = [
  { code: "es", label: "ES", name: "Castellano" },
  { code: "ca", label: "CA", name: "Català" },
  { code: "en", label: "EN", name: "English" },
];

export default function DetalleApunte() {
  const { id } = useParams();
  const [original, setOriginal] = useState(null);
  const [displayApunte, setDisplayApunte] = useState(null);
  const [activeLang, setActiveLang] = useState(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  const [audioUrl, setAudioUrl] = useState(null);
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    getApunte(id).then((a) => {
      setOriginal(a);
      setDisplayApunte(a);
      setActiveLang(a.language || "es");
    }).finally(() => setLoading(false));
  }, [id]);

  const switchLang = async (lang) => {
    if (lang === activeLang) return;

    if (lang === (original.language || "es")) {
      setDisplayApunte(original);
      setActiveLang(lang);
      setAudioUrl(null);
      return;
    }

    setTranslating(true);
    try {
      const translated = await translateApunte(id, lang);
      setDisplayApunte(translated);
      setActiveLang(lang);
      setAudioUrl(null);
    } catch (e) {
      alert("Error traduciendo: " + e.message);
    } finally {
      setTranslating(false);
    }
  };

  const handleListen = async () => {
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }
    setGeneratingTTS(true);
    try {
      const blob = await fetchTTS(id, activeLang);
      setAudioUrl(URL.createObjectURL(blob));
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e) {
      alert("Error generando audio: " + e.message);
    } finally {
      setGeneratingTTS(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Cargando…</div>;
  if (!displayApunte) return <div className="text-center py-20 text-neutral-400">Apunte no encontrado.</div>;

  const structure = displayApunte.structure || {};
  const isTranslated = activeLang !== (original.language || "es");
  const hasCachedAudio = !!(displayApunte?.ttsPaths?.[activeLang]);

  return (
    <div className="max-w-5xl mx-auto px-10 py-10 grid grid-cols-3 gap-8">
      <div className="col-span-2">
        <Link to="/apuntes" className="inline-flex items-center gap-1 text-sm text-neutral-500 mb-6 hover:text-forge-blue">
          <ChevronLeft className="w-4 h-4" /> Mis apuntes
        </Link>

        {isTranslated && (
          <div className="mb-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 bg-forge-blue-soft text-forge-blue rounded-full">
            <Languages className="w-3 h-3" />
            Traducido del {(original.language || "es").toUpperCase()} con Cloud Translation
          </div>
        )}

        <div className="flex gap-2 mb-4 flex-wrap">
          {displayApunte.tags?.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 bg-neutral-100 rounded-full text-neutral-600">{t}</span>
          ))}
        </div>

        <h1 className="text-4xl font-bold mb-6">{displayApunte.title}</h1>

        {displayApunte.summary && (
          <div className="bg-forge-blue-soft border border-forge-blue/20 rounded-2xl p-5 mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-forge-blue" />
              <span className="font-semibold text-sm text-forge-blue">Resumen IA</span>
            </div>
            <p className="text-sm leading-relaxed">{displayApunte.summary}</p>
          </div>
        )}

        {structure.sections?.map((sec, i) => (
          <section key={i} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">{i + 1} · {sec.heading}</h2>
            <div className="space-y-3">
              {sec.blocks?.map((b, j) => <Block key={j} block={b} />)}
            </div>
          </section>
        ))}

        <div className="mt-12 pt-6 border-t border-neutral-100 text-xs text-neutral-400 flex items-center gap-2">
          <FileText className="w-3 h-3" />
          {original.sources?.length} {original.sources?.length === 1 ? "fuente" : "fuentes"} ·
          forjado {original.forgedAt ? new Date(original.forgedAt).toLocaleString("es-ES") : ""}
        </div>
      </div>

      <aside className="col-span-1 space-y-4">
        <div className="border border-neutral-200 rounded-2xl p-5 sticky top-10 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Languages className="w-4 h-4 text-forge-blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Idioma</span>
            </div>
            <div className="flex gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLang(l.code)}
                  disabled={translating}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${
                    activeLang === l.code
                      ? "bg-forge-blue text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {translating && (
              <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Traduciendo…
              </p>
            )}
          </div>

          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-forge-blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Escucha este apunte
              </span>
            </div>
            <p className="text-sm text-neutral-700 mb-3">
              Voz · {LANGS.find((l) => l.code === activeLang)?.name} · TTS
            </p>

            {!audioUrl ? (
              <button
                onClick={handleListen}
                disabled={generatingTTS}
                className="w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {generatingTTS ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {hasCachedAudio ? "Cargando audio…" : "Generando audio…"}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Reproducir
                  </>
                )}
              </button>
            ) : (
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            )}

          </div>
        </div>
      </aside>
    </div>
  );
}

function Block({ block }) {
  if (block.type === "paragraph") return <p className="leading-relaxed">{block.text}</p>;
  if (block.type === "bullet_list") {
    return (
      <ul className="list-disc pl-6 space-y-1">
        {block.items?.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    );
  }
  if (block.type === "formula") {
    return <pre className="bg-neutral-50 px-3 py-2 rounded text-sm font-mono overflow-x-auto">{block.latex}</pre>;
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-2 border-forge-blue pl-4 italic text-neutral-600">
        "{block.text}"
        {block.source && <span className="block text-xs not-italic text-neutral-400 mt-1">— {block.source}</span>}
      </blockquote>
    );
  }
  return null;
}