import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sparkles, Image, Mic, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { listApuntes } from "../lib/api";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Home() {
  const { user } = useAuth();
  const [apuntes, setApuntes] = useState([]);

  useEffect(() => {
    listApuntes()
      .then((r) => setApuntes(r.items || []))
      .catch(() => setApuntes([]));
  }, []);

  const firstName = (user?.displayName || user?.email || "").split(" ")[0];
  const recientes = apuntes.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-10 py-10">
      <p className="text-sm text-neutral-500">
        {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="text-4xl font-bold mt-1">{greeting()}, {firstName}.</h1>
      <p className="text-neutral-500 mt-2">
        Tienes <span className="font-semibold text-neutral-800">{apuntes.length} apuntes</span> en tu biblioteca.
      </p>

      <Link
        to="/nuevo"
        className="mt-8 block border border-neutral-200 rounded-2xl p-5 hover:border-forge-blue transition"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-forge-blue flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">Forjar apunte con IA</span>
          <span className="ml-auto text-xs text-neutral-400">Gemini · OCR · S2T</span>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 text-sm text-neutral-400">
          Pega una imagen, suelta un audio o escribe lo que quieres aprender…
        </div>
        <div className="flex gap-2 mt-3">
          <span className="flex items-center gap-1 text-xs px-3 py-1.5 border rounded-full">
            <Image className="w-3 h-3" /> Subir imagen
          </span>
          <span className="flex items-center gap-1 text-xs px-3 py-1.5 border rounded-full">
            <Mic className="w-3 h-3" /> Grabar audio
          </span>
          <span className="flex items-center gap-1 text-xs px-3 py-1.5 border rounded-full">
            <FileText className="w-3 h-3" /> Pegar texto
          </span>
        </div>
      </Link>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recientes</h2>
          <Link to="/apuntes" className="text-sm text-neutral-500 flex items-center gap-1 hover:text-forge-blue">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recientes.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
            Aún no has forjado ningún apunte. Pulsa “Forjar apunte con IA” arriba para empezar.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {recientes.map((a) => (
              <Link key={a.id} to={`/apuntes/${a.id}`} className="border rounded-2xl p-5 hover:border-forge-blue transition">
                <div className="text-xs text-neutral-500 mb-2">{a.tags?.[0] || "Apunte"}</div>
                <h3 className="font-semibold leading-tight">{a.title}</h3>
                <p className="text-xs text-neutral-400 mt-4">
                  {a.status === "ready" ? "Listo" : "Forjando…"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}