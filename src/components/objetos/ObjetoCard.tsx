import React from 'react';
import { Link } from 'react-router-dom';
import type { Objeto } from '@/types/models';
import { Badge } from '@/components/ui/Badge';
import { CATEGORIA_LABEL } from '@/lib/textos';
import { formatFecha } from '@/lib/fechas';
import { MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

export const ObjetoCard: React.FC<{ objeto: Objeto }> = ({ objeto }) => {
  return (
    <Link
      to={`/objetos/${objeto.id}`}
      className="group card flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
    >
      {/* Imagen o Placeholder */}
      <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {objeto.imagen ? (
          <img
            src={objeto.imagen}
            alt={`Fotografía de ${objeto.nombre}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImageIcon className="w-10 h-10 stroke-1" />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge estado={objeto.estado} />
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
          {CATEGORIA_LABEL[objeto.categoria]}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5">
            {objeto.nombre}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {objeto.descripcion}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 truncate max-w-[55%]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{objeto.ubicacion}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatFecha(objeto.fecha)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};