import { Sparkles } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const ACTIONS = [
  { label: 'Ampliar' },
  { label: 'Explicar como a niño' },
  { label: 'Crear flashcards' },
  { label: 'Preguntas tipo examen' },
];

export default function SummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="p-5 bg-forge-blue-soft border border-forge-blue-border rounded-2xl mb-8">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-forge-blue flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm leading-relaxed">
            <span className="font-semibold">Resumen IA · </span>{summary}
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {ACTIONS.map((a) => (
              <Tooltip key={a.label} text="Próximamente">
                <button
                  disabled
                  className="px-3 h-7 bg-white rounded-full text-xs font-medium text-forge-blue border border-forge-blue-border opacity-60 cursor-not-allowed"
                >
                  {a.label}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}