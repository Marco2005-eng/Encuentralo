export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const STORAGE_SESSION_KEY = 'encuentralo:supabase_session';

export function getAuthHeaders(accessToken?: string) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export function guardarSesionLocal(data: any) {
  try {
    if (!data) {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } else {
      // Calcular y asegurar timestamp unix de expiración si viene expires_in
      if (data.expires_in && !data.expires_at) {
        data.expires_at = Math.floor(Date.now() / 1000) + Number(data.expires_in);
      }
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignorar errores de storage
  }
}

export function obtenerSesionLocal(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Deduplicador de llamadas concurrentes a refresco de token para evitar conflictos de rotación
let refrescoEnCurso: Promise<string | null> | null = null;

export async function refrescarTokenSupabase(): Promise<string | null> {
  if (refrescoEnCurso) {
    return refrescoEnCurso;
  }

  refrescoEnCurso = (async () => {
    try {
      const sesion = obtenerSesionLocal();
      if (!sesion?.refresh_token) {
        return null;
      }

      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: sesion.refresh_token,
        }),
      });

      if (!res.ok) {
        // Si el refresh token fue revocado o ya no es válido, limpiar la sesión
        if (res.status === 400 || res.status === 401) {
          guardarSesionLocal(null);
        }
        return null;
      }

      const nuevaData = await res.json();
      guardarSesionLocal(nuevaData);
      return nuevaData.access_token || null;
    } catch {
      return null;
    } finally {
      refrescoEnCurso = null;
    }
  })();

  return refrescoEnCurso;
}

export async function obtenerAccessTokenValido(): Promise<string | null> {
  const sesion = obtenerSesionLocal();
  if (!sesion?.access_token) return null;

  // Si tiene fecha de expiración y le quedan menos de 2 minutos, renovarlo antes de usar
  if (sesion.expires_at) {
    const ahoraSegundos = Math.floor(Date.now() / 1000);
    if (ahoraSegundos >= sesion.expires_at - 120) {
      if (sesion.refresh_token) {
        const nuevoToken = await refrescarTokenSupabase();
        if (nuevoToken) return nuevoToken;
      }
    }
  }

  return sesion.access_token;
}
