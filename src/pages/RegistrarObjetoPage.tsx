import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { ObjetoValues } from '@/lib/validaciones';
import { ObjetoForm } from '@/components/objetos/ObjetoForm';
import type { TipoReporte } from '@/types/models';
import { Lock } from 'lucide-react';

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

      {/* Banner Informativo de Privacidad y Buenas Prácticas */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100 flex items-start gap-3 text-xs text-slate-700">
        <Lock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Recomendación de seguridad institucional:
          </p>
          <p className="text-slate-600 leading-relaxed">
            No incluyas números de celular, direcciones personales ni contraseñas en la descripción. Cuando se apruebe una solicitud, podrás coordinar la entrega en un punto seguro del campus mediante el <strong>Chat de Entrega</strong> privado.
          </p>
        </div>
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
