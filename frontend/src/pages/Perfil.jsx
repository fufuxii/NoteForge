import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getProfile, updateProfile } from "../lib/api";
import { User } from "lucide-react";

export default function Perfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ universidad: "", estudios: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => setForm({ universidad: p.universidad || "", estudios: p.estudios || "" }))
      .finally(() => setLoading(false));
  }, []);

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
            <input
              value={form.universidad}
              onChange={(e) => setForm({ ...form, universidad: e.target.value })}
              placeholder="Ej: Universitat Autònoma de Barcelona"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700 block mb-1">Estudios</label>
            <input
              value={form.estudios}
              onChange={(e) => setForm({ ...form, estudios: e.target.value })}
              placeholder="Ej: Ingeniería Informática - Sistemas Multimedia"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue"
            />
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