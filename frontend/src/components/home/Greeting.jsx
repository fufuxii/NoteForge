import { useAuth } from '../../auth/AuthContext';

function partOfDay() {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatToday() {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

export default function Greeting({ apuntesCount = 0, forgingCount = 0 }) {
  const { user } = useAuth();
  const name = (user?.displayName || user?.email || 'estudiante').split(' ')[0];

  return (
    <div className="mb-6">
      <p className="text-sm text-neutral-500 capitalize mb-1">{formatToday()}</p>
      <h1 className="text-4xl font-bold tracking-tight">{partOfDay()}, {name}.</h1>
      <p className="text-neutral-500 mt-2">
        Tienes <span className="font-semibold text-neutral-900">{apuntesCount} apuntes</span> en tu biblioteca
        {forgingCount > 0 && <> · <span className="text-forge-blue">{forgingCount} procesándose</span></>}.
      </p>
    </div>
  );
}