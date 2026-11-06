import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Compass } from 'lucide-react';

/**
 * Loader accesible a pantalla completa con role="status" y aria-live="polite" (Criterio IHC / WCAG).
 * Mantiene la estética e identidad visual de la aplicación sin saltos bruscos.
 */
export const PantallaCarga: React.FC<{ mensaje?: string }> = ({
  mensaje = 'Cargando Encuéntralo...',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-800"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in p-6 text-center max-w-sm">
        {/* Isotipo de Encuéntralo con pulso suave */}
        <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
          <Compass className="w-9 h-9 animate-pulse" aria-hidden="true" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Encuéntralo</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Campus universitario</p>
        </div>

        {/* Indicador visual de estado y spinner */}
        <div className="flex items-center gap-2.5 mt-2 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-sm">
          <svg
            className="animate-spin h-4 w-4 text-brand-600"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs font-semibold text-slate-700">{mensaje}</span>
        </div>

        {/* Anuncio accesible exclusivo para lectores de pantalla */}
        <span className="sr-only">{mensaje} Por favor espera un momento.</span>
      </div>
    </div>
  );
};

/**
 * Guard para rutas privadas (solicita autenticación).
 * Mientras verifica la sesión, muestra PantallaCarga. Si no hay usuario,
 * redirige a /iniciar-sesion preservando la ruta solicitada en state.from.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <PantallaCarga mensaje="Verificando autorización..." />;
  }

  if (!usuario) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RequireAuth = ProtectedRoute;

/**
 * Guard para rutas exclusivas de visitantes no autenticados (Login y Registro).
 * Si la sesión ya existe o se acaba de resolver, redirige al destino con replace.
 */
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <PantallaCarga mensaje="Comprobando sesión..." />;
  }

  if (usuario) {
    // Redirige al destino previo o a /objetos por defecto
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/objetos';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * Guard para panel de administración.
 */
export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <PantallaCarga mensaje="Verificando permisos de administración..." />;
  }

  if (!usuario) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  if (usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
