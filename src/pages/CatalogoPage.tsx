import React, { useState, useEffect, useTransition } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { services } from '@/services';
import type { Categoria, EstadoObjeto, Objeto, TipoReporte } from '@/types/models';
import { CATEGORIAS, ESTADO_OBJETO_LABEL } from '@/lib/textos';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Search, Filter, X, PlusCircle } from 'lucide-react';

export const CatalogoPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [, startTransition] = useTransition();

  // Estados leídos de la URL
  const qParam = searchParams.get('q') || '';
  const catParam = (searchParams.get('categoria') as Categoria) || '';
  const estParam = (searchParams.get('estado') as EstadoObjeto) || '';
  const tipoParam = (searchParams.get('tipo') as TipoReporte) || '';
  const ordenParam = (searchParams.get('orden') as 'recientes' | 'antiguos') || 'recientes';

  const [textoBusqueda, setTextoBusqueda] = useState(qParam);
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [cargando, setCargando] = useState(true);

  // Debounce para actualizar URL al tipear
  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        setSearchParams((prev) => {
          const nuevo = new URLSearchParams(prev);
          if (textoBusqueda.trim()) nuevo.set('q', textoBusqueda.trim());
          else nuevo.delete('q');
          return nuevo;
        });
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [textoBusqueda, setSearchParams]);

  // Cargar objetos cuando cambien los parámetros de búsqueda
  useEffect(() => {
    const fetchObjetos = async () => {
      setCargando(true);
      try {
        const datos = await services.objetos.listar({
          q: qParam || undefined,
          categoria: catParam || undefined,
          estado: estParam || undefined,
          tipo: tipoParam || undefined,
          orden: ordenParam,
        });
        setObjetos(datos);
      } finally {
        setCargando(false);
      }
    };
    fetchObjetos();
  }, [qParam, catParam, estParam, tipoParam, ordenParam]);

  const actualizarFiltro = (clave: string, valor: string) => {
    setSearchParams((prev) => {
      const nuevo = new URLSearchParams(prev);
      if (valor) nuevo.set(clave, valor);
      else nuevo.delete(clave);
      return nuevo;
    });
  };

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    setSearchParams({});
  };

  const hayFiltrosActivos = Boolean(qParam || catParam || estParam || tipoParam || ordenParam !== 'recientes');

  return (
    <div className="container-app py-8">
      {/* Encabezado y búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Catálogo de objetos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explora las pertenencias reportadas en el campus
          </p>
        </div>
        <Link to="/objetos/nuevo">
          <Button variant="primary" className="shadow-sm gap-2">
            <PlusCircle className="w-4 h-4" />
            Publicar reporte
          </Button>
        </Link>
      </div>

      {/* Barra de Filtros y Buscador */}
      <div className="card p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Input Buscador */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            />
          </div>

          {/* Filtro Categoría */}
          <select
            value={catParam}
            onChange={(e) => actualizarFiltro('categoria', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Filtro Tipo / Estado */}
          <select
            value={estParam}
            onChange={(e) => actualizarFiltro('estado', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_OBJETO_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* Orden */}
          <select
            value={ordenParam}
            onChange={(e) => actualizarFiltro('orden', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            aria-label="Ordenar publicaciones"
          >
            <option value="recientes">Más recientes primero</option>
            <option value="antiguos">Más antiguos primero</option>
          </select>
        </div>

        {/* Chips de filtros activos (IHC 7.3) */}
        {hayFiltrosActivos && (
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtros:
            </span>
            {qParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-brand-50 text-brand-700 font-medium">
                "{qParam}"
                <button
                  type="button"
                  onClick={() => {
                    setTextoBusqueda('');
                    actualizarFiltro('q', '');
                  }}
                  className="hover:text-brand-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {catParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                Cat: {CATEGORIAS.find((c) => c.value === catParam)?.label}
                <button
                  type="button"
                  onClick={() => actualizarFiltro('categoria', '')}
                  className="hover:text-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {estParam && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 font-medium">
                Estado: {ESTADO_OBJETO_LABEL[estParam]}
                <button
                  type="button"
                  onClick={() => actualizarFiltro('estado', '')}
                  className="hover:text-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-auto"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Resultados */}
      {cargando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : objetos.length === 0 ? (
        <EmptyState
          titulo="No se encontraron objetos"
          descripcion={
            hayFiltrosActivos
              ? 'No hay publicaciones que coincidan con los filtros aplicados. Intenta cambiar de categoría o borrar el texto de búsqueda.'
              : 'Aún no se ha registrado ningún objeto en la plataforma.'
          }
          accionTexto={hayFiltrosActivos ? 'Limpiar filtros' : 'Reportar un objeto'}
          onAccion={hayFiltrosActivos ? limpiarFiltros : () => (window.location.href = '/objetos/nuevo')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {objetos.map((obj) => (
            <ObjetoCard key={obj.id} objeto={obj} />
          ))}
        </div>
      )}
    </div>
  );
};