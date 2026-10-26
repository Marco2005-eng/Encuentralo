import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { SolicitudConObjeto } from '@/services/types';
import { formatFechaHora } from '@/lib/fechas';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Inbox, ExternalLink, XCircle, Phone, MessageCircle } from 'lucide-react';

export const MisSolicitudesPage: React.FC = () => {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [solicitudes, setSolicitudes] = useState<SolicitudConObjeto[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarSolicitudes = async () => {
    if (!usuario) return;
    setCargando(true);
    try {
      const data = await services.solicitudes.delSolicitante(usuario.id);
      setSolicitudes(data);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, [usuario]);

  const handleCancelar = async (id: string) => {
    if (!usuario) return;
    if (window.confirm('¿Seguro que deseas cancelar esta solicitud?')) {
      try {
        await services.solicitudes.cancelar(id, usuario);
        mostrarToast('Solicitud cancelada correctamente.', 'info');
        cargarSolicitudes();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mis solicitudes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Estado y seguimiento de tus reclamos de pertenencia enviados a otros usuarios.
        </p>
      </div>

      {cargando ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : solicitudes.length === 0 ? (
        <EmptyState
          titulo="Sin solicitudes enviadas"
          descripcion="Aún no has reclamado ningún objeto. Si encuentras algo que te pertenezca en el catálogo, puedes solicitar su recuperación."
          accionTexto="Explorar catálogo"
          onAccion={() => (window.location.href = '/objetos')}
          icono={<Inbox className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          {solicitudes.map((s) => (
            <div key={s.id} className="card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <Badge estado={s.estado} />
                  <span className="text-xs text-slate-400">
                    Enviada el {formatFechaHora(s.creadoEn)}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {s.objeto ? (
                    <Link
                      to={`/objetos/${s.objeto.id}`}
                      className="hover:text-brand-600 transition-colors inline-flex items-center gap-1.5"
                    >
                      {s.objeto.nombre}
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Link>
                  ) : (
                    <span>Objeto no disponible</span>
                  )}
                </h3>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                  <p>
                    <strong className="text-slate-700">Tu prueba de pertenencia:</strong> "{s.pruebaPertenencia}"
                  </p>
                  {s.motivoRechazo && (
                    <p className="text-rose-700 font-medium">
                      <strong>Motivo de rechazo:</strong> {s.motivoRechazo}
                    </p>
                  )}
                  {s.estado === 'aprobada' && s.publicadorTelefono && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2 text-emerald-900">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-emerald-700" /> Contacto del responsable: {s.publicadorTelefono}
                      </span>
                      <a
                        href={`https://wa.me/${s.publicadorTelefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Botón cancelar si está pendiente */}
              {s.estado === 'pendiente' && (
                <div className="shrink-0 flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelar(s.id)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Cancelar solicitud
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};