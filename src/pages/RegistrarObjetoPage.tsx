import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { ObjetoValues } from '@/lib/validaciones';
import { ObjetoForm } from '@/components/objetos/ObjetoForm';
import type { TipoReporte } from '@/types/models';
import { Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const RegistrarObjetoPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipoQuery = searchParams.get('tipo') as TipoReporte | null;
  const { usuario, estaSuspendido, motivoSuspension, fechaFinSuspension } = useAuth();
  const { mostrarToast } = useToast();

  if (estaSuspendido) {
    return (
      <div className="container-app py-16 max-w-lg text-center animate-fade-in">
        <div className="card p-8 shadow-xl border-rose-200 bg-rose-50/40">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Publicación no autorizada
          </h2>
          <p className="text-xs text-rose-800 mb-4 leading-relaxed font-medium">
            Tu cuenta tiene una suspensión temporal activa y no está autorizada para publicar objetos en la plataforma.
          </p>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-left mb-6 space-y-1.5 shadow-2xs">
            <p className="text-slate-700">
              <strong className="text-slate-900">Motivo:</strong> {motivoSuspension || 'Infracción a las normas de convivencia'}
            </p>
            <p className="text-slate-700">
              <strong className="text-slate-900">Vigencia:</strong> Hasta el{' '}
              {fechaFinSuspension
                ? new Date(fechaFinSuspension).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'próximo aviso'}
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/objetos')} className="w-full">
            Volver al catálogo
          </Button>
        </div>
      </div>
    );
  }

  const handleCrear = async (valores: ObjetoValues) => {
    if (!usuario) return;
    if (estaSuspendido) {
      mostrarToast('Tu cuenta se encuentra suspendida temporalmente y no tiene permisos para publicar objetos.', 'error');
      return;
    }

    const uActual = await services.auth.usuarioActual().catch(() => usuario);
    if (!uActual || (uActual.baneadoHasta && new Date(uActual.baneadoHasta) > new Date())) {
      mostrarToast('Tu cuenta se encuentra suspendida temporalmente por moderación.', 'error');
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
