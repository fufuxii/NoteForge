// TODO: replace with backend /asignaturas endpoint when available.
export const SUBJECTS = [
  { id: 'bio-molecular',     name: 'Biología molecular',  tone: 'blue'  },
  { id: 'sistemes-mm',       name: 'Sistemes multimèdia', tone: 'amber' },
  { id: 'calculo-2',         name: 'Cálculo II',          tone: 'red'   },
  { id: 'filosofia-moderna', name: 'Filosofía moderna',   tone: 'green' },
];

export const TONES = {
  blue:    { pill: 'bg-blue-50 text-blue-700',        dot: 'bg-blue-500',    ring: 'ring-blue-200'    },
  amber:   { pill: 'bg-amber-50 text-amber-800',      dot: 'bg-amber-500',   ring: 'ring-amber-200'   },
  red:     { pill: 'bg-red-50 text-red-700',          dot: 'bg-red-500',     ring: 'ring-red-200'     },
  green:   { pill: 'bg-green-50 text-green-700',      dot: 'bg-green-500',   ring: 'ring-green-200'   },
  neutral: { pill: 'bg-neutral-100 text-neutral-700', dot: 'bg-neutral-400', ring: 'ring-neutral-200' },
};

export function getSubject(id) {
  return SUBJECTS.find((s) => s.id === id) ?? null;
}

export function getTone(toneName) {
  return TONES[toneName] ?? TONES.neutral;
}

export function detectSubject(apunte) {
  if (!apunte) return null;
  if (apunte.asignaturaId) {
    const direct = getSubject(apunte.asignaturaId);
    if (direct) return direct;
  }
  const tagsLower = (apunte.tags ?? []).map((t) => String(t).toLowerCase());
  for (const s of SUBJECTS) {
    const n = s.name.toLowerCase();
    if (tagsLower.some((t) => t === n || n.includes(t) || t.includes(n))) return s;
  }
  return null;
}