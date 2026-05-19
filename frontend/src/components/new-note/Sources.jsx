import { useRef } from 'react';
import { Image, FileText, AudioLines, X } from 'lucide-react';
import AudioRecorder from '../AudioRecorder';
import IconButton from '../ui/IconButton';

function SourceHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-8 w-8 rounded-lg bg-forge-blue-soft flex items-center justify-center">
        <Icon className="h-4 w-4 text-forge-blue" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-neutral-400">{subtitle}</div>
      </div>
      {badge}
    </div>
  );
}

export default function Sources({ images, addImages, removeImage, audioFiles, addAudios, removeAudio, recordedAudio, setRecordedAudio, text, setText }) {
  const imgInputRef = useRef(null);
  const audInputRef = useRef(null);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-3">
      {/* Imágenes */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4">
        <SourceHeader
          icon={Image}
          title="Imágenes"
          subtitle={images.length === 0 ? 'PNG, JPG · pizarras, apuntes, libros…' : `${images.length} imagen${images.length === 1 ? '' : 'es'} listas para OCR`}
        />
        <input
          ref={imgInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addImages(Array.from(e.target.files ?? []))}
        />
        <div className="grid grid-cols-4 gap-2">
          {images.map((f, i) => (
            <div key={i} className="relative aspect-[3/4] bg-neutral-50 rounded-lg overflow-hidden group">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label={`Eliminar imagen ${i + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => imgInputRef.current?.click()}
            className="aspect-[3/4] border-2 border-dashed border-neutral-200 rounded-lg flex items-center justify-center text-neutral-400 hover:border-forge-blue hover:text-forge-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2"
            aria-label="Añadir imágenes"
          >
            +
          </button>
        </div>
      </div>

      {/* Audio */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4">
        <SourceHeader
          icon={AudioLines}
          title="Audio"
          subtitle="Graba en directo o sube un archivo"
        />
        <AudioRecorder onChange={setRecordedAudio} />
        <input
          ref={audInputRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={(e) => addAudios(Array.from(e.target.files ?? []))}
        />
        <button
          onClick={() => audInputRef.current?.click()}
          className="block w-full text-sm text-neutral-500 hover:text-forge-blue text-center py-2 mt-3 border-t border-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2 rounded"
        >
          o subir archivo de audio (.mp3, .m4a, .wav, .webm)
        </button>
        {audioFiles.length > 0 && (
          <div className="space-y-2 mt-3">
            {audioFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg text-sm">
                <AudioLines className="w-4 h-4 text-neutral-500" />
                <span className="flex-1 truncate">{f.name}</span>
                <IconButton aria-label="Eliminar audio" size="sm" onClick={() => removeAudio(i)}>
                  <X />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4">
        <SourceHeader
          icon={FileText}
          title="Mis notas adicionales"
          subtitle={`${words} palabra${words === 1 ? '' : 's'}`}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cualquier nota extra, página del libro, frases que dijo el profesor…"
          rows={3}
          className="w-full text-sm bg-neutral-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forge-blue resize-y placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}