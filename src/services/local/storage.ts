import type { Notificacion, Objeto, Solicitud, Usuario } from '@/types/models';
import { ServiceError } from '@/services/types';

/** Único módulo que toca localStorage. */
const PREFIJO = 'encuentralo:';

export interface UsuarioGuardado extends Usuario {
  /** Solo demo local. En producción lo gestiona Supabase Auth. */
  contrasena: string;
}

interface Colecciones {
  usuarios: UsuarioGuardado[];
  objetos: Objeto[];
  solicitudes: Solicitud[];
  notificaciones: Notificacion[];
}

export function leer<K extends keyof Colecciones>(clave: K): Colecciones[K] {
  try {
    const raw = localStorage.getItem(PREFIJO + clave);
    return raw ? (JSON.parse(raw) as Colecciones[K]) : ([] as unknown as Colecciones[K]);
  } catch {
    return [] as unknown as Colecciones[K];
  }
}

export function escribir<K extends keyof Colecciones>(clave: K, valor: Colecciones[K]): void {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    throw new ServiceError(
      'No se pudo guardar en este navegador (espacio lleno o modo privado). Prueba con una imagen más pequeña.',
    );
  }
}

export function leerValor(clave: string): string | null {
  try {
    return localStorage.getItem(PREFIJO + clave);
  } catch {
    return null;
  }
}

export function escribirValor(clave: string, valor: string | null): void {
  try {
    if (valor === null) localStorage.removeItem(PREFIJO + clave);
    else localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    /* sin persistencia: la sesión durará solo esta pestaña */
  }
}

export function borrarTodo(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIJO))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignorado */
  }
}

/** Latencia simulada para ver estados de carga. */
export function latencia(ms = 150 + Math.random() * 150): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export const ahora = () => new Date().toISOString();
export const nuevoId = () => crypto.randomUUID();
