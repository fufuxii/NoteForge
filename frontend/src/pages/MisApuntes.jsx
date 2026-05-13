import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { listApuntes } from "../lib/api";

function relativeTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "hace " + Math.round(diff) + "s";
  if (diff < 3600) return "hace " + Math.round(diff / 60) + "m";
  if (diff < 86400) return "hace " + Math.round(diff / 3600) + "h";
  return "hace " + Math.round(diff / 86400) + "d";
}

export default function MisApuntes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listApuntes()
      .then((r) => setItems(r.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-400" />
          <h1 className="text-lg font-semibold">Mis apuntes</h1>
          <span className="text-sm text-neutral-400">· {items.length} documentos</span>
        </div>
        <Link
          to="/nuevo"
          className="flex items-center gap-2 bg-forge-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-neutral-400 py-20">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">No tienes apuntes todavía.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a) => (
            <Link
              key={a.id}
              to={`/apuntes/${a.id}`}
              className="border border-neutral-200 rounded-2xl p-5 hover:border-forge-blue transition flex flex-col min-h-44"
            >
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forge-blue" />
                {a.tags?.[0] || "Apunte"}
              </div>
              <h3 className="font-semibold leading-tight">{a.title}</h3>
              <div className="mt-auto text-xs text-neutral-400 pt-4">
                {(a.sources?.length || 0)} {a.sources?.length === 1 ? "fuente" : "fuentes"} · {relativeTime(a.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}