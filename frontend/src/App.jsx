import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MisApuntes from "./pages/MisApuntes";
import NuevoApunte from "./pages/NuevoApunte";
import DetalleApunte from "./pages/DetalleApunte";
import BibliotecaAudio from "./pages/MisAudios";
import DetalleAudio from "./pages/DetalleAudio";
import Perfil from "./pages/Perfil";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/" element={<Home />} />
            <Route path="/apuntes" element={<MisApuntes />} />
            <Route path="/apuntes/:id" element={<DetalleApunte />} />
            <Route path="/nuevo" element={<NuevoApunte />} />
            <Route path="/audios" element={<BibliotecaAudio />} />
            <Route path="/audios/:id" element={<DetalleAudio />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}