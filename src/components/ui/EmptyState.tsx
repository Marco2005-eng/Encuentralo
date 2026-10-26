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
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 my-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        {icono || <PackageOpen className="w-8 h-8" />}
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