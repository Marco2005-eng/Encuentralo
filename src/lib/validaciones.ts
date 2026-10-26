import { z } from 'zod';
import { hoyISO } from '@/lib/fechas';

const correo = z
  .string()
  .trim()
  .min(1, 'Escribe tu correo electrónico.')
  .email('El correo debe tener el formato nombre@dominio.com.');

export const loginSchema = z.object({
  correo,
  contrasena: z.string().min(1, 'Escribe tu contraseña.'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const REQUISITOS_CONTRASENA = [
  { id: 'len', texto: 'Al menos 8 caracteres', test: (v: string) => v.length >= 8 },
  { id: 'may', texto: 'Una letra mayúscula', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'num', texto: 'Un número', test: (v: string) => /\d/.test(v) },
] as const;

export const registroSchema = z
  .object({
    nombre: z.string().trim().min(3, 'Escribe tu nombre (mínimo 3 letras).').max(60, 'Máximo 60 caracteres.'),
    correo,
    contrasena: z
      .string()
      .min(8, 'La contraseña necesita al menos 8 caracteres.')
      .regex(/[A-Z]/, 'Agrega al menos una letra mayúscula.')
      .regex(/\d/, 'Agrega al menos un número.'),
    confirmar: z.string().min(1, 'Repite tu contraseña.'),
  })
  .refine((d) => d.contrasena === d.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden. Vuelve a escribirla.',
  });
export type RegistroValues = z.infer<typeof registroSchema>;

export const objetoSchema = z.object({
  tipo: z.enum(['perdido', 'encontrado'], { message: 'Indica si perdiste o encontraste el objeto.' }),
  nombre: z.string().trim().min(3, 'Escribe un nombre corto (mínimo 3 letras), ej. "Mochila negra".').max(80, 'Máximo 80 caracteres.'),
  categoria: z.enum(['electronicos', 'documentos', 'ropa', 'accesorios', 'utiles', 'llaves', 'mochilas', 'otros'], {
    message: 'Elige una categoría.',
  }),
  descripcion: z
    .string()
    .trim()
    .min(10, 'Describe el objeto con al menos 10 caracteres (color, marca, tamaño…).')
    .max(500, 'Máximo 500 caracteres.'),
  ubicacion: z.string().trim().min(2, 'Indica dónde se perdió o encontró.'),
  fecha: z
    .string()
    .min(1, 'Indica la fecha.')
    .refine((v) => v <= hoyISO(), 'La fecha no puede ser futura.'),
  imagen: z.string().optional(),
});
export type ObjetoValues = z.infer<typeof objetoSchema>;

export const solicitudSchema = z.object({
  pruebaPertenencia: z
    .string()
    .trim()
    .min(20, 'Cuéntanos un poco más (mínimo 20 caracteres): marcas, contenido o algo que solo el dueño sabría.')
    .max(600, 'Máximo 600 caracteres.'),
});
export type SolicitudValues = z.infer<typeof solicitudSchema>;

export const rechazoSchema = z.object({
  motivo: z.string().trim().min(5, 'Escribe un motivo breve (mínimo 5 caracteres).').max(200, 'Máximo 200 caracteres.'),
});
export type RechazoValues = z.infer<typeof rechazoSchema>;
