import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Image as ImageIcon, FileText, X, Loader2, AudioLines } from "lucide-react";
import { forjar, getProfile, getAllUniversidades } from "../lib/api";
import AudioRecorder from "../components/AudioRecorder";
import { useAuth } from "../auth/AuthContext";

export default function NuevoApunte() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [textNote, setTextNote] = useState("");
  const [sending, setSending] = useState(false);  
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [asignaturaId, setAsignaturaId] = useState("");
const [asignaturas, setAsignaturas] = useState([]);

useEffect(() => {
  Promise.all([getProfile(), getAllUniversidades()]).then(([perfil, unis]) => {
    if (!perfil.universidad || !perfil.estudios) return;
    const uni = unis.find((u) => u.nombre === perfil.universidad);
    const estudio = uni?.estudios?.find((e) => e.nombre === perfil.estudios);
    setAsignaturas(estudio?.asignaturas || []);
  });
}, []);

  const addImages = (files) => setImages((prev) => [...prev, ...Array.from(files)]);
  const addAudios = (files) => setAudioFiles((prev) => [...prev, ...Array.from(files)]);
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeAudio = (i) => setAudioFiles((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    const allAudios = [...audioFiles];
    if (recordedAudio) {
      const f = new File([recordedAudio], `grabacion-${Date.now()}.webm`, { type: "audio/webm" });
      allAudios.push(f);
    }
    if (images.length === 0 && allAudios.length === 0 && !textNote.trim()) {
      setError("Sube al menos una imagen, un audio o escribe alguna nota.");
      return;
    }
    setError(null);
    setSending(true); 

    try {
      await forjar({
        images,
        audios: allAudios,
        texts: textNote.trim() ? [textNote.trim()] : [],
        asignaturaId: asignaturaId || null,
      });

      setImages([]);
      setAudioFiles([]);
      setRecordedAudio(null);
      setTextNote("");
      setSending(false);
      setPendingCount((prev) => prev + 1); 

    } catch (e) {
      setError(e.message || "Error al forjar.");
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-10 py-10">
      <h1 className="text-3xl font-bold mb-2">Nuevo apunte</h1>
      <p className="text-neutral-500 mb-8">Sube imágenes, audios, notas...</p>

      <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 mb-4">
        <label className="cursor-pointer">
          <input key={images.length} type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-forge-blue-soft flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-forge-blue" />
            </div>
            <div>
              <p className="font-medium">Subir imágenes</p>
              <p className="text-sm text-neutral-500">PNG, JPG · apuntes manuscritos, pizarras, libros…</p>
            </div>
          </div>
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {images.map((f, i) => (
              <div key={i} className="relative border rounded-lg overflow-hidden bg-neutral-50">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-24 object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-forge-blue-soft flex items-center justify-center">
            <AudioLines className="w-5 h-5 text-forge-blue" />
          </div>
          <div>
            <p className="font-medium">Audio</p>
            <p className="text-sm text-neutral-500">Graba en directo o sube un archivo</p>
          </div>
        </div>

        <AudioRecorder onChange={setRecordedAudio} />

        <label className="cursor-pointer block mt-3">
          <input key={audioFiles.length} type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addAudios(e.target.files)} />
          <div className="text-sm text-neutral-500 hover:text-forge-blue text-center py-2 border-t border-neutral-100">
            o subir archivo de audio (.mp3, .m4a, .wav)
          </div>
        </label>

        {audioFiles.length > 0 && (
          <div className="space-y-2 mt-3">
            {audioFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg text-sm">
                <AudioLines className="w-4 h-4 text-neutral-500" />
                <span className="flex-1 truncate">{f.name}</span>
                <button onClick={() => removeAudio(i)} className="p-1 hover:bg-neutral-200 rounded">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {asignaturas.length > 0 && (
        <div className="border border-neutral-200 rounded-2xl p-6 mb-6">
          <label className="text-sm font-medium text-neutral-700 block mb-2">
            Asignatura (opcional)
          </label>
          <select
            value={asignaturaId}
            onChange={(e) => setAsignaturaId(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-forge-blue bg-white"
          >
            <option value="">Sin asignatura</option>
            {asignaturas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}

      <div className="border border-neutral-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-neutral-500" />
          <span className="font-medium text-sm">Notas adicionales</span>
        </div>
        <textarea
          value={textNote}
          onChange={(e) => setTextNote(e.target.value)}
          placeholder="Cualquier nota extra, página del libro, frases que dijo el profesor…"
          className="w-full text-sm bg-transparent outline-none resize-none min-h-20"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 mb-4 text-sm">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>
            {pendingCount === 1
              ? "1 apunte forjándose en segundo plano."
              : `${pendingCount} apuntes forjándose en segundo plano.`}
            {" "}Los verás en{" "}
            <button
              onClick={() => { setPendingCount(0); navigate("/apuntes"); }}
              className="underline font-medium hover:text-blue-900"
            >
              Mis apuntes
            </button>
            {" "}cuando estén listos.
          </span>
        </div>
      )}

      <button
        onClick={submit}
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {sending ? "Enviando…" : "Forjar apunte"}
      </button>

    </div>
  );
}
