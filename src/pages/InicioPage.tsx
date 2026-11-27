import React, { useEffect, useState, useTransition } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { services } from '@/services';
import type { Objeto } from '@/types/models';
import { CATEGORIAS } from '@/lib/textos';
import { ObjetoCard } from '@/components/objetos/ObjetoCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoriaAcceso } from '@/components/objetos/CategoriaAcceso';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  Search,
  SearchX,
  PackageCheck,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Building,
  Utensils,
  CheckCircle2,
} from 'lucide-react';
import { useAyuda } from '@/context/AyudaContext';
import { PASOS_PERDI } from '@/lib/ayudaContenido';

export const InicioPage: React.FC = () => {
  const navigate = useNavigate();
  const { abrirAyuda } = useAyuda();
  const [busqueda, setBusqueda] = useState('');
  const [buscando, startSearchTransition] = useTransition();
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
    startSearchTransition(() => {
      navigate(busqueda.trim() ? `/objetos?q=${encodeURIComponent(busqueda.trim())}` : '/objetos');
    });
  };

  return (
    <div className="home-page flex flex-col gap-12 pb-16">
      {/* Hero Section */}
      <section className="hero-bg py-12 sm:py-16 border-b border-brand-900">
        <div className="container-app text-center max-w-3xl flex flex-col items-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight">
            ¿Perdiste o encontraste algo en el campus?
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 mb-8 leading-relaxed max-w-2xl">
            Busca entre los reportes de tu comunidad o publica un objeto para ayudar a que vuelva a su dueño.
          </p>

          {/* Buscador Destacado */}
          <form aria-busy={buscando} onSubmit={handleBuscar} className="w-full max-w-xl flex gap-2 p-2 rounded-xl bg-white border border-slate-300 shadow-sm focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 mb-6">
            <div className="relative min-w-0 flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="search"
                aria-label="Buscar objeto o lugar"
                placeholder="Buscar objeto o lugar…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-11 pr-4 py-2 text-slate-900 bg-transparent text-sm sm:text-base placeholder:text-slate-500 focus:outline-none min-h-[44px]"
              />
            </div>
            <Button type="submit" variant="primary" size="md" cargando={buscando} aria-busy={buscando} className="shrink-0">
              Buscar
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row justify-center gap-3 w-full sm:w-auto">
            <Link to="/objetos/nuevo?tipo=perdido" className="hero-action inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white hover:bg-rose-700 transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.97]">
              <SearchX className="h-5 w-5" aria-hidden="true" /> Perdí algo
            </Link>
            <Link to="/objetos/nuevo?tipo=encontrado" className="hero-action inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800 transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.97]">
              <PackageCheck className="h-5 w-5" aria-hidden="true" /> Encontré algo
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
          {CATEGORIAS.map((cat) => <CategoriaAcceso key={cat.value} categoria={cat.value} label={cat.label} />)}
        </div>
      </section>

      {/* Publicados Recientemente */}
      <section className="container-app">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
            className="text-brand-600 hover:text-brand-700 font-semibold text-sm flex min-h-[44px] items-center gap-2 whitespace-nowrap group"
          >
            Ver todos los objetos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div aria-busy={cargando}>
        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : recientes.length === 0 ? (
          <EmptyState titulo="No se encontraron objetos" descripcion="Aún no se ha registrado ningún objeto en la plataforma." accionTexto="Reportar un objeto" onAccion={() => navigate('/objetos/nuevo')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recientes.map((obj) => (
              <ObjetoCard key={obj.id} objeto={obj} />
            ))}
          </div>
        )}
        </div>
      </section>

      {/* Cómo funciona (3 pasos unificados) */}
      <section className="container-app py-8">
        <div className="rounded-3xl bg-indigo-50/60 border border-indigo-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¿Cómo funciona Encuéntralo?</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-8">
            En tres sencillos pasos puedes reportar, verificar y recuperar tus pertenencias.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {PASOS_PERDI.map((paso) => (
              <div key={paso.numero} className="card p-6 bg-white flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center">
                  {paso.numero}
                </div>
                <h3 className="text-base font-bold text-slate-900">{paso.titulo}</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {paso.descripcion}
                </p>
                {paso.consejo && (
                  <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
                    💡 {paso.consejo}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Enlace discreto de texto para no competir con el contenido */}
          <div className="mt-8 pt-6 border-t border-indigo-100 text-center text-xs text-slate-600">
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

      {/* Sección Informativa: Puntos Seguros de Entrega en el Campus */}
      <section className="container-app py-8" aria-labelledby="puntos-entrega-titulo">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-100">
            <MapPin className="w-3.5 h-3.5" /> Recomendaciones del Campus
          </div>
          <h2 id="puntos-entrega-titulo" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Puntos oficiales y seguros para coordinar devoluciones
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Para la tranquilidad de todos, recomendamos siempre realizar la entrega física en lugares públicos, iluminados y con presencia de personal de apoyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 1. Caseta de Vigilancia */}
          <div className="card p-6 bg-white hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Caseta de Vigilancia Central
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Confirma el horario con tu institución
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Consulta con vigilancia si puede recibir documentos u objetos de valor y qué procedimiento debes seguir antes de dejarlos en custodia.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-rose-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Recomendado para documentos y objetos de valor
            </div>
          </div>

          {/* 2. Mostrador de Biblioteca */}
          <div className="card p-6 bg-white hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Mostrador de Biblioteca Central
              </h3>
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Consulta ubicación y disponibilidad
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Ideal para entrega de útiles, mochilas, calculadoras científicas, cuadernos o laptops. Cuenta con mesas iluminadas para revisar el objeto con calma antes de cerrar el caso.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Confirma que haya personal de apoyo
            </div>
          </div>

          {/* 3. Comedor */}
          <div className="card p-6 bg-white hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Comedor
              </h3>
              {/* TODO: Horarios del comedor */}
              <p className="text-xs text-slate-500 font-semibold mb-3">
                Pabellón Central • Zona abierta
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Zona concurrida, amplia y visible, ideal para entregas a plena vista durante el día. Recomendada para coordinar devoluciones rápidas y públicas entre clases.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-amber-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zona concurrida a plena vista
            </div>
          </div>
        </div>
      </section>

      <section className="container-app" aria-labelledby="privacidad-inicio">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <div className="max-w-2xl">
            <h2 id="privacidad-inicio" className="text-base font-semibold text-slate-900">Publica el objeto, no tus datos personales</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Evita incluir teléfonos, correos o documentos legibles en las descripciones y fotografías del catálogo.</p>
          </div>
          <Link to="/privacidad" className="inline-flex min-h-[44px] shrink-0 items-center gap-2 text-sm font-semibold text-brand-700 hover:underline underline-offset-4">Consultar privacidad <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
};