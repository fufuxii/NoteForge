import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Image as ImageIcon, FileText, X, Loader2, AudioLines } from "lucide-react";
import { forjar } from "../lib/api";
import AudioRecorder from "../components/AudioRecorder";

export default function NuevoApunte() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [textNote, setTextNote] = useState("");
  const [forging, setForging] = useState(false);
  const [error, setError] = useState(null);

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
    setForging(true);
    try {
      const { id } = await forjar({
        images,
        audios: allAudios,
        texts: textNote.trim() ? [textNote.trim()] : [],
      });
      navigate(`/apuntes/${id}`);
    } catch (e) {
      setError(e.message || "Error al forjar.");
      setForging(false);
    }
  };

  const totalSources =
    images.length + audioFiles.length + (recordedAudio ? 1 : 0) + (textNote.trim() ? 1 : 0);

  if (forging) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-forge-blue mx-auto flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Forjando tu apunte…</h2>
          <p className="text-neutral-500 mb-8">
            Fusionando {totalSources} {totalSources === 1 ? "fuente" : "fuentes"} en un solo documento.
          </p>
          <div className="space-y-3 text-left">
            {images.length > 0 && <Step done label={`Cloud Vision · OCR de ${images.length} imagen(es)`} />}
            {(audioFiles.length > 0 || recordedAudio) && <Step done label="Speech-to-Text · transcribiendo audio" />}
            <Step current label="Gemini · fusionando fuentes" detail="identificando estructura jerárquica…" />
            <Step pending label="Generando resumen y tags" />
          </div>
          <p className="text-xs text-neutral-400 mt-8">ETA · ~10-20s restantes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-10 py-10">
      <h1 className="text-3xl font-bold mb-2">Nuevo apunte</h1>
      <p className="text-neutral-500 mb-8">
        Sube imágenes, audios, notas ...
      </p>

      <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 mb-4">
        <label className="cursor-pointer">
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addImages(e.target.files)} />
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
          <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addAudios(e.target.files)} />
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

      <button
        onClick={submit}
        className="w-full flex items-center justify-center gap-2 bg-forge-blue text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
      >
        <Sparkles className="w-4 h-4" /> Forjar apunte
      </button>
    </div>
  );
}

function Step({ done, current, pending, label, detail }) {
  const bg = done ? "bg-forge-blue text-white" : current ? "bg-forge-blue-soft text-forge-blue border-2 border-forge-blue" : "bg-neutral-100 text-neutral-400";
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${current ? "bg-forge-blue-soft" : ""}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${bg}`}>
        {done ? "✓" : current ? <Loader2 className="w-3 h-3 animate-spin" /> : "·"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${pending ? "text-neutral-400" : "font-medium"}`}>{label}</p>
        {detail && <p className="text-xs text-neutral-500 font-mono">{detail}</p>}
      </div>
    </div>
  );
}