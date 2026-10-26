import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { objetoSchema, type ObjetoValues } from '@/lib/validaciones';
import { CATEGORIAS, UBICACIONES, PRIVACIDAD_PUBLICADOR } from '@/lib/textos';
import { hoyISO } from '@/lib/fechas';
import { comprimirImagen } from '@/lib/imagenes';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Upload, X, ShieldAlert } from 'lucide-react';

interface ObjetoFormProps {
  valIniciales?: Partial<ObjetoValues>;
  alEnviar: (valores: ObjetoValues) => Promise<void>;
  alCancelar: () => void;
  textoBoton?: string;
}

export const ObjetoForm: React.FC<ObjetoFormProps> = ({
  valIniciales,
  alEnviar,
  alCancelar,
  textoBoton = 'Guardar publicación',
}) => {
  const [imagenPreview, setImagenPreview] = useState<string | undefined>(valIniciales?.imagen);
  const [errorImagen, setErrorImagen] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ObjetoValues>({
    resolver: zodResolver(objetoSchema),
    defaultValues: {
      tipo: valIniciales?.tipo || 'perdido',
      nombre: valIniciales?.nombre || '',
      categoria: valIniciales?.categoria || 'otros',
      descripcion: valIniciales?.descripcion || '',
      ubicacion: valIniciales?.ubicacion || '',
      fecha: valIniciales?.fecha || hoyISO(),
      imagen: valIniciales?.imagen || '',
    },
  });

  const tipoSeleccionado = watch('tipo');

  const handleArchivoImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorImagen(null);
    setSubiendoImagen(true);
    try {
      const dataUrl = await comprimirImagen(file);
      setImagenPreview(dataUrl);
      setValue('imagen', dataUrl, { shouldDirty: true });
    } catch (err: unknown) {
      if (err instanceof Error) setErrorImagen(err.message);
      else setErrorImagen('Error al procesar la foto');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const quitarImagen = () => {
    setImagenPreview(undefined);
    setValue('imagen', '', { shouldDirty: true });
  };

  const onConfirmCancel = () => {
    if (isDirty) {
      if (window.confirm('¿Deseas descartar los cambios no guardados?')) {
        alCancelar();
      }
    } else {
      alCancelar();
    }
  };

  return (
    <form onSubmit={handleSubmit(alEnviar)} className="space-y-6">
      {/* Aviso de Privacidad Requerido por IHC */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Aviso de privacidad y protección de datos</p>
          <p className="text-xs text-amber-800 mt-0.5">
            {PRIVACIDAD_PUBLICADOR}. Por favor, no incluyas datos personales sensibles como números de teléfono, DNI o direcciones en el título o descripción.
          </p>
        </div>
      </div>

      {/* Tipo de reporte (perdido / encontrado) */}
      <div className="space-y-1.5 text-left">
        <label className="text-sm font-semibold text-slate-700">
          ¿Qué deseas reportar? <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3.5">
          <label
            className={`flex items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer font-semibold text-sm transition-all duration-200 select-none shadow-xs ${
              tipoSeleccionado === 'perdido'
                ? 'bg-rose-50/80 border-rose-300 text-rose-900 shadow-sm ring-2 ring-rose-200/50'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              value="perdido"
              {...register('tipo')}
              className="sr-only"
            />
            <span className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full transition-transform duration-200 ${
                  tipoSeleccionado === 'perdido'
                    ? 'bg-rose-600 ring-4 ring-rose-200 scale-110'
                    : 'bg-slate-300'
                }`}
              />
              <span>Perdí un objeto</span>
            </span>
          </label>
          <label
            className={`flex items-center justify-center p-3.5 rounded-2xl border-2 cursor-pointer font-semibold text-sm transition-all duration-200 select-none shadow-xs ${
              tipoSeleccionado === 'encontrado'
                ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-sm ring-2 ring-blue-200/50'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              value="encontrado"
              {...register('tipo')}
              className="sr-only"
            />
            <span className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full transition-transform duration-200 ${
                  tipoSeleccionado === 'encontrado'
                    ? 'bg-blue-600 ring-4 ring-blue-200 scale-110'
                    : 'bg-slate-300'
                }`}
              />
              <span>Encontré un objeto</span>
            </span>
          </label>
        </div>
        {errors.tipo && (
          <p className="text-xs font-medium text-rose-600">{errors.tipo.message}</p>
        )}
      </div>

      {/* Nombre */}
      <Input
        label="Título del objeto"
        placeholder="Ej. Mochila negra con llavero de gato"
        required
        error={errors.nombre?.message}
        ayuda="Nombre corto y descriptivo del artículo."
        {...register('nombre')}
      />

      {/* Categoría y Ubicación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Categoría"
          required
          options={CATEGORIAS.map((c) => ({ value: c.value, label: c.label }))}
          error={errors.categoria?.message}
          {...register('categoria')}
        />

        <Input
          label="Lugar / Ubicación en el campus"
          placeholder="Ej. Pabellón 300, Comedor, Laboratorio 1..."
          list="ubicaciones-sugeridas"
          required
          error={errors.ubicacion?.message}
          {...register('ubicacion')}
        />
        <datalist id="ubicaciones-sugeridas">
          {UBICACIONES.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>

      {/* Fecha */}
      <Input
        type="date"
        label="Fecha del suceso"
        max={hoyISO()}
        required
        error={errors.fecha?.message}
        ayuda="No se permiten fechas futuras."
        {...register('fecha')}
      />

      {/* Descripción */}
      <Textarea
        label="Descripción detallada"
        rows={4}
        placeholder="Menciona color, detalles de diseño, estado general..."
        required
        error={errors.descripcion?.message}
        ayuda="Mínimo 10 caracteres. No incluyas información privada."
        {...register('descripcion')}
      />

      {/* Fotografía opcional */}
      <div className="space-y-2 text-left">
        <label className="text-sm font-semibold text-slate-700">
          Fotografía del objeto (opcional pero recomendada)
        </label>
        {imagenPreview ? (
          <div className="relative inline-block border rounded-2xl overflow-hidden bg-slate-100 max-h-56">
            <img src={imagenPreview} alt="Vista previa del objeto" className="max-h-56 object-contain" />
            <button
              type="button"
              onClick={quitarImagen}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors"
              aria-label="Quitar fotografía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 font-medium">
                  {subiendoImagen ? 'Procesando imagen...' : 'Haz clic para seleccionar una foto'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG o WebP (se comprime automáticamente)</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleArchivoImagen}
                disabled={subiendoImagen}
              />
            </label>
          </div>
        )}
        {errorImagen && <p className="text-xs font-medium text-rose-600">{errorImagen}</p>}
      </div>

      {/* Botones de acción - Cancelar a la izquierda, Acción principal a la derecha (IHC sección 9) */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onConfirmCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" cargando={isSubmitting}>
          {textoBoton}
        </Button>
      </div>
    </form>
  );
};