import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { ObjetoValues } from '@/lib/validaciones';
import { ObjetoForm } from '@/components/objetos/ObjetoForm';
import type { TipoReporte } from '@/types/models';

export const RegistrarObjetoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoQuery = searchParams.get('tipo') as TipoReporte | null;
  const { usuario, estaSuspendido } = useAuth();
  const { mostrarToast } = useToast();

  const handleCrear = async (valores: ObjetoValues) => {
    if (!usuario) return;
    if (estaSuspendido) {
      mostrarToast('Tu cuenta se encuentra suspendida temporalmente.', 'error');
      return;
    }
    try {
      const nuevo = await services.objetos.crear(valores, usuario.id);
      mostrarToast('¡Objeto publicado con éxito!', 'exito');
      navigate(`/objetos/${nuevo.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        mostrarToast(err.message, 'error');
      } else {
        mostrarToast('Error al publicar el objeto.', 'error');
      }
    }
  };

  return (
    <div className="container-app py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publicar nuevo objeto
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Completa los datos del objeto para que la comunidad pueda encontrarlo o reconocerlo.
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <ObjetoForm
          valIniciales={{ tipo: tipoQuery || 'perdido' }}
          alEnviar={handleCrear}
          alCancelar={() => navigate(-1)}
          textoBoton="Publicar aviso"
        />
      </div>
    </div>
  );
};