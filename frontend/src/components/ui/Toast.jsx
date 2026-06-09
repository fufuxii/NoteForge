// Sistema de notificaciones (toasts) accesible desde cualquier componente vía useToast.
import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const noop = () => {};
const ToastCtx = createContext({ success: noop, error: noop, info: noop });

let _id = 0;

// Icono y colores por tipo de toast.
const META = {
  success: { Icon: CheckCircle2, ring: "border-green-200", icon: "text-green-500" },
  error: { Icon: AlertCircle, ring: "border-red-200", icon: "text-red-500" },
  info: { Icon: Info, ring: "border-neutral-200", icon: "text-forge-blue" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Añade un toast y programa su desaparición automática.
  const push = useCallback((message, type, duration = 3500) => {
    const id = ++_id;
    setToasts((t) => [...t, { id, message, type }]);
    if (duration) setTimeout(() => remove(id), duration);
  }, [remove]);

  const api = {
    success: (m, d) => push(m, "success", d),
    error: (m, d) => push(m, "error", d),
    info: (m, d) => push(m, "info", d),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const { Icon, ring, icon } = META[type] || META.info;
          return (
            <div
              key={id}
              className={`animate-toast-in pointer-events-auto flex items-start gap-3 bg-white border ${ring} shadow-lg rounded-xl px-4 py-3 text-sm`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${icon}`} />
              <span className="flex-1 text-neutral-800">{message}</span>
              <button
                onClick={() => remove(id)}
                className="text-neutral-400 hover:text-neutral-700 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);