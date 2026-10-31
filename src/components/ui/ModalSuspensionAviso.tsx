import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { ShieldAlert, AlertTriangle, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const ModalSuspensionAviso: React.FC = () => {
  const {
    estaSuspendido,
    motivoSuspension,
    fechaFinSuspension,
    mostrarModalSuspension,
    cerrarModalSuspension,
  } = useAuth();

  if (!estaSuspendido || !mostrarModalSuspension) return null;

  const fechaTexto = fechaFinSuspension
    ? new Date(fechaFinSuspension).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Próximo aviso';

  return (
    <Modal
      abierto={mostrarModalSuspension}
      alCerrar={cerrarModalSuspension}
      titulo="Aviso de Suspensión de Cuenta"
    >
      <div className="space-y-5 text-slate-800">
        {/* Cabecera con ícono de sanción */}
        <div className="flex items-start gap-3.5 p-4 bg-rose-50 border border-rose-200/80 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-950">
              Tu cuenta ha sido suspendida temporalmente
            </h3>
            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              La administración del sistema ha aplicado una restricción temporal a tu cuenta por infracción a las normas de uso o convivencia del campus.
            </p>
          </div>
        </div>

        {/* Motivo de la suspensión indicado por el admin */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Motivo indicado por la administración:
          </div>
          <p className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200/60 leading-relaxed">
            "{motivoSuspension || 'No se detalló un motivo específico.'}"
          </p>
        </div>

        {/* Vigencia */}
        <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl">
          <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Vigencia de la sanción:</strong> Hasta el{' '}
            <span className="font-bold text-amber-900">{fechaTexto}</span>. Al vencer la fecha, tu cuenta se reactivará automáticamente.
          </span>
        </div>

        {/* Qué puede y qué no puede hacer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1.5">
            <div className="font-bold text-red-900 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Funciones restringidas:
            </div>
            <ul className="list-disc list-inside text-red-800/90 space-y-1">
              <li>Publicar nuevos objetos</li>
              <li>Enviar solicitudes de reclamo</li>
              <li>Avisos de hallazgo directos</li>
            </ul>
          </div>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Funciones disponibles:
            </div>
            <ul className="list-disc list-inside text-emerald-800/90 space-y-1">
              <li>Explorar el catálogo</li>
              <li>Ver tus publicaciones previas</li>
              <li>Revisar tus notificaciones</li>
            </ul>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic text-center">
          Si consideras que esta sanción fue aplicada por error, acércate a la oficina de Asuntos Estudiantiles o contacta al administrador institucional.
        </p>

        {/* Botón de cierre */}
        <div className="pt-2 flex justify-end">
          <Button variant="primary" onClick={cerrarModalSuspension} className="w-full sm:w-auto">
            Entendido, continuar en modo restringido
          </Button>
        </div>
      </div>
    </Modal>
  );
};
