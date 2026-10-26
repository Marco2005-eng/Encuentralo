import type { Categoria, EstadoObjeto, EstadoSolicitud, TipoReporte } from '@/types/models';

/** Textos visibles centralizados (sección 10). */
export const APP_NOMBRE = 'Encuéntralo';

export const CATEGORIAS: { value: Categoria; label: string }[] = [
  { value: 'electronicos', label: 'Electrónicos' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'ropa', label: 'Ropa' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'utiles', label: 'Útiles' },
  { value: 'llaves', label: 'Llaves' },
  { value: 'mochilas', label: 'Mochilas' },
  { value: 'otros', label: 'Otros' },
];

export const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.value, c.label])) as Record<
  Categoria,
  string
>;

export const ESTADO_OBJETO_LABEL: Record<EstadoObjeto, string> = {
  perdido: 'Perdido',
  encontrado: 'Encontrado',
  en_proceso: 'En proceso',
  recuperado: 'Recuperado',
};

export const ESTADO_SOLICITUD_LABEL: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
};

export const TIPO_LABEL: Record<TipoReporte, string> = {
  perdido: 'Perdí algo',
  encontrado: 'Encontré algo',
};

export const UBICACIONES = [
  'Pabellón 100',
  'Pabellón 200',
  'Pabellón 300',
  'Pabellón 400',
  'Pabellón 500',
  'Pabellón 600',
  'Comedor',
  'Laboratorio 1',
  'Laboratorio 2',
  'Laboratorio 3',
  'Laboratorio de IA',
  'Laboratorio de Redes',
  'Otro',
];

export const PRIVACIDAD_PUBLICADOR = 'Publicado por un usuario de la institución';
export const MSG_ERROR_GENERICO = 'Ocurrió un problema. Inténtalo de nuevo en unos segundos.';
