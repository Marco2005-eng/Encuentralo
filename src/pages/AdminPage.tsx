import React, { useState, useEffect } from 'react';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Objeto, Usuario } from '@/types/models';
import type { Estadisticas, SolicitudConObjeto } from '@/services/types';
import { CATEGORIA_LABEL } from '@/lib/textos';
import { formatFecha } from '@/lib/fechas';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import {
  SearchX,
  PackageCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Shield,
  Layers,
  Inbox,
  Trash2,
  Users,
  UserX,
  UserCheck,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [seccionActiva, setSeccionActiva] = useState<'metricas' | 'publicaciones' | 'solicitudes' | 'usuarios'>('metricas');
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudConObjeto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para filtro y búsqueda en Publicaciones
  const [busquedaPub, setBusquedaPub] = useState('');
  const [filtroVisibilidadPub, setFiltroVisibilidadPub] = useState<'todas' | 'visibles' | 'ocultas'>('todas');
  const [objetoParaOcultar, setObjetoParaOcultar] = useState<Objeto | null>(null);
  const [motivoOcultarPub, setMotivoOcultarPub] = useState('');
  const [procesandoOcultarPub, setProcesandoOcultarPub] = useState(false);

  // Estados para filtro y búsqueda en Solicitudes
  const [busquedaSolicitud, setBusquedaSolicitud] = useState('');
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada' | 'ocultas'>('todas');
  const [paginaSolicitudes, setPaginaSolicitudes] = useState(1);
  const porPagina = 8;

  // Modal Detalle / Prueba de Solicitud en Admin
  const [solicitudDetalle, setSolicitudDetalle] = useState<SolicitudConObjeto | null>(null);

  // Estados para Usuarios y Baneo
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [filtroEstadoUsuario, setFiltroEstadoUsuario] = useState<'todos' | 'activos' | 'suspendidos'>('todos');
  const [usuarioParaSuspender, setUsuarioParaSuspender] = useState<Usuario | null>(null);
  const [diasSuspension, setDiasSuspension] = useState<number>(7);
  const [motivoSuspension, setMotivoSuspension] = useState('');
  const [procesandoSuspension, setProcesandoSuspension] = useState(false);

  const cargarAdminData = async () => {
    if (!usuario || usuario.rol !== 'admin') return;
    setCargando(true);
    try {
      const [stats, objs, sols, users] = await Promise.all([
        services.estadisticas.resumen(),
        services.objetos.listar({ incluirOcultos: true }),
        services.solicitudes.todas(usuario),
        services.auth.listarUsuarios(usuario),
      ]);
      setEstadisticas(stats);
      setObjetos(objs);
      setSolicitudes(sols);
      setUsuarios(users);
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAdminData();
  }, [usuario]);

  const handleRestablecerDemo = async () => {
    if (
      window.confirm(
        '¿Deseas restablecer todos los datos de demostración a su estado inicial? Se borrarán registros creados manualmente.'
      )
    ) {
      await services.restablecerDemo();
      mostrarToast('Datos de demostración restablecidos.', 'exito');
      cargarAdminData();
    }
  };

  const handleEliminarObjeto = async (id: string) => {
    if (!usuario) return;
    if (window.confirm('¿Eliminar definitivamente este objeto como Administrador?')) {
      try {
        await services.objetos.eliminar(id, usuario);
        mostrarToast('Objeto eliminado.', 'exito');
        cargarAdminData();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  const handleOcultarObjeto = async () => {
    if (!usuario || !objetoParaOcultar) return;
    if (!motivoOcultarPub.trim()) {
      mostrarToast('Debes indicar el motivo para ocultar la publicación.', 'error');
      return;
    }
    setProcesandoOcultarPub(true);
    try {
      await services.objetos.ocultar(objetoParaOcultar.id, motivoOcultarPub, usuario);
      mostrarToast('Publicación ocultada temporalmente y se notificó al usuario.', 'exito');
      setObjetoParaOcultar(null);
      setMotivoOcultarPub('');
      cargarAdminData();
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
    } finally {
      setProcesandoOcultarPub(false);
    }
  };

  const handleDesocultarObjeto = async (obj: Objeto) => {
    if (!usuario) return;
    if (window.confirm(`¿Reactivar la publicación "${obj.nombre}" y hacerla visible en el catálogo?`)) {
      try {
        await services.objetos.desocultar(obj.id, usuario);
        mostrarToast('Publicación reactivada y visible nuevamente en el catálogo.', 'exito');
        cargarAdminData();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  const handleEliminarSolicitud = async (id: string) => {
    if (!usuario) return;
    if (window.confirm('¿Eliminar definitivamente esta solicitud de reclamo? Esta acción es irreversible.')) {
      try {
        await services.solicitudes.eliminar(id, usuario);
        mostrarToast('Solicitud eliminada.', 'exito');
        setSolicitudes((prev) => prev.filter((s) => s.id !== id));
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  const handleToggleOcultarSolicitud = async (s: SolicitudConObjeto) => {
    if (!usuario) return;
    const nuevoEstado = !s.oculta;
    try {
      await services.solicitudes.ocultar(s.id, nuevoEstado, usuario);
      mostrarToast(nuevoEstado ? 'Solicitud ocultada / marcada como spam.' : 'Solicitud visible de nuevo.', 'info');
      setSolicitudes((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, oculta: nuevoEstado } : item))
      );
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
    }
  };

  const handleSuspenderUsuario = async () => {
    if (!usuario || !usuarioParaSuspender) return;
    if (!motivoSuspension.trim()) {
      mostrarToast('Debes indicar el motivo de la suspensión.', 'error');
      return;
    }
    setProcesandoSuspension(true);
    try {
      await services.auth.suspenderUsuario(
        usuarioParaSuspender.id,
        diasSuspension,
        motivoSuspension,
        usuario
      );
      mostrarToast(
        `Usuario suspendido por ${diasSuspension} días exitosamente.`,
        'exito'
      );
      setUsuarioParaSuspender(null);
      setMotivoSuspension('');
      cargarAdminData();
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
    } finally {
      setProcesandoSuspension(false);
    }
  };

  const handleQuitarSuspension = async (u: Usuario) => {
    if (!usuario) return;
    if (window.confirm(`¿Levantar la suspensión y rehabilitar la cuenta de ${u.nombre}?`)) {
      try {
        await services.auth.quitarSuspension(u.id, usuario);
        mostrarToast(`Suspensión levantada para ${u.nombre}.`, 'exito');
        cargarAdminData();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  if (cargando) {
    return (
      <div className="container-app py-8 space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Filtrado de publicaciones para Admin
  const objetosFiltrados = objetos.filter((o) => {
    if (filtroVisibilidadPub === 'visibles' && o.oculto) return false;
    if (filtroVisibilidadPub === 'ocultas' && !o.oculto) return false;
    if (busquedaPub.trim()) {
      const q = busquedaPub.toLowerCase();
      const matchNombre = o.nombre.toLowerCase().includes(q);
      const matchDesc = o.descripcion.toLowerCase().includes(q);
      const matchLugar = o.ubicacion.toLowerCase().includes(q);
      const matchMotivo = (o.motivoOculto || '').toLowerCase().includes(q);
      return matchNombre || matchDesc || matchLugar || matchMotivo;
    }
    return true;
  });

  // Filtrado de solicitudes para Admin
  const solicitudesFiltradas = solicitudes.filter((s) => {
    // Filtro estado
    if (filtroEstadoSolicitud === 'ocultas' && !s.oculta) return false;
    if (filtroEstadoSolicitud !== 'ocultas' && filtroEstadoSolicitud !== 'todas' && s.estado !== filtroEstadoSolicitud) return false;
    if (filtroEstadoSolicitud !== 'ocultas' && s.oculta) return false;

    // Filtro búsqueda
    if (busquedaSolicitud.trim()) {
      const q = busquedaSolicitud.toLowerCase();
      const matchObj = s.objeto?.nombre.toLowerCase().includes(q);
      const matchSol = (s.solicitanteNombre || '').toLowerCase().includes(q);
      const matchPrueba = s.pruebaPertenencia.toLowerCase().includes(q);
      return matchObj || matchSol || matchPrueba;
    }
    return true;
  });

  const totalPaginasSol = Math.ceil(solicitudesFiltradas.length / porPagina) || 1;
  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (paginaSolicitudes - 1) * porPagina,
    paginaSolicitudes * porPagina
  );

  // Filtrado de usuarios para Admin
  const usuariosFiltrados = usuarios.filter((u) => {
    const suspendido = Boolean(u.baneadoHasta && new Date(u.baneadoHasta) > new Date());
    if (filtroEstadoUsuario === 'activos' && suspendido) return false;
    if (filtroEstadoUsuario === 'suspendidos' && !suspendido) return false;

    if (busquedaUsuario.trim()) {
      const q = busquedaUsuario.toLowerCase();
      return u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
    }
    return true;
  });

  const datosGrafico =
    estadisticas?.porCategoria.map((c: { categoria: keyof typeof CATEGORIA_LABEL; total: number }) => ({
      name: CATEGORIA_LABEL[c.categoria],
      total: c.total,
    })) || [];

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b'];

  return (
    <div className="container-app py-8 space-y-8">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Rol Administrador UCSS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de control y moderación
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisión integral de objetos, solicitudes, cotejo de pertenencia y control de usuarios.
          </p>
        </div>

        {/* Botón Restablecer Datos de Demostración (IHC 7.8) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestablecerDemo}
          className="border-slate-300 gap-1.5 shadow-sm text-xs font-semibold self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer demo
        </Button>
      </div>

      {/* Pestañas de Navegación del Panel (IHC - Organización clara) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3" role="tablist">
        <button
          type="button"
          onClick={() => setSeccionActiva('metricas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            seccionActiva === 'metricas'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" /> Resumen & Métricas
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('publicaciones')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            seccionActiva === 'publicaciones'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" /> Publicaciones ({objetos.length})
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('solicitudes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            seccionActiva === 'solicitudes'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" /> Solicitudes ({solicitudes.length})
        </button>

        <button
          type="button"
          onClick={() => setSeccionActiva('usuarios')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            seccionActiva === 'usuarios'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Usuarios & Sanciones ({usuarios.length})
        </button>
      </div>

      {/* SECCIÓN 1: MÉTRICAS & ESTADÍSTICAS */}
      {seccionActiva === 'metricas' && (
        <div className="space-y-6">
          {estadisticas && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-l-rose-500 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Perdidos</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.perdidos}</p>
                </div>
                <SearchX className="w-8 h-8 text-rose-500 opacity-80" />
              </div>

              <div className="card p-5 border-l-4 border-l-blue-500 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Encontrados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.encontrados}</p>
                </div>
                <PackageCheck className="w-8 h-8 text-blue-500 opacity-80" />
              </div>

              <div className="card p-5 border-l-4 border-l-amber-500 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">En proceso</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.enProceso}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-80" />
              </div>

              <div className="card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Recuperados</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.recuperados}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
              </div>
            </div>
          )}

          {/* Gráfico de Distribución Accesible */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" /> Distribución de objetos por categoría
            </h2>
            <div className="space-y-4">
              {datosGrafico.map((cat, idx) => {
                const max = Math.max(...datosGrafico.map((d) => d.total), 1);
                const porcentaje = Math.round((cat.total / max) * 100);
                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat.name}</span>
                      <span className="text-slate-500 font-bold">{cat.total} {cat.total === 1 ? 'objeto' : 'objetos'}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${porcentaje}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: PUBLICACIONES SUPERVISADAS */}
      {seccionActiva === 'publicaciones' && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Supervisión de publicaciones ({objetos.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisa los reportes del campus. Si una publicación necesita mejoras o incumple normas, puedes ocultarla y notificar al autor.
              </p>
            </div>

            {/* Búsqueda en Publicaciones */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por objeto, lugar o motivo..."
                value={busquedaPub}
                onChange={(e) => setBusquedaPub(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50"
              />
              {busquedaPub && (
                <button
                  type="button"
                  onClick={() => setBusquedaPub('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filtros de visibilidad */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-500 mr-1">Filtrar:</span>
            <button
              type="button"
              onClick={() => setFiltroVisibilidadPub('todas')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filtroVisibilidadPub === 'todas'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({objetos.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroVisibilidadPub('visibles')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filtroVisibilidadPub === 'visibles'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Visibles ({objetos.filter((o) => !o.oculto).length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroVisibilidadPub('ocultas')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                filtroVisibilidadPub === 'ocultas'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Ocultas para mejoras ({objetos.filter((o) => o.oculto).length})
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full min-w-[680px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3 pr-4">Objeto</th>
                  <th className="pb-3 pr-4">Categoría</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Visibilidad</th>
                  <th className="pb-3 pr-4">Lugar</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {objetosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron publicaciones con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  objetosFiltrados.map((obj) => (
                    <tr key={obj.id} className={`hover:bg-slate-50 transition-colors ${obj.oculto ? 'bg-amber-50/20' : ''}`}>
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        <a href={`/objetos/${obj.id}`} className="hover:text-brand-600 hover:underline">
                          {obj.nombre}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{CATEGORIA_LABEL[obj.categoria]}</td>
                      <td className="py-3 pr-4">
                        <Badge estado={obj.estado} />
                      </td>
                      <td className="py-3 pr-4">
                        {obj.oculto ? (
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Oculta
                            </span>
                            {obj.motivoOculto && (
                              <p className="text-[10px] text-amber-800 font-medium mt-0.5 max-w-[200px] truncate" title={obj.motivoOculto}>
                                Motivo: {obj.motivoOculto}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Visible
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{obj.ubicacion}</td>
                      <td className="py-3 pr-4 text-slate-500">{formatFecha(obj.fecha)}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Botón Ocultar / Desocultar */}
                          {obj.oculto ? (
                            <button
                              type="button"
                              onClick={() => handleDesocultarObjeto(obj)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center gap-1"
                              title="Hacer visible nuevamente en el catálogo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reactivar</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setObjetoParaOcultar(obj);
                                setMotivoOcultarPub('');
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors inline-flex items-center gap-1"
                              title="Ocultar publicación para que sea mejorada"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Ocultar</span>
                            </button>
                          )}

                          {/* Botón Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleEliminarObjeto(obj.id)}
                            className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Eliminar publicación definitivamente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: SOLICITUDES DE RECLAMO (ORGANIZACIÓN, BÚSQUEDA, FILTRO, OCULTAR Y BORRAR) */}
      {seccionActiva === 'solicitudes' && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-brand-600" />
                Moderación de solicitudes de reclamo ({solicitudesFiltradas.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Revisa comprobantes, oculta intentos de spam o elimina solicitudes fraudulentas.
              </p>
            </div>

            {/* Barra de búsqueda rápida */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por objeto, usuario o prueba..."
                value={busquedaSolicitud}
                onChange={(e) => {
                  setBusquedaSolicitud(e.target.value);
                  setPaginaSolicitudes(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex flex-wrap gap-1.5 text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setFiltroEstadoSolicitud('todas');
                setPaginaSolicitudes(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoSolicitud === 'todas'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({solicitudes.filter((s) => !s.oculta).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroEstadoSolicitud('pendiente');
                setPaginaSolicitudes(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoSolicitud === 'pendiente'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendientes ({solicitudes.filter((s) => s.estado === 'pendiente' && !s.oculta).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroEstadoSolicitud('aprobada');
                setPaginaSolicitudes(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoSolicitud === 'aprobada'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Aprobadas ({solicitudes.filter((s) => s.estado === 'aprobada' && !s.oculta).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroEstadoSolicitud('rechazada');
                setPaginaSolicitudes(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoSolicitud === 'rechazada'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Rechazadas ({solicitudes.filter((s) => s.estado === 'rechazada' && !s.oculta).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroEstadoSolicitud('ocultas');
                setPaginaSolicitudes(1);
              }}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoSolicitud === 'ocultas'
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ocultas / Spam ({solicitudes.filter((s) => s.oculta).length})
            </button>
          </div>

          {/* Tabla de Solicitudes */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3 pr-4">Objeto</th>
                  <th className="pb-3 pr-4">Solicitante</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 pr-4">Prueba / Detalle</th>
                  <th className="pb-3 pr-4">Foto / Comprobante</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {solicitudesPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron solicitudes con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  solicitudesPaginadas.map((s) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        s.oculta ? 'bg-purple-50/40 text-slate-400' : ''
                      }`}
                    >
                      <td className="py-3 pr-4 font-semibold text-slate-900">
                        {s.objeto?.nombre || 'Objeto'}
                        {s.oculta && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-sm bg-purple-100 text-purple-700">
                            Oculta
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-700 font-medium">
                        {s.solicitanteNombre || 'Usuario'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge estado={s.estado} />
                      </td>
                      <td className="py-3 pr-4 text-slate-600 max-w-xs truncate" title={s.pruebaPertenencia}>
                        "{s.pruebaPertenencia}"
                      </td>
                      <td className="py-3 pr-4">
                        {s.pruebaImagen ? (
                          <button
                            type="button"
                            onClick={() => setSolicitudDetalle(s)}
                            className="text-xs text-brand-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>🧾 Ver foto</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Sin foto</span>
                        )}
                      </td>
                      <td className="py-3 text-right space-x-1 whitespace-nowrap">
                        {/* Botón Ver detalles */}
                        <button
                          type="button"
                          onClick={() => setSolicitudDetalle(s)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100"
                          title="Ver detalle completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Botón Ocultar / Desocultar */}
                        <button
                          type="button"
                          onClick={() => handleToggleOcultarSolicitud(s)}
                          className={`p-1.5 rounded-lg ${
                            s.oculta
                              ? 'text-purple-600 hover:bg-purple-100'
                              : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title={s.oculta ? 'Desocultar solicitud' : 'Ocultar solicitud (marcar como spam)'}
                        >
                          {s.oculta ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        {/* Botón Eliminar Solicitud */}
                        <button
                          type="button"
                          onClick={() => handleEliminarSolicitud(s.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Eliminar solicitud definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPaginasSol > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Página {paginaSolicitudes} de {totalPaginasSol}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaSolicitudes === 1}
                  onClick={() => setPaginaSolicitudes((p) => Math.max(1, p - 1))}
                  className="gap-1 px-2.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaSolicitudes === totalPaginasSol}
                  onClick={() => setPaginaSolicitudes((p) => Math.min(totalPaginasSol, p + 1))}
                  className="gap-1 px-2.5"
                >
                  Siguiente <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN 4: GESTIÓN DE USUARIOS Y SANCIONES (BANEAR / SUSPENDER POR DÍAS) */}
      {seccionActiva === 'usuarios' && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                Control de usuarios y sanciones ({usuariosFiltrados.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Suspende temporal o permanentemente a cuentas que envíen reportes o reclamos falsos.
              </p>
            </div>

            {/* Buscador de usuario */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Filtros de usuario */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFiltroEstadoUsuario('todos')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoUsuario === 'todos'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({usuarios.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstadoUsuario('activos')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoUsuario === 'activos'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Activos ({usuarios.filter((u) => !u.baneadoHasta || new Date(u.baneadoHasta) <= new Date()).length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstadoUsuario('suspendidos')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filtroEstadoUsuario === 'suspendidos'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Suspendidos ({usuarios.filter((u) => u.baneadoHasta && new Date(u.baneadoHasta) > new Date()).length})
            </button>
          </div>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="pb-3 pr-4">Nombre</th>
                  <th className="pb-3 pr-4">Correo</th>
                  <th className="pb-3 pr-4">Teléfono</th>
                  <th className="pb-3 pr-4">Rol</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => {
                    const estaSuspendido = Boolean(u.baneadoHasta && new Date(u.baneadoHasta) > new Date());
                    return (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-4 font-semibold text-slate-900">{u.nombre}</td>
                        <td className="py-3 pr-4 text-slate-600">{u.correo}</td>
                        <td className="py-3 pr-4 text-slate-600">{u.telefono || '—'}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              u.rol === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {estaSuspendido ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 inline-block">
                                Suspendido hasta {new Date(u.baneadoHasta!).toLocaleDateString('es-PE')}
                              </span>
                              {u.motivoBaneo && (
                                <p className="text-[10px] text-rose-600 mt-0.5 italic max-w-xs truncate" title={u.motivoBaneo}>
                                  Motivo: {u.motivoBaneo}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {u.id === usuario?.id ? (
                            <span className="text-xs text-slate-400 italic">Tú</span>
                          ) : estaSuspendido ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuitarSuspension(u)}
                              className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 text-xs"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Levantar sanción
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setUsuarioParaSuspender(u);
                                setDiasSuspension(7);
                                setMotivoSuspension('');
                              }}
                              className="gap-1 text-xs font-semibold"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Suspender / Banear
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE SOLICITUD / PRUEBA PARA ADMIN */}
      {solicitudDetalle && (
        <Modal
          abierto={Boolean(solicitudDetalle)}
          alCerrar={() => setSolicitudDetalle(null)}
          titulo="Detalle de Solicitud de Reclamo"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Objeto</p>
                <h4 className="text-sm font-bold text-slate-900">{solicitudDetalle.objeto?.nombre}</h4>
              </div>
              <Badge estado={solicitudDetalle.estado} />
            </div>

            <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p><strong>Solicitante:</strong> {solicitudDetalle.solicitanteNombre}</p>
              {solicitudDetalle.solicitanteTelefono && (
                <p><strong>Teléfono / WhatsApp:</strong> {solicitudDetalle.solicitanteTelefono}</p>
              )}
              <p><strong>Fecha de solicitud:</strong> {formatFecha(solicitudDetalle.creadoEn)}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Declaración de pertenencia:</p>
              <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed italic">
                "{solicitudDetalle.pruebaPertenencia}"
              </p>
            </div>

            {solicitudDetalle.pruebaImagen && (
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">Fotografía de prueba / comprobante:</p>
                <a
                  href={solicitudDetalle.pruebaImagen}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-56 group relative"
                  title="Abrir imagen completa"
                >
                  <img
                    src={solicitudDetalle.pruebaImagen}
                    alt="Comprobante"
                    className="w-full h-full object-contain max-h-56 mx-auto"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                    Ver en tamaño completo ↗
                  </div>
                </a>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSolicitudDetalle(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL OCULTAR PUBLICACIÓN PARA MEJORAS */}
      {objetoParaOcultar && (
        <Modal
          abierto={Boolean(objetoParaOcultar)}
          alCerrar={() => setObjetoParaOcultar(null)}
          titulo="Ocultar publicación para que sea mejorada"
        >
          <div className="space-y-4 text-slate-800">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <EyeOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Ocultando: "{objetoParaOcultar.nombre}"
                </p>
                <p className="mt-0.5 text-amber-800">
                  Esta publicación dejará de verse en el catálogo público. Su autor recibirá una notificación automática con el motivo que ingreses abajo para que pueda editarla y mejorarla.
                </p>
              </div>
            </div>

            {/* Presets sugeridos */}
            <div>
              <span className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                Motivos frecuentes (haz clic para autocompletar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Fotografía borrosa o poco nítida; por favor adjunta una imagen más clara.',
                  'Falta especificar la ubicación exacta o pabellón del campus.',
                  'Descripción incompleta o ambigua; agrega más detalles para reconocerlo.',
                  'Contiene datos privados o números en el texto que deben ser retirados por seguridad.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMotivoOcultarPub(preset)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg border border-slate-200 transition-colors text-left"
                  >
                    + {preset.split(';')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo escrito */}
            <Textarea
              label="Motivo por el que se oculta (visible para el autor) *"
              placeholder="Indica qué necesita mejorar o corregir el usuario en su publicación..."
              value={motivoOcultarPub}
              onChange={(e) => setMotivoOcultarPub(e.target.value)}
              rows={3}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setObjetoParaOcultar(null)}
                disabled={procesandoOcultarPub}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleOcultarObjeto}
                cargando={procesandoOcultarPub}
                disabled={!motivoOcultarPub.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Confirmar y notificar al autor
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL SUSPENDER / BANEAR USUARIO */}
      {usuarioParaSuspender && (
        <Modal
          abierto={Boolean(usuarioParaSuspender)}
          alCerrar={() => setUsuarioParaSuspender(null)}
          titulo={`Suspender cuenta: ${usuarioParaSuspender.nombre}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>
                La suspensión impedirá que este usuario publique nuevos objetos o envíe solicitudes de reclamo durante el tiempo especificado.
              </p>
            </div>

            {/* Selector de días de baneo */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duración de la suspensión *
              </label>
              <select
                value={diasSuspension}
                onChange={(e) => setDiasSuspension(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value={3}>3 días — Advertencia por caso sospechoso</option>
                <option value={7}>7 días — Reporte o reclamo falso detectado</option>
                <option value={15}>15 días — Infracción reiterada de suplantación</option>
                <option value={30}>30 días — Sanción grave por conducta indebida</option>
                <option value={365}>1 año (365 días) — Baneo permanente por fraude</option>
              </select>
            </div>

            {/* Motivo de la suspensión */}
            <Textarea
              label="Motivo del baneo / justificación institucional *"
              placeholder="Ejemplo: Intento reiterado de reclamar objetos ajenos proporcionando datos falsos."
              value={motivoSuspension}
              onChange={(e) => setMotivoSuspension(e.target.value)}
              rows={3}
              required
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUsuarioParaSuspender(null)}
                disabled={procesandoSuspension}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSuspenderUsuario}
                cargando={procesandoSuspension}
                disabled={!motivoSuspension.trim()}
              >
                Confirmar suspensión
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
