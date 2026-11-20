import React, { createContext, useContext, useState, useCallback } from 'react';

export type RolAyuda = 'perdi' | 'encontre' | null;

interface AyudaContextType {
  modalAbierto: boolean;
  rolInicial: RolAyuda;
  abrirAyuda: (rol?: RolAyuda) => void;
  cerrarAyuda: () => void;
  terminosAbierto: boolean;
  abrirTerminos: () => void;
  cerrarTerminos: () => void;
}

const AyudaContext = createContext<AyudaContextType | undefined>(undefined);

export const AyudaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolInicial, setRolInicial] = useState<RolAyuda>(null);
  const [terminosAbierto, setTerminosAbierto] = useState(false);

  const abrirAyuda = useCallback((rol: RolAyuda = null) => {
    setRolInicial(rol);
    setModalAbierto(true);
  }, []);

  const cerrarAyuda = useCallback(() => {
    setModalAbierto(false);
  }, []);

  const abrirTerminos = useCallback(() => {
    setTerminosAbierto(true);
  }, []);

  const cerrarTerminos = useCallback(() => {
    setTerminosAbierto(false);
  }, []);

  return (
    <AyudaContext.Provider
      value={{
        modalAbierto,
        rolInicial,
        abrirAyuda,
        cerrarAyuda,
        terminosAbierto,
        abrirTerminos,
        cerrarTerminos,
      }}
    >
      {children}
    </AyudaContext.Provider>
  );
};

export const useAyuda = (): AyudaContextType => {
  const context = useContext(AyudaContext);
  if (!context) {
    throw new Error('useAyuda debe ser usado dentro de un AyudaProvider');
  }
  return context;
};
