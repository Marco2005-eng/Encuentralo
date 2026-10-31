import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Info } from 'lucide-react';
import { ModalSuspensionAviso } from '@/components/ui/ModalSuspensionAviso';

export const Layout: React.FC = () => {
  const { estaSuspendido, motivoSuspension, fechaFinSuspension, abrirModalSuspension } = useAuth();

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
          className="bg-rose-600 text-white px-4 py-3 text-xs sm:text-sm font-medium shadow-md flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 border-b border-rose-700 animate-fade-in"
        >
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-200" />
            <span>
              <strong>Cuenta suspendida temporalmente</strong> hasta el{' '}
              {fechaFinSuspension ? new Date(fechaFinSuspension).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }) : 'próximo aviso'}.
              {motivoSuspension && (
                <span className="hidden md:inline"> Motivo: <em className="text-rose-100">{motivoSuspension}</em>.</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={abrirModalSuspension}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white text-rose-700 text-xs font-bold rounded-full hover:bg-rose-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-white shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            Ver por qué está suspendida
          </button>
        </div>
      )}

      <ModalSuspensionAviso />

      <main id="contenido-principal" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};