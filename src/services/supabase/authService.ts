import type { AuthService } from '@/services/types';
import type { Usuario } from '@/types/models';
import {
  SUPABASE_URL,
  getAuthHeaders,
  guardarSesionLocal,
  obtenerSesionLocal,
  refrescarTokenSupabase,
} from './client';
import { supabaseNotificacionesService } from './notificacionesService';

export const supabaseAuthService: AuthService = {
  async registrar({ nombre, correo, contrasena }): Promise<Usuario> {
    // 1. Verificar primero si el correo ya existe en perfiles (por ejemplo, si ya se creó con Google)
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?correo=eq.${correo.trim().toLowerCase()}&select=id`, {
      headers: getAuthHeaders(),
    });
    if (checkRes.ok) {
      const existentes = await checkRes.json();
      if (existentes && existentes.length > 0) {
        throw new Error('Ya existe una cuenta registrada con este correo electrónico (posiblemente creada con Google). Inicia sesión con Google o usa tu contraseña.');
      }
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: correo.trim().toLowerCase(),
        password: contrasena,
        data: {
          nombre,
          rol: 'usuario',
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      // Supabase suele responder con "User already registered"
      const errorMsg = data.msg || data.error_description || '';
      if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('registered')) {
        throw new Error('Ya existe una cuenta con este correo. Por favor inicia sesión directamente o ingresa con Google.');
      }
      throw new Error(errorMsg || 'No se pudo crear la cuenta.');
    }

    if (data.access_token) {
      guardarSesionLocal(data);
    }

    const user = data.user || data;
    return {
      id: user.id,
      nombre: user.user_metadata?.nombre || nombre,
      correo: user.email || correo,
      rol: (user.user_metadata?.rol as 'usuario' | 'admin') || 'usuario',
      creadoEn: user.created_at || new Date().toISOString(),
    };
  },

  async iniciarSesion(correo: string, contrasena: string): Promise<Usuario> {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        email: correo.trim().toLowerCase(),
        password: contrasena,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error_description || data.msg || '';
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('not confirmed')) {
        throw new Error('Debes confirmar tu correo electrónico antes de ingresar (o desactiva "Confirm email" en Supabase).');
      }
      throw new Error(
        'Correo o contraseña incorrectos. Si creaste la cuenta con Google, ingresa con el botón de Google.'
      );
    }

    guardarSesionLocal(data);
    const user = data.user;

    let rolReal: 'usuario' | 'admin' = (user.user_metadata?.rol as 'usuario' | 'admin') || 'usuario';
    let nombreReal = user.user_metadata?.nombre || user.user_metadata?.full_name || 'Usuario';
    let telefonoReal = user.user_metadata?.telefono || undefined;
    let baneadoHastaReal: string | null = null;
    let motivoBaneoReal: string | null = null;

    try {
      const perfilRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${user.id}&select=*`, {
        headers: getAuthHeaders(data.access_token),
      });
      if (perfilRes.ok) {
        const perfiles = await perfilRes.json();
        if (perfiles && perfiles.length > 0) {
          if (perfiles[0].rol) rolReal = perfiles[0].rol;
          if (perfiles[0].nombre) nombreReal = perfiles[0].nombre;
          if (perfiles[0].telefono) telefonoReal = perfiles[0].telefono;
          if (perfiles[0].baneado_hasta) baneadoHastaReal = perfiles[0].baneado_hasta;
          if (perfiles[0].motivo_baneo) motivoBaneoReal = perfiles[0].motivo_baneo;
        }
      }
    } catch {}

    return {
      id: user.id,
      nombre: nombreReal,
      correo: user.email || correo,
      telefono: telefonoReal,
      rol: rolReal,
      creadoEn: user.created_at || new Date().toISOString(),
      baneadoHasta: baneadoHastaReal,
      motivoBaneo: motivoBaneoReal,
    };
  },

  async iniciarSesionConGoogle(): Promise<void> {
    // Redirige directamente al endpoint REST oficial de Supabase Auth para Google OAuth
    const redirectTo = encodeURIComponent(`${window.location.origin}/objetos`);
    const googleAuthUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
    window.location.href = googleAuthUrl;
  },

  async cerrarSesion(): Promise<void> {
    const sesion = obtenerSesionLocal();
    if (sesion?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: getAuthHeaders(sesion.access_token),
      }).catch(() => {});
    }
    guardarSesionLocal(null);
  },

  async usuarioActual(): Promise<Usuario | null> {
    // 1. Si venimos redirigidos de Google OAuth, los tokens vienen en el hash (#access_token=...)
    if (window.location.hash.includes('access_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken) {
        // Limpiamos el hash de la URL para que no quede visible
        window.history.replaceState(null, '', window.location.pathname);

        // Obtener usuario con este token
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: getAuthHeaders(accessToken),
        });

        if (res.ok) {
          const user = await res.json();
          const expiresIn = Number(hashParams.get('expires_in')) || 3600;
          guardarSesionLocal({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expiresIn,
            user,
          });

          // Consultar el rol real en public.perfiles
          let rolReal: 'usuario' | 'admin' = (user.user_metadata?.rol as 'usuario' | 'admin') || 'usuario';
          let telefonoReal = user.user_metadata?.telefono || undefined;
          let nombreReal = user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';

          try {
            const perfilRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${user.id}&select=*`, {
              headers: getAuthHeaders(accessToken),
            });
            if (perfilRes.ok) {
              const perfiles = await perfilRes.json();
              if (perfiles && perfiles.length > 0) {
                if (perfiles[0].rol) rolReal = perfiles[0].rol;
                if (perfiles[0].nombre) nombreReal = perfiles[0].nombre;
                if (perfiles[0].telefono) telefonoReal = perfiles[0].telefono;
              }
            }
          } catch {
            // Ignorar y usar user_metadata
          }

          return {
            id: user.id,
            nombre: nombreReal,
            correo: user.email || '',
            telefono: telefonoReal,
            rol: rolReal,
            creadoEn: user.created_at || new Date().toISOString(),
          };
        }
      }
    }

    // 2. Sesión guardada previamente
    let sesion = obtenerSesionLocal();
    if (!sesion?.access_token) return null;

    // Verificar si el token está por expirar o ya expiró y renovarlo proactivamente
    if (sesion.expires_at) {
      const ahoraSegundos = Math.floor(Date.now() / 1000);
      if (ahoraSegundos >= sesion.expires_at - 120 && sesion.refresh_token) {
        await refrescarTokenSupabase();
        sesion = obtenerSesionLocal();
      }
    }

    if (!sesion?.access_token) return null;

    try {
      let tokenActual = sesion.access_token;
      let res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: getAuthHeaders(tokenActual),
      });

      // Si el access_token expiró (401), intentar renovarlo con el refresh_token
      if (res.status === 401 && sesion.refresh_token) {
        const nuevoToken = await refrescarTokenSupabase();
        if (nuevoToken) {
          tokenActual = nuevoToken;
          res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            headers: getAuthHeaders(tokenActual),
          });
        }
      }

      if (!res.ok) {
        guardarSesionLocal(null);
        return null;
      }

      const user = await res.json();

      // Consultar siempre el rol actualizado en public.perfiles
      let rolReal: 'usuario' | 'admin' = (user.user_metadata?.rol as 'usuario' | 'admin') || 'usuario';
      let telefonoReal = user.user_metadata?.telefono || undefined;
      let nombreReal = user.user_metadata?.nombre || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
      let baneadoHastaReal: string | null = null;
      let motivoBaneoReal: string | null = null;

      try {
        const perfilRes = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${user.id}&select=*`, {
          headers: getAuthHeaders(tokenActual),
        });
        if (perfilRes.ok) {
          const perfiles = await perfilRes.json();
          if (perfiles && perfiles.length > 0) {
            if (perfiles[0].rol) rolReal = perfiles[0].rol;
            if (perfiles[0].nombre) nombreReal = perfiles[0].nombre;
            if (perfiles[0].telefono) telefonoReal = perfiles[0].telefono;
            if (perfiles[0].baneado_hasta) baneadoHastaReal = perfiles[0].baneado_hasta;
            if (perfiles[0].motivo_baneo) motivoBaneoReal = perfiles[0].motivo_baneo;
          }
        }
      } catch {
        // Ignorar y usar user_metadata
      }

      return {
        id: user.id,
        nombre: nombreReal,
        correo: user.email || '',
        telefono: telefonoReal,
        rol: rolReal,
        creadoEn: user.created_at || new Date().toISOString(),
        baneadoHasta: baneadoHastaReal,
        motivoBaneo: motivoBaneoReal,
      };
    } catch {
      return null;
    }
  },

  async actualizarPerfil({ nombre, telefono }): Promise<Usuario> {
    const sesion = obtenerSesionLocal();
    if (!sesion?.access_token) {
      throw new Error('No hay una sesión activa.');
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: getAuthHeaders(sesion.access_token),
      body: JSON.stringify({
        data: {
          nombre: nombre.trim(),
          telefono: telefono?.trim() || null,
        },
      }),
    });

    const user = await res.json();
    if (!res.ok) {
      throw new Error(user.msg || user.error_description || 'No se pudo actualizar el perfil.');
    }

    // Actualizar también la tabla public.perfiles en Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(sesion.access_token),
      body: JSON.stringify({
        nombre: nombre.trim(),
        telefono: telefono?.trim() || null,
      }),
    }).catch(() => {});

    sesion.user = user;
    guardarSesionLocal(sesion);

    return {
      id: user.id,
      nombre: user.user_metadata?.nombre || nombre,
      correo: user.email || '',
      telefono: user.user_metadata?.telefono || undefined,
      rol: (user.user_metadata?.rol as 'usuario' | 'admin') || 'usuario',
      creadoEn: user.created_at || new Date().toISOString(),
    };
  },

  async asignarContrasena(contrasena: string): Promise<void> {
    const sesion = obtenerSesionLocal();
    if (!sesion?.access_token) {
      throw new Error('No hay una sesión activa.');
    }

    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: getAuthHeaders(sesion.access_token),
      body: JSON.stringify({
        password: contrasena,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.msg || data.error_description || 'No se pudo asignar la contraseña.');
    }
  },

  async listarUsuarios(admin: Usuario): Promise<Usuario[]> {
    if (admin.rol !== 'admin') throw new Error('Acceso restringido.');
    const sesion = obtenerSesionLocal();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/perfiles?order=creado_en.desc&select=*`, {
      headers: getAuthHeaders(sesion?.access_token),
    });
    if (!res.ok) return [];
    const perfiles = await res.json();
    return perfiles.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      correo: p.correo,
      telefono: p.telefono || undefined,
      rol: p.rol || 'usuario',
      creadoEn: p.creado_en,
      baneadoHasta: p.baneado_hasta || null,
      motivoBaneo: p.motivo_baneo || null,
    }));
  },

  async suspenderUsuario(usuarioId: string, dias: number, motivo: string, admin: Usuario): Promise<void> {
    if (admin.rol !== 'admin') throw new Error('Acceso restringido.');
    const sesion = obtenerSesionLocal();
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias);

    await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${usuarioId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(sesion?.access_token),
      body: JSON.stringify({
        baneado_hasta: fechaFin.toISOString(),
        motivo_baneo: motivo.trim(),
      }),
    });

    const fechaFormateada = fechaFin.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    await supabaseNotificacionesService.crear(
      usuarioId,
      `Tu cuenta ha sido suspendida hasta el ${fechaFormateada}. Motivo: ${motivo.trim()}. Las funciones de publicar y solicitar objetos quedan restringidas.`
    );
  },

  async quitarSuspension(usuarioId: string, admin: Usuario): Promise<void> {
    if (admin.rol !== 'admin') throw new Error('Acceso restringido.');
    const sesion = obtenerSesionLocal();
    await fetch(`${SUPABASE_URL}/rest/v1/perfiles?id=eq.${usuarioId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(sesion?.access_token),
      body: JSON.stringify({
        baneado_hasta: null,
        motivo_baneo: null,
      }),
    });

    await supabaseNotificacionesService.crear(
      usuarioId,
      'Tu cuenta institucional ha sido reactivada. Ya puedes volver a publicar reportes y enviar solicitudes de objetos.'
    );
  },
};
