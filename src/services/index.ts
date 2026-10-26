import type { DataSource } from '@/services/types';
import { authService } from './local/authService';
import { objetosService, inicializarStorageSiVacio } from './local/objetosService';
import { solicitudesService } from './local/solicitudesService';
import { notificacionesService } from './local/notificacionesService';
import { estadisticasService } from './local/estadisticasService';
import { borrarTodo, escribir } from './local/storage';
import { OBJETOS_SEED, USUARIOS_SEED, SOLICITUDES_SEED } from './local/seed';
import { supabaseAuthService } from './supabase/authService';
import { supabaseObjetosService } from './supabase/objetosService';
import { supabaseSolicitudesService } from './supabase/solicitudesService';
import { supabaseNotificacionesService } from './supabase/notificacionesService';
import { supabaseEstadisticasService } from './supabase/estadisticasService';

const origenDatos = import.meta.env.VITE_DATA_SOURCE || 'local';

// Inicializa datos por defecto la primera vez en local
if (origenDatos === 'local') {
  inicializarStorageSiVacio();
}

export const services: DataSource = {
  auth: origenDatos === 'supabase' ? supabaseAuthService : authService,
  objetos: origenDatos === 'supabase' ? supabaseObjetosService : objetosService,
  solicitudes: origenDatos === 'supabase' ? supabaseSolicitudesService : solicitudesService,
  notificaciones: origenDatos === 'supabase' ? supabaseNotificacionesService : notificacionesService,
  estadisticas: origenDatos === 'supabase' ? supabaseEstadisticasService : estadisticasService,
  async restablecerDemo() {
    borrarTodo();
    escribir('usuarios', USUARIOS_SEED);
    escribir('objetos', OBJETOS_SEED);
    escribir('solicitudes', SOLICITUDES_SEED);
    escribir('notificaciones', []);
  },
};

export default services;