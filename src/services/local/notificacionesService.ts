import type { NotificacionesService } from '@/services/types';
import type { Notificacion } from '@/types/models';
import { escribir, latencia, leer, nuevoId, ahora } from './storage';
import { inicializarStorageSiVacio } from './objetosService';

export const notificacionesService: NotificacionesService = {
  async delUsuario(usuarioId) {
    await latencia(50);
    inicializarStorageSiVacio();
    const notificaciones = leer('notificaciones') || [];
    return notificaciones.filter((n) => n.usuarioId === usuarioId);
  },

  async marcarTodasLeidas(usuarioId) {
    await latencia(50);
    inicializarStorageSiVacio();
    const notificaciones = leer('notificaciones') || [];
    const actualizadas = notificaciones.map((n) => {
      if (n.usuarioId === usuarioId) {
        return { ...n, leida: true };
      }
      return n;
    });
    escribir('notificaciones', actualizadas);
  },

  async crear(usuarioId, mensaje, enlace) {
    await latencia(30);
    inicializarStorageSiVacio();
    const notificaciones = leer('notificaciones') || [];
    const nueva: Notificacion = {
      id: nuevoId(),
      usuarioId,
      mensaje,
      leida: false,
      enlace,
      creadoEn: ahora(),
    };
    escribir('notificaciones', [nueva, ...notificaciones]);
    return nueva;
  },
};