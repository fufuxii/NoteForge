import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sources from '../components/new-note/Sources';
import ConfigPanel from '../components/new-note/ConfigPanel';
import ConsejoIA from '../components/new-note/ConsejoIA';
import ForgeProgress from '../components/forge/ForgeProgress';
import Button from '../components/ui/Button';
import { forjar } from '../lib/api';
import { notify } from '../lib/toast';
import { useDraft } from '../hooks/useDraft';
import { useDropzone } from '../hooks/useDropzone';
import { cn } from '../lib/cn';

export default function NuevoApunte() {
  const navigate = useNavigate();
  const [draft, setDraft, clearDraft] = useDraft('noteforge:new-note', {
    title: '', subject: null, language: 'es', text: '',
    postForja: { tts: true, translate: false, formulas: true },
  });
  const [images, setImages] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [forging, setForging] = useState(false);
  const [error, setError] = useState(null);

  const set = (patch) => setDraft({ ...draft, ...patch });

  const counts = {
    images: images.length,
    audios: audioFiles.length + (recordedAudio ? 1 : 0),
    texts:  draft.text.trim() ? 1 : 0,
  };
  const totalSources = counts.images + counts.audios + counts.texts;
  const canSubmit = totalSources > 0 && !forging;

  const addImages = (files) => setImages((prev) => [...prev, ...files]);
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const addAudios = (files) => setAudioFiles((prev) => [...prev, ...files]);
  const removeAudio = (i) => setAudioFiles((prev) => prev.filter((_, idx) => idx !== i));

  const { isOver, bind } = useDropzone({
    onFiles: (files) => {
      const imgs = files.filter((f) => f.type.startsWith('image/'));
      const auds = files.filter((f) => f.type.startsWith('audio/'));
      if (imgs.length) addImages(imgs);
      if (auds.length) addAudios(auds);
      if (imgs.length === 0 && auds.length === 0) notify.error('Solo imágenes o audios');
    },
  });

  const submit = async () => {
    if (!canSubmit) return;
    const allAudios = [...audioFiles];
    if (recordedAudio) {
      const f = new File([recordedAudio], `grabacion-${Date.now()}.webm`, { type: 'audio/webm' });
      allAudios.push(f);
    }
    setError(null);
    setForging(true);
    try {
      const { id } = await forjar({
        images,
        audios: allAudios,
        texts: draft.text.trim() ? [draft.text.trim()] : [],
        asignaturaId: draft.subject,
      });
      clearDraft();
      notify.success('Apunte forjado');
      navigate(`/apuntes/${id}`);
    } catch (e) {
      setError(e.message || 'Error al forjar.');
      setForging(false);
    }
  };

  return (
    <>
      <div {...bind} className={cn('max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 relative', isOver && 'after:absolute after:inset-0 after:rounded-2xl after:border-2 after:border-dashed after:border-forge-blue after:bg-forge-blue/5 after:pointer-events-none')}>
        <div>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="Título del apunte…"
            className="w-full text-4xl font-bold tracking-tight bg-transparent focus:outline-none placeholder:text-neutral-300 mb-3"
          />
          <p className="text-sm text-neutral-500 mb-8">Borrador · guardado automáticamente</p>

          <Sources
            images={images} addImages={addImages} removeImage={removeImage}
            audioFiles={audioFiles} addAudios={addAudios} removeAudio={removeAudio}
            recordedAudio={recordedAudio} setRecordedAudio={setRecordedAudio}
            text={draft.text} setText={(text) => set({ text })}
          />

          <ConsejoIA counts={counts} />

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}
        </div>

        <aside className="space-y-3">
          <ConfigPanel
            subject={draft.subject} setSubject={(subject) => set({ subject })}
            language={draft.language} setLanguage={(language) => set({ language })}
            postForja={draft.postForja} setPostForja={(postForja) => set({ postForja })}
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={submit}
            disabled={!canSubmit}
            leadingIcon={<Sparkles className="h-4 w-4" />}
          >
            Forjar apunte
          </Button>
          <p className="text-xs text-center text-neutral-400">
            {totalSources === 0 ? 'Añade al menos una fuente' : `${totalSources} fuente${totalSources === 1 ? '' : 's'} · Gemini + Cloud Vision`}
          </p>
        </aside>

        {isOver && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
            <div className="bg-forge-blue text-white px-6 py-3 rounded-full font-medium shadow-lg">
              Suelta tus archivos para añadirlos
            </div>
          </div>
        )}
      </div>

      {forging && <ForgeProgress counts={counts} />}
    </>
  );
}