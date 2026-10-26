import React from 'react';
import type { EstadoObjeto, EstadoSolicitud } from '@/types/models';
import { ESTADO_OBJETO_LABEL, ESTADO_SOLICITUD_LABEL } from '@/lib/textos';
import { SearchX, PackageCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

export type BadgeEstado = EstadoObjeto | EstadoSolicitud;

interface BadgeProps {
  estado: BadgeEstado;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ estado, className = '' }) => {
  const configs: Record<BadgeEstado, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    perdido: {
      label: ESTADO_OBJETO_LABEL.perdido,
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <SearchX className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    encontrado: {
      label: ESTADO_OBJETO_LABEL.encontrado,
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <PackageCheck className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    en_proceso: {
      label: ESTADO_OBJETO_LABEL.en_proceso,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    recuperado: {
      label: ESTADO_OBJETO_LABEL.recuperado,
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    pendiente: {
      label: ESTADO_SOLICITUD_LABEL.pendiente,
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    aprobada: {
      label: ESTADO_SOLICITUD_LABEL.aprobada,
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    rechazada: {
      label: ESTADO_SOLICITUD_LABEL.rechazada,
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5" aria-hidden="true" />,
    },
  };

  const config = configs[estado] || configs.perdido;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};