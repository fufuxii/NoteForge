import { Sparkles } from 'lucide-react';

export default function ConsejoIA({ counts }) {
  const total = (counts.images ?? 0) + (counts.audios ?? 0) + (counts.texts ?? 0);
  if (total === 0) return null;
  let msg = `Procesaremos ${total} fuente${total === 1 ? '' : 's'} y las fusionaremos en un único apunte.`;
  if (counts.images && counts.audios) {
    msg = 'Hemos detectado imágenes y audio. Vamos a hacer OCR, transcribir el audio y fusionarlo todo con Gemini.';
  } else if (counts.images > 0) {
    msg = `Hemos detectado ${counts.images} imagen${counts.images === 1 ? '' : 'es'}. La estructura propuesta es esquema con epígrafes.`;
  } else if (counts.audios > 0) {
    msg = `Vamos a transcribir el audio con Speech-to-Text y organizarlo en secciones.`;
  }
  return (
    <div className="mt-4 p-4 bg-forge-blue-soft border border-forge-blue-border rounded-2xl flex items-start gap-3">
      <Sparkles className="h-4 w-4 text-forge-blue mt-0.5 shrink-0" />
      <div className="text-sm">
        <span className="font-semibold text-forge-blue">Consejo IA · </span>
        <span className="text-neutral-700">{msg}</span>
      </div>
    </div>
  );
}