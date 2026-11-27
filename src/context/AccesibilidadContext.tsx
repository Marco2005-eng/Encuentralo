import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { accesibilidadService, PREFERENCIAS_INICIALES, type PreferenciasAccesibilidad } from '@/services/accesibilidadService';
interface AccesibilidadContextType {
  preferencias: PreferenciasAccesibilidad;
  actualizar: (cambio: Partial<PreferenciasAccesibilidad>) => void;
  restablecer: () => void;
  guardado: boolean;
  panelAbierto: boolean;
  abrirPanel: () => void;
  cerrarPanel: () => void;
}
const AccesibilidadContext = createContext<AccesibilidadContextType | null>(null);
export function AccesibilidadProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState(accesibilidadService.leer);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [guardado, setGuardado] = useState(true);
  useEffect(() => {
    document.documentElement.style.fontSize = `${preferencias.tamano}%`;
    document.documentElement.dataset.colores = preferencias.colores;
    document.documentElement.dataset.tamanoTexto = String(preferencias.tamano);
    setGuardado(accesibilidadService.guardar(preferencias));
  }, [preferencias]);
  const actualizar = (cambio: Partial<PreferenciasAccesibilidad>) => setPreferencias(actual => ({ ...actual, ...cambio }));
  const restablecer = () => setPreferencias({ ...PREFERENCIAS_INICIALES });
  return <AccesibilidadContext.Provider value={{ preferencias, actualizar, restablecer, guardado, panelAbierto, abrirPanel: () => setPanelAbierto(true), cerrarPanel: () => setPanelAbierto(false) }}>{children}</AccesibilidadContext.Provider>;
}
export function useAccesibilidad() {
  const context = useContext(AccesibilidadContext);
  if (!context) throw new Error('Falta AccesibilidadProvider');
  return context;
}
