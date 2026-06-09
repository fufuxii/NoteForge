// Listado de apuntes propios con acciones de borrar y publicar.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, BookOpen, Trash2, Globe, Lock } from "lucide-react";
import { listApuntes, deleteApunte, setVisibility } from "../lib/api";
import { useToast } from "../components/ui/Toast";
import PublicarApunteModal from "../components/PublicarApunteModal";

export default function MisApuntes() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    listApuntes()
      .then((r) => setItems(r.items || []))
      .catch(() => toast.error("No se pudieron cargar los apuntes."))
      .finally(() => setLoading(false));
  }, []);

  // Borrado optimista: quita el apunte de la lista y revierte si falla.
  const handleDelete = async (e, item) => {
    e.preventDefault();
    if (!confirm("¿Eliminar este apunte? Esta acción no se puede deshacer.")) return;
    const prev = items;
    setItems((list) => list.filter((a) => a.id !== item.id));
    try {
      await deleteApunte(item.id);
      toast.success(`"${item.title}" eliminado.`);
    } catch {
      setItems(prev);
      toast.error("No se pudo eliminar el apunte.");
    }
  };

  // Si es privado abre el modal de publicar; si es público lo hace privado.
  const handleVisibility = async (e, item) => {
    e.preventDefault();
    if (!item.isPublic) {
      setModalItem(item);
      return;
    }
    setBusyId(item.id);
    try {
      const updated = await setVisibility(item.id, false);
      setItems((list) => list.map((a) => (a.id === item.id ? { ...a, isPublic: updated.isPublic } : a)));
      toast.info("Apunte ahora privado.");
    } catch {
      toast.error("No se pudo cambiar la visibilidad.");
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmPublicar = async (asignatura) => {
    try {
      const updated = await setVisibility(modalItem.id, true, asignatura);
      setItems((list) =>
        list.map((a) =>
          a.id === modalItem.id ? { ...a, isPublic: updated.isPublic, asignatura: updated.asignatura } : a
        )
      );
      toast.success("Apunte publicado.");
    } catch {
      toast.error("No se pudo publicar el apunte.");
    } finally {
      setModalItem(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-neutral-400" />
          <h1 className="text-lg font-semibold">Mis apuntes</h1>
          {!loading && <span className="text-sm text-neutral-400">· {items.length}</span>}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="animate-fade-in border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">No tienes apuntes todavía.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a, i) => (
            <Link
              key={a.id}
              to={`/apuntes/${a.id}`}
              style={{ animationDelay: `${Math.min(i, 12) * 40}ms` }}
              className="animate-fade-in border border-neutral-200 rounded-2xl p-5 hover:border-forge-blue hover:shadow-md hover:-translate-y-0.5 transition flex flex-col min-h-44"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-forge-blue" />
                  {a.tags?.[0] || "Apunte"}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleVisibility(e, a)}
                    disabled={busyId === a.id}
                    title={a.isPublic ? "Hacer privado" : "Publicar"}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-forge-blue disabled:opacity-50 transition"
                  >
                    {a.isPublic ? <Globe className="w-3.5 h-3.5 text-forge-blue" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, a)}
                    title="Eliminar"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition"
                  >
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

      {modalItem && (
        <PublicarApunteModal
          onConfirm={handleConfirmPublicar}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
}