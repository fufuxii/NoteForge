import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Image, Mic, FileText } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { cn } from '../../lib/cn';

export default function ForjaComposer({ onQuickSubmit, submitting = false }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 0 && !submitting;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onQuickSubmit?.(text.trim());
    setText('');
  };

  return (
    <Card padded={false} className="border-forge-blue-border">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-forge-blue flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Forjar apunte con IA</span>
          <span className="ml-auto text-xs text-neutral-400">Gemini · OCR · S2T</span>
        </div>

        <form onSubmit={submit}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pega una imagen, suelta un audio o escribe lo que quieres aprender…"
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forge-blue placeholder:text-neutral-400 mb-3"
            disabled={submitting}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <Chip icon={Image} label="Subir imagen" onClick={() => navigate('/nuevo')} />
            <Chip icon={Mic} label="Grabar audio" onClick={() => navigate('/nuevo')} />
            <Chip icon={FileText} label="Pegar texto" onClick={() => document.querySelector('input[type="text"]')?.focus()} />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className={cn('ml-auto transition-opacity', canSubmit ? 'opacity-100' : 'opacity-0 pointer-events-none')}
              disabled={!canSubmit}
            >
              {submitting ? 'Forjando…' : 'Forjar'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

function Chip({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-medium border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-blue focus-visible:ring-offset-2"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}