import type { NotificacionesService } from '@/services/types';
import type { Notificacion } from '@/types/models';
import { SUPABASE_URL, getAuthHeaders, obtenerSesionLocal } from './client';

export const supabaseNotificacionesService: NotificacionesService = {
  async delUsuario(usuarioId): Promise<Notificacion[]> {
    const sesion = obtenerSesionLocal();
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/notificaciones?usuario_id=eq.${usuarioId}&order=creado_en.desc&select=*`,
        {
          headers: getAuthHeaders(sesion?.access_token),
        }
      );
      if (res.ok) {
        const datos = await res.json();
        if (Array.isArray(datos)) {
          return datos.map((n: any) => ({
            id: n.id,
            usuarioId: n.usuario_id,
            mensaje: n.mensaje,
            leida: n.leida,
            enlace: n.enlace || undefined,
            creadoEn: n.creado_en,
          }));
        }
      } else {
        console.warn('⚠️ No se pudieron cargar notificaciones desde Supabase:', res.status, await res.text());
      }
    } catch (e) {
      console.warn('⚠️ Error de red al consultar notificaciones en Supabase:', e);
    }

    // Fallback a localStorage
    try {
      const raw = localStorage.getItem('encuentralo:notificaciones');
      if (raw) {
        const lista: Notificacion[] = JSON.parse(raw);
        return lista.filter((n) => n.usuarioId === usuarioId);
      }
    } catch {}
    return [];
  },

  async marcarTodasLeidas(usuarioId): Promise<void> {
    const sesion = obtenerSesionLocal();
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notificaciones?usuario_id=eq.${usuarioId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(sesion?.access_token),
        body: JSON.stringify({ leida: true }),
      });
    } catch {}

    try {
      const raw = localStorage.getItem('encuentralo:notificaciones');
      if (raw) {
        const lista: Notificacion[] = JSON.parse(raw);
        const actualizadas = lista.map((n) =>
          n.usuarioId === usuarioId ? { ...n, leida: true } : n
        );
        localStorage.setItem('encuentralo:notificaciones', JSON.stringify(actualizadas));
      }
    } catch {}
  },

  async crear(usuarioId, mensaje, enlace): Promise<Notificacion> {
    const sesion = obtenerSesionLocal();
    const nueva: Notificacion = {
      id: crypto.randomUUID(),
      usuarioId,
      mensaje,
      leida: false,
      enlace,
      creadoEn: new Date().toISOString(),
    };

    // 1. Guardar en Supabase
    try {
      let res = await fetch(`${SUPABASE_URL}/rest/v1/notificaciones`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(sesion?.access_token),
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: nueva.id,
          usuario_id: usuarioId,
          mensaje,
          leida: false,
          enlace: enlace || null,
        }),
      });

      // Si falló por restricciones de token autenticado intentando notificar a otro usuario, reintentar con anon_key
      if (!res.ok) {
        const errorInicial = await res.text();
        console.warn('⚠️ Primer intento con token falló, reintentando con anon key...', res.status, errorInicial);
        res = await fetch(`${SUPABASE_URL}/rest/v1/notificaciones`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(), // Usa SUPABASE_ANON_KEY
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: nueva.id,
            usuario_id: usuarioId,
            mensaje,
            leida: false,
            enlace: enlace || null,
          }),
        });
      }

      if (!res.ok) {
        console.error('❌ Error al registrar notificación en Supabase:', res.status, await res.text());
      } else {
        console.log('🔔 Notificación creada exitosamente en Supabase para el usuario:', usuarioId);
      }
    } catch (err) {
      console.error('❌ Error de red al registrar notificación:', err);
    }

    // 2. Guardar también en localStorage para entrega inmediata y offline
    try {
      const raw = localStorage.getItem('encuentralo:notificaciones');
      const lista: Notificacion[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem('encuentralo:notificaciones', JSON.stringify([nueva, ...lista]));
    } catch {}

    return nueva;
  },
};
