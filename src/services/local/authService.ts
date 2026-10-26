import type { Usuario } from '@/types/models';
import { ServiceError, type AuthService } from '@/services/types';
import { ahora, escribir, escribirValor, latencia, leer, leerValor, nuevoId, type UsuarioGuardado } from './storage';

const SESION = 'sesion';

function publico(u: UsuarioGuardado): Usuario {
  const { contrasena: _omit, ...resto } = u;
  void _omit;
  return resto;
}

export const authService: AuthService = {
  async registrar({ nombre, correo, contrasena }) {
    await latencia();
    const usuarios = leer('usuarios');
    const c = correo.trim().toLowerCase();
    if (usuarios.some((u) => u.correo === c)) {
      throw new ServiceError('No pudimos crear la cuenta con ese correo. Prueba con otro o inicia sesión.');
    }
    const nuevo: UsuarioGuardado = { id: nuevoId(), nombre: nombre.trim(), correo: c, rol: 'usuario', creadoEn: ahora(), contrasena };
    escribir('usuarios', [...usuarios, nuevo]);
    escribirValor(SESION, nuevo.id);
    return publico(nuevo);
  },

  async iniciarSesion(correo, contrasena) {
    await latencia();
    const c = correo.trim().toLowerCase();
    const u = leer('usuarios').find((x) => x.correo === c && x.contrasena === contrasena);
    // Mensaje genérico: no revela si el correo existe.
    if (!u) throw new ServiceError('Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.');
    
    // Verificar si está suspendido
    if (u.baneadoHasta && new Date(u.baneadoHasta) > new Date()) {
      const fecha = new Date(u.baneadoHasta).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
      throw new ServiceError(
        `Tu cuenta se encuentra suspendida hasta el ${fecha}. Motivo: ${u.motivoBaneo || 'Infracción a las normas de convivencia'}.`
      );
    }

    escribirValor(SESION, u.id);
    return publico(u);
  },

  async iniciarSesionConGoogle() {
    await latencia();
    // En modo local demo: simula autenticación con una cuenta institucional de Google
    let usuarioGoogle = leer('usuarios').find((u) => u.correo === 'estudiante.google@encuentralo.test');
    if (!usuarioGoogle) {
      usuarioGoogle = {
        id: nuevoId(),
        nombre: 'Estudiante Google Demo',
        correo: 'estudiante.google@encuentralo.test',
        rol: 'usuario',
        creadoEn: ahora(),
        contrasena: 'GoogleAuth123!',
      };
      escribir('usuarios', [...leer('usuarios'), usuarioGoogle]);
    }
    escribirValor(SESION, usuarioGoogle.id);
  },

  async cerrarSesion() {
    await latencia(80);
    escribirValor(SESION, null);
  },

  async usuarioActual() {
    const id = leerValor(SESION);
    if (!id) return null;
    const u = leer('usuarios').find((x) => x.id === id);
    return u ? publico(u) : null;
  },

  async actualizarPerfil({ nombre, telefono }) {
    await latencia();
    const id = leerValor(SESION);
    if (!id) throw new ServiceError('No hay una sesión activa.');
    const usuarios = leer('usuarios');
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx === -1) throw new ServiceError('Usuario no encontrado.');

    usuarios[idx] = {
      ...usuarios[idx],
      nombre: nombre.trim(),
      telefono: telefono?.trim() || undefined,
    };
    escribir('usuarios', usuarios);
    return publico(usuarios[idx]);
  },

  async asignarContrasena(contrasena: string) {
    await latencia();
    const id = leerValor(SESION);
    if (!id) throw new ServiceError('No hay una sesión activa.');
    const usuarios = leer('usuarios');
    const idx = usuarios.findIndex((u) => u.id === id);
    if (idx === -1) throw new ServiceError('Usuario no encontrado.');

    usuarios[idx] = {
      ...usuarios[idx],
      contrasena,
    };
    escribir('usuarios', usuarios);
  },

  async listarUsuarios(admin: Usuario): Promise<Usuario[]> {
    await latencia();
    if (admin.rol !== 'admin') throw new ServiceError('Acceso restringido.');
    return leer('usuarios').map(publico);
  },

  async suspenderUsuario(usuarioId: string, dias: number, motivo: string, admin: Usuario): Promise<void> {
    await latencia();
    if (admin.rol !== 'admin') throw new ServiceError('Acceso restringido.');
    const usuarios = leer('usuarios');
    const idx = usuarios.findIndex((u) => u.id === usuarioId);
    if (idx === -1) throw new ServiceError('Usuario no encontrado.');

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias);

    usuarios[idx] = {
      ...usuarios[idx],
      baneadoHasta: fechaFin.toISOString(),
      motivoBaneo: motivo.trim(),
    };
    escribir('usuarios', usuarios);
  },

  async quitarSuspension(usuarioId: string, admin: Usuario): Promise<void> {
    await latencia();
    if (admin.rol !== 'admin') throw new ServiceError('Acceso restringido.');
    const usuarios = leer('usuarios');
    const idx = usuarios.findIndex((u) => u.id === usuarioId);
    if (idx === -1) throw new ServiceError('Usuario no encontrado.');

    usuarios[idx] = {
      ...usuarios[idx],
      baneadoHasta: null,
      motivoBaneo: null,
    };
    escribir('usuarios', usuarios);
  },
};

export function nombreUsuario(id: string): string | undefined {
  return leer('usuarios').find((u) => u.id === id)?.nombre;
}
