import React from 'react';
import { Compass, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAyuda } from '@/context/AyudaContext';

export const Footer: React.FC = () => {
  const { abrirAyuda, abrirTerminos } = useAyuda();

  return (
    <footer className="mt-auto border-t border-slate-800/90 bg-slate-950 text-slate-400">
      {/* Contenido principal en columnas limpias */}
      <div className="container-app py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Columna 1: Marca y Propósito para el usuario */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-black text-xl text-white tracking-tight">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <span>Encuéntralo</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Encuentra y recupera lo que perdiste en el campus. Conectamos a estudiantes y personal de forma rápida, segura y transparente.
            </p>
          </div>

          {/* Columna 2: Navegación rápida */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/objetos" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Catálogo de objetos
                </Link>
              </li>
              <li>
                <Link to="/objetos/nuevo?tipo=perdido" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Reportar objeto perdido
                </Link>
              </li>
              <li>
                <Link to="/objetos/nuevo?tipo=encontrado" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Reportar objeto encontrado
                </Link>
              </li>
              <li>
                <Link to="/mis-solicitudes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Mis solicitudes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Centro de Ayuda */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Soporte y Ayuda
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ¿Tienes dudas sobre cómo publicar, acreditar pertenencia o coordinar la entrega?
            </p>
            <div>
              <button
                type="button"
                onClick={() => abrirAyuda()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-all duration-150 border border-slate-800 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
              >
                <HelpCircle className="w-4 h-4 text-brand-400" />
                Abrir Centro de Ayuda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de cierre / Copyright */}
      <div className="border-t border-slate-900 bg-black/40 py-5 text-xs text-slate-500">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Encuéntralo — Proyecto académico de{' '}
            <strong className="text-slate-400">Interacción Humano-Computador (IHC)</strong>.
          </p>
          <div className="flex items-center gap-3">
            <span>Comunidad universitaria</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => abrirTerminos()}
              className="text-slate-400 hover:text-white transition-colors underline focus:outline-none"
            >
              Privacidad y Términos
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
