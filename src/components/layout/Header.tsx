import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { services } from '@/services';
import type { Notificacion } from '@/types/models';
import {
  Compass,
  Bell,
  Menu,
  X,
  PlusCircle,
  FolderArchive,
  Inbox,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [campanaAbierta, setCampanaAbierta] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const cargarNotificaciones = async () => {
    if (!usuario) return;
    try {
      const data = await services.notificaciones.delUsuario(usuario.id);
      setNotificaciones(data);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    cargarNotificaciones();
  }, [usuario]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const toggleCampana = async () => {
    if (!campanaAbierta && usuario && noLeidas > 0) {
      await services.notificaciones.marcarTodasLeidas(usuario.id);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    }
    setCampanaAbierta(!campanaAbierta);
  };

  const handleLogout = async () => {
    await cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-brand-700 font-extrabold text-xl tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <span>Encuéntralo</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Navegación principal">
          <NavLink to="/objetos" className={navLinkClass}>
            Catálogo
          </NavLink>
          {usuario && (
            <>
              <NavLink to="/mis-publicaciones" className={navLinkClass}>
                <FolderArchive className="w-4 h-4" />
                Mis publicaciones
              </NavLink>
              <NavLink to="/mis-solicitudes" className={navLinkClass}>
                <Inbox className="w-4 h-4" />
                Mis solicitudes
              </NavLink>
              {usuario.rol === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* Acciones derecha */}
        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <>
              <Link to="/objetos/nuevo">
                <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                  Publicar objeto
                </Button>
              </Link>

              {/* Notificaciones */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleCampana}
                  aria-expanded={campanaAbierta}
                  aria-label={`Notificaciones (${noLeidas} no leídas)`}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <Bell className="w-5 h-5" />
                  {noLeidas > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {noLeidas}
                    </span>
                  )}
                </button>

                {campanaAbierta && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 border border-slate-100 animate-scale-in">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-semibold text-sm text-slate-800">Notificaciones</span>
                      <span className="text-xs text-slate-500">{notificaciones.length} total</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 mt-1">
                      {notificaciones.length === 0 ? (
                        <p className="p-4 text-center text-xs text-slate-500">No tienes notificaciones.</p>
                      ) : (
                        notificaciones.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 text-xs rounded-lg transition-colors ${
                              n.leida ? 'text-slate-600 hover:bg-slate-50' : 'bg-brand-50/50 font-medium text-brand-900'
                            }`}
                          >
                            <p>{n.mensaje}</p>
                            {n.enlace && (
                              <Link
                                to={n.enlace}
                                onClick={() => setCampanaAbierta(false)}
                                className="inline-block mt-1 text-brand-600 hover:underline font-semibold"
                              >
                                Ver detalle &rarr;
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Usuario Dropdown / Salir */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/perfil"
                  title="Mi Perfil"
                  className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 transition-colors px-2.5 py-1.5 rounded-lg"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {usuario.nombre.split(' ')[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/iniciar-sesion">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {usuario && (
            <button
              type="button"
              onClick={toggleCampana}
              aria-label="Notificaciones"
              className="relative p-2 text-slate-600 hover:text-slate-900"
            >
              <Bell className="w-6 h-6" />
              {noLeidas > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {noLeidas}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-expanded={menuAbierto}
            aria-label="Abrir menú"
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col gap-1.5" aria-label="Navegación móvil">
            <Link
              to="/objetos"
              onClick={() => setMenuAbierto(false)}
              className="p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50"
            >
              Catálogo de objetos
            </Link>
            {usuario ? (
              <>
                <Link
                  to="/objetos/nuevo"
                  onClick={() => setMenuAbierto(false)}
                  className="p-2.5 rounded-xl font-semibold text-brand-700 bg-brand-50"
                >
                  + Publicar objeto
                </Link>
                <Link
                  to="/mis-publicaciones"
                  onClick={() => setMenuAbierto(false)}
                  className="p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50"
                >
                  Mis publicaciones
                </Link>
                <Link
                  to="/mis-solicitudes"
                  onClick={() => setMenuAbierto(false)}
                  className="p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50"
                >
                  Mis solicitudes
                </Link>
                <Link
                  to="/perfil"
                  onClick={() => setMenuAbierto(false)}
                  className="p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  Mi Perfil
                </Link>
                {usuario.rol === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuAbierto(false)}
                    className="p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Panel Admin
                  </Link>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm text-slate-600 font-medium">Hola, {usuario.nombre}</span>
                  <Button variant="danger" size="sm" onClick={handleLogout}>
                    Cerrar sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <Link to="/iniciar-sesion" onClick={() => setMenuAbierto(false)}>
                  <Button variant="outline" className="w-full">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link to="/registro" onClick={() => setMenuAbierto(false)}>
                  <Button variant="primary" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};