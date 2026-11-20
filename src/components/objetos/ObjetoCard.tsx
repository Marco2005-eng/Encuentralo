import React from 'react';
import { Link } from 'react-router-dom';
import type { Categoria, Objeto } from '@/types/models';
import { Badge } from '@/components/ui/Badge';
import { CATEGORIA_LABEL } from '@/lib/textos';
import { formatFecha } from '@/lib/fechas';
import {
  MapPin,
  Calendar,
  Laptop,
  FileText,
  Shirt,
  Watch,
  BookOpen,
  Key,
  Briefcase,
  Package,
} from 'lucide-react';

const CATEGORIA_ICONOS: Record<Categoria, React.ComponentType<{ className?: string }>> = {
  electronicos: Laptop,
  documentos: FileText,
  ropa: Shirt,
  accesorios: Watch,
  utiles: BookOpen,
  llaves: Key,
  mochilas: Briefcase,
  otros: Package,
};

export const ObjetoCard: React.FC<{ objeto: Objeto }> = ({ objeto }) => {
  const IconoCategoria = CATEGORIA_ICONOS[objeto.categoria] || Package;

  return (
    <Link
      to={`/objetos/${objeto.id}`}
      className="group card flex flex-col overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      {/* Imagen o Placeholder: vista integrada y natural sin bordes duros */}
      <div className="relative h-44 sm:h-52 w-full bg-slate-50/80 flex items-center justify-center overflow-hidden border-b border-slate-100">
        {objeto.imagen ? (
          <>
            {/* Fondo ambiental difuminado que se funde con el objeto */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-125 pointer-events-none"
              style={{ backgroundImage: `url(${objeto.imagen})` }}
              aria-hidden="true"
            />

            {/* Contenedor con máscara de difuminado radial */}
            <div
              className="relative z-10 w-full h-full flex items-center justify-center p-3 transition-transform duration-300 ease-out group-hover:scale-105"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 90% 90% at 50% 50%, black 70%, transparent 100%)',
                maskImage:
                  'radial-gradient(ellipse 90% 90% at 50% 50%, black 70%, transparent 100%)',
              }}
            >
              <img
                src={objeto.imagen}
                alt={`Fotografía de ${objeto.nombre}`}
                className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                loading="lazy"
              />
            </div>

            {/* Suave degradado inferior para fundir la imagen con la tarjeta */}
            <div
              className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white via-white/50 to-transparent z-10 pointer-events-none"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-slate-400 group-hover:text-brand-600 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
              <IconoCategoria className="w-7 h-7 stroke-[1.5]" />
            </div>
            <span className="text-[11px] font-semibold tracking-tight uppercase text-slate-400 group-hover:text-brand-700 transition-colors">
              {CATEGORIA_LABEL[objeto.categoria]}
            </span>
          </div>
        )}

        {/* Badges superiores sobre foto */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <Badge estado={objeto.estado} />
        </div>
        <div className="absolute top-2.5 right-2.5 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight text-slate-700 shadow-2xs border border-slate-200/80">
          {CATEGORIA_LABEL[objeto.categoria]}
        </div>
      </div>

      {/* Contenido con jerarquía tipográfica moderna */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors line-clamp-1 mb-1.5 [overflow-wrap:anywhere]">
            {objeto.nombre}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed [overflow-wrap:anywhere]">
            {objeto.descripcion}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium gap-2">
          <span className="flex items-center gap-1.5 truncate max-w-[58%]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{objeto.ubicacion}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatFecha(objeto.fecha)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};