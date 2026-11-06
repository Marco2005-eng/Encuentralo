import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipProps {
  texto: string;
  className?: string;
  posicion?: 'arriba' | 'abajo' | 'izquierda' | 'derecha';
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  texto,
  className = '',
  posicion = 'arriba',
}) => {
  const [visible, setVisible] = useState(false);
  const idTooltip = useRef(`tooltip-${crypto.randomUUID()}`);
  const contenedorRef = useRef<HTMLSpanElement>(null);

  // Cerrar si se hace click fuera
  useEffect(() => {
    if (!visible) return;
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [visible]);

  // Posicionamiento dinámico de clases
  const posicionClases = {
    arriba: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    abajo: 'top-full left-1/2 -translate-x-1/2 mt-2',
    izquierda: 'right-full top-1/2 -translate-y-1/2 mr-2',
    derecha: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[posicion];

  return (
    <span
      ref={contenedorRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="p-1 rounded-full text-slate-400 hover:text-brand-600 focus:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
        aria-describedby={idTooltip.current}
        aria-label="Más información"
      >
        <HelpCircle className="w-4 h-4 shrink-0" />
      </button>

      {visible && (
        <span
          id={idTooltip.current}
          role="tooltip"
          className={`absolute ${posicionClases} z-50 w-64 p-2.5 text-xs font-normal leading-relaxed text-white bg-slate-900 rounded-xl shadow-xl border border-slate-700 pointer-events-none animate-fade-in`}
        >
          {texto}
        </span>
      )}
    </span>
  );
};
