import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NoEncontradoPage: React.FC = () => {
  return (
    <div className="container-app py-20 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-3">Página no encontrada</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-8">
        La ruta a la que intentas acceder no existe o fue movida.
      </p>
      <Link to="/">
        <Button variant="primary">Volver al inicio</Button>
      </Link>
    </div>
  );
};