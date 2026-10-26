import type {
  Categoria,
  EstadoObjeto,
  MensajeEntrega,
  Notificacion,
  Objeto,
  Solicitud,
  TipoReporte,
  Usuario,
} from '@/types/models';

/**
 * Contratos de la capa de datos. La UI solo depende de estas interfaces;
 * hoy se implementan con localStorage y mañana con Supabase (mismas firmas).
 */

export interface ObjetoFiltros {
  q?: string;
  categoria?: Categoria;
  ubicacion?: string;
  estado?: EstadoObjeto;
  tipo?: TipoReporte;
  desde?: string;
  hasta?: string;
  orden?: 'recientes' | 'antiguos';
}

export type NuevoObjeto = Omit<Objeto, 'id' | 'estado' | 'publicadoPor' | 'creadoEn' | 'actualizadoEn'>;

/** Solicitud enriquecida con datos mínimos del objeto (sin datos personales). */
export interface SolicitudConObjeto extends Solicitud {
  objeto?: Pick<Objeto, 'id' | 'nombre' | 'estado' | 'imagen' | 'publicadoPor'>;
  /** Nombre del solicitante: solo para autor del objeto o admin. */
  solicitanteNombre?: string;
  /** Teléfono o WhatsApp de contacto disponible solo si fue aprobada */
  solicitanteTelefono?: string;
  publicadorTelefono?: string;
}

export interface Estadisticas {
  perdidos: number;
  encontrados: number;
  enProceso: number;
  recuperados: number;
  solicitudesPendientes: number;
  porCategoria: { categoria: Categoria; total: number }[];
}

export interface AuthService {
  registrar(datos: { nombre: string; correo: string; contrasena: string }): Promise<Usuario>;
  iniciarSesion(correo: string, contrasena: string): Promise<Usuario>;
  iniciarSesionConGoogle?(): Promise<void>;
  cerrarSesion(): Promise<void>;
  usuarioActual(): Promise<Usuario | null>;
  actualizarPerfil(datos: { nombre: string; telefono?: string }): Promise<Usuario>;
  asignarContrasena(contrasena: string): Promise<void>;
  listarUsuarios(admin: Usuario): Promise<Usuario[]>;
  suspenderUsuario(usuarioId: string, dias: number, motivo: string, admin: Usuario): Promise<void>;
  quitarSuspension(usuarioId: string, admin: Usuario): Promise<void>;
}

export interface ObjetosService {
  listar(filtros?: ObjetoFiltros): Promise<Objeto[]>;
  obtener(id: string): Promise<Objeto | null>;
  crear(datos: NuevoObjeto, usuarioId: string): Promise<Objeto>;
  actualizar(id: string, datos: Partial<NuevoObjeto>, usuario: Usuario): Promise<Objeto>;
  cambiarEstado(id: string, estado: EstadoObjeto, usuario: Usuario): Promise<Objeto>;
  eliminar(id: string, usuario: Usuario): Promise<void>;
  delUsuario(usuarioId: string): Promise<Objeto[]>;
  ubicaciones(): Promise<string[]>;
}

export interface SolicitudesService {
  crear(objetoId: string, pruebaPertenencia: string, usuario: Usuario, pruebaImagen?: string): Promise<Solicitud>;
  delSolicitante(usuarioId: string): Promise<SolicitudConObjeto[]>;
  delObjeto(objetoId: string, usuario: Usuario): Promise<SolicitudConObjeto[]>;
  todas(usuario: Usuario): Promise<SolicitudConObjeto[]>;
  miSolicitudActiva(objetoId: string, usuarioId: string): Promise<Solicitud | null>;
  aprobar(id: string, usuario: Usuario): Promise<void>;
  rechazar(id: string, motivo: string, usuario: Usuario): Promise<void>;
  cancelar(id: string, usuario: Usuario): Promise<void>;
  eliminar(id: string, usuario: Usuario): Promise<void>;
  ocultar(id: string, oculta: boolean, usuario: Usuario): Promise<void>;
  listarMensajesEntrega(solicitudId: string): Promise<MensajeEntrega[]>;
  enviarMensajeEntrega(solicitudId: string, mensaje: string, emisorId: string): Promise<MensajeEntrega>;
}

export interface NotificacionesService {
  delUsuario(usuarioId: string): Promise<Notificacion[]>;
  marcarTodasLeidas(usuarioId: string): Promise<void>;
  crear(usuarioId: string, mensaje: string, enlace?: string): Promise<Notificacion>;
}

export interface EstadisticasService {
  resumen(): Promise<Estadisticas>;
}

export interface DataSource {
  auth: AuthService;
  objetos: ObjetosService;
  solicitudes: SolicitudesService;
  notificaciones: NotificacionesService;
  estadisticas: EstadisticasService;
  restablecerDemo(): Promise<void>;
}

/** Error con mensaje apto para mostrar al usuario. */
export class ServiceError extends Error {}
