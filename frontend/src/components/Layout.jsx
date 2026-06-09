// Layout con barra lateral de navegación y pie de perfil/cierre de sesión.
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, FileText, Plus, AudioLines, Languages, LogOut, Building2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

// Entradas del menú lateral.
const navItems = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/nuevo", label: "Nuevo apunte", icon: Plus },
  { to: "/apuntes", label: "Mis apuntes", icon: FileText },
  { to: "/audios", label: "Mis audios", icon: AudioLines },
  { to: "/universidades", label: "Universidades", icon: Building2 },
  { to: "/traducciones", label: "Traducciones", icon: Languages },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-64 border-r border-neutral-200 flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2">
          <img src="/logo.png" alt="NoteForge" className="h-8 w-auto" />
          <span className="font-bold text-lg">NoteForge</span>
        </div>

        <nav className="px-2 flex-1 mt-2">
          {navItems.map(({ to, label, icon: Icon, end, disabled }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition ${
                  disabled
                    ? "text-neutral-300 cursor-not-allowed"
                    : isActive
                    ? "bg-forge-blue-soft text-forge-blue font-medium"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`
              }
              onClick={(e) => disabled && e.preventDefault()}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Link to="/perfil" className="border-t border-neutral-200 p-3 flex items-center gap-3 hover:bg-neutral-50 transition">
          <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center font-semibold text-sm">
            {(user?.displayName || user?.email || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
            <p className="text-xs text-neutral-500">Plan Universitario</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); logout().then(() => navigate("/login")); }}
            className="p-2 hover:bg-neutral-100 rounded-lg"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4 text-neutral-500" />
          </button>
        </Link>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}