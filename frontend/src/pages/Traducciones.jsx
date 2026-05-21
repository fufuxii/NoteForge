import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Languages,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { listApuntes, translateApunte } from "../lib/api";

const LANGS = [
  { code: "es", label: "Castellano" },
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
];

function langLabel(code) {
  return LANGS.find((l) => l.code === code)?.label ?? code?.toUpperCase();
}

export default function Traducciones() {
  const [apuntes, setApuntes] = useState([]);
  const [loading, setLoading] = useState(true);

  // { [apunteId]: { target, status: "idle"|"loading"|"done"|"error", result, error } }
  const [translationState, setTranslationState] = useState({});

  useEffect(() => {
    listApuntes()
      .then((r) => setApuntes(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  function setItemState(id, patch) {
    setTranslationState((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }));
  }

  async function handleTranslate(apunte) {
    const state = translationState[apunte.id] || {};
    const target = state.target;
    if (!target || target === (apunte.language || "es")) return;

    setItemState(apunte.id, { status: "loading", result: null, error: null });
    try {
      const translated = await translateApunte(apunte.id, target);
      setItemState(apunte.id, { status: "done", result: translated });
    } catch (e) {
      setItemState(apunte.id, { status: "error", error: e.message });
    }
  }

  if (loading)
    return (
      <div className="text-center py-20 text-neutral-400">Cargando…</div>
    );

  const ready = apuntes.filter((a) => a.status === "ready");

  return (
    <div className="max-w-4xl mx-auto px-10 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Languages className="w-5 h-5 text-forge-blue" />
        <h1 className="text-lg font-semibold">Traducciones</h1>
      </div>
      <p className="text-sm text-neutral-500 mb-8">
        Traduce cualquiera de tus apuntes a otro idioma con Cloud Translation
        API. La traducción es temporal: no modifica el apunte original.
      </p>

      {ready.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">
            No tienes apuntes listos para traducir.
          </p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ready.map((apunte) => {
            const s = translationState[apunte.id] || {};
            const srcLang = apunte.language || "es";
            const availableTargets = LANGS.filter((l) => l.code !== srcLang);

            return (
              <div
                key={apunte.id}
                className="border border-neutral-200 rounded-2xl p-5"
              >
                {/* Top row */}
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
                      Idioma original:{" "}
                      <span className="font-medium">{langLabel(srcLang)}</span>
                    </p>
                  </div>

                  {/* Lang selector + button */}
                  <div className="flex items-center gap-2">
                    <select
                      value={s.target || ""}
                      onChange={(e) =>
                        setItemState(apunte.id, {
                          target: e.target.value,
                          status: "idle",
                          result: null,
                          error: null,
                        })
                      }
                      className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-forge-blue"
                    >
                      <option value="">Seleccionar idioma…</option>
                      {availableTargets.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleTranslate(apunte)}
                      disabled={
                        !s.target || s.status === "loading"
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-forge-blue text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 transition"
                    >
                      {s.status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Traduciendo…
                        </>
                      ) : (
                        <>
                          <Languages className="w-4 h-4" />
                          Traducir
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Result / error */}
                {s.status === "done" && s.result && (
                  <div className="mt-4 border-t border-neutral-100 pt-4">
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Traducción completada a{" "}
                      <span className="font-semibold">
                        {langLabel(s.target)}
                      </span>
                    </div>

                    {/* Preview: title + summary */}
                    <h3 className="font-semibold text-sm mb-1">
                      {s.result.title}
                    </h3>
                    {s.result.summary && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-4">
                        {s.result.summary}
                      </p>
                    )}

                    {/* Sections preview */}
                    {s.result.structure?.sections?.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {s.result.structure.sections.map((sec, i) => (
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

                    <Link
                      to={`/apuntes/${apunte.id}?lang=${s.target}`}
                      className="mt-4 inline-flex items-center gap-1 text-xs text-forge-blue hover:underline"
                    >
                      Ver apunte completo →
                    </Link>
                  </div>
                )}

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

function BlockPreview({ block }) {
  if (block.type === "paragraph")
    return (
      <p className="text-sm text-neutral-600 line-clamp-3">{block.text}</p>
    );
  if (block.type === "bullet_list")
    return (
      <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-0.5">
        {block.items?.slice(0, 3).map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    );
  return null;
}
