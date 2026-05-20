import { useEffect, useState } from "react";
import { X, Globe } from "lucide-react";
import { getProfile } from "../lib/api";
import { getAllUniversidades } from "../lib/api";

export default function PublicarApunteModal({ onConfirm, onClose }) {
  const [asignaturas, setAsignaturas] = useState([]);
  const [asignatura, setAsignatura] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getAllUniversidades()])
      .then(([profile, unis]) => {
        const uni = unis.find((u) => u.nombre === profile.universidad);
        const estudio = uni?.estudios?.find((e) => e.nombre === profile.estudios);
        setAsignaturas(estudio?.asignaturas || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-forge-blue" />
            <h2 className="font-semibold">Publicar apunte</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {loading ? (
          <div className="text-neutral-400 text-sm py-4 text-center">Cargando…</div>
        ) : asignaturas.length === 0 ? (
          <p className="text-sm text-neutral-500 mb-4">
            No tienes asignaturas configuradas. Ve a tu perfil y selecciona universidad y estudios primero.
          </p>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-3">Selecciona la asignatura de este apunte:</p>
            <select
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue bg-white mb-4"
            >
              <option value="">Selecciona una asignatura</option>
              {asignaturas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              onClick={() => onConfirm(asignatura)}
              disabled={!asignatura}
              className="w-full bg-forge-blue text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Publicar
            </button>
          </>
        )}
      </div>
    </div>
  );
}