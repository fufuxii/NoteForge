import { Link, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';

const TITLES = {
  '/':        'Inicio',
  '/apuntes': 'Mis apuntes',
  '/audios':  'Mis audios',
  '/nuevo':   'Nuevo apunte',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? '';

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <div className="text-sm text-neutral-600">{title}</div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400 px-2 py-0.5 border border-neutral-200 rounded">v0.5.0</span>
        {pathname !== '/nuevo' && (
          <Link to="/nuevo">
            <Button variant="primary" size="sm" leadingIcon={<Plus className="h-4 w-4" />}>
              Nuevo apunte
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}