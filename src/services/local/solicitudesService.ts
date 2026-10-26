import type { Notificacion, Solicitud } from '@/types/models';
import { ServiceError, type SolicitudesService } from '@/services/types';
import { ahora, escribir, latencia, leer, nuevoId } from './storage';
import { inicializarStorageSiVacio } from './objetosService';
import { nombreUsuario } from './authService';

function crearNotificacion(usuarioId: string, mensaje: string, enlace?: string) {
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
}

export const solicitudesService: SolicitudesService = {
  async crear(objetoId, pruebaPertenencia, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const objetos = leer('objetos');
    const objeto = objetos.find((o) => o.id === objetoId);
    if (!objeto) throw new ServiceError('El objeto seleccionado no existe.');

    // Regla 5: Un usuario no puede solicitar un objeto que él mismo publicó
    if (objeto.publicadoPor === usuario.id) {
      throw new ServiceError('No puedes enviar una solicitud para un objeto que tú mismo publicaste.');
    }

    // Regla 9: Objeto recuperado no permite solicitudes
    if (objeto.estado === 'recuperado') {
      throw new ServiceError('Este objeto ya fue recuperado y no admite nuevas solicitudes.');
    }

    const solicitudes = leer('solicitudes');
    const yaSolicitado = solicitudes.some(
      (s) => s.objetoId === objetoId && s.solicitanteId === usuario.id && s.estado === 'pendiente'
    );
    if (yaSolicitado) {
      throw new ServiceError('Ya tienes una solicitud pendiente para este objeto.');
    }

    const nueva: Solicitud = {
      id: nuevoId(),
      objetoId,
      solicitanteId: usuario.id,
      pruebaPertenencia,
      estado: 'pendiente',
      creadoEn: ahora(),
    };

    // Regla 2: Al existir solicitud pendiente, el objeto puede pasar a en_proceso
    if (objeto.estado === 'perdido' || objeto.estado === 'encontrado') {
      objeto.estado = 'en_proceso';
      objeto.actualizadoEn = ahora();
      escribir('objetos', objetos);
    }

    escribir('solicitudes', [nueva, ...solicitudes]);

    // Notificar al dueño de la publicación
    crearNotificacion(
      objeto.publicadoPor,
      `Has recibido una nueva solicitud de recuperación para "${objeto.nombre}".`,
      '/mis-publicaciones'
    );

    return nueva;
  },

  async delSolicitante(usuarioId) {
    await latencia();
    inicializarStorageSiVacio();
    const solicitudes = leer('solicitudes').filter((s) => s.solicitanteId === usuarioId);
    const objetos = leer('objetos');

    return solicitudes.map((s) => {
      const obj = objetos.find((o) => o.id === s.objetoId);
      return {
        ...s,
        objeto: obj ? { id: obj.id, nombre: obj.nombre, estado: obj.estado, imagen: obj.imagen, publicadoPor: obj.publicadoPor } : undefined,
      };
    });
  },

  async delObjeto(objetoId, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const objetos = leer('objetos');
    const objeto = objetos.find((o) => o.id === objetoId);
    if (!objeto) throw new ServiceError('El objeto no existe.');

    if (objeto.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes permisos para ver las solicitudes de este objeto.');
    }

    const solicitudes = leer('solicitudes').filter((s) => s.objetoId === objetoId);
    return solicitudes.map((s) => ({
      ...s,
      solicitanteNombre: nombreUsuario(s.solicitanteId),
      objeto: { id: objeto.id, nombre: objeto.nombre, estado: objeto.estado, imagen: objeto.imagen, publicadoPor: objeto.publicadoPor },
    }));
  },

  async todas(usuario) {
    await latencia();
    inicializarStorageSiVacio();
    if (usuario.rol !== 'admin') {
      throw new ServiceError('Solo administradores pueden listar todas las solicitudes.');
    }
    const solicitudes = leer('solicitudes');
    const objetos = leer('objetos');
    return solicitudes.map((s) => {
      const obj = objetos.find((o) => o.id === s.objetoId);
      return {
        ...s,
        solicitanteNombre: nombreUsuario(s.solicitanteId),
        objeto: obj ? { id: obj.id, nombre: obj.nombre, estado: obj.estado, imagen: obj.imagen, publicadoPor: obj.publicadoPor } : undefined,
      };
    });
  },

  async miSolicitudActiva(objetoId, usuarioId) {
    await latencia(50);
    inicializarStorageSiVacio();
    const solicitudes = leer('solicitudes');
    return (
      solicitudes.find(
        (s) => s.objetoId === objetoId && s.solicitanteId === usuarioId && s.estado === 'pendiente'
      ) || null
    );
  },

  async aprobar(id, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const solicitudes = leer('solicitudes');
    const sIndex = solicitudes.findIndex((s) => s.id === id);
    if (sIndex === -1) throw new ServiceError('Solicitud no encontrada.');

    const solicitud = solicitudes[sIndex];
    const objetos = leer('objetos');
    const oIndex = objetos.findIndex((o) => o.id === solicitud.objetoId);
    if (oIndex === -1) throw new ServiceError('Objeto asociado no encontrado.');

    const objeto = objetos[oIndex];
    if (objeto.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes autorización para responder a esta solicitud.');
    }

    // Regla 3: Al aprobar, el objeto pasa a 'recuperado' y demás solicitudes pendientes se rechazan
    solicitud.estado = 'aprobada';
    solicitud.resueltaEn = ahora();

    objeto.estado = 'recuperado';
    objeto.actualizadoEn = ahora();

    // Notificar al solicitante
    crearNotificacion(
      solicitud.solicitanteId,
      `¡Tu solicitud para recuperar "${objeto.nombre}" fue aprobada! Coordina la entrega.`,
      '/mis-solicitudes'
    );

    // Rechazar otras solicitudes pendientes del mismo objeto
    solicitudes.forEach((otra) => {
      if (otra.id !== solicitud.id && otra.objetoId === objeto.id && otra.estado === 'pendiente') {
        otra.estado = 'rechazada';
        otra.motivoRechazo = 'El objeto ya fue entregado a otro reclamante verificado.';
        otra.resueltaEn = ahora();
        crearNotificacion(
          otra.solicitanteId,
          `Tu solicitud para "${objeto.nombre}" no procedió: el objeto fue entregado a otro usuario.`,
          '/mis-solicitudes'
        );
      }
    });

    escribir('solicitudes', solicitudes);
    escribir('objetos', objetos);
  },

  async rechazar(id, motivo, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const solicitudes = leer('solicitudes');
    const sIndex = solicitudes.findIndex((s) => s.id === id);
    if (sIndex === -1) throw new ServiceError('Solicitud no encontrada.');

    const solicitud = solicitudes[sIndex];
    const objetos = leer('objetos');
    const oIndex = objetos.findIndex((o) => o.id === solicitud.objetoId);
    if (oIndex === -1) throw new ServiceError('Objeto asociado no encontrado.');

    const objeto = objetos[oIndex];
    if (objeto.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes autorización para responder a esta solicitud.');
    }

    solicitud.estado = 'rechazada';
    solicitud.motivoRechazo = motivo;
    solicitud.resueltaEn = ahora();

    // Regla 4: Al rechazar, si no quedan pendientes, el objeto vuelve a su estado anterior (tipo)
    const quedanPendientes = solicitudes.some(
      (s) => s.id !== solicitud.id && s.objetoId === objeto.id && s.estado === 'pendiente'
    );
    if (!quedanPendientes && objeto.estado === 'en_proceso') {
      objeto.estado = objeto.tipo;
      objeto.actualizadoEn = ahora();
    }

    escribir('solicitudes', solicitudes);
    escribir('objetos', objetos);

    // Notificar al solicitante
    crearNotificacion(
      solicitud.solicitanteId,
      `Tu solicitud para "${objeto.nombre}" fue rechazada. Motivo: ${motivo}`,
      '/mis-solicitudes'
    );
  },

  async cancelar(id, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const solicitudes = leer('solicitudes');
    const s = solicitudes.find((item) => item.id === id);
    if (!s) throw new ServiceError('Solicitud no encontrada.');

    if (s.solicitanteId !== usuario.id) {
      throw new ServiceError('Solo el solicitante puede cancelar su propia solicitud.');
    }

    const filtradas = solicitudes.filter((item) => item.id !== id);
    escribir('solicitudes', filtradas);

    // Si ya no quedan pendientes para ese objeto, restablecer estado
    const objetos = leer('objetos');
    const objeto = objetos.find((o) => o.id === s.objetoId);
    if (objeto && objeto.estado === 'en_proceso') {
      const masPendientes = filtradas.some(
        (otra) => otra.objetoId === objeto.id && otra.estado === 'pendiente'
      );
      if (!masPendientes) {
        objeto.estado = objeto.tipo;
        objeto.actualizadoEn = ahora();
        escribir('objetos', objetos);
      }
    }
  },
};