import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { PanelAccesibilidad } from '@/components/ui/PanelAccesibilidad';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Info, Accessibility } from 'lucide-react';
import { ModalSuspensionAviso } from '@/components/ui/ModalSuspensionAviso';
import { AyudaProvider } from '@/context/AyudaContext';
import { ModalCentroAyuda } from '@/components/ayuda/ModalCentroAyuda';
import { BotonFlotanteAyuda } from '@/components/ayuda/BotonFlotanteAyuda';
import { useAccesibilidad } from '@/context/AccesibilidadContext';
import { PantallaCarga } from '@/routes/guards';

const LayoutContenido: React.FC = () => {
  const { cargando, usuario, estaSuspendido, motivoSuspension, fechaFinSuspension, abrirModalSuspension } = useAuth();
  const { abrirPanel } = useAccesibilidad();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (cargando) return;
    document.querySelector('.app-content')?.scrollTo({ top: 0 });
    const main = document.getElementById('contenido-principal');
    if (!main) return;
    let focused = false;
    const updateHeading = () => {
      const heading = main.querySelector('h1');
      if (!heading?.textContent?.trim()) return;
      document.title = `${heading.textContent.trim()} | Encuéntralo`;
      if (!focused) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
        focused = true;
      }
    };
    document.title = 'Encuéntralo';
    // También espera encabezados de pantallas cuyos datos llegan después.
    const observer = new MutationObserver(updateHeading);
    observer.observe(main, { childList: true, subtree: true, characterData: true });
    updateHeading();
    return () => observer.disconnect();
  }, [pathname, cargando]);

  // Si tras resolver la sesión existe un destino guardado de OAuth, redirigir limpiamente sin pasar por el catálogo
  useEffect(() => {
    if (!cargando && usuario) {
      try {
        const destinoGuardado = sessionStorage.getItem('encuentralo:destino_oauth');
        if (destinoGuardado) {
          sessionStorage.removeItem('encuentralo:destino_oauth');
          if (window.location.pathname !== destinoGuardado) {
            navigate(destinoGuardado, { replace: true });
          }
        }
      } catch {}
    }
  }, [cargando, usuario, navigate]);

  // Mientras la sesión se inicializa, no renderizar catálogo ni páginas para evitar parpadeos
  if (cargando) {
    return <PantallaCarga mensaje="Cargando Encuéntralo..." />;
  }

  return (
    <div className="app-layout min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
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
              {fechaFinSuspension
                ? new Date(fechaFinSuspension).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'próximo aviso'}
              .
              {motivoSuspension && (
                <span className="hidden md:inline">
                  {' '}
                  Motivo: <em className="text-rose-100">{motivoSuspension}</em>.
                </span>
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
      <ModalCentroAyuda />
      <PanelAccesibilidad />
      <div role="group" aria-label="Ayuda y accesibilidad" className="support-dock fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3 print:hidden">
        <button type="button" onClick={abrirPanel} aria-haspopup="dialog" aria-label="Abrir opciones de accesibilidad" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 shadow-md hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
          <Accessibility className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Accesibilidad</span>
        </button>
        <BotonFlotanteAyuda />
      </div>

      <div className="app-content flex flex-1 flex-col min-w-0">
      <main id="contenido-principal" className="flex-1 flex flex-col focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
      </div>
    </div>
  );
};

export const Layout: React.FC = () => {
  return (
    <AyudaProvider>
      <LayoutContenido />
    </AyudaProvider>
  );
};
