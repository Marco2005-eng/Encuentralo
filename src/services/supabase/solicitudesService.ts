import type { SolicitudConObjeto, SolicitudesService } from '@/services/types';
import type { Solicitud, Usuario } from '@/types/models';
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

export const supabaseSolicitudesService: SolicitudesService = {
  async crear(objetoId, pruebaPertenencia, usuario, pruebaImagen): Promise<Solicitud> {
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

    // Subir imagen al storage si viene adjunta
    let urlImagenPrueba: string | null = null;
    if (pruebaImagen) {
      if (pruebaImagen.startsWith('data:image')) {
        try {
          urlImagenPrueba = await subirImagenASupabaseStorage(pruebaImagen);
        } catch {
          urlImagenPrueba = pruebaImagen;
        }
      } else {
        urlImagenPrueba = pruebaImagen;
      }
    }

    // 2. Insertar solicitud
    const nuevaSol = {
      objeto_id: objetoId,
      solicitante_id: usuario.id,
      prueba_pertenencia: pruebaPertenencia,
      prueba_imagen: urlImagenPrueba,
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

    // 4. Crear notificación al dueño del objeto (IHC)
    const mensajeNotif =
      objeto.tipo === 'perdido'
        ? `¡Buenas noticias! Un usuario reportó haber encontrado tu objeto perdido "${objeto.nombre}".`
        : `Has recibido una solicitud de recuperación para "${objeto.nombre}".`;
    await supabaseNotificacionesService
      .crear(objeto.publicado_por, mensajeNotif, '/mis-publicaciones')
      .catch(() => {});

    const creadas = await res.json();
    const c = creadas[0];
    return {
      id: c.id,
      objetoId: c.objeto_id,
      solicitanteId: c.solicitante_id,
      pruebaPertenencia: c.prueba_pertenencia,
      pruebaImagen: c.prueba_imagen || undefined,
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
      pruebaImagen: s.prueba_imagen || undefined,
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
    // 1. Intentar con join de perfiles
    let res = await fetch(
      `${SUPABASE_URL}/rest/v1/solicitudes?objeto_id=eq.${objetoId}&order=creado_en.desc&select=*,perfiles(nombre,telefono)`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );

    // Si fallara por la relación de perfiles, consultar solicitudes directamente
    if (!res.ok) {
      res = await fetch(
        `${SUPABASE_URL}/rest/v1/solicitudes?objeto_id=eq.${objetoId}&order=creado_en.desc&select=*`,
        {
          headers: getHeaders(sesion?.access_token),
        }
      );
    }

    if (!res.ok) return [];
    const datos = await res.json();
    return datos.map((s: any) => ({
      id: s.id,
      objetoId: s.objeto_id,
      solicitanteId: s.solicitante_id,
      pruebaPertenencia: s.prueba_pertenencia,
      pruebaImagen: s.prueba_imagen || undefined,
      estado: s.estado,
      motivoRechazo: s.motivo_rechazo || undefined,
      creadoEn: s.creado_en,
      resueltaEn: s.resuelta_en || undefined,
      solicitanteNombre: s.perfiles?.nombre || 'Usuario solicitante',
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
      pruebaImagen: s.prueba_imagen || undefined,
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
      pruebaImagen: s.prueba_imagen || undefined,
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

    // Notificar al solicitante que fue aprobada
    await supabaseNotificacionesService
      .crear(
        sol.solicitante_id,
        '¡Tu solicitud para el objeto fue aprobada! Ya pueden coordinar la entrega en el chat.',
        '/mis-solicitudes'
      )
      .catch(() => {});
  },

  async rechazar(id, motivo, _usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    // Obtener datos de la solicitud para saber a quién notificar
    const sRes = await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}&select=solicitante_id`, {
      headers: getHeaders(token),
    });
    let solicitanteId: string | null = null;
    if (sRes.ok) {
      const datos = await sRes.json();
      if (datos && datos.length > 0) solicitanteId = datos[0].solicitante_id;
    }

    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify({
        estado: 'rechazada',
        motivo_rechazo: motivo,
        resuelta_en: new Date().toISOString(),
      }),
    });

    if (solicitanteId) {
      await supabaseNotificacionesService
        .crear(
          solicitanteId,
          `Tu solicitud de recuperación no fue aceptada. Motivo: ${motivo}`,
          '/mis-solicitudes'
        )
        .catch(() => {});
    }
  },

  async cancelar(id, _usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    const token = sesion?.access_token;

    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
  },

  async eliminar(id: string, _usuario: Usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'DELETE',
      headers: getHeaders(sesion?.access_token),
    });
  },

  async ocultar(id: string, oculta: boolean, _usuario: Usuario): Promise<void> {
    const sesion = obtenerSesionLocal();
    await fetch(`${SUPABASE_URL}/rest/v1/solicitudes?id=eq.${id}`, {
      method: 'PATCH',
      headers: getHeaders(sesion?.access_token),
      body: JSON.stringify({ oculta }),
    });
  },

  async listarMensajesEntrega(solicitudId: string) {
    const sesion = obtenerSesionLocal();
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mensajes_entrega?solicitud_id=eq.${solicitudId}&order=creado_en.asc&select=*`,
      {
        headers: getHeaders(sesion?.access_token),
      }
    );
    if (!res.ok) return [];
    const datos = await res.json();
    return datos.map((m: any) => ({
      id: m.id,
      solicitudId: m.solicitud_id,
      emisorId: m.emisor_id,
      mensaje: m.mensaje,
      creadoEn: m.creado_en,
    }));
  },

  async enviarMensajeEntrega(solicitudId: string, mensaje: string, emisorId: string) {
    const sesion = obtenerSesionLocal();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/mensajes_entrega`, {
      method: 'POST',
      headers: {
        ...getHeaders(sesion?.access_token),
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        solicitud_id: solicitudId,
        emisor_id: emisorId,
        mensaje: mensaje.trim(),
      }),
    });

    if (!res.ok) {
      throw new Error('No se pudo enviar el mensaje.');
    }
    const creados = await res.json();
    const m = creados[0];
    return {
      id: m.id,
      solicitudId: m.solicitud_id,
      emisorId: m.emisor_id,
      mensaje: m.mensaje,
      creadoEn: m.creado_en,
    };
  },
};
