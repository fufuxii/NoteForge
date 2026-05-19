import { useNavigate } from 'react-router-dom';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import IconButton from '../ui/IconButton';

export default function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.displayName || user?.email || 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try { await logout(); } finally { navigate('/login'); }
  };

  return (
    <div className="p-3 border-t border-neutral-200 flex items-center gap-3">
      <div className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center text-sm font-medium text-neutral-700">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{displayName}</div>
        <div className="text-xs text-neutral-500">Plan Universitario</div>
      </div>
      <IconButton aria-label="Ajustes" disabled><Settings /></IconButton>
      <IconButton aria-label="Cerrar sesión" onClick={handleLogout}><LogOut /></IconButton>
    </div>
  );
}