import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Compass, Search, Plus, Inbox, User, LogIn } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { usuario, estaSuspendido } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-1 py-1.5 px-1 text-[11px] font-medium transition-all duration-150 active:scale-95 ${
      isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {/* 1. Inicio */}
        <NavLink to="/" end className={navItemClass}>
          {({ isActive }) => (
            <>
              <Compass className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span>Inicio</span>
            </>
          )}
        </NavLink>

        {/* 2. Catálogo */}
        <NavLink to="/objetos" className={navItemClass}>
          {({ isActive }) => (
            <>
              <Search className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span>Catálogo</span>
            </>
          )}
        </NavLink>

        {/* 3. Botón Central Destacado: Publicar */}
        <div className="flex items-center justify-center px-1">
          <NavLink
            to={usuario ? (estaSuspendido ? '#' : '/objetos/nuevo') : '/iniciar-sesion'}
            title={estaSuspendido ? 'Cuenta suspendida' : 'Publicar nuevo objeto'}
            className={({ isActive }) =>
              `relative -top-3.5 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform duration-150 active:scale-90 ${
                estaSuspendido
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                  : isActive
                  ? 'bg-brand-700 text-white ring-4 ring-brand-100 shadow-brand-500/40'
                  : 'bg-brand-600 text-white hover:bg-brand-700 ring-4 ring-white shadow-brand-500/30'
              }`
            }
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
            <span className="sr-only">Publicar objeto</span>
          </NavLink>
        </div>

        {/* 4. Solicitudes / Publicaciones (según estado de sesión) */}
        {usuario ? (
          <NavLink to="/mis-solicitudes" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Inbox className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>Solicitudes</span>
              </>
            )}
          </NavLink>
        ) : (
          <NavLink to="/iniciar-sesion" className={navItemClass}>
            {({ isActive }) => (
              <>
                <LogIn className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>Ingresar</span>
              </>
            )}
          </NavLink>
        )}

        {/* 5. Perfil / Registrarse */}
        {usuario ? (
          <NavLink to="/perfil" className={navItemClass}>
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>Perfil</span>
              </>
            )}
          </NavLink>
        ) : (
          <NavLink to="/registro" className={navItemClass}>
            {({ isActive }) => (
              <>
                <User className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>Registro</span>
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
};
