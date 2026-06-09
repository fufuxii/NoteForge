// Pantalla de inicio de sesión con Google.
import { Sparkles } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { loginGoogle } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-forge-blue flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">NoteForge</h1>
      </div>
      <p className="text-neutral-500 mb-12">
        Forja tus apuntes con IA · imagen · audio · texto
      </p>

      <button
        onClick={loginGoogle}
        className="flex items-center gap-3 px-6 py-3 border border-neutral-300 rounded-xl hover:bg-neutral-50 transition shadow-sm"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt=""
          className="w-5 h-5"
        />
        <span className="font-medium">Continuar con Google</span>
      </button>

      <p className="text-xs text-neutral-400 mt-12">
        Universitat Autònoma de Barcelona · Sistemes Multimèdia 2025/2026
      </p>
    </div>
  );
}