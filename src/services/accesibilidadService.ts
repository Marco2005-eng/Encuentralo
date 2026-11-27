export const TAMANOS_TEXTO = [100, 115, 130, 150] as const;
export type TamanoTexto = typeof TAMANOS_TEXTO[number];
export type ModoColor = 'original' | 'diferenciado' | 'contraste';
export interface PreferenciasAccesibilidad {
  tamano: TamanoTexto;
  colores: ModoColor;
  voz: boolean;
  velocidad: number;
}
export const PREFERENCIAS_INICIALES: PreferenciasAccesibilidad = {
  tamano: 100, colores: 'original', voz: false, velocidad: 1,
};
const CLAVE = 'encuentralo:accesibilidad:v1';
export const accesibilidadService = {
  leer(): PreferenciasAccesibilidad {
    try {
      const datos: unknown = JSON.parse(localStorage.getItem(CLAVE) || 'null');
      if (!datos || typeof datos !== 'object') return { ...PREFERENCIAS_INICIALES };
      const valor = datos as Record<string, unknown>;
      return {
        tamano: TAMANOS_TEXTO.includes(valor.tamano as TamanoTexto) ? valor.tamano as TamanoTexto : 100,
        colores: ['original', 'diferenciado', 'contraste'].includes(String(valor.colores)) ? valor.colores as ModoColor : 'original',
        voz: valor.voz === true,
        velocidad: [0.8, 1, 1.2].includes(Number(valor.velocidad)) ? Number(valor.velocidad) : 1,
      };
    } catch { return { ...PREFERENCIAS_INICIALES }; }
  },
  guardar(preferencias: PreferenciasAccesibilidad): boolean {
    try { localStorage.setItem(CLAVE, JSON.stringify(preferencias)); return true; }
    catch { return false; }
  },
};
