import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

export default function AudioRecorder({ onChange }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    onChange?.(blob);
  }, [blob]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const b = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(b);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      alert("No se pudo acceder al micrófono: " + e.message);
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const reset = () => {
    setBlob(null);
    setSeconds(0);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (blob) {
    return (
      <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
        <Mic className="w-4 h-4 text-forge-blue" />
        <span className="text-sm flex-1">Audio grabado · {fmt(seconds)}</span>
        <audio src={URL.createObjectURL(blob)} controls className="h-8" />
        <button onClick={reset} className="p-2 hover:bg-neutral-200 rounded" title="Eliminar">
          <Trash2 className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    );
  }

  if (recording) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-sm flex-1 font-mono">REC · {fmt(seconds)}</span>
        <button
          onClick={stop}
          className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600"
        >
          <Square className="w-3 h-3" /> Detener
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={start}
      type="button"
      className="w-full flex items-center gap-3 p-3 border border-dashed border-neutral-300 rounded-lg hover:border-forge-blue hover:bg-forge-blue-soft transition"
    >
      <Mic className="w-4 h-4 text-neutral-500" />
      <span className="text-sm text-neutral-600">Grabar audio en directo</span>
    </button>
  );
}