import type { Categoria } from '@/types/models';
import type { Estadisticas, EstadisticasService } from '@/services/types';
import { latencia, leer } from './storage';
import { inicializarStorageSiVacio } from './objetosService';
import { CATEGORIAS } from '@/lib/textos';

export const estadisticasService: EstadisticasService = {
  async resumen(): Promise<Estadisticas> {
    await latencia();
    inicializarStorageSiVacio();
    const objetos = leer('objetos');
    const solicitudes = leer('solicitudes');

    let perdidos = 0;
    let encontrados = 0;
    let enProceso = 0;
    let recuperados = 0;

    const conteoCategorias: Record<Categoria, number> = {
      electronicos: 0,
      documentos: 0,
      ropa: 0,
      accesorios: 0,
      utiles: 0,
      llaves: 0,
      mochilas: 0,
      otros: 0,
    };

    objetos.forEach((o) => {
      if (o.estado === 'perdido') perdidos++;
      else if (o.estado === 'encontrado') encontrados++;
      else if (o.estado === 'en_proceso') enProceso++;
      else if (o.estado === 'recuperado') recuperados++;

      if (conteoCategorias[o.categoria] !== undefined) {
        conteoCategorias[o.categoria]++;
      }
    });

    const solicitudesPendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;

    const porCategoria = CATEGORIAS.map((c) => ({
      categoria: c.value,
      total: conteoCategorias[c.value] || 0,
    }));

    return {
      perdidos,
      encontrados,
      enProceso,
      recuperados,
      solicitudesPendientes,
      porCategoria,
    };
  },
};