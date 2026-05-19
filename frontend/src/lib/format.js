const RTF = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });

export function relativeTime(input) {
  if (!input) return '';
  const ms = input?._seconds != null ? input._seconds * 1000 : new Date(input).getTime();
  const diffSec = Math.round((ms - Date.now()) / 1000);
  const units = [
    ['year',   60 * 60 * 24 * 365],
    ['month',  60 * 60 * 24 * 30],
    ['week',   60 * 60 * 24 * 7],
    ['day',    60 * 60 * 24],
    ['hour',   60 * 60],
    ['minute', 60],
    ['second', 1],
  ];
  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSec) >= secondsInUnit || unit === 'second') {
      return RTF.format(Math.round(diffSec / secondsInUnit), unit);
    }
  }
  return '';
}

export function formatDuration(totalSeconds) {
  if (totalSeconds == null) return '';
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function formatCount(count, singular, plural) {
  return count === 1 ? `1 ${singular}` : `${count.toLocaleString('es-ES')} ${plural}`;
}