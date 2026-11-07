import React, { useState, useEffect, useRef } from 'react';
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
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/context/ChatContext';
import { useAyuda } from '@/context/AyudaContext';

export const Header: React.FC = () => {
  const { usuario, cerrarSesion, estaSuspendido } = useAuth();
  const { abrirChat } = useChat();
  const { abrirAyuda } = useAyuda();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [campanaAbierta, setCampanaAbierta] = useState(false);
  const [panelChatAbierto, setPanelChatAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [chatsActivos, setChatsActivos] = useState<{ id: string; titulo: string }[]>([]);

  const campanaRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera o presionar Esc (Criterio IHC: Control y prevención de errores)
  useEffect(() => {
    const handleClickAfuera = (e: MouseEvent) => {
      const target = e.target as Node;
      if (campanaRef.current && !campanaRef.current.contains(target)) {
        setCampanaAbierta(false);
      }
      if (chatRef.current && !chatRef.current.contains(target)) {
        setPanelChatAbierto(false);
      }
      if (menuUsuarioRef.current && !menuUsuarioRef.current.contains(target)) {
        setMenuUsuarioAbierto(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCampanaAbierta(false);
        setPanelChatAbierto(false);
        setMenuUsuarioAbierto(false);
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickAfuera);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const cargarNotificaciones = async () => {
    if (!usuario) return;
    try {
      const data = await services.notificaciones.delUsuario(usuario.id);
      setNotificaciones(data);
    } catch {
      // Ignorar
    }
  };

  const cargarChatsActivos = async () => {
    if (!usuario) return;
    try {
      // Obtener solicitudes aprobadas donde el usuario sea solicitante o dueño del objeto
      const [comoSol, misPubs] = await Promise.all([
        services.solicitudes.delSolicitante(usuario.id),
        services.objetos.delUsuario(usuario.id),
      ]);

      const listaChats: { id: string; titulo: string }[] = [];

      // 1. Solicitudes que envié y fueron aprobadas
      comoSol
        .filter((s) => s.estado === 'aprobada')
        .forEach((s) => {
          listaChats.push({
            id: s.id,
            titulo: s.objeto?.nombre || 'Objeto reclamado',
          });
        });

      // 2. Solicitudes recibidas en mis publicaciones que aprobé
      for (const pub of misPubs) {
        if (pub.estado === 'recuperado' || pub.estado === 'en_proceso') {
          const sols = await services.solicitudes.delObjeto(pub.id, usuario);
          sols
            .filter((s) => s.estado === 'aprobada')
            .forEach((s) => {
              if (!listaChats.some((c) => c.id === s.id)) {
                listaChats.push({
                  id: s.id,
                  titulo: pub.nombre,
                });
              }
            });
        }
      }

      setChatsActivos(listaChats);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    cargarNotificaciones();
    cargarChatsActivos();

    if (!usuario) return;

    // Sondeo en tiempo real para notificaciones y chats activos (IHC Visibilidad)
    const interval = setInterval(() => {
      cargarNotificaciones();
      cargarChatsActivos();
    }, 3500);

    return () => clearInterval(interval);
  }, [usuario]);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const toggleCampana = async () => {
    if (!campanaAbierta && usuario && noLeidas > 0) {
      await services.notificaciones.marcarTodasLeidas(usuario.id);
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    }
    setCampanaAbierta(!campanaAbierta);
    if (!campanaAbierta) {
      setPanelChatAbierto(false);
      setMenuAbierto(false);
    }
  };

  const togglePanelChat = () => {
    setPanelChatAbierto(!panelChatAbierto);
    if (!panelChatAbierto) {
      setCampanaAbierta(false);
      setMenuAbierto(false);
    }
  };

  const handleLogout = async () => {
    await cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-brand-50 text-brand-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Identidad y Navegación izquierda */}
        <div className="flex items-center gap-3 lg:gap-5 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-brand-700 font-extrabold text-xl tracking-tight focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1 shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white shadow-sm">
              <Compass className="h-5 w-5" />
            </div>
            <span>Encuéntralo</span>
          </Link>

          {/* Enlaces principales de exploración */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
            <NavLink to="/objetos" className={navLinkClass}>
              Catálogo
            </NavLink>
            {usuario && (
              <>
                <NavLink to="/mis-publicaciones" className={navLinkClass}>
                  <FolderArchive className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <span className="hidden xl:inline">Mis </span>publicaciones
                  </span>
                </NavLink>
                <NavLink to="/mis-solicitudes" className={navLinkClass}>
                  <Inbox className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    <span className="hidden xl:inline">Mis </span>solicitudes
                  </span>
                </NavLink>
                {usuario.rol === 'admin' && (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ml-1 ${
                        isActive
                          ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
                          : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 shadow-2xs'
                      }`
                    }
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Admin</span>
                  </NavLink>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Acciones y Utilidades derecha */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {usuario ? (
            <>
              {/* Botón CTA Destacado: bloqueado si la cuenta está suspendida */}
              {!estaSuspendido ? (
                <Link to="/objetos/nuevo" className="shrink-0">
                  <Button variant="primary" size="sm" className="gap-1.5 shadow-sm whitespace-nowrap px-3.5">
                    <PlusCircle className="w-4 h-4" />
                    Publicar objeto
                  </Button>
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="Tu cuenta está suspendida. No puedes publicar objetos."
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 cursor-not-allowed shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Publicación bloqueada
                </button>
              )}

              {/* Separador vertical */}
              <div className="h-5 w-px bg-slate-200 mx-0.5" aria-hidden="true" />

              {/* Cluster de Herramientas y Notificaciones */}
              <div className="flex items-center gap-0.5 text-slate-600">
                {/* Botón de Ayuda */}
                <button
                  type="button"
                  onClick={() => abrirAyuda()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-brand-700 hover:bg-brand-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  title="Centro de Ayuda y dudas frecuentes"
                  aria-label="Abrir centro de ayuda"
                >
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  <span className="hidden xl:inline">Ayuda</span>
                </button>

                {/* Chats de Entrega */}
                <div className="relative" ref={chatRef}>
                  <button
                    type="button"
                    onClick={togglePanelChat}
                    aria-expanded={panelChatAbierto}
                    aria-label={`Chats de entrega (${chatsActivos.length} activos)`}
                    title="Chats de coordinación de entrega"
                    className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {chatsActivos.length > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {chatsActivos.length}
                      </span>
                    )}
                  </button>

                  {panelChatAbierto && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 border border-slate-100 animate-scale-in z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          Chats de entrega
                        </span>
                        <span className="text-xs text-slate-500">{chatsActivos.length} activos</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 mt-1">
                        {chatsActivos.length === 0 ? (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500 font-medium">No hay entregas activas.</p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              El chat se activa automáticamente cuando se aprueba una solicitud de recuperación.
                            </p>
                          </div>
                        ) : (
                          chatsActivos.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                abrirChat(c.id, c.titulo);
                                setPanelChatAbierto(false);
                              }}
                              className="w-full text-left p-2.5 text-xs rounded-xl transition-colors hover:bg-emerald-50/70 flex items-center justify-between group"
                            >
                              <div className="min-w-0 pr-2">
                                <p className="font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                                  {c.titulo}
                                </p>
                                <p className="text-[11px] text-slate-500">Coordinar entrega segura</p>
                              </div>
                              <span className="text-emerald-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                                Abrir &rarr;
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notificaciones */}
                <div className="relative" ref={campanaRef}>
                  <button
                    type="button"
                    onClick={toggleCampana}
                    aria-expanded={campanaAbierta}
                    aria-label={`Notificaciones (${noLeidas} no leídas)`}
                    title="Notificaciones"
                    className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {noLeidas > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {noLeidas}
                      </span>
                    )}
                  </button>

                  {campanaAbierta && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 border border-slate-100 animate-scale-in z-50">
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
              </div>

              {/* Separador vertical */}
              <div className="h-5 w-px bg-slate-200 mx-0.5" aria-hidden="true" />

              {/* Menú de Usuario desplegable organizado */}
              <div className="relative" ref={menuUsuarioRef}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuUsuarioAbierto(!menuUsuarioAbierto);
                    setCampanaAbierta(false);
                    setPanelChatAbierto(false);
                  }}
                  aria-expanded={menuUsuarioAbierto}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 bg-white shadow-xs"
                  title="Opciones de cuenta"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-700 to-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[85px] truncate">
                    {usuario.nombre.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      menuUsuarioAbierto ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {menuUsuarioAbierto && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200 border border-slate-100 animate-scale-in z-50">
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{usuario.nombre}</p>
                      <p className="text-[11px] text-slate-500 truncate">{usuario.correo}</p>
                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            usuario.rol === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-brand-50 text-brand-700 border border-brand-200'
                          }`}
                        >
                          {usuario.rol === 'admin' ? 'Administrador' : 'Estudiante / Personal'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/perfil"
                        onClick={() => setMenuUsuarioAbierto(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/mis-publicaciones"
                        onClick={() => setMenuUsuarioAbierto(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <FolderArchive className="w-4 h-4 text-slate-400" />
                        Mis publicaciones
                      </Link>
                      <Link
                        to="/mis-solicitudes"
                        onClick={() => setMenuUsuarioAbierto(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <Inbox className="w-4 h-4 text-slate-400" />
                        Mis solicitudes
                      </Link>
                      {usuario.rol === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuUsuarioAbierto(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-purple-700 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          Panel de administración
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
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
            <>
              <button
                type="button"
                onClick={togglePanelChat}
                aria-label="Chats de entrega"
                className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-xl"
              >
                <MessageCircle className="w-6 h-6" />
                {chatsActivos.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {chatsActivos.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={toggleCampana}
                aria-label="Notificaciones"
                className="relative p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-xl"
              >
                <Bell className="w-6 h-6" />
                {noLeidas > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                    {noLeidas}
                  </span>
                )}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              const siguiente = !menuAbierto;
              setMenuAbierto(siguiente);
              if (siguiente) {
                setPanelChatAbierto(false);
                setCampanaAbierta(false);
              }
            }}
            aria-expanded={menuAbierto}
            aria-label="Abrir menú"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Popovers Móviles */}
      {panelChatAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 shadow-lg animate-scale-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Chats de entrega ({chatsActivos.length})
            </span>
            <button
              onClick={() => setPanelChatAbierto(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Cerrar
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
            {chatsActivos.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-500">
                No tienes entregas activas en coordinación.
              </p>
            ) : (
              chatsActivos.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    abrirChat(c.id, c.titulo);
                    setPanelChatAbierto(false);
                  }}
                  className="w-full text-left p-2.5 text-xs rounded-xl hover:bg-emerald-50 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{c.titulo}</p>
                    <p className="text-[11px] text-slate-500">Coordinar entrega campus/hogar</p>
                  </div>
                  <span className="text-emerald-600 font-bold text-xs">Abrir &rarr;</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {campanaAbierta && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 shadow-lg animate-scale-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-brand-600" />
              Notificaciones ({notificaciones.length})
            </span>
            <button
              onClick={() => setCampanaAbierta(false)}
              className="text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Cerrar
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 mt-2">
            {notificaciones.length === 0 ? (
              <p className="p-3 text-center text-xs text-slate-500">No tienes notificaciones.</p>
            ) : (
              notificaciones.map((n) => (
                <div key={n.id} className="p-2 text-xs">
                  <p className="text-slate-700">{n.mensaje}</p>
                  {n.enlace && (
                    <Link
                      to={n.enlace}
                      onClick={() => setCampanaAbierta(false)}
                      className="inline-block mt-1 text-brand-600 font-semibold"
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
            <button
              type="button"
              onClick={() => {
                setMenuAbierto(false);
                abrirAyuda();
              }}
              className="w-full text-left p-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-brand-600" />
              Centro de Ayuda / ¿Cómo funciona?
            </button>
            {usuario ? (
              <>
                {!estaSuspendido && (
                  <Link
                    to="/objetos/nuevo"
                    onClick={() => setMenuAbierto(false)}
                    className="p-2.5 rounded-xl font-semibold text-brand-700 bg-brand-50"
                  >
                    + Publicar objeto
                  </Link>
                )}
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