// Detalle del apunte: contenido estructurado + panel de audio, exportación y visibilidad.
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Sparkles, FileText, Volume2, Loader2, Play, Globe, Lock, Download } from "lucide-react";
import { getApunte, fetchTTS, setVisibility, downloadApunte } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import PublicarApunteModal from "../components/PublicarApunteModal";

// Formatos de exportación disponibles.
const FORMATS = [
  { fmt: "pdf", label: "PDF" },
  { fmt: "docx", label: "Word" },
  { fmt: "txt", label: "TXT" },
];

export default function DetalleApunte() {
  const { id } = useParams();
  const toast = useToast();
  const [original, setOriginal] = useState(null);
  const [displayApunte, setDisplayApunte] = useState(null);
  const [loading, setLoading] = useState(true);

  const [audioUrl, setAudioUrl] = useState(null);
  const [generatingTTS, setGeneratingTTS] = useState(false);
  const audioRef = useRef(null);

  const [isPublic, setIsPublic] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    getApunte(id).then((a) => {
      setOriginal(a);
      setDisplayApunte(a);
      setIsPublic(a.isPublic || false);
    }).catch(() => toast.error("No se pudo cargar el apunte.")).finally(() => setLoading(false));
  }, [id]);

  // Genera y reproduce el audio TTS bajo demanda.
  const handleListen = async () => {
    if (audioUrl) {
      audioRef.current?.play();
      return;
    }
    setGeneratingTTS(true);
    try {
      const blob = await fetchTTS(id, original.language || "es");
      setAudioUrl(URL.createObjectURL(blob));
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e) {
      toast.error("Error generando audio: " + e.message);
    } finally {
      setGeneratingTTS(false);
    }
  };

  // Descarga el apunte en el formato elegido.
  const handleExport = async (fmt, label) => {
    setExporting(fmt);
    try {
      await downloadApunte(id, fmt, original.language || "es", displayApunte.title);
      toast.success(`Descarga ${label} lista.`);
    } catch (e) {
      toast.error("Error al descargar: " + e.message);
    } finally {
      setExporting(null);
    }
  };

  const handleConfirmPublicar = async (asignatura) => {
    try {
      await setVisibility(id, true, asignatura);
      setIsPublic(true);
      toast.success("Apunte publicado.");
    } catch {
      toast.error("No se pudo publicar.");
    } finally {
      setShowModal(false);
    }
  };

  const handlePrivar = async () => {
    try {
      await setVisibility(id, false);
      setIsPublic(false);
      toast.info("Apunte ahora privado.");
    } catch {
      toast.error("No se pudo cambiar la visibilidad.");
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Cargando…</div>;
  if (!displayApunte) return <div className="text-center py-20 text-neutral-400">Apunte no encontrado.</div>;

  const structure = displayApunte.structure || {};

  return (
    <div className="max-w-5xl mx-auto px-10 py-10 grid grid-cols-3 gap-8 animate-fade-in">
      <div className="col-span-2">
        <Link to="/apuntes" className="inline-flex items-center gap-1 text-sm text-neutral-500 mb-6 hover:text-forge-blue">
          <ChevronLeft className="w-4 h-4" /> Mis apuntes
        </Link>

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

          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-forge-blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Escucha este apunte
              </span>
            </div>
            <p className="text-sm text-neutral-700 mb-3">
              Voz · {original.language?.toUpperCase() || "ES"} · TTS
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
                    Generando audio…
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

          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-forge-blue" />
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Descargar
              </span>
            </div>
            <p className="text-sm text-neutral-700 mb-3">
              {original.language?.toUpperCase() || "ES"} · elige formato
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map(({ fmt, label }) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt, label)}
                  disabled={exporting !== null}
                  className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-700 hover:border-forge-blue hover:text-forge-blue disabled:opacity-50 transition"
                >
                  {exporting === fmt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-5">
            <div className="flex items-center gap-2 mb-3">
              {isPublic ? <Globe className="w-4 h-4 text-forge-blue" /> : <Lock className="w-4 h-4 text-neutral-400" />}
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Visibilidad
              </span>
            </div>
            {isPublic ? (
              <button
                onClick={handlePrivar}
                className="w-full flex items-center justify-center gap-2 border border-neutral-200 text-neutral-700 py-2.5 rounded-lg hover:bg-neutral-50 transition text-sm"
              >
                <Lock className="w-4 h-4" /> Hacer privado
              </button>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Globe className="w-4 h-4" /> Publicar
              </button>
            )}
          </div>

        </div>
      </aside>

      {showModal && (
        <PublicarApunteModal
          onConfirm={handleConfirmPublicar}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// Renderiza cada bloque del apunte según su tipo (párrafo, lista, fórmula, cita).
function Block({ block }) {
  if (block.type === "paragraph") return <p className="leading-relaxed">{block.text}</p>;
  if (block.type === "bullet_list") {
    return (
      <ul className="list-disc pl-6 space-y-1">
        {block.items?.map((it, i) => (
          typeof it === "string" ? (
            <li key={i}>{it}</li>
          ) : it.type === "bullet_list" ? (
            <Block key={i} block={it} />
          ) : (
            <li key={i}>{it.text || JSON.stringify(it)}</li>
          )
        ))}
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