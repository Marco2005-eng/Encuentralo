import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Objeto, Solicitud } from '@/types/models';
import { CATEGORIA_LABEL, PRIVACIDAD_PUBLICADOR } from '@/lib/textos';
import { formatFecha, formatFechaHora } from '@/lib/fechas';
import { solicitudSchema, type SolicitudValues } from '@/lib/validaciones';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Edit,
  Trash2,
} from 'lucide-react';

export const DetalleObjetoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [solicitudActiva, setSolicitudActiva] = useState<Solicitud | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudValues>({
    resolver: zodResolver(solicitudSchema),
  });

  const cargarDatos = async () => {
    if (!id) return;
    setCargando(true);
    try {
      const data = await services.objetos.obtener(id);
      setObjeto(data);

      if (usuario && data) {
        const miSol = await services.solicitudes.miSolicitudActiva(data.id, usuario.id);
        setSolicitudActiva(miSol);
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id, usuario]);

  const handleEnviarSolicitud = async (valores: SolicitudValues) => {
    if (!usuario || !objeto) return;
    try {
      const nueva = await services.solicitudes.crear(objeto.id, valores.pruebaPertenencia, usuario);
      setSolicitudActiva(nueva);
      mostrarToast('¡Solicitud de recuperación enviada exitosamente!', 'exito');
      setModalAbierto(false);
      reset();
      cargarDatos();
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
      else mostrarToast('No se pudo enviar la solicitud.', 'error');
    }
  };

  const handleEliminar = async () => {
    if (!usuario || !objeto) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.')) {
      try {
        await services.objetos.eliminar(objeto.id, usuario);
        mostrarToast('Publicación eliminada correctamente.', 'exito');
        navigate('/objetos');
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  if (cargando) {
    return (
      <div className="container-app py-10 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!objeto) {
    return (
      <div className="container-app py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Objeto no encontrado</h2>
        <p className="text-slate-500 mb-6">El objeto que buscas ha sido eliminado o no existe.</p>
        <Link to="/objetos">
          <Button variant="primary">Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  const esAutor = usuario?.id === objeto.publicadoPor;
  const esAdmin = usuario?.rol === 'admin';
  const puedeEditar = esAutor || esAdmin;

  return (
    <div className="container-app py-8 max-w-4xl">
      {/* Botón Volver */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        {puedeEditar && (
          <div className="flex gap-2">
            <Link to={`/mis-publicaciones/${objeto.id}/editar`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit className="w-4 h-4" /> Editar
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={handleEliminar} className="gap-1.5">
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 card p-6 sm:p-8">
        {/* Imagen o Placeholder */}
        <div className="flex flex-col gap-3">
          <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {objeto.imagen ? (
              <img
                src={objeto.imagen}
                alt={objeto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <ImageIcon className="w-16 h-16 stroke-1" />
                <span className="text-sm font-medium">Sin imagen adjunta</span>
              </div>
            )}
          </div>
          {/* Protección de privacidad visible (IHC sección 9) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
            <span>{PRIVACIDAD_PUBLICADOR}</span>
          </div>
        </div>

        {/* Información y Acciones */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge estado={objeto.estado} />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {CATEGORIA_LABEL[objeto.categoria]}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {objeto.nombre}
            </h1>

            <div className="space-y-2 text-sm text-slate-600 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Ubicación:</span>
                <span>{objeto.ubicacion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Fecha del suceso:</span>
                <span>{formatFecha(objeto.fecha)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Registrado el {formatFechaHora(objeto.creadoEn)}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">Descripción:</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {objeto.descripcion}
              </p>
            </div>
          </div>

          {/* Botón o Estado de Reclamación */}
          <div className="pt-6 border-t border-slate-100 mt-6">
            {objeto.estado === 'recuperado' ? (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-semibold">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                Este objeto ya fue devuelto a su dueño verificado.
              </div>
            ) : esAutor ? (
              <div className="p-3.5 bg-brand-50 text-brand-800 border border-brand-200 rounded-xl text-sm">
                Tú eres el autor de esta publicación.{' '}
                <Link to="/mis-publicaciones" className="font-bold underline">
                  Gestiona las solicitudes recibidas aquí.
                </Link>
              </div>
            ) : solicitudActiva ? (
              <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Tienes una solicitud enviada ({solicitudActiva.estado})
                </div>
                <p className="text-xs text-amber-800">
                  El responsable está verificando la información que proporcionaste. Te notificaremos cualquier cambio.
                </p>
              </div>
            ) : !usuario ? (
              <Link to="/iniciar-sesion" state={{ from: { pathname: `/objetos/${objeto.id}` } }}>
                <Button variant="primary" className="w-full">
                  Iniciar sesión para solicitar recuperación
                </Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-md"
                onClick={() => setModalAbierto(true)}
              >
                Solicitar recuperación de este objeto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Solicitud de Pertenencia (IHC 7.5) */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Acreditar que el objeto es tuyo"
      >
        <form onSubmit={handleSubmit(handleEnviarSolicitud)} className="space-y-4">
          <div className="flex items-start gap-2.5 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            <HelpCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              Para evitar fraudes y proteger al propietario original, describe detalles específicos (rayones, contenido de bolsillos, pegatinas, fondo de pantalla, marcas distintivas).
            </p>
          </div>

          <Textarea
            label="Detalles de pertenencia"
            rows={5}
            placeholder="Ejemplo: La mochila tiene una mancha azul pequeña en la correa derecha y dentro guardaba una libreta con espiral rojo..."
            required
            error={errors.pruebaPertenencia?.message}
            ayuda="Mínimo 20 caracteres. Sé lo más preciso posible."
            {...register('pruebaPertenencia')}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" cargando={isSubmitting}>
              Enviar solicitud
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};