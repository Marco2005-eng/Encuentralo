import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastTipo = 'exito' | 'error' | 'info';

interface Toast {
  id: string;
  mensaje: string;
  tipo: ToastTipo;
}

interface ToastContextType {
  mostrarToast: (mensaje: string, tipo?: ToastTipo) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const mostrarToast = useCallback((mensaje: string, tipo: ToastTipo = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const cerrarToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const config = {
            exito: {
              bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            },
            error: {
              bg: 'bg-rose-50 border-rose-300 text-rose-900',
              icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            },
            info: {
              bg: 'bg-blue-50 border-blue-300 text-blue-900',
              icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
            },
          }[t.tipo];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all animate-fade-up ${config.bg}`}
              role="status"
            >
              {config.icon}
              <p className="text-sm font-medium flex-1">{t.mensaje}</p>
              <button
                type="button"
                onClick={() => cerrarToast(t.id)}
                className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
}