import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { services } from '@/services';
import type { Objeto } from '@/types/models';
import { CATEGORIAS } from '@/lib/textos';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Search, Compass, ArrowRight } from 'lucide-react';

export const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [recientes, setRecientes] = useState<Objeto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRecientes = async () => {
      try {
        const datos = await services.objetos.listar({ orden: 'recientes' });
        setRecientes(datos.slice(0, 8));
      } finally {
        setCargando(false);
      }
    };
    cargarRecientes();
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/objetos?q=${encodeURIComponent(busqueda.trim())}`);
    } else {
      navigate('/objetos');
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="hero-bg text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="container-app text-center max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-100 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/15">
            <Compass className="w-4 h-4" /> Comunidad Educativa Segura
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            ¿Perdiste o encontraste algo en el campus?
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 mb-8 leading-relaxed max-w-2xl">
            Conectamos a estudiantes y personal para devolver pertenencias de forma rápida, segura y transparente.
          </p>

          {/* Buscador Destacado */}
          <form onSubmit={handleBuscar} className="w-full max-w-xl flex gap-2 p-2 rounded-2xl bg-white shadow-2xl mb-8">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Busca por nombre, categoría o lugar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-2 text-slate-900 bg-transparent text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="shrink-0">
              Buscar
            </Button>
          </form>

          {/* Botones Grandes Principales (IHC 7.1) */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/objetos/nuevo?tipo=perdido">
              <Button
                variant="danger"
                size="lg"
                className="shadow-lg shadow-rose-950/20 font-bold px-8 min-w-[200px]"
              >
                Perdí algo
              </Button>
            </Link>
            <Link to="/objetos/nuevo?tipo=encontrado">
              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-950/20 font-bold px-8 min-w-[200px]"
              >
                Encontré algo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accesos Rápidos por Categoría */}
      <section className="container-app">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center sm:text-left">
          Explorar por categoría
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.value}
              to={`/objetos?categoria=${cat.value}`}
              className="card p-4 flex flex-col items-center justify-center text-center gap-2 hover:border-brand-500 hover:text-brand-600 transition-all duration-200 group"
            >
              <span className="font-semibold text-sm group-hover:scale-105 transition-transform">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Publicados Recientemente */}
      <section className="container-app">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Publicados recientemente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Últimos avisos reportados en la institución
            </p>
          </div>
          <Link
            to="/objetos"
            className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex items-center gap-1 group"
          >
            Ver todos los objetos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recientes.map((obj) => (
              <ObjetoCard key={obj.id} objeto={obj} />
            ))}
          </div>
        )}
      </section>

      {/* Cómo funciona (3 pasos) */}
      <section className="container-app py-6">
        <div className="rounded-3xl bg-indigo-50/60 border border-indigo-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¿Cómo funciona Encuéntralo?</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-10">
            En tres sencillos pasos puedes reportar, verificar y recuperar tus pertenencias.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="card p-6 bg-white flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Publica el reporte</h3>
              <p className="text-sm text-slate-600">
                Registra el objeto indicando sus características básicas y lugar aproximado sin datos personales.
              </p>
            </div>
            <div className="card p-6 bg-white flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Acredita tu pertenencia</h3>
              <p className="text-sm text-slate-600">
                El dueño envía detalles específicos y privados que solo él podría conocer para validar su identidad.
              </p>
            </div>
            <div className="card p-6 bg-white flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Entrega confirmada</h3>
              <p className="text-sm text-slate-600">
                Una vez aprobada la solicitud, coordinan la entrega en un punto seguro del campus y se cierra el caso.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};