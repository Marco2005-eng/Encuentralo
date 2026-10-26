import React, { useState, useEffect } from 'react';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Objeto } from '@/types/models';
import type { Estadisticas, SolicitudConObjeto } from '@/services/types';
import { CATEGORIA_LABEL } from '@/lib/textos';
import { formatFecha } from '@/lib/fechas';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  SearchX,
  PackageCheck,
  Clock,
  CheckCircle2,
  RotateCcw,
  Shield,
  Layers,
  Inbox,
  Trash2,
} from 'lucide-react';


export const AdminPage: React.FC = () => {
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudConObjeto[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarAdminData = async () => {
    if (!usuario || usuario.rol !== 'admin') return;
    setCargando(true);
    try {
      const [stats, objs, sols] = await Promise.all([
        services.estadisticas.resumen(),
        services.objetos.listar(),
        services.solicitudes.todas(usuario),
      ]);
      setEstadisticas(stats);
      setObjetos(objs);
      setSolicitudes(sols);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAdminData();
  }, [usuario]);

  const handleRestablecerDemo = async () => {
    if (
      window.confirm(
        '¿Deseas restablecer todos los datos de demostración a su estado inicial? Se borrarán registros creados manualmente.'
      )
    ) {
      await services.restablecerDemo();
      mostrarToast('Datos de demostración restablecidos.', 'exito');
      cargarAdminData();
    }
  };

  const handleEliminarObjeto = async (id: string) => {
    if (!usuario) return;
    if (window.confirm('¿Eliminar definitivamente este objeto como Administrador?')) {
      try {
        await services.objetos.eliminar(id, usuario);
        mostrarToast('Objeto eliminado.', 'exito');
        cargarAdminData();
      } catch (err: unknown) {
        if (err instanceof Error) mostrarToast(err.message, 'error');
      }
    }
  };

  if (cargando) {
    return (
      <div className="container-app py-8 space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  const datosGrafico =
    estadisticas?.porCategoria.map((c: { categoria: keyof typeof CATEGORIA_LABEL; total: number }) => ({
      name: CATEGORIA_LABEL[c.categoria],
      total: c.total,
    })) || [];

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#64748b'];

  return (
    <div className="container-app py-8 space-y-10">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Rol Administrador
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de control general
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisión institucional de publicaciones, solicitudes y métricas de objetos.
          </p>
        </div>

        {/* Botón Restablecer Datos de Demostración (IHC 7.8) */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestablecerDemo}
          className="border-slate-300 gap-1.5 shadow-sm text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restablecer datos de demostración
        </Button>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      {estadisticas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-rose-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Perdidos</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.perdidos}</p>
            </div>
            <SearchX className="w-8 h-8 text-rose-500 opacity-80" />
          </div>

          <div className="card p-5 border-l-4 border-l-blue-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Encontrados</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.encontrados}</p>
            </div>
            <PackageCheck className="w-8 h-8 text-blue-500 opacity-80" />
          </div>

          <div className="card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">En proceso</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.enProceso}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500 opacity-80" />
          </div>

          <div className="card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Recuperados</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{estadisticas.recuperados}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
          </div>
        </div>
      )}

      {/* Gráfico de Objetos por Categoría (CSS puro accesible y liviano) */}
      <div className="card p-6">
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600" /> Distribución de objetos por categoría
        </h2>
        <div className="space-y-4">
          {datosGrafico.map((cat, idx) => {
            const max = Math.max(...datosGrafico.map((d) => d.total), 1);
            const porcentaje = Math.round((cat.total / max) * 100);
            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{cat.name}</span>
                  <span className="text-slate-500 font-bold">{cat.total} {cat.total === 1 ? 'objeto' : 'objetos'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${porcentaje}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de Publicaciones Supervisadas */}
      <div className="card p-6 overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Todas las publicaciones ({objetos.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Objeto</th>
                <th className="pb-3 pr-4">Categoría</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3 pr-4">Lugar</th>
                <th className="pb-3 pr-4">Fecha</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {objetos.map((obj) => (
                <tr key={obj.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-semibold text-slate-900">
                    <a href={`/objetos/${obj.id}`} className="hover:text-brand-600">
                      {obj.nombre}
                    </a>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{CATEGORIA_LABEL[obj.categoria]}</td>
                  <td className="py-3 pr-4">
                    <Badge estado={obj.estado} />
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{obj.ubicacion}</td>
                  <td className="py-3 pr-4 text-slate-500">{formatFecha(obj.fecha)}</td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleEliminarObjeto(obj.id)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="card p-6 overflow-hidden">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Inbox className="w-4 h-4 text-brand-600" /> Registro de todas las solicitudes ({solicitudes.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pr-4">Objeto</th>
                <th className="pb-3 pr-4">Solicitante</th>
                <th className="pb-3 pr-4">Estado</th>
                <th className="pb-3">Detalle de pertenencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {solicitudes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-semibold text-slate-900">
                    {s.objeto?.nombre || 'Objeto'}
                  </td>
                  <td className="py-3 pr-4 text-slate-700">{s.solicitanteNombre || 'Usuario'}</td>
                  <td className="py-3 pr-4">
                    <Badge estado={s.estado} />
                  </td>
                  <td className="py-3 text-slate-600 max-w-xs truncate" title={s.pruebaPertenencia}>
                    {s.pruebaPertenencia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};