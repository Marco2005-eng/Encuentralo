import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Objeto } from '@/types/models';
import type { SolicitudConObjeto } from '@/services/types';
import { formatFecha } from '@/lib/fechas';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useChat } from '@/context/ChatContext';
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  AlertCircle,
  MessageCircle,
  Scale,
} from 'lucide-react';

export const MisPublicacionesPage: React.FC = () => {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();
  const { abrirChat } = useChat();

  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [solicitudesMap, setSolicitudesMap] = useState<Record<string, SolicitudConObjeto[]>>({});
  const [cargando, setCargando] = useState(true);

  // Modal Rechazo
  const [solicitudParaRechazar, setSolicitudParaRechazar] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [enviandoRechazo, setEnviandoRechazo] = useState(false);

  // Modal Cotejo / Verificación Lado a Lado
  const [solicitudCotejo, setSolicitudCotejo] = useState<{
    solicitud: SolicitudConObjeto;
    objeto: Objeto;
  } | null>(null);

  // Filtros de solicitudes por cada objeto (objetoId -> filtro)
  const [filtroSolicitudes, setFiltroSolicitudes] = useState<
    Record<string, 'todas' | 'pendientes' | 'resueltas'>
  >({});

  const cargarPublicaciones = async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const pubs = await services.objetos.delUsuario(usuario.id);
      setObjetos(pubs);

      // Cargar solicitudes de cada publicación
      const map: Record<string, SolicitudConObjeto[]> = {};
      for (const obj of pubs) {
        const sols = await services.solicitudes.delObjeto(obj.id, usuario);
        map[obj.id] = sols;
      }
      setSolicitudesMap(map);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, [usuario]);

  const handleEliminar = async (id: string) => {
    if (!usuario) return;
    if (window.confirm('¿Seguro que deseas eliminar esta publicación? Se cancelarán las solicitudes pendientes asociadas.')) {
      try {
        await services.objetos.eliminar(id, usuario);
        mostrarToast('Publicación eliminada.', 'exito');
        cargarPublicaciones();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  const handleAprobarSolicitud = async (solicitudId: string) => {
    if (!usuario) return;
    if (window.confirm('¿Aprobar esta solicitud? El objeto se marcará como "Recuperado" y se cerrarán las demás solicitudes.')) {
      try {
        await services.solicitudes.aprobar(solicitudId, usuario);
        mostrarToast('Solicitud aprobada con éxito. El objeto fue marcado como Recuperado.', 'exito');
        cargarPublicaciones();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  const handleRechazarSolicitud = async () => {
    if (!usuario || !solicitudParaRechazar) return;
    if (!motivoRechazo.trim()) {
      mostrarToast('Por favor escribe un motivo de rechazo.', 'error');
      return;
    }
    setEnviandoRechazo(true);
    try {
      await services.solicitudes.rechazar(solicitudParaRechazar, motivoRechazo, usuario);
      mostrarToast('Solicitud rechazada.', 'info');
      setSolicitudParaRechazar(null);
      setMotivoRechazo('');
      cargarPublicaciones();
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
    } finally {
      setEnviandoRechazo(false);
    }
  };

  return (
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mis publicaciones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra los objetos que reportaste y revisa las solicitudes de recuperación recibidas.
          </p>
        </div>
        <Link to="/objetos/nuevo">
          <Button variant="primary">+ Nueva publicación</Button>
        </Link>
      </div>

      {cargando ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : objetos.length === 0 ? (
        <EmptyState
          titulo="No tienes publicaciones"
          descripcion="Aún no has reportado ningún objeto perdido o encontrado en la plataforma."
          accionTexto="Crear mi primer reporte"
          onAccion={() => (window.location.href = '/objetos/nuevo')}
        />
      ) : (
        <div className="space-y-6">
          {objetos.map((obj) => {
            return (
              <div key={obj.id} className="card p-5 sm:p-6 space-y-4">
                {/* Cabecera del objeto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <Badge estado={obj.estado} />
                    <h2 className="text-lg font-bold text-slate-900">
                      <Link to={`/objetos/${obj.id}`} className="hover:text-brand-600 transition-colors">
                        {obj.nombre}
                      </Link>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/objetos/${obj.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" /> Ver
                      </Button>
                    </Link>
                    <Link to={`/mis-publicaciones/${obj.id}/editar`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="w-4 h-4" /> Editar
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleEliminar(obj.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex flex-wrap gap-4">
                  <span><strong>Lugar:</strong> {obj.ubicacion}</span>
                  <span><strong>Fecha:</strong> {formatFecha(obj.fecha)}</span>
                </div>

                {/* Sección de solicitudes recibidas para este objeto */}
                {(() => {
                  const solicitudes = solicitudesMap[obj.id] || [];
                  const filtroActual = filtroSolicitudes[obj.id] || 'todas';
                  const pendientesCount = solicitudes.filter((s) => s.estado === 'pendiente').length;
                  const resueltasCount = solicitudes.filter((s) => s.estado !== 'pendiente').length;

                  const solicitudesFiltradas = solicitudes.filter((s) => {
                    if (filtroActual === 'pendientes') return s.estado === 'pendiente';
                    if (filtroActual === 'resueltas') return s.estado !== 'pendiente';
                    return true;
                  });

                  return (
                    <div className="mt-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                          {obj.tipo === 'perdido' ? 'Avisos de hallazgo recibidos' : 'Solicitudes de reclamo'} ({solicitudes.length})
                        </h3>

                        {/* Filtros rápidos si hay solicitudes */}
                        {solicitudes.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <button
                              type="button"
                              onClick={() => setFiltroSolicitudes((prev) => ({ ...prev, [obj.id]: 'todas' }))}
                              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                                filtroActual === 'todas'
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Todas ({solicitudes.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setFiltroSolicitudes((prev) => ({ ...prev, [obj.id]: 'pendientes' }))}
                              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                                filtroActual === 'pendientes'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Pendientes ({pendientesCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setFiltroSolicitudes((prev) => ({ ...prev, [obj.id]: 'resueltas' }))}
                              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                                filtroActual === 'resueltas'
                                  ? 'bg-slate-700 text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Resueltas ({resueltasCount})
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Alerta IHC: Prevención de errores con múltiples reclamantes */}
                      {pendientesCount > 1 && obj.estado !== 'recuperado' && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">
                              {obj.tipo === 'perdido'
                                ? `Hay ${pendientesCount} avisos de personas que afirman tener tu objeto`
                                : `Hay ${pendientesCount} personas reclamando este objeto`}
                            </p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              {obj.tipo === 'perdido'
                                ? 'Usa "Cotejar pruebas" para ver la foto y los detalles donde lo tienen antes de confirmar. Al confirmar al que tiene tu objeto real, los demás avisos se cerrarán.'
                                : 'Usa la herramienta "Cotejar pruebas" para comparar los detalles y fotos antes de decidir. Al aprobar al dueño legítimo, las demás solicitudes se marcarán como rechazadas de forma automática.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {solicitudesFiltradas.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          {solicitudes.length === 0
                            ? 'No has recibido avisos o solicitudes para este objeto.'
                            : 'No hay elementos en esta sección.'}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {solicitudesFiltradas.map((s) => (
                            <div
                              key={s.id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                            >
                              <div className="space-y-1.5 max-w-xl">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge estado={s.estado} />
                                  <span className="text-xs font-semibold text-slate-800">
                                    {obj.tipo === 'perdido' ? 'Encontrado por' : 'Reclamante'}: {s.solicitanteNombre || 'Usuario'}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    • {formatFecha(s.creadoEn)}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                  "{s.pruebaPertenencia}"
                                </p>
                                {s.pruebaImagen && (
                                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                                    <p className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                      <span>🧾 Foto de prueba / comprobante:</span>
                                    </p>
                                    <a
                                      href={s.pruebaImagen}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group relative block border rounded-lg overflow-hidden bg-white shadow-xs max-w-xs"
                                      title="Haz clic para ver la imagen en tamaño completo"
                                    >
                                      <img
                                        src={s.pruebaImagen}
                                        alt="Comprobante o foto de pertenencia"
                                        className="max-h-40 w-full object-contain group-hover:scale-105 transition-transform duration-200"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                                        Ver en tamaño completo ↗
                                      </div>
                                    </a>
                                  </div>
                                )}
                                {s.motivoRechazo && (
                                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                                    <strong>Motivo de rechazo:</strong> {s.motivoRechazo}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {/* Botón de Cotejo de Verificación */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSolicitudCotejo({ solicitud: s, objeto: obj })}
                                  className="gap-1.5 text-xs text-brand-700 bg-brand-50/80 border-brand-200 hover:bg-brand-100 font-semibold"
                                  title="Comparar fotos y detalles lado a lado"
                                >
                                  <Scale className="w-3.5 h-3.5 text-brand-600" /> Cotejar pruebas
                                </Button>

                                {s.estado === 'aprobada' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => abrirChat(s.id, obj.nombre)}
                                    className="bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 gap-1.5 text-xs font-semibold"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Coordinar Entrega
                                  </Button>
                                )}

                                {s.estado === 'pendiente' && obj.estado !== 'recuperado' && (
                                  <>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleAprobarSolicitud(s.id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      {obj.tipo === 'perdido' ? '¡Es mi objeto!' : 'Aprobar'}
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => {
                                        setSolicitudParaRechazar(s.id);
                                        setMotivoRechazo('');
                                      }}
                                      className="gap-1 text-xs"
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Rechazo con Motivo Obligatorio (IHC regla 4) */}
      <Modal
        abierto={Boolean(solicitudParaRechazar)}
        alCerrar={() => setSolicitudParaRechazar(null)}
        titulo="Rechazar solicitud de recuperación"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Indica al solicitante por qué los datos de pertenencia no corresponden con el objeto para mantener la transparencia.
            </p>
          </div>

          <Textarea
            label="Motivo del rechazo"
            placeholder="Ejemplo: Las características indicadas no corresponden al modelo o color del objeto encontrado."
            rows={3}
            required
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setSolicitudParaRechazar(null)}
              disabled={enviandoRechazo}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRechazarSolicitud}
              cargando={enviandoRechazo}
            >
              Confirmar rechazo
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Cotejo de Verificación Lado a Lado (IHC) */}
      {solicitudCotejo && (
        <Modal
          abierto={Boolean(solicitudCotejo)}
          alCerrar={() => setSolicitudCotejo(null)}
          titulo="Cotejo de Verificación de Pertenencia"
          anchoMax="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-start gap-2">
              <Scale className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p>
                Compara lado a lado los datos del objeto publicado con las pruebas proporcionadas por el reclamante para verificar que realmente sea el propietario.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna Izquierda: Objeto Publicado */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tu publicación original
                </span>
                <h4 className="text-sm font-bold text-slate-900">{solicitudCotejo.objeto.nombre}</h4>
                {solicitudCotejo.objeto.imagen ? (
                  <div className="h-44 w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                    <img
                      src={solicitudCotejo.objeto.imagen}
                      alt={solicitudCotejo.objeto.nombre}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-44 w-full rounded-lg border border-dashed border-slate-200 bg-white flex items-center justify-center text-xs text-slate-400">
                    Sin fotografía publicada
                  </div>
                )}
                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Lugar:</strong> {solicitudCotejo.objeto.ubicacion}</p>
                  <p><strong>Fecha:</strong> {formatFecha(solicitudCotejo.objeto.fecha)}</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-3">
                    {solicitudCotejo.objeto.descripcion}
                  </p>
                </div>
              </div>

              {/* Columna Derecha: Pruebas del Reclamante */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Prueba del Reclamante
                  </span>
                  <Badge estado={solicitudCotejo.solicitud.estado} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {solicitudCotejo.solicitud.solicitanteNombre || 'Usuario'}
                </h4>
                {solicitudCotejo.solicitud.pruebaImagen ? (
                  <a
                    href={solicitudCotejo.solicitud.pruebaImagen}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block h-44 w-full rounded-lg overflow-hidden border border-emerald-200 bg-white"
                    title="Clic para ver en tamaño completo"
                  >
                    <img
                      src={solicitudCotejo.solicitud.pruebaImagen}
                      alt="Comprobante presentado"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      Ver en tamaño completo ↗
                    </div>
                  </a>
                ) : (
                  <div className="h-44 w-full rounded-lg border border-dashed border-emerald-200 bg-white flex items-center justify-center text-xs text-slate-400">
                    No adjuntó fotografía
                  </div>
                )}
                <div className="text-xs text-slate-700">
                  <p className="font-semibold mb-0.5">Detalles y señas particulares:</p>
                  <p className="text-[11px] bg-white p-2 rounded-lg border border-emerald-100 italic">
                    "{solicitudCotejo.solicitud.pruebaPertenencia}"
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSolicitudCotejo(null)}
              >
                Cerrar cotejo
              </Button>
              {solicitudCotejo.solicitud.estado === 'pendiente' && solicitudCotejo.objeto.estado !== 'recuperado' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const id = solicitudCotejo.solicitud.id;
                      setSolicitudCotejo(null);
                      setSolicitudParaRechazar(id);
                      setMotivoRechazo('');
                    }}
                    className="gap-1 text-xs"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Rechazar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      const id = solicitudCotejo.solicitud.id;
                      setSolicitudCotejo(null);
                      await handleAprobarSolicitud(id);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar Dueño y Aprobar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};