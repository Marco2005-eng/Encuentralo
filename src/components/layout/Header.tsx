import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Bell, Menu, PlusCircle, FolderArchive, Inbox, ShieldCheck, LogOut, User, MessageCircle, HelpCircle, Accessibility, ChevronDown, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useAyuda } from '@/context/AyudaContext';
import { useAccesibilidad } from '@/context/AccesibilidadContext';
import { services } from '@/services';
import type { Notificacion } from '@/types/models';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const { usuario, cerrarSesion, estaSuspendido } = useAuth();
  const { abrirChat } = useChat();
  const { abrirAyuda } = useAyuda();
  const { abrirPanel } = useAccesibilidad();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const [esMovil, setEsMovil] = useState(() => window.matchMedia('(max-width: 1199px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1199px)');
    const actualizar = () => setEsMovil(media.matches);
    media.addEventListener('change', actualizar);
    return () => media.removeEventListener('change', actualizar);
  }, []);
  useEffect(() => {
    const closeDisclosures = (event: MouseEvent | KeyboardEvent) => {
      headerRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(detail => {
        if (event instanceof KeyboardEvent) {
          if (event.key !== 'Escape') return;
          detail.open = false;
          detail.querySelector('summary')?.focus();
        } else if (!detail.contains(event.target as Node)) detail.open = false;
      });
    };
    document.addEventListener('click', closeDisclosures);
    document.addEventListener('keydown', closeDisclosures);
    return () => {
      document.removeEventListener('click', closeDisclosures);
      document.removeEventListener('keydown', closeDisclosures);
    };
  }, []);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [campanaAbierta, setCampanaAbierta] = useState(false);
  const [panelChatAbierto, setPanelChatAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const popoverRef = useRef<HTMLElement>(null);
  const communicationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (esMovil || (!panelChatAbierto && !campanaAbierta)) return;
    const focusTrigger = () => {
      const name = panelChatAbierto ? 'Mensajes:' : 'Avisos:';
      const desktop = communicationRef.current?.querySelector<HTMLButtonElement>(`button[aria-label^="${name}"]`);
      if (desktop && desktop.getClientRects().length) desktop.focus();
      else headerRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Abrir menú"]')?.focus();
    };
    const onOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target) || communicationRef.current?.contains(target)) return;
      setPanelChatAbierto(false); setCampanaAbierta(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setPanelChatAbierto(false); setCampanaAbierta(false); focusTrigger();
    };
    popoverRef.current?.focus({ preventScroll: true });
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [panelChatAbierto, campanaAbierta, esMovil]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [chatsActivos, setChatsActivos] = useState<{ id: string; titulo: string }[]>([]);

  useEffect(() => {
    headerRef.current?.querySelector<HTMLElement>('.header-mobile-nav [aria-current="page"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setMenuAbierto(false);
    setCampanaAbierta(false);
    setPanelChatAbierto(false);
    setMenuUsuarioAbierto(false);
  }, [pathname]);

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
    `header-control ${isActive ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-slate-700 hover:bg-slate-100'}`;
  const cerrarPaneles = () => {
    headerRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(detail => { detail.open = false; });
    setMenuAbierto(false); setCampanaAbierta(false); setPanelChatAbierto(false); setMenuUsuarioAbierto(false);
  };
  const mostrarAyuda = () => { cerrarPaneles(); abrirAyuda(); };
  const mostrarAccesibilidad = () => { cerrarPaneles(); abrirPanel(); };
  const publicar = estaSuspendido
    ? <Button disabled className="gap-2"><PlusCircle className="h-4 w-4" aria-hidden="true" />Publicar objeto</Button>
    : <Link to="/objetos/nuevo" className="header-control justify-center bg-brand-600 font-semibold text-white hover:bg-brand-700"><PlusCircle className="h-4 w-4" aria-hidden="true" />Publicar objeto</Link>;
  const enlacesPersonales = <>
    <NavLink to="/mis-publicaciones" className={navLinkClass} onClick={cerrarPaneles}><FolderArchive className="h-4 w-4" aria-hidden="true" />Mis publicaciones</NavLink>
    <NavLink to="/mis-solicitudes" className={navLinkClass} onClick={cerrarPaneles}><Inbox className="h-4 w-4" aria-hidden="true" />Mis solicitudes</NavLink>
    {usuario?.rol === 'admin' && <NavLink to="/admin" className={navLinkClass} onClick={cerrarPaneles}><ShieldCheck className="h-4 w-4" aria-hidden="true" />Administración</NavLink>}
  </>;

  const contenidoMensajes = (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Abre una conversación para coordinar la devolución.</p>
        {chatsActivos.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">No tienes entregas activas. Cuando se apruebe una solicitud, encontrarás aquí su conversación.</p>
          : chatsActivos.map(chat => <button key={chat.id} type="button" className="flex min-h-[44px] w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50" onClick={() => { setPanelChatAbierto(false); abrirChat(chat.id, chat.titulo); }}><span className="min-w-0 break-words font-semibold text-slate-900">{chat.titulo}</span><span className="text-sm font-semibold text-brand-700">Abrir</span></button>)}
      </div>
  );
  const contenidoNotificaciones = (
      <div className="space-y-3">
        {notificaciones.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">No tienes avisos por ahora. Aquí aparecerán las actualizaciones de tus publicaciones y solicitudes.</p>
          : notificaciones.map(aviso => <div key={aviso.id} className="rounded-xl border border-slate-200 p-4 text-sm text-slate-800"><p className="break-words">{aviso.mensaje}</p>{aviso.enlace && <Link to={aviso.enlace} onClick={cerrarPaneles} className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-brand-700 underline">Ver detalle</Link>}</div>)}
      </div>
  );

  return <>
    <header ref={headerRef} className="site-header sticky top-0 z-40 w-full border-b border-slate-200 bg-white print:static">
      <div className="header-bar">
        <Link to="/" className="header-brand" aria-label="Encuéntralo, inicio">
          <span className="header-brand-symbol"><Compass className="h-5 w-5" aria-hidden="true" /></span>
          <span>Encuéntralo</span>
        </Link>
        <nav aria-label="Navegación principal" className="header-desktop-nav">
          <NavLink to="/objetos" className={navLinkClass}>Catálogo</NavLink>
          {usuario && enlacesPersonales}
        </nav>
        <div className="header-desktop-actions">
          {publicar}
          {usuario && <div ref={communicationRef} className="header-communication" role="group" aria-label="Comunicación">
            <button type="button" onClick={togglePanelChat} aria-expanded={panelChatAbierto} aria-controls="header-messages" aria-label={`Mensajes: ${chatsActivos.length} conversaciones activas`} title="Mensajes de entrega" className="header-icon-button"><MessageCircle className="h-5 w-5" aria-hidden="true" />{chatsActivos.length > 0 && <span className="header-dot" aria-hidden="true" />}</button>
            <button type="button" onClick={toggleCampana} aria-expanded={campanaAbierta} aria-controls="header-notifications" aria-label={`Avisos: ${noLeidas} sin leer`} title="Avisos y notificaciones" className="header-icon-button"><Bell className="h-5 w-5" aria-hidden="true" />{noLeidas > 0 && <span className="header-dot" aria-hidden="true" />}</button>
          </div>}
          <details className="header-disclosure">
            <summary className="header-control cursor-pointer text-slate-600"><HelpCircle className="h-4 w-4" aria-hidden="true" />Ayuda<ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></summary>
            <div className="header-dropdown header-dropdown-right">
              <p className="header-dropdown-caption">Apoyo para usar Encuéntralo</p>
              <button type="button" onClick={mostrarAyuda} className="header-control text-slate-700"><HelpCircle className="h-4 w-4" aria-hidden="true" />Centro de ayuda</button>
              <button type="button" onClick={mostrarAccesibilidad} className="header-control text-slate-700"><Accessibility className="h-4 w-4" aria-hidden="true" />Accesibilidad</button>
            </div>
          </details>
          {usuario ? <button type="button" onClick={() => setMenuUsuarioAbierto(true)} aria-haspopup="dialog" aria-label="Mi cuenta" title="Mi cuenta" className="header-account"><span className="header-avatar" aria-hidden="true">{usuario.nombre.charAt(0).toUpperCase()}</span><ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /></button>
            : <Link to="/iniciar-sesion" className="header-control whitespace-nowrap text-slate-700">Ingresar</Link>}
        </div>
        <div className="header-mobile-actions">
          {estaSuspendido ? <button type="button" disabled className="header-mobile-publish opacity-60" aria-label="Publicar objeto, cuenta suspendida"><PlusCircle className="h-4 w-4" aria-hidden="true" /><span>Publicar</span></button> : <Link to="/objetos/nuevo" className="header-mobile-publish" aria-label="Publicar objeto"><PlusCircle className="h-4 w-4" aria-hidden="true" /><span>Publicar</span></Link>}
          <button type="button" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú" aria-haspopup="dialog" className="header-icon-button"><Menu className="h-5 w-5" aria-hidden="true" /></button>
        </div>
      </div>
      <nav aria-label="Accesos principales en móvil" className="header-mobile-nav">
        <NavLink to="/objetos" className={navLinkClass}>Catálogo</NavLink>
        {usuario ? <><NavLink to="/mis-publicaciones" className={navLinkClass}>Mis publicaciones</NavLink><NavLink to="/mis-solicitudes" className={navLinkClass}>Mis solicitudes</NavLink>{usuario.rol === 'admin' && <NavLink to="/admin" className={navLinkClass}>Administración</NavLink>}</>
          : <Link to="/iniciar-sesion" className="header-control text-slate-600">Iniciar sesión</Link>}
      </nav>
    {!esMovil && panelChatAbierto && usuario && <section ref={popoverRef} id="header-messages" role="region" aria-labelledby="header-messages-title" tabIndex={-1} className="header-popover">
      <div className="header-popover-heading"><h2 id="header-messages-title">Mensajes</h2><button type="button" aria-label="Cerrar mensajes" onClick={() => { setPanelChatAbierto(false); communicationRef.current?.querySelector<HTMLButtonElement>('button[aria-controls="header-messages"]')?.focus(); }} className="header-icon-button"><X className="h-4 w-4" aria-hidden="true" /></button></div>
      {contenidoMensajes}
    </section>}
    {!esMovil && campanaAbierta && usuario && <section ref={popoverRef} id="header-notifications" role="region" aria-labelledby="header-notifications-title" tabIndex={-1} className="header-popover">
      <div className="header-popover-heading"><h2 id="header-notifications-title">Notificaciones</h2><button type="button" aria-label="Cerrar notificaciones" onClick={() => { setCampanaAbierta(false); communicationRef.current?.querySelector<HTMLButtonElement>('button[aria-controls="header-notifications"]')?.focus(); }} className="header-icon-button"><X className="h-4 w-4" aria-hidden="true" /></button></div>
      {contenidoNotificaciones}
    </section>}
    </header>
    <Modal abierto={esMovil && panelChatAbierto && Boolean(usuario)} alCerrar={() => setPanelChatAbierto(false)} titulo="Mensajes de entrega">
      {contenidoMensajes}
    </Modal>
    <Modal abierto={esMovil && campanaAbierta && Boolean(usuario)} alCerrar={() => setCampanaAbierta(false)} titulo="Avisos y notificaciones">
      {contenidoNotificaciones}
    </Modal>

    <Modal abierto={menuAbierto} alCerrar={() => setMenuAbierto(false)} titulo="Menú principal">
      <nav aria-label="Navegación móvil" className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-4">
          <button type="button" onClick={mostrarAyuda} className="header-control border border-slate-200 text-slate-700"><HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />Ayuda</button>
          <button type="button" onClick={mostrarAccesibilidad} className="header-control border border-slate-200 text-slate-700"><Accessibility className="h-4 w-4 shrink-0" aria-hidden="true" />Accesibilidad</button>
        </div>
        {usuario && <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-4">
          <button type="button" onClick={() => { cerrarPaneles(); setPanelChatAbierto(true); }} className="header-control text-slate-700"><MessageCircle className="h-4 w-4" aria-hidden="true" />Mensajes ({chatsActivos.length})</button>
          <button type="button" onClick={() => { setMenuAbierto(false); void toggleCampana(); }} className="header-control text-slate-700"><Bell className="h-4 w-4" aria-hidden="true" />Avisos ({noLeidas})</button>
        </div>}
        <NavLink to="/objetos" className={navLinkClass} onClick={cerrarPaneles}>Catálogo</NavLink>
        {usuario ? <>
          {enlacesPersonales}
          <Link to="/perfil" onClick={cerrarPaneles} className="header-control text-slate-700"><User className="h-4 w-4" aria-hidden="true" />Mi perfil</Link>
          <div className="mt-2 border-t border-slate-200 pt-3"><p className="mb-2 break-words text-sm text-slate-600">Sesión de {usuario.nombre}</p><Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4" aria-hidden="true" />Cerrar sesión</Button></div>
        </> : <><Link to="/iniciar-sesion" onClick={cerrarPaneles} className="header-control text-slate-700">Iniciar sesión</Link><Link to="/registro" onClick={cerrarPaneles} className="header-control text-slate-700">Registrarse</Link></>}
      </nav>
    </Modal>
    <Modal abierto={menuUsuarioAbierto && Boolean(usuario)} alCerrar={() => setMenuUsuarioAbierto(false)} titulo="Mi cuenta">
      <div className="space-y-4">
        <p className="break-words text-base font-semibold text-slate-900">{usuario?.nombre}</p>
        <p className="text-sm text-slate-700">{usuario?.rol === 'admin' ? 'Administrador' : 'Estudiante / Personal'}</p>
        <Link to="/perfil" onClick={cerrarPaneles} className="header-control border border-slate-200 text-slate-700"><User className="h-4 w-4" aria-hidden="true" />Mi perfil</Link>
        <Button variant="outline" onClick={handleLogout}><LogOut className="h-4 w-4" aria-hidden="true" />Cerrar sesión</Button>
      </div>
    </Modal>

  </>;
};
