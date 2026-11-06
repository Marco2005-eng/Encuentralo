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
      {/* Imagen o Placeholder: vista integrada y natural sin bordes duros */}
      <div className="relative h-48 sm:h-52 w-full bg-slate-50/70 flex items-center justify-center overflow-hidden">
        {objeto.imagen ? (
          <>
            {/* Fondo ambiental difuminado que se funde con el objeto */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${objeto.imagen})` }}
              aria-hidden="true"
            />

            {/* Contenedor con máscara de difuminado radial en el contorno: elimina las líneas duras rectangulares */}
            <div
              className="relative z-10 w-full h-full flex items-center justify-center p-3 transition-transform duration-300 group-hover:scale-105"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 88% 88% at 50% 50%, black 65%, transparent 100%)',
                maskImage:
                  'radial-gradient(ellipse 88% 88% at 50% 50%, black 65%, transparent 100%)',
              }}
            >
              <img
                src={objeto.imagen}
                alt={`Fotografía de ${objeto.nombre}`}
                className="max-h-full max-w-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>

            {/* Suave degradado inferior para fundir la imagen directamente con el cuerpo blanco de la tarjeta */}
            <div
              className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white via-white/50 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <ImageIcon className="w-10 h-10 stroke-1" />
            <span className="text-xs font-medium">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 z-20">
          <Badge estado={objeto.estado} />
        </div>
        <div className="absolute top-2.5 right-2.5 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm border border-slate-200/60">
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