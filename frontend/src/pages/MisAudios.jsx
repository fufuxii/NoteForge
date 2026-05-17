import { useEffect, useState } from "react";
import { AudioLines, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { listApuntes } from "../lib/api";

export default function MisAudios() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listApuntes()
      .then((r) => setItems((r.items || []).filter((a) => a.status === "ready")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center gap-2 mb-8">
        <AudioLines className="w-5 h-5 text-neutral-400" />
        <h1 className="text-lg font-semibold">Mis audios</h1>
        <span className="text-sm text-neutral-400">· {items.length} apuntes</span>
      </div>

      {loading ? (
        <div className="text-center text-neutral-400 py-20">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">Aún no tienes apuntes con audio.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a) => (
            <Link
              key={a.id}
              to={`/audios/${a.id}`}
              className="border border-neutral-200 rounded-2xl p-5 flex flex-col min-h-44 hover:border-forge-blue transition"
            >
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forge-blue" />
                {a.tags?.[0] || "Apunte"}
              </div>
              <h3 className="font-semibold leading-tight flex-1">{a.title}</h3>
              <div className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                <PlayCircle className="w-4 h-4" /> Escuchar
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}