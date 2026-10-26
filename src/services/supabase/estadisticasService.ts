import type { Categoria } from '@/types/models';
import type { Estadisticas, EstadisticasService } from '@/services/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, obtenerSesionLocal } from './client';
import { CATEGORIAS } from '@/lib/textos';

export const supabaseEstadisticasService: EstadisticasService = {
  async resumen(): Promise<Estadisticas> {
    const sesion = obtenerSesionLocal();
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${sesion?.access_token || SUPABASE_ANON_KEY}`,
    };

    const [objRes, solRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/objetos?select=estado,categoria`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/solicitudes?estado=eq.pendiente&select=id`, { headers }),
    ]);

    const objetos = objRes.ok ? await objRes.json() : [];
    const solicitudes = solRes.ok ? await solRes.json() : [];

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

    objetos.forEach((o: any) => {
      if (o.estado === 'perdido') perdidos++;
      else if (o.estado === 'encontrado') encontrados++;
      else if (o.estado === 'en_proceso') enProceso++;
      else if (o.estado === 'recuperado') recuperados++;

      if (conteoCategorias[o.categoria as Categoria] !== undefined) {
        conteoCategorias[o.categoria as Categoria]++;
      }
    });

    const porCategoria = CATEGORIAS.map((c) => ({
      categoria: c.value,
      total: conteoCategorias[c.value] || 0,
    }));

    return {
      perdidos,
      encontrados,
      enProceso,
      recuperados,
      solicitudesPendientes: solicitudes.length,
      porCategoria,
    };
  },
};
