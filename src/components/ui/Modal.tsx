import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ abierto, alCerrar, titulo, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape y focus trap básico
  useEffect(() => {
    if (!abierto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        alCerrar();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll
    document.body.style.overflow = 'hidden';

    // Foco en el modal
    modalRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-slate-900">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-brand-500"
            aria-label="Cerrar ventana emergente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};