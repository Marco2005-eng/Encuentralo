import type { NotificacionesService } from '@/services/types';
import { escribir, latencia, leer } from './storage';
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
};