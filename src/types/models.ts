export type Rol = 'usuario' | 'admin';
export type TipoReporte = 'perdido' | 'encontrado';
export type EstadoObjeto = 'perdido' | 'encontrado' | 'en_proceso' | 'recuperado';
export type Categoria =
  | 'electronicos'
  | 'documentos'
  | 'ropa'
  | 'accesorios'
  | 'utiles'
  | 'llaves'
  | 'mochilas'
  | 'otros';
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  rol: Rol;
  creadoEn: string;
  baneadoHasta?: string | null;
  motivoBaneo?: string | null;
}

export interface Objeto {
  id: string;
  tipo: TipoReporte;
  estado: EstadoObjeto;
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  ubicacion: string;
  fecha: string;
  imagen?: string;
  publicadoPor: string;
  creadoEn: string;
  actualizadoEn: string;
  oculto?: boolean;
  motivoOculto?: string;
}

export interface Solicitud {
  id: string;
  objetoId: string;
  solicitanteId: string;
  pruebaPertenencia: string;
  pruebaImagen?: string;
  estado: EstadoSolicitud;
  motivoRechazo?: string;
  creadoEn: string;
  resueltaEn?: string;
  oculta?: boolean;
}

export interface Notificacion {
  id: string;
  usuarioId: string;
  mensaje: string;
  leida: boolean;
  enlace?: string;
  creadoEn: string;
}

export interface MensajeEntrega {
  id: string;
  solicitudId: string;
  emisorId: string;
  mensaje: string;
  creadoEn: string;
}
