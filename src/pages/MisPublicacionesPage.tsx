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
import { Edit, Trash2, CheckCircle2, XCircle, Eye, MessageSquare, AlertCircle } from 'lucide-react';

export const MisPublicacionesPage: React.FC = () => {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [solicitudesMap, setSolicitudesMap] = useState<Record<string, SolicitudConObjeto[]>>({});
  const [cargando, setCargando] = useState(true);

  // Modal Rechazo
  const [solicitudParaRechazar, setSolicitudParaRechazar] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [enviandoRechazo, setEnviandoRechazo] = useState(false);

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
            const solicitudes = solicitudesMap[obj.id] || [];
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
                <div className="mt-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                    Solicitudes de reclamo ({solicitudes.length})
                  </h3>

                  {solicitudes.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No has recibido solicitudes para este objeto.</p>
                  ) : (
                    <div className="space-y-3">
                      {solicitudes.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center gap-2">
                              <Badge estado={s.estado} />
                              <span className="text-xs font-semibold text-slate-700">
                                Reclamante: {s.solicitanteNombre || 'Usuario'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                              "{s.pruebaPertenencia}"
                            </p>
                            {s.motivoRechazo && (
                              <p className="text-xs text-rose-600">
                                <strong>Motivo de rechazo:</strong> {s.motivoRechazo}
                              </p>
                            )}
                          </div>

                          {s.estado === 'pendiente' && obj.estado !== 'recuperado' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAprobarSolicitud(s.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-1 text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
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
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
    </div>
  );
};