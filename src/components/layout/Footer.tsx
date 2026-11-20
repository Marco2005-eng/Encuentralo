import React from 'react';
import { Compass, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAyuda } from '@/context/AyudaContext';

const enlaces = [
  { to: '/objetos', label: 'Catálogo de objetos' },
  { to: '/objetos/nuevo?tipo=perdido', label: 'Reportar objeto perdido' },
  { to: '/objetos/nuevo?tipo=encontrado', label: 'Reportar objeto encontrado' },
  { to: '/mis-solicitudes', label: 'Mis solicitudes' },
];

export const Footer: React.FC = () => {
  const { abrirAyuda } = useAyuda();
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="container-app py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.2fr_0.8fr] lg:gap-8">
          <div>
            <Link to="/" className="inline-flex min-h-[44px] items-center gap-3 text-xl font-extrabold tracking-tight text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700"><Compass className="h-5 w-5" aria-hidden="true" /></span>
              Encuéntralo
            </Link>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">Encuentra y recupera lo que perdiste en el campus. Conectamos a estudiantes y personal de forma rápida, segura y transparente.</p>
          </div>
          <nav aria-labelledby="footer-navegacion">
            <h2 id="footer-navegacion" className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Navegación</h2>
            <ul>
              {enlaces.map(({ to, label }) => <li key={to}><Link to={to} className="inline-flex min-h-[44px] md:min-h-8 items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white hover:underline underline-offset-4"><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />{label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Soporte y ayuda</h2>
            <p className="text-sm leading-6 text-slate-300">¿Tienes dudas sobre cómo publicar, acreditar pertenencia o coordinar la entrega?</p>
            <button type="button" onClick={() => abrirAyuda()} className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700">
              <HelpCircle className="h-4 w-4" aria-hidden="true" /> Abrir Centro de Ayuda
            </button>
          </div>
          <nav aria-labelledby="footer-comunidad">
            <h2 id="footer-comunidad" className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Comunidad universitaria</h2>
            <ul>
              <li><Link to="/privacidad" className="inline-flex min-h-[44px] md:min-h-8 items-center text-sm text-slate-300 underline underline-offset-4 hover:text-white">Privacidad</Link></li>
              <li><Link to="/terminos" className="inline-flex min-h-[44px] md:min-h-8 items-center text-sm text-slate-300 underline underline-offset-4 hover:text-white">Términos</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="container-app py-4 text-center text-[13px] leading-relaxed text-slate-300">
          <p>Derechos reservados · Encuéntralo 2026</p>

        </div>
      </div>
    </footer>
  );
};
