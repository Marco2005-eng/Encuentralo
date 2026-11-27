import React, { useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  anchoMax?: string;
}

export const Modal: React.FC<ModalProps> = ({
  abierto,
  alCerrar,
  titulo,
  children,
  anchoMax = 'max-w-lg',
}) => {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);
  const alCerrarRef = useRef(alCerrar);
  alCerrarRef.current = alCerrar;

  // Cerrar con Escape y focus trap básico
  useEffect(() => {
    if (!abierto) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const elements = Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex="0"]') || []).filter(el => el.getClientRects().length > 0);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (!first) { e.preventDefault(); modalRef.current?.focus(); }
        else if (e.shiftKey && (document.activeElement === first || document.activeElement === modalRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && (document.activeElement === last || document.activeElement === modalRef.current)) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'Escape') {
        alCerrarRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Bloquear scroll
    document.body.style.overflow = 'hidden';

    // Foco en el modal al abrirse solo si el foco no está ya dentro de sus elementos
    if (!modalRef.current?.contains(document.activeElement)) {
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-scale-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${anchoMax} max-h-[92dvh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden focus:outline-none flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0">
          <h2 id={titleId} className="text-base sm:text-lg font-bold text-slate-900 truncate pr-2">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-brand-500 shrink-0"
            aria-label="Cerrar ventana emergente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
};