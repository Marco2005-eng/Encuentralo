import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PantallaCarga } from '@/routes/guards';
import { useToast } from '@/context/ToastContext';

export const AuthCallbackPage: React.FC = () => {
  const { usuario, cargando } = useAuth();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  useEffect(() => {
    // Esperar a que la autenticación termine de parsear tokens y perfil
    if (cargando) return;

    if (usuario) {
      let destino = '/objetos';
      try {
        const guardado = sessionStorage.getItem('encuentralo:destino_oauth');
        if (guardado) {
          destino = guardado;
          sessionStorage.removeItem('encuentralo:destino_oauth');
        }
      } catch {}

      mostrarToast('¡Sesión con Google iniciada exitosamente!', 'exito');
      navigate(destino, { replace: true });
    } else {
      mostrarToast('No fue posible completar la autenticación con Google.', 'error');
      navigate('/iniciar-sesion', { replace: true });
    }
  }, [cargando, usuario, navigate, mostrarToast]);

  return <PantallaCarga mensaje="Finalizando inicio de sesión con Google..." />;
};
