import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Usuario } from '@/types/models';
import { services } from '@/services';

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (correo: string, contrasena: string) => Promise<Usuario>;
  iniciarSesionConGoogle: () => Promise<void>;
  registrar: (datos: { nombre: string; correo: string; contrasena: string }) => Promise<Usuario>;
  cerrarSesion: () => Promise<void>;
  refrescarSesion: () => Promise<void>;
  actualizarPerfil: (datos: { nombre: string; telefono?: string }) => Promise<Usuario>;
  asignarContrasena: (contrasena: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  const refrescarSesion = async () => {
    try {
      const u = await services.auth.usuarioActual();
      setUsuario(u);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    refrescarSesion();
  }, []);

  const iniciarSesion = async (correo: string, contrasena: string) => {
    const u = await services.auth.iniciarSesion(correo, contrasena);
    setUsuario(u);
    return u;
  };

  const iniciarSesionConGoogle = async () => {
    if (services.auth.iniciarSesionConGoogle) {
      await services.auth.iniciarSesionConGoogle();
      await refrescarSesion();
    }
  };

  const registrar = async (datos: { nombre: string; correo: string; contrasena: string }) => {
    const u = await services.auth.registrar(datos);
    setUsuario(u);
    return u;
  };

  const cerrarSesion = async () => {
    await services.auth.cerrarSesion();
    setUsuario(null);
  };

  const actualizarPerfil = async (datos: { nombre: string; telefono?: string }) => {
    const actualizado = await services.auth.actualizarPerfil(datos);
    setUsuario(actualizado);
    return actualizado;
  };

  const asignarContrasena = async (contrasena: string) => {
    await services.auth.asignarContrasena(contrasena);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        iniciarSesion,
        iniciarSesionConGoogle,
        registrar,
        cerrarSesion,
        refrescarSesion,
        actualizarPerfil,
        asignarContrasena,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}