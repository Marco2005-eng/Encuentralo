import type { SolicitudConObjeto, SolicitudesService } from '@/services/types';
import type { Solicitud, Usuario } from '@/types/models';
import { SUPABASE_URL, SUPABASE_ANON_KEY, obtenerSesionLocal } from './client';

function getHeaders(token?: string) {
  const sesion = obtenerSesionLocal();
  const bearer = token || sesion?.access_token || SUPABASE_ANON_KEY;
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${bearer}`,
    'Content-Type': 'application/json',
  };
}

export const supabaseSolicitudesService: SolicitudesService = {
  async crear(objetoId, pruebaPertenencia, usuario): Promise<Solicitud> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    // 1. Validar que no sea el mismo publicador
    const objRes = await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${objetoId}&select=*`, {
      headers: getHeaders(token),
    });
    if (!objRes.ok) throw new Error('No se pudo verificar el objeto.');
    const objs = await objRes.json();
    if (!objs || objs.length === 0) throw new Error('El objeto no existe.');
    const objeto = objs[0];

    if (objeto.publicado_por === usuario.id) {
      throw new Error('No puedes enviar una solicitud para un objeto que tú mismo publicaste.');
    }
    if (objeto.estado === 'recuperado') {
      throw new Error('Este objeto ya fue recuperado.');
    }

    // 2. Insertar solicitud
    const nuevaSol = {
      objeto_id: objetoId,
      solicitante_id: usuario.id,
      prueba_pertenencia: pruebaPertenencia,
      estado: 'pendiente',
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/solicitudes`, {
      method: 'POST',
      headers: {
        ...getHeaders(token),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(nuevaSol),
    });

    if (!res.ok) {
      throw new Error('No se pudo registrar la solicitud en Supabase.');
    }

    // 3. Cambiar objeto a en_proceso
    if (objeto.estado === 'perdido' || objeto.estado === 'encontrado') {
      await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${objetoId}`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({
          estado: 'en_proceso',
          actualizado_en: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    const creadas = await res.json();
    const c = creadas[0];
    return {
      id: c.id,
      objetoId: c.objeto_id,
      solicitanteId: c.solicitante_id,
      pruebaPertenencia: c.prueba_pertenencia,
      estado: c.estado,
      motivoRechazo: c.motivo_rechazo || undefined,
      creadoEn: c.creado_en,
      resueltaEn: c.resuelta_en || undefined,
    };
  },

  async delSolicitante(usuarioId): Promise<SolicitudConObjeto[]> {
    const sesion = obtenerSesionLocal();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/solicitudes?solicitante_id=eq.${usuarioId}&order=creado_en.desc&select=*,objetos(*)`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );
    if (!res.ok) return [];
    const datos = await res.json();
    return datos.map((s: any) => ({
      id: s.id,
      objetoId: s.objeto_id,
      solicitanteId: s.solicitante_id,
      pruebaPertenencia: s.prueba_pertenencia,
      estado: s.estado,
      motivoRechazo: s.motivo_rechazo || undefined,
      creadoEn: s.creado_en,
      resueltaEn: s.resuelta_en || undefined,
      objeto: s.objetos
        ? {
            id: s.objetos.id,
            nombre: s.objetos.nombre,
            estado: s.objetos.estado,
            imagen: s.objetos.imagen,
            publicadoPor: s.objetos.publicado_por,
          }
        : undefined,
    }));
  },

  async delObjeto(objetoId, _usuario): Promise<SolicitudConObjeto[]> {
    const sesion = obtenerSesionLocal();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/solicitudes?objeto_id=eq.${objetoId}&order=creado_en.desc&select=*,perfiles(nombre,telefono)`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );
    if (!res.ok) return [];
    const datos = await res.json();
    return datos.map((s: any) => ({
      id: s.id,
      objetoId: s.objeto_id,
      solicitanteId: s.solicitante_id,
      pruebaPertenencia: s.prueba_pertenencia,
      estado: s.estado,
      motivoRechazo: s.motivo_rechazo || undefined,
      creadoEn: s.creado_en,
      resueltaEn: s.resuelta_en || undefined,
      solicitanteNombre: s.perfiles?.nombre || 'Usuario',
      solicitanteTelefono: s.perfiles?.telefono || undefined,
    }));
  },

  async todas(_usuario: Usuario): Promise<SolicitudConObjeto[]> {
    const sesion = obtenerSesionLocal();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/solicitudes?order=creado_en.desc&select=*,objetos(id,nombre,estado,imagen),perfiles(nombre,telefono)`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );
    if (!res.ok) return [];
    const datos = await res.json();
    return datos.map((s: any) => ({
      id: s.id,
      objetoId: s.objeto_id,
      solicitanteId: s.solicitante_id,
      pruebaPertenencia: s.prueba_pertenencia,
      estado: s.estado,
      motivoRechazo: s.motivo_rechazo || undefined,
      creadoEn: s.creado_en,
      resueltaEn: s.resuelta_en || undefined,
      solicitanteNombre: s.perfiles?.nombre || 'Usuario',
      solicitanteTelefono: s.perfiles?.telefono || undefined,
      objeto: s.objetos
        ? {
            id: s.objetos.id,
            nombre: s.objetos.nombre,
            estado: s.objetos.estado,
            imagen: s.objetos.imagen,
            publicadoPor: s.objetos.publicado_por,
          }
        : undefined,
    }));
  },

  async miSolicitudActiva(objetoId, usuarioId): Promise<Solicitud | null> {
    const sesion = obtenerSesionLocal();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/solicitudes?objeto_id=eq.${objetoId}&solicitante_id=eq.${usuarioId}&estado=eq.pendiente&select=*`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );
    if (!res.ok) return null;
    const datos = await res.json();
    if (!datos || datos.length === 0) return null;
    const s = datos[0];
    return {
      id: s.id,
      objetoId: s.objeto_id,
      solicitanteId: s.solicitante_id,
      pruebaPertenencia: s.prueba_pertenencia,
      estado: s.estado,
      motivoRechazo: s.motivo_rechazo || undefined,
      creadoEn: s.creado_en,
      resueltaEn: s.resuelta_en || undefined,
    };
  },

  async aprobar(id, _usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    // Obtener solicitud
    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}&select=*`, {
      headers: getHeaders(token),
    });
    if (!sRes.ok) throw new Error('No se pudo encontrar la solicitud.');
    const solicitudes = await sRes.json();
    if (!solicitudes || solicitudes.length === 0) throw new Error('Solicitud no encontrada.');
    const sol = solicitudes[0];

    // Marcar como aprobada
    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        estado: 'aprobada',
        resuelta_en: new Date().toISOString(),
      }),
    });

    // Marcar objeto como recuperado
    await fetch(`${SUPABASE_URL}/rest/v1/objetos?id=eq.${sol.objeto_id}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        estado: 'recuperado',
        actualizado_en: new Date().toISOString(),
      }),
    });
  },

  async rechazar(id, motivo, _usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        estado: 'rechazada',
        motivo_rechazo: motivo,
        resuelta_en: new Date().toISOString(),
      }),
    });
  },

  async cancelar(id, _usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },
};
