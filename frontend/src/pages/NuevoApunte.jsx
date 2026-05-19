import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sources from '../components/new-note/Sources';
import ConfigPanel from '../components/new-note/ConfigPanel';
import ConsejoIA from '../components/new-note/ConsejoIA';
import ForgeProgress from '../components/forge/ForgeProgress';
import Button from '../components/ui/Button';
import { forjar } from '../lib/api';

export default function NuevoApunte() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(null);
  const [language, setLanguage] = useState('es');
  const [postForja, setPostForja] = useState({ tts: true, translate: false, formulas: true });

  const [images, setImages] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [text, setText] = useState('');

  const [forging, setForging] = useState(false);
  const [error, setError] = useState(null);

  const counts = {
    images: images.length,
    audios: audioFiles.length + (recordedAudio ? 1 : 0),
    texts:  text.trim() ? 1 : 0,
  };
  const totalSources = counts.images + counts.audios + counts.texts;
  const canSubmit = totalSources > 0 && !forging;

  const addImages = (files) => setImages((prev) => [...prev, ...files]);
  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const addAudios = (files) => setAudioFiles((prev) => [...prev, ...files]);
  const removeAudio = (i) => setAudioFiles((prev) => prev.filter((_, idx) => idx !== i));

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
        texts: text.trim() ? [text.trim()] : [],
        asignaturaId: subject,
      });
      navigate(`/apuntes/${id}`);
    } catch (e) {
      setError(e.message || 'Error al forjar.');
      setForging(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del apunte…"
            className="w-full text-4xl font-bold tracking-tight bg-transparent focus:outline-none placeholder:text-neutral-300 mb-3"
          />
          <p className="text-sm text-neutral-500 mb-8">Borrador · el título lo refinará Gemini si lo dejas vacío</p>

          <Sources
            images={images} addImages={addImages} removeImage={removeImage}
            audioFiles={audioFiles} addAudios={addAudios} removeAudio={removeAudio}
            recordedAudio={recordedAudio} setRecordedAudio={setRecordedAudio}
            text={text} setText={setText}
          />

          <ConsejoIA counts={counts} />

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}
        </div>

        <aside className="space-y-3">
          <ConfigPanel
            subject={subject} setSubject={setSubject}
            language={language} setLanguage={setLanguage}
            postForja={postForja} setPostForja={setPostForja}
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
      </div>

      {forging && <ForgeProgress counts={counts} />}
    </>
  );
}