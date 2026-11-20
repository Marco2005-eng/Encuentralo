import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { services } from '@/services';
import type { Objeto } from '@/types/models';
import { CATEGORIAS } from '@/lib/textos';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Compass,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Building,
  Utensils,
  CheckCircle2,
  PackageCheck,
  Laptop,
  FileText,
  Shirt,
  Watch,
  BookOpen,
  Key,
  Briefcase,
  Package,
} from 'lucide-react';
import { useAyuda } from '@/context/AyudaContext';
import { PASOS_PERDI } from '@/lib/ayudaContenido';

const ICONOS_CATEGORIA: Record<string, React.ComponentType<{ className?: string }>> = {
  electronicos: Laptop,
  documentos: FileText,
  ropa: Shirt,
  accesorios: Watch,
  utiles: BookOpen,
  llaves: Key,
  mochilas: Briefcase,
  otros: Package,
};

export const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const { abrirAyuda } = useAyuda();
  const [busqueda, setBusqueda] = useState('');
  const [recientes, setRecientes] = useState<Objeto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRecientes = async () => {
      try {
        const datos = await services.objetos.listar({ orden: 'recientes' });
        // Priorizar objetos activos (perdido y encontrado) antes de resueltos
        const activos = datos.filter((o) => o.estado === 'perdido' || o.estado === 'encontrado');
        const enProceso = datos.filter((o) => o.estado === 'en_proceso');
        const recuperados = datos.filter((o) => o.estado === 'recuperado');
        const ordenados = [...activos, ...enProceso, ...recuperados];
        setRecientes(ordenados.slice(0, 8));
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
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Section Moderno y Atmosférico */}
      <section className="hero-bg hero-grid text-white py-16 sm:py-24 relative overflow-hidden border-b border-slate-800/80">
        <div className="container-app text-center max-w-3xl flex flex-col items-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-semibold tracking-tight border border-white/15 shadow-2xs mb-6">
            <Compass className="w-4 h-4 text-brand-300" />
            <span>Comunidad Universitaria • Campus Seguro</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            ¿Perdiste o encontraste algo en el campus?
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
            Conectamos a estudiantes y personal para registrar, verificar y recuperar pertenencias de forma rápida, privada y segura.
          </p>

          {/* Buscador Destacado con Microinteracción */}
          <form
            onSubmit={handleBuscar}
            className="w-full max-w-xl flex items-center gap-2 p-2 rounded-2xl bg-white shadow-2xl mb-8 border border-slate-100 focus-within:ring-4 focus-within:ring-brand-500/20 transition-all duration-200"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Busca por nombre, categoría o lugar..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-3 py-2 text-slate-900 bg-transparent text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="shrink-0 shadow-sm">
              Buscar
            </Button>
          </form>

          {/* Botones Grandes Principales: Jerarquía clara (Primario vs Secundario) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link to="/objetos/nuevo?tipo=perdido" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:min-w-[210px] shadow-lg shadow-brand-900/40 font-bold px-7 gap-2.5"
              >
                <Search className="w-5 h-5" />
                Perdí algo
              </Button>
            </Link>
            <Link to="/objetos/nuevo?tipo=encontrado" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:min-w-[210px] bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-950 shadow-lg font-bold px-7 gap-2.5 border border-white/20"
              >
                <PackageCheck className="w-5 h-5 text-brand-600" />
                Encontré algo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accesos Rápidos por Categoría con Iconos */}
      <section className="container-app">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Explorar por categoría
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Filtra rápidamente por el tipo de artículo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {CATEGORIAS.map((cat) => {
            const Icono = ICONOS_CATEGORIA[cat.value] || Package;
            return (
              <Link
                key={cat.value}
                to={`/objetos?categoria=${cat.value}`}
                className="card p-3.5 flex flex-col items-center justify-center text-center gap-2 hover:border-brand-500/80 hover:shadow-card-hover transition-all duration-200 group active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-brand-50 text-slate-600 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <Icono className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <span className="font-semibold text-xs text-slate-700 group-hover:text-brand-700 transition-colors">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Publicados Recientemente */}
      <section className="container-app">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Publicados recientemente
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Últimos avisos reportados en la institución
            </p>
          </div>
          <Link
            to="/objetos"
            className="text-brand-600 hover:text-brand-700 font-semibold text-xs sm:text-sm flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Ver todos los objetos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {recientes.map((obj) => (
              <ObjetoCard key={obj.id} objeto={obj} />
            ))}
          </div>
        )}
      </section>

      {/* Cómo funciona (3 pasos) */}
      <section className="container-app py-4">
        <div className="rounded-3xl bg-gradient-to-b from-indigo-50/70 to-slate-50 border border-indigo-100/80 p-6 sm:p-10 text-center shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            ¿Cómo funciona Encuéntralo?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed">
            En tres sencillos pasos puedes reportar, verificar y recuperar tus pertenencias con total seguridad.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {PASOS_PERDI.map((paso) => (
              <div
                key={paso.numero}
                className="card p-6 bg-white border-slate-200/80 flex flex-col justify-between hover:border-brand-300 hover:shadow-card-hover transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center mb-4 border border-brand-100 shadow-2xs">
                    {paso.numero}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight">
                    {paso.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {paso.descripcion}
                  </p>
                </div>
                {paso.consejo && (
                  <p className="text-xs text-slate-500 font-medium pt-3 mt-4 border-t border-slate-100">
                    💡 {paso.consejo}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-indigo-100/70 text-center text-xs text-slate-600">
            <span>¿Tienes dudas sobre el proceso? Revisa las </span>
            <button
              type="button"
              onClick={() => abrirAyuda('perdi')}
              className="text-brand-700 font-bold hover:underline focus:outline-none focus:ring-1 focus:ring-brand-500 rounded px-1"
            >
              preguntas frecuentes y guía completa &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Puntos Oficiales y Seguros */}
      <section className="container-app py-4">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-100 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span>Recomendaciones del Campus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Puntos oficiales y seguros para coordinar devoluciones
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Para la tranquilidad de todos, recomendamos siempre realizar la entrega física en lugares públicos, iluminados y con presencia de personal de apoyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Caseta de Vigilancia */}
          <div className="card p-6 bg-white hover:border-slate-300 hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                Caseta de Vigilancia Central
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Puerta Principal • Disponible 24/7
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                El punto más neutral y seguro del campus. Los documentos de identidad, carnés universitarios y artículos de alto valor deben entregarse aquí. También puedes dejar el objeto en custodia si no coinciden en horario.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-rose-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Oficial para documentos y valor
            </div>
          </div>

          {/* 2. Mostrador de Biblioteca */}
          <div className="card p-6 bg-white hover:border-slate-300 hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-2xs">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                Mostrador de Biblioteca Central
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Edificio A • Lunes a Sábados
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ideal para entrega de útiles, mochilas, calculadoras científicas, cuadernos o laptops. Cuenta con mesas iluminadas para revisar el objeto con calma antes de cerrar el caso.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-sky-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zona tranquila y vigilada
            </div>
          </div>

          {/* 3. Comedor */}
          <div className="card p-6 bg-white hover:border-slate-300 hover:shadow-card-hover transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100 shadow-2xs">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1 tracking-tight">
                Comedor Universitario
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Pabellón Central • Zona abierta
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Zona concurrida, amplia y visible, ideal para entregas a plena vista durante el día. Recomendada para coordinar devoluciones rápidas y públicas entre clases.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zona concurrida a plena vista
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};