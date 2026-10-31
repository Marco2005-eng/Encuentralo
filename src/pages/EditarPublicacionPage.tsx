import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { services } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { Objeto } from '@/types/models';
import type { ObjetoValues } from '@/lib/validaciones';
import { ObjetoForm } from '@/components/objetos/ObjetoForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';

export const EditarPublicacionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { mostrarToast } = useToast();

  const [objeto, setObjeto] = useState<Objeto | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      if (!id) return;
      try {
        const data = await services.objetos.obtener(id);
        if (data && usuario && (data.publicadoPor === usuario.id || usuario.rol === 'admin')) {
          setObjeto(data);
        } else {
          mostrarToast('No tienes permiso para editar esta publicación.', 'error');
          navigate('/mis-publicaciones');
        }
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, usuario, navigate]);

  const handleGuardar = async (valores: ObjetoValues) => {
    if (!usuario || !objeto) return;
    try {
      await services.objetos.actualizar(objeto.id, valores, usuario);
      if (objeto.oculto) {
        await services.objetos.desocultar(objeto.id, usuario);
        mostrarToast('¡Publicación corregida y visible nuevamente en el catálogo!', 'exito');
      } else {
        mostrarToast('Publicación actualizada correctamente.', 'exito');
      }
      navigate(`/objetos/${objeto.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
      else mostrarToast('Error al actualizar.', 'error');
    }
  };

  if (cargando) {
    return (
      <div className="container-app py-10 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!objeto) return null;

  return (
    <div className="container-app py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Editar publicación
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Actualiza los detalles o corrige información sobre "{objeto.nombre}"
        </p>
      </div>

      {objeto.oculto && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-amber-950">
              Esta publicación está actualmente oculta al público
            </p>
            <p className="text-slate-800">
              <strong>Motivo indicado por la administración:</strong>{' '}
              <span className="font-semibold text-amber-900">"{objeto.motivoOculto || 'Requiere mejoras en la información o imagen.'}"</span>
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Realiza las mejoras solicitadas abajo y haz clic en <strong>"Guardar cambios"</strong>. Tu publicación se reactivará automáticamente y volverá a ser visible en el catálogo general.
            </p>
          </div>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <ObjetoForm
          valIniciales={{
            tipo: objeto.tipo,
            nombre: objeto.nombre,
            categoria: objeto.categoria,
            descripcion: objeto.descripcion,
            ubicacion: objeto.ubicacion,
            fecha: objeto.fecha,
            imagen: objeto.imagen,
          }}
          alEnviar={handleGuardar}
          alCancelar={() => navigate(-1)}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
};