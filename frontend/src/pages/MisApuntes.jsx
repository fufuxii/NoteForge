import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Trash2, Globe, Lock } from "lucide-react";
import { listApuntes, deleteApunte, setVisibility } from "../lib/api";

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

  const handleDelete = async (e, id) => {
  e.preventDefault(); 
  if (!confirm("¿Eliminar estos apuntes? Esta acción no se puede deshacer.")) return;
  await deleteApunte(id);
  setItems((prev) => prev.filter((a) => a.id !== id));
  };

  const handleVisibility = async (e, item) => {
    e.preventDefault();
    const updated = await setVisibility(item.id, !item.isPublic);
    setItems((prev) => prev.map((a) => a.id === item.id ? { ...a, isPublic: updated.isPublic } : a));
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-400" />
          <h1 className="text-lg font-semibold">Mis apuntes</h1>
        </div>
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-forge-blue" />
                  {a.tags?.[0] || "Apunte"}
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => handleVisibility(e, a)} title={a.isPublic ? "Hacer privado" : "Publicar"}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-forge-blue transition">
                    {a.isPublic ? <Globe className="w-3.5 h-3.5 text-forge-blue" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={(e) => handleDelete(e, a.id)} title="Eliminar"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold leading-tight flex-1">{a.title}</h3>
              <div className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                <BookOpen className="w-4 h-4" /> Leer
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}