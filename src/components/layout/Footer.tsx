import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-slate-600">
      <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Compass className="h-5 w-5 text-brand-600" />
          <span>Encuéntralo — Sistema de Objetos Perdidos y Encontrados</span>
        </div>
        <p className="flex items-center gap-1 text-slate-500 text-xs sm:text-sm">
          Encuentra y recupera lo que perdiste en el campus
        </p>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <Link to="/objetos" className="hover:text-brand-600">
            Catálogo
          </Link>
          <Link to="/iniciar-sesion" className="hover:text-brand-600">
            Acceso
          </Link>
        </div>
      </div>
    </footer>
  );
};