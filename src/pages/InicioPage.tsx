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
  Lock,
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link to="/objetos/nuevo?tipo=perdido" className="w-full sm:w-auto">
              <Button
                variant="danger"
                size="lg"
                className="w-full sm:min-w-[200px] shadow-lg shadow-rose-950/20 font-bold px-8"
              >
                Perdí algo
              </Button>
            </Link>
            <Link to="/objetos/nuevo?tipo=encontrado" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:min-w-[200px] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-950/20 font-bold px-8"
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

      {/* Cómo funciona (3 pasos unificados) */}
      <section className="container-app py-6">
        <div className="rounded-3xl bg-indigo-50/60 border border-indigo-100 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">¿Cómo funciona Encuéntralo?</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-10">
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
          <div className="mt-8 pt-5 border-t border-indigo-100 text-center text-xs text-slate-600">
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
      <section className="container-app py-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-100">
            <MapPin className="w-3.5 h-3.5" /> Recomendaciones del Campus
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Puntos oficiales y seguros para coordinar devoluciones
          </h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Para la tranquilidad de todos, recomendamos siempre realizar la entrega física en lugares públicos, iluminados y con presencia de personal de apoyo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Puerta Principal • Disponible 24/7
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                El punto más neutral y seguro del campus. Los documentos de identidad, carnés universitarios y artículos de alto valor deben entregarse aquí. También puedes dejar el objeto en custodia si no coinciden en horario.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-rose-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Oficial para documentos y valor
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
                Edificio A • Lunes a Sábados
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Ideal para entrega de útiles, mochilas, calculadoras científicas, cuadernos o laptops. Cuenta con mesas iluminadas para revisar el objeto con calma antes de cerrar el caso.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-blue-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zona tranquila y vigilada
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

      {/* Sección Informativa: Compromiso de Privacidad y Seguridad (Tarjeta oscura con ancho completo y contraste AA) */}
      <section className="container-app py-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white shadow-xl w-full border border-slate-800">
          <div className="w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-500/30">
              <Lock className="w-3.5 h-3.5" /> Tu privacidad está protegida
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              Tu información personal nunca se muestra
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-3xl">
              A diferencia de las redes sociales públicas donde se exponen nombres completos y teléfonos a desconocidos, Encuéntralo protege tu identidad mediante protocolos seguros:
            </p>

            {/* Grid 2x2 aprovechando todo el ancho de la tarjeta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-sm text-slate-200">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <strong className="text-white block font-bold mb-0.5">Cero datos personales expuestos</strong>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Nadie puede ver tu correo ni teléfono en los reportes del catálogo ni en las tarjetas públicas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <strong className="text-white block font-bold mb-0.5">Acreditación privada y segura</strong>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    El solicitante demuestra pertenencia aportando detalles que solo el dueño real conoce antes de la entrega.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <strong className="text-white block font-bold mb-0.5">Chat interno exclusivo</strong>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    Canal privado para coordinar entrega sin compartir tu WhatsApp o redes sociales personales.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <strong className="text-white block font-bold mb-0.5">Supervisión institucional</strong>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    El sistema cuenta con moderación de reportes y sanciones ante reclamos fraudulentos.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800">
              <Link to="/objetos">
                <Button
                  variant="primary"
                  size="md"
                  className="gap-2 text-xs sm:text-sm font-bold shadow-lg"
                >
                  Explorar catálogo de objetos
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};