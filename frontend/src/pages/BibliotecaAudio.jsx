import { useEffect, useState, useRef } from "react";
import { AudioLines, Play, Pause, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { listApuntes, fetchTTS } from "../lib/api";

export default function BibliotecaAudio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    listApuntes()
      .then((r) => setItems((r.items || []).filter((a) => a.status === "ready")))
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = async (apunte) => {
    if (playingId === apunte.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    if (audioUrls[apunte.id]) {
      audioRef.current?.pause();
      const audio = new Audio(audioUrls[apunte.id]);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setPlayingId(null);
      setPlayingId(apunte.id);
      return;
    }

    setLoadingId(apunte.id);
    try {
      const blob = await fetchTTS(apunte.id, apunte.language || "es");
      const url = URL.createObjectURL(blob);
      setAudioUrls((prev) => ({ ...prev, [apunte.id]: url }));
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setPlayingId(null);
      setPlayingId(apunte.id);
    } catch (e) {
      alert("Error cargando audio: " + e.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-10 py-10">
      <div className="flex items-center gap-2 mb-8">
        <AudioLines className="w-5 h-5 text-neutral-400" />
        <h1 className="text-lg font-semibold">Mis audios</h1>
      </div>

      {loading ? (
        <div className="text-center text-neutral-400 py-20">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center">
          <p className="text-neutral-400 mb-4">Aún no tienes apuntes con audio.</p>
          <Link to="/nuevo" className="text-forge-blue font-medium">
            Forjar tu primer apunte con audio →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((a) => (
            <div
              key={a.id}
              className={`border rounded-2xl p-5 flex flex-col min-h-44 transition ${
                playingId === a.id ? "border-forge-blue bg-forge-blue-soft" : "border-neutral-200"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-forge-blue" />
                {a.tags?.[0] || "Apunte"}
              </div>
              <Link to={`/apuntes/${a.id}`} className="font-semibold leading-tight hover:text-forge-blue flex-1">
                {a.title}
              </Link>
              <button
                onClick={() => handlePlay(a)}
                disabled={loadingId === a.id}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm"
              >
                {loadingId === a.id ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Cargando…</>
                ) : playingId === a.id ? (
                  <><Pause className="w-4 h-4" /> Pausar</>
                ) : (
                  <><Play className="w-4 h-4" /> Escuchar</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}