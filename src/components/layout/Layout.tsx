import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const Layout: React.FC = () => {
  const { estaSuspendido, motivoSuspension, fechaFinSuspension } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Enlace para saltar al contenido principal accesible */}
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      {estaSuspendido && (
        <div
          role="alert"
          className="bg-rose-600 text-white px-4 py-3 text-xs sm:text-sm font-medium shadow-md flex items-center justify-center gap-2 border-b border-rose-700"
        >
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>
            <strong>Cuenta suspendida temporalmente</strong> hasta el{' '}
            {fechaFinSuspension ? new Date(fechaFinSuspension).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'próximo aviso'}.{' '}
            Motivo: {motivoSuspension}. Ciertas funciones como publicar o reclamar objetos están restringidas.
          </span>
        </div>
      )}

      <main id="contenido-principal" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};