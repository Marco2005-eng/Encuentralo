import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  titulo: string;
  descripcion: string;
  accionTexto?: string;
  onAccion?: () => void;
  icono?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  titulo,
  descripcion,
  accionTexto,
  onAccion,
  icono,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200/90 rounded-3xl bg-slate-50/40 my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 border border-brand-100 shadow-2xs">
        {icono || <PackageOpen className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">{titulo}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{descripcion}</p>
      {accionTexto && onAccion && (
        <Button onClick={onAccion} variant="primary" className="shadow-sm">
          {accionTexto}
        </Button>
      )}
    </div>
  );
};