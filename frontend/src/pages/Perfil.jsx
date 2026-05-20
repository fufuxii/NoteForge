import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getProfile, updateProfile, getUniversidades, getEstudios } from "../lib/api";

export default function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ universidad: "", estudios: "" });
  const [universidades, setUniversidades] = useState([]);
  const [estudiosOpciones, setEstudiosOpciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getUniversidades()])
      .then(([p, unis]) => {
        setUniversidades(unis);
        setForm({ universidad: p.universidad || "", estudios: p.estudios || "" });
        if (p.universidad) {
          const uni = unis.find((u) => u.nombre === p.universidad);
          if (uni) setEstudiosOpciones(uni.estudios || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUniversidad = (nombre) => {
    setForm({ universidad: nombre, estudios: "" });
    const uni = universidades.find((u) => u.nombre === nombre);
    setEstudiosOpciones(uni?.estudios || []);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-10 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center font-semibold text-lg">
          {(user?.displayName || user?.email || "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{user?.displayName || user?.email}</p>
          <p className="text-sm text-neutral-500">{user?.email}</p>
        </div>
      </div>

      {loading ? <div className="text-neutral-400">Cargando…</div> : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Universidad</label>
            <select
              value={form.universidad}
              onChange={(e) => handleUniversidad(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue bg-white"
            >
              <option value="">Selecciona tu universidad</option>
              {universidades.map((u) => (
                <option key={u.id} value={u.nombre}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Estudios</label>
            <select
              value={form.estudios}
              onChange={(e) => setForm({ ...form, estudios: e.target.value })}
              disabled={!form.universidad}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue bg-white disabled:opacity-50"
            >
              <option value="">Selecciona tus estudios</option>
              {estudiosOpciones.map((e) => (
                <option key={e.nombre} value={e.nombre}>{e.nombre}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-forge-blue text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}