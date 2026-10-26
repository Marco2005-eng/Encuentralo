import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="container-app py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Skeleton className="w-12 h-12 rounded-full mb-4" />
        <Skeleton className="w-48 h-6 rounded-lg" />
      </div>
    );
  }

  if (!usuario) {
    // Redirige al login y preserva la ruta de destino
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="container-app py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <Skeleton className="w-12 h-12 rounded-full mb-4" />
        <Skeleton className="w-48 h-6 rounded-lg" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/iniciar-sesion" state={{ from: location }} replace />;
  }

  if (usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};