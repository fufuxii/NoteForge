import { cn } from '../../lib/cn';
import { getSubject, getTone } from '../../lib/subjects';

export default function Pill({ children, tone = 'neutral', subjectId, subject, showDot = false, className, ...props }) {
  const subj = subject ?? (subjectId ? getSubject(subjectId) : null);
  const styles = getTone(subj?.tone ?? tone);
  const label = children ?? subj?.name;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles.pill, className
      )}
      {...props}
    >
      {(showDot || subj) && (
        <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}