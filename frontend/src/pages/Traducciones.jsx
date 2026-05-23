import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Languages, ChevronRight, Loader2, CheckCircle2,
  AlertCircle, Save, BookOpen, Copy,
} from "lucide-react";
import { listApuntes, translateApunte, saveTranslation } from "../lib/api";

const LANGS = [
  { code: "es", label: "Castellano" },
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
];

function langLabel(code) {
  return LANGS.find((l) => l.code === code)?.label ?? code?.toUpperCase();
}

function initItemState() {
  return { target: "", status: "idle", result: null, savedId: null, editTitle: "", saving: false };
}

export default function Traducciones() {
  const [apuntes, setApuntes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ts, setTs]           = useState({});
  const navigate              = useNavigate();

  useEffect(() => {
    listApuntes()
      .then((r) => setApuntes(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  function patch(id, data) {
    setTs((prev) => ({ ...prev, [id]: { ...(prev[id] || initItemState()), ...data } }));
  }

  async function handleTranslate(apunte) {
    const s = ts[apunte.id] || initItemState();
    if (!s.target || s.target === (apunte.language || "es")) return;

    const existing = apuntes.find(
      (a) => a.sourceApunteId === apunte.id && a.language === s.target
    );
    if (existing) {
      if (window.confirm(`Ya tienes una traducción de este apunte a ${langLabel(s.target)}. ¿Quieres verla?`)) {
        navigate(`/apuntes/${existing.id}`);
      }
      return;
    }

    patch(apunte.id, { status: "loading", result: null, savedId: null });
    try {
      const translated = await translateApunte(apunte.id, s.target);
      patch(apunte.id, { status: "preview", result: translated, editTitle: translated.title });
    } catch (e) {
      patch(apunte.id, { status: "error", error: e.message });
    }
  }

  async function handleSave(apunte) {
    const s = ts[apunte.id] || initItemState();
    if (!s.result) return;
    patch(apunte.id, { saving: true });
    try {
      const saved = await saveTranslation(apunte.id, s.target, s.editTitle, s.result);
      patch(apunte.id, { status: "saved", savedId: saved.id, saving: false });
      setApuntes((prev) => [...prev, { ...s.result, id: saved.id, sourceApunteId: apunte.id }]);
    } catch (e) {
      patch(apunte.id, { saving: false, error: e.message });
    }
  }

  if (loading)
    return <div className="text-center py-20 text-neutral-400">Cargando…</div>;

  const ready = apuntes.filter((a) => a.status === "ready" && !a.sourceApunteId);

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Languages className="w-5 h-5 text-forge-blue" />
        <h1 className="text-lg font-semibold">Traducciones</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        Traduce tus apuntes con Cloud Translation API. La traducción se guarda
        como un apunte nuevo que puedes publicar, descargar o compartir igual
        que cualquier otro.
      </p>

      {ready.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">No tienes apuntes listos para traducir.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ready.map((apunte) => {
            const s       = ts[apunte.id] || initItemState();
            const srcLang = apunte.language || "es";
            const available = LANGS.filter((l) => l.code !== srcLang);

            return (
              <div key={apunte.id} className="border border-neutral-200 rounded-2xl p-5">

                {/* Fila superior */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <Link
                      to={`/apuntes/${apunte.id}`}
                      className="font-semibold hover:text-forge-blue flex items-center gap-1 group"
                    >
                      {apunte.title}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Idioma original: <span className="font-medium">{langLabel(srcLang)}</span>
                    </p>
                    <ExistingTranslations apuntes={apuntes} sourceId={apunte.id} />
                  </div>

                  {/* Selector + botón */}
                  <div className="flex items-center gap-2">
                    <select
                      value={s.target}
                      onChange={(e) => patch(apunte.id, {
                        target: e.target.value,
                        status: "idle",
                        result: null,
                        savedId: null,
                      })}
                      disabled={s.status === "loading" || s.status === "saving"}
                      className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-forge-blue"
                    >
                      <option value="">Seleccionar idioma…</option>
                      {available.map((l) => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleTranslate(apunte)}
                      disabled={!s.target || s.status === "loading" || s.status === "preview"}
                      className="flex items-center gap-2 px-4 py-2 bg-forge-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
                    >
                      {s.status === "loading" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Traduciendo…</>
                      ) : (
                        <><Languages className="w-4 h-4" /> Traducir</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Vista previa + guardar */}
                {s.status === "preview" && s.result && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Vista previa — traducido a <span className="font-semibold">{langLabel(s.target)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <input
                          value={s.editTitle}
                          onChange={(e) => patch(apunte.id, { editTitle: e.target.value })}
                          placeholder="Título del apunte traducido…"
                          className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-forge-blue"
                        />
                        <button
                          onClick={() => handleSave(apunte)}
                          disabled={s.saving || !s.editTitle.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-40 transition"
                        >
                          {s.saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando…</>
                          ) : (
                            <><Save className="w-4 h-4" /> Guardar apunte</>
                          )}
                        </button>
                        <button
                          onClick={() => patch(apunte.id, initItemState())}
                          className="text-xs text-neutral-400 hover:text-neutral-600"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm mb-1">{s.result.title}</h3>
                    {s.result.summary && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">
                        {s.result.summary}
                      </p>
                    )}
                    {s.result.structure?.sections?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {s.result.structure.sections.slice(0, 2).map((sec, i) => (
                          <div key={i}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                              {sec.heading}
                            </p>
                            {sec.blocks?.slice(0, 1).map((b, j) => (
                              <BlockPreview key={j} block={b} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Guardado con éxito */}
                {s.status === "saved" && s.savedId && (
                  <div className="mt-4 border-t border-neutral-100 pt-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Apunte guardado en <span className="font-semibold">{langLabel(s.target)}</span>!
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/apuntes/${s.savedId}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-forge-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                      >
                        <BookOpen className="w-4 h-4" /> Ver apunte
                      </Link>
                      <button
                        onClick={() => patch(apunte.id, initItemState())}
                        className="flex items-center gap-1.5 px-4 py-2 border border-neutral-200 text-sm rounded-lg hover:bg-neutral-50 transition"
                      >
                        <Copy className="w-4 h-4" /> Traducir a otro idioma
                      </button>
                    </div>
                  </div>
                )}

                {/* Error */}
                {s.status === "error" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Error: {s.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExistingTranslations({ apuntes, sourceId }) {
  const translations = apuntes.filter((a) => a.sourceApunteId === sourceId);
  if (translations.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
      <span className="text-xs text-neutral-400">Traducido a:</span>
      {translations.map((t) => (
        <Link
          key={t.id}
          to={`/apuntes/${t.id}`}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-neutral-100 hover:bg-forge-blue hover:text-white rounded-full transition"
        >
          {langLabel(t.language)}
        </Link>
      ))}
    </div>
  );
}

function BlockPreview({ block }) {
  if (block.type === "paragraph")
    return <p className="text-sm text-neutral-600 line-clamp-3">{block.text}</p>;
  if (block.type === "bullet_list")
    return (
      <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-0.5">
        {block.items?.slice(0, 3).map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    );
  return null;
}
