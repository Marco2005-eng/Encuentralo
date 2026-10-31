import type { Objeto, Usuario } from '@/types/models';
import { ServiceError, type ObjetosService } from '@/services/types';
import { ahora, escribir, latencia, leer, nuevoId } from './storage';
import { OBJETOS_SEED, USUARIOS_SEED, SOLICITUDES_SEED } from './seed';
import { notificacionesService } from './notificacionesService';

export function inicializarStorageSiVacio(): void {
  const usuarios = leer('usuarios');
  if (!usuarios || usuarios.length === 0) {
    escribir('usuarios', USUARIOS_SEED);
  }
  const objetos = leer('objetos');
  if (!objetos || objetos.length === 0) {
    escribir('objetos', OBJETOS_SEED);
  }
  const solicitudes = leer('solicitudes');
  if (!solicitudes || solicitudes.length === 0) {
    escribir('solicitudes', SOLICITUDES_SEED);
  }
  const notificaciones = leer('notificaciones');
  if (!notificaciones) {
    escribir('notificaciones', []);
  }
}

export const objetosService: ObjetosService = {
  async listar(filtros) {
    await latencia();
    inicializarStorageSiVacio();
    let lista = leer('objetos');

    if (filtros?.q) {
      const q = filtros.q.toLowerCase().trim();
      lista = lista.filter(
        (o) => o.nombre.toLowerCase().includes(q) || o.descripcion.toLowerCase().includes(q)
      );
    }
    if (filtros?.categoria) {
      lista = lista.filter((o) => o.categoria === filtros.categoria);
    }
    if (filtros?.ubicacion) {
      lista = lista.filter((o) => o.ubicacion.toLowerCase() === filtros.ubicacion?.toLowerCase());
    }
    if (filtros?.estado) {
      lista = lista.filter((o) => o.estado === filtros.estado);
    }
    if (filtros?.tipo) {
      lista = lista.filter((o) => o.tipo === filtros.tipo);
    }
    if (filtros?.desde) {
      lista = lista.filter((o) => o.fecha >= filtros.desde!);
    }
    if (filtros?.hasta) {
      lista = lista.filter((o) => o.fecha <= filtros.hasta!);
    }
    if (!filtros?.incluirOcultos) {
      lista = lista.filter((o) => !o.oculto);
    }

    if (filtros?.orden === 'antiguos') {
      lista.sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime());
    } else {
      lista.sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime());
    }

    return lista;
  },

  async obtener(id) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    return lista.find((o) => o.id === id) || null;
  },

  async crear(datos, usuarioId) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const nuevo: Objeto = {
      ...datos,
      id: nuevoId(),
      estado: datos.tipo, // Regla 1: estado inicial igual al tipo (perdido | encontrado)
      publicadoPor: usuarioId,
      creadoEn: ahora(),
      actualizadoEn: ahora(),
    };
    escribir('objetos', [nuevo, ...lista]);
    return nuevo;
  },

  async actualizar(id, datos, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const index = lista.findIndex((o) => o.id === id);
    if (index === -1) throw new ServiceError('El objeto especificado no existe.');

    const obj = lista[index];
    if (obj.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes permiso para modificar esta publicación.');
    }

    const actualizado: Objeto = {
      ...obj,
      ...datos,
      actualizadoEn: ahora(),
    };
    lista[index] = actualizado;
    escribir('objetos', lista);
    return actualizado;
  },

  async cambiarEstado(id, nuevoEstado, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const index = lista.findIndex((o) => o.id === id);
    if (index === -1) throw new ServiceError('El objeto especificado no existe.');

    const obj = lista[index];
    if (obj.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes permiso para cambiar el estado de este objeto.');
    }

    const actualizado: Objeto = {
      ...obj,
      estado: nuevoEstado,
      actualizadoEn: ahora(),
    };
    lista[index] = actualizado;
    escribir('objetos', lista);
    return actualizado;
  },

  async eliminar(id, usuario: Usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const obj = lista.find((o) => o.id === id);
    if (!obj) throw new ServiceError('El objeto especificado no existe.');

    if (obj.publicadoPor !== usuario.id && usuario.rol !== 'admin') {
      throw new ServiceError('No tienes permiso para eliminar esta publicación.');
    }

    escribir('objetos', lista.filter((o) => o.id !== id));
  },

  async delUsuario(usuarioId) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    return lista.filter((o) => o.publicadoPor === usuarioId);
  },

  async ubicaciones() {
    await latencia(50);
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const setUbicaciones = new Set(lista.map((o) => o.ubicacion));
    return Array.from(setUbicaciones);
  },

  async ocultar(id, motivo, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const index = lista.findIndex((o) => o.id === id);
    if (index === -1) throw new ServiceError('El objeto especificado no existe.');

    const obj = lista[index];
    if (usuario.rol !== 'admin' && obj.publicadoPor !== usuario.id) {
      throw new ServiceError('No tienes permiso para ocultar esta publicación.');
    }

    const actualizado: Objeto = {
      ...obj,
      oculto: true,
      motivoOculto: motivo.trim(),
      actualizadoEn: ahora(),
    };
    lista[index] = actualizado;
    escribir('objetos', lista);

    // Notificar al autor
    await notificacionesService.crear(
      obj.publicadoPor,
      `Tu publicación "${obj.nombre}" ha sido ocultada por la administración. Motivo: ${motivo.trim()}. Por favor edítala para mejorarla.`,
      `/mis-publicaciones/${obj.id}/editar`
    );

    return actualizado;
  },

  async desocultar(id, usuario) {
    await latencia();
    inicializarStorageSiVacio();
    const lista = leer('objetos');
    const index = lista.findIndex((o) => o.id === id);
    if (index === -1) throw new ServiceError('El objeto especificado no existe.');

    const obj = lista[index];
    if (usuario.rol !== 'admin' && obj.publicadoPor !== usuario.id) {
      throw new ServiceError('No tienes permiso para reactivar esta publicación.');
    }

    const actualizado: Objeto = {
      ...obj,
      oculto: false,
      motivoOculto: undefined,
      actualizadoEn: ahora(),
    };
    lista[index] = actualizado;
    escribir('objetos', lista);

    await notificacionesService.crear(
      obj.publicadoPor,
      `Tu publicación "${obj.nombre}" ha sido reactivada y ya es visible públicamente en el catálogo.`,
      `/objetos/${obj.id}`
    );

    return actualizado;
  },
};