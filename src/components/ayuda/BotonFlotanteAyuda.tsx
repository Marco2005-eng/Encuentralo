import React, { useState, useEffect } from 'react';
import { useAyuda } from '@/context/AyudaContext';
import { HelpCircle } from 'lucide-react';

const FAB_STORAGE_KEY = 'encuentralo_fab_aviso_visto_v1';

export const BotonFlotanteAyuda: React.FC = () => {
  const { abrirAyuda } = useAyuda();
  const [esPrimeraVez, setEsPrimeraVez] = useState(false);
  const [hoverOFocus, setHoverOFocus] = useState(false);

  useEffect(() => {
    try {
      const visto = localStorage.getItem(FAB_STORAGE_KEY);
      if (!visto) {
        setEsPrimeraVez(true);
        // Ocultar la etiqueta expandida automáticamente tras 5 segundos
        const timer = setTimeout(() => {
          setEsPrimeraVez(false);
          localStorage.setItem(FAB_STORAGE_KEY, 'true');
        }, 5000);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignorar
    }
  }, []);

  const handleClick = () => {
    if (esPrimeraVez) {
      setEsPrimeraVez(false);
      try {
        localStorage.setItem(FAB_STORAGE_KEY, 'true');
      } catch {
        // ignorar
      }
    }
    abrirAyuda();
  };

  const mostrarTexto = esPrimeraVez || hoverOFocus;

  return (
    <aside
      aria-label="Botón de ayuda rápida"
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3.5 sm:bottom-6 sm:right-6 z-40 print:hidden pointer-events-auto"
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHoverOFocus(true)}
        onMouseLeave={() => setHoverOFocus(false)}
        onFocus={() => setHoverOFocus(true)}
        onBlur={() => setHoverOFocus(false)}
        className={`group relative flex items-center justify-center h-11 sm:h-12 rounded-full bg-brand-700 hover:bg-brand-800 text-white shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-brand-400/80 cursor-pointer min-w-[44px] min-h-[44px] ${
          mostrarTexto ? 'px-3.5 gap-2' : 'w-11 sm:w-12 p-0'
        }`}
        aria-label="Abrir centro de ayuda y preguntas frecuentes"
        title="¿Dudas sobre cómo funciona? Haz clic aquí"
      >
        <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-transform group-hover:scale-110" />

        {/* Etiqueta visible solo en primera visita o en hover/focus */}
        {mostrarTexto && (
          <span className="text-xs font-bold tracking-tight whitespace-nowrap animate-fade-in pr-0.5">
            ¿Dudas o eres nuevo?
          </span>
        )}
      </button>
    </aside>
  );
};
