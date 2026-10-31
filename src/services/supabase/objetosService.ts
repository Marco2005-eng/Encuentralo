import type { Objeto, Usuario } from '@/types/models';
import type { ObjetosService, ObjetoFiltros, NuevoObjeto } from '@/services/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, obtenerSesionLocal } from './client';
import { subirImagenASupabaseStorage } from './storageService';
import { supabaseNotificacionesService } from './notificacionesService';

function getHeaders(token?: string) {
  const sesion = obtenerSesionLocal();
  const bearer = token || sesion?.access_token || SUPABASE_ANON_KEY;
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${bearer}`,
    'Content-Type': 'application/json',
  };
}

function formatearObjeto(o: any): Objeto {
  return {
    id: o.id,
    tipo: o.tipo,
    estado: o.estado,
    nombre: o.nombre,
    descripcion: o.descripcion,
    categoria: o.categoria,
    ubicacion: o.ubicacion,
    fecha: o.fecha,
    imagen: o.imagen || undefined,
    publicadoPor: o.publicado_por,
    creadoEn: o.creado_en,
    actualizadoEn: o.actualizado_en,
    oculto: Boolean(o.oculto),
    motivoOculto: o.motivo_oculto || undefined,
  };
}

export const supabaseObjetosService: ObjetosService = {
  async listar(filtros?: ObjetoFiltros): Promise<Objeto[]> {
    const params = new URLSearchParams();
    params.set('select', '*');

    if (filtros?.orden === 'antiguos') {
      params.set('order', 'creado_en.asc');
    } else {
      params.set('order', 'creado_en.desc');
    }

    if (filtros?.categoria) {
      params.set('categoria', `eq.${filtros.categoria}`);
    }
    if (filtros?.estado) {
      params.set('estado', `eq.${filtros.estado}`);
    }
    if (filtros?.tipo) {
      params.set('tipo', `eq.${filtros.tipo}`);
    }
    if (filtros?.desde) {
      params.set('fecha', `gte.${filtros.desde}`);
    }
    if (filtros?.hasta) {
      params.set('fecha', `lte.${filtros.hasta}`);
    }
    if (!filtros?.incluirOcultos) {
      params.set('oculto', 'neq.true');
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener los objetos desde Supabase');
    }

    let datos: any[] = await res.json();

    // Filtro de texto por búsqueda si viene 'q'
    if (filtros?.q) {
      const q = filtros.q.toLowerCase().trim();
      datos = datos.filter(
        (o) =>
          o.nombre?.toLowerCase().includes(q) ||
          o.descripcion?.toLowerCase().includes(q) ||
          o.ubicacion?.toLowerCase().includes(q)
      );
    }

    return datos.map(formatearObjeto);
  },

  async obtener(id: string): Promise<Objeto | null> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}&select=*`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const datos: any[] = await res.json();
    return datos.length > 0 ? formatearObjeto(datos[0]) : null;
  },

  async crear(datos: NuevoObjeto, usuarioId: string): Promise<Objeto> {
    let urlImagenFinal: string | null = null;

    if (datos.imagen) {
      if (datos.imagen.startsWith('data:image')) {
        try {
          urlImagenFinal = await subirImagenASupabaseStorage(datos.imagen);
        } catch {
          urlImagenFinal = datos.imagen;
        }
      } else {
        urlImagenFinal = datos.imagen;
      }
    }

    const body = {
      tipo: datos.tipo,
      estado: datos.tipo,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      ubicacion: datos.ubicacion,
      fecha: datos.fecha,
      imagen: urlImagenFinal,
      publicado_por: usuarioId,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al guardar el objeto en Supabase.');
    }

    const insertado: any[] = await res.json();
    return formatearObjeto(insertado[0]);
  },

  async actualizar(id: string, datos: Partial<NuevoObjeto>, _usuario: Usuario): Promise<Objeto> {
    const body: Record<string, any> = {
      actualizado_en: new Date().toISOString(),
    };
    if (datos.nombre) body.nombre = datos.nombre;
    if (datos.descripcion) body.descripcion = datos.descripcion;
    if (datos.categoria) body.categoria = datos.categoria;
    if (datos.ubicacion) body.ubicacion = datos.ubicacion;
    if (datos.fecha) body.fecha = datos.fecha;
    if (datos.imagen !== undefined) {
      if (datos.imagen && datos.imagen.startsWith('data:image')) {
        try {
          body.imagen = await subirImagenASupabaseStorage(datos.imagen);
        } catch {
          body.imagen = datos.imagen;
        }
      } else {
        body.imagen = datos.imagen;
      }
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('No se pudo actualizar el objeto en Supabase.');
    }

    const actualizados: any[] = await res.json();
    return formatearObjeto(actualizados[0]);
  },

  async cambiarEstado(id: string, nuevoEstado: any, _usuario: Usuario): Promise<Objeto> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        estado: nuevoEstado,
        actualizado_en: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error('No se pudo cambiar el estado en Supabase.');
    }

    const actualizados: any[] = await res.json();
    return formatearObjeto(actualizados[0]);
  },

  async eliminar(id: string, _usuario: Usuario): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error('No se pudo eliminar el objeto de Supabase.');
    }
  },

  async delUsuario(usuarioId: string): Promise<Objeto[]> {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/objetos?publicado_por=eq.${usuarioId}&order=creado_en.desc&select=*`,
      {
        headers: getHeaders(),
      }
    );
    if (!res.ok) return [];
    const datos: any[] = await res.json();
    return datos.map(formatearObjeto);
  },

  async ubicaciones(): Promise<string[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?select=ubicacion`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    const datos: any[] = await res.json();
    const setUbicaciones = new Set(datos.map((d: any) => d.ubicacion));
    return Array.from(setUbicaciones);
  },

  async ocultar(id: string, motivo: string, _usuario: Usuario): Promise<Objeto> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        oculto: true,
        motivo_oculto: motivo.trim(),
        actualizado_en: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error('No se pudo ocultar la publicación en Supabase.');
    }

    const actualizados: any[] = await res.json();
    const obj = formatearObjeto(actualizados[0]);

    // Notificar al autor
    await supabaseNotificacionesService.crear(
      obj.publicadoPor,
      `Tu publicación "${obj.nombre}" ha sido ocultada por la administración. Motivo: ${motivo.trim()}. Por favor edítala para mejorarla.`,
      `/mis-publicaciones/${obj.id}/editar`
    );

    return obj;
  },

  async desocultar(id: string, _usuario: Usuario): Promise<Objeto> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        oculto: false,
        motivo_oculto: null,
        actualizado_en: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      throw new Error('No se pudo reactivar la publicación en Supabase.');
    }

    const actualizados: any[] = await res.json();
    const obj = formatearObjeto(actualizados[0]);

    // Notificar al autor
    await supabaseNotificacionesService.crear(
      obj.publicadoPor,
      `Tu publicación "${obj.nombre}" ha sido reactivada y ya es visible públicamente en el catálogo.`,
      `/objetos/${obj.id}`
    );

    return obj;
  },
};
