import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { getAllUniversidades, getApuntesPublicos } from "../lib/api";

export default function Universidades() {
  const [universidades, setUniversidades] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedEstudio, setSelectedEstudio] = useState(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [apuntes, setApuntes] = useState([]);
  const [loadingApuntes, setLoadingApuntes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUniversidades()
      .then(setUniversidades)
      .finally(() => setLoading(false));
  }, []);

  const handleUni = (uni) => {
    setSelectedUni(uni);
    setSelectedEstudio(null);
    setSelectedAsignatura(null);
    setApuntes([]);
  };

  const handleEstudio = (estudio) => {
    setSelectedEstudio(estudio);
    setSelectedAsignatura(null);
    setApuntes([]);
  };

  const handleAsignatura = async (asignatura) => {
    setSelectedAsignatura(asignatura);
    setLoadingApuntes(true);
    try {
      const data = await getApuntesPublicos(asignatura);
      setApuntes(data.items || []);
    } finally {
      setLoadingApuntes(false);
    }
  };

  if (loading) return <div className="text-center text-neutral-400 py-20">Cargando…</div>;

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Building2 className="w-5 h-5 text-neutral-400" />
        <h1 className="text-lg font-semibold">Universidades</h1>
      </div>

      {(selectedUni || selectedEstudio || selectedAsignatura) && (
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6 flex-wrap">
          <button onClick={() => handleUni(null)} className="hover:text-forge-blue">Universidades</button>
          {selectedUni && <><ChevronRight className="w-3 h-3" /><button onClick={() => handleEstudio(null)} className="hover:text-forge-blue">{selectedUni.nombre}</button></>}
          {selectedEstudio && <><ChevronRight className="w-3 h-3" /><button onClick={() => handleAsignatura(null)} className="hover:text-forge-blue">{selectedEstudio.nombre}</button></>}
          {selectedAsignatura && <><ChevronRight className="w-3 h-3" /><span className="text-neutral-800">{selectedAsignatura}</span></>}
        </div>
      )}

      {!selectedUni && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {universidades.map((u) => (
            <button key={u.id} onClick={() => handleUni(u)}
              className="border border-neutral-200 rounded-2xl p-5 text-left hover:border-forge-blue transition">
              <Building2 className="w-5 h-5 text-forge-blue mb-3" />
              <p className="font-semibold">{u.nombre}</p>
              <p className="text-xs text-neutral-500 mt-1">{u.estudios?.length || 0} estudios</p>
            </button>
          ))}
        </div>
      )}

      {selectedUni && !selectedEstudio && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedUni.estudios?.map((e) => (
            <button key={e.nombre} onClick={() => handleEstudio(e)}
              className="border border-neutral-200 rounded-2xl p-5 text-left hover:border-forge-blue transition">
              <GraduationCap className="w-5 h-5 text-forge-blue mb-3" />
              <p className="font-semibold">{e.nombre}</p>
              <p className="text-xs text-neutral-500 mt-1">{e.asignaturas?.length || 0} asignaturas</p>
            </button>
          ))}
        </div>
      )}

      {selectedEstudio && !selectedAsignatura && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedEstudio.asignaturas?.map((a) => (
            <button key={a} onClick={() => handleAsignatura(a)}
              className="border border-neutral-200 rounded-2xl p-5 text-left hover:border-forge-blue transition">
              <BookOpen className="w-5 h-5 text-forge-blue mb-3" />
              <p className="font-semibold">{a}</p>
            </button>
          ))}
        </div>
      )}

      {selectedAsignatura && (
        <div>
          {loadingApuntes ? (
            <div className="text-center text-neutral-400 py-10">Cargando apuntes…</div>
          ) : apuntes.length === 0 ? (
            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
              No hay apuntes públicos para esta asignatura todavía.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {apuntes.map((a) => (
                <Link key={a.id} to={`/apuntes/${a.id}`}
                  className="border border-neutral-200 rounded-2xl p-5 hover:border-forge-blue transition flex flex-col min-h-44">
                  <div className="text-xs text-neutral-500 mb-2">{a.tags?.[0] || "Apunte"}</div>
                  <h3 className="font-semibold leading-tight flex-1">{a.title}</h3>
                  <div className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    <BookOpen className="w-4 h-4" /> Leer
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}