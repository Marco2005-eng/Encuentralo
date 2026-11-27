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
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-indigo-200 rounded-3xl bg-indigo-50/60 my-6">
      <div className="relative w-24 h-24 rounded-full border-8 border-white shadow-sm bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
        {icono || <PackageOpen className="w-12 h-12" strokeWidth={1.25} aria-hidden="true" />}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{titulo}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{descripcion}</p>
      {accionTexto && onAccion && (
        <Button onClick={onAccion} variant="primary">
          {accionTexto}
        </Button>
      )}
    </div>
  );
};