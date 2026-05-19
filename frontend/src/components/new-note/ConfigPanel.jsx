import Card from '../ui/Card';
import Toggle from '../ui/Toggle';
import { SUBJECTS } from '../../lib/subjects';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm gap-3">
      <span className="text-neutral-500">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  );
}

export default function ConfigPanel({ subject, setSubject, language, setLanguage, postForja, setPostForja }) {
  return (
    <div className="space-y-3">
      <Card>
        <h3 className="text-sm font-semibold mb-3">Configuración</h3>

        <Row label="Asignatura">
          <select
            value={subject ?? ''}
            onChange={(e) => setSubject(e.target.value || null)}
            className="text-sm bg-transparent text-right focus:outline-none cursor-pointer"
          >
            <option value="">— Ninguna —</option>
            {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Row>

        <Row label="Idioma salida">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-transparent text-right focus:outline-none cursor-pointer"
          >
            <option value="es">Castellano</option>
            <option value="ca">Català</option>
            <option value="en">English</option>
          </select>
        </Row>

        <Row label="Modelo"><span className="text-sm">Gemini 2.5 Flash</span></Row>
        <Row label="OCR"><span className="text-sm">Cloud Vision</span></Row>
        <Row label="Transcripción"><span className="text-sm">Speech-to-Text</span></Row>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold mb-3">Acciones post-forja</h3>
        <Row label="Generar audio (TTS)">
          <Toggle checked={postForja.tts} onChange={(v) => setPostForja({ ...postForja, tts: v })} label="Generar audio" />
        </Row>
        <Row label="Traducir al inglés">
          <Toggle checked={postForja.translate} onChange={(v) => setPostForja({ ...postForja, translate: v })} label="Traducir" />
        </Row>
        <Row label="Detectar fórmulas">
          <Toggle checked={postForja.formulas} onChange={(v) => setPostForja({ ...postForja, formulas: v })} label="Detectar fórmulas" />
        </Row>
      </Card>
    </div>
  );
}