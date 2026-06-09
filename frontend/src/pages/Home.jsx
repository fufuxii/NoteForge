// Inicio: saludo según la hora y los apuntes más recientes.
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { listApuntes } from "../lib/api";

// Devuelve el saludo según la franja horaria.
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Home() {
  const { user } = useAuth();
  const [apuntes, setApuntes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listApuntes()
      .then((r) => setApuntes(r.items || []))
      .catch(() => setApuntes([]))
      .finally(() => setLoading(false));
  }, []);

  const firstName = (user?.displayName || user?.email || "").split(" ")[0];
  // Solo los tres apuntes más recientes para el resumen.
  const recientes = apuntes.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-10 py-10 animate-fade-in">
      <h1 className="text-4xl font-bold mt-1">{greeting()}, {firstName}.</h1>
      <p className="text-neutral-500 mt-2">
        {loading ? (
          "Cargando tu biblioteca…"
        ) : (
          <>Tienes <span className="font-semibold text-neutral-800">{apuntes.length} apuntes</span> en tu biblioteca.</>
        )}
      </p>

      <Link
        to="/nuevo"
        className="mt-8 inline-flex items-center gap-2 bg-forge-blue text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 hover:-translate-y-0.5 transition"
      >
        <Plus className="w-4 h-4" />
        Forjar apunte
      </Link>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recientes</h2>
          <Link to="/apuntes" className="text-sm text-neutral-500 flex items-center gap-1 hover:text-forge-blue">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : recientes.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
            Aún no has forjado ningún apunte. Pulsa “Forjar apunte” para empezar.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {recientes.map((a, i) => {
              const ready = a.status === "ready";
              return (
                <Link
                  key={a.id}
                  to={`/apuntes/${a.id}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="animate-fade-in border rounded-2xl p-5 hover:border-forge-blue hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="text-xs text-neutral-500 mb-2">{a.tags?.[0] || "Apunte"}</div>
                  <h3 className="font-semibold leading-tight">{a.title}</h3>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs mt-4 px-2 py-0.5 rounded-full ${
                      ready ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
                    {ready ? "Listo" : "Forjando…"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}