import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registroSchema, type RegistroValues, REQUISITOS_CONTRASENA } from '@/lib/validaciones';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Check, X, UserPlus, Eye, EyeOff } from 'lucide-react';

export const RegistroPage: React.FC = () => {
  const { registrar, iniciarSesionConGoogle } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const [mostrarClave, setMostrarClave] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistroValues>({
    resolver: zodResolver(registroSchema),
  });

  const claveActual = watch('contrasena') || '';

  const onSubmit = async (valores: RegistroValues) => {
    setErrorGlobal(null);
    try {
      await registrar({
        nombre: valores.nombre,
        correo: valores.correo,
        contrasena: valores.contrasena,
      });
      mostrarToast('¡Cuenta creada exitosamente! Bienvenido a Encuéntralo.', 'exito');
      navigate('/objetos');
    } catch (err: unknown) {
      if (err instanceof Error) setErrorGlobal(err.message);
      else setErrorGlobal('No fue posible completar el registro.');
    }
  };

  const handleGoogleSignup = async () => {
    setErrorGlobal(null);
    setCargandoGoogle(true);
    try {
      await iniciarSesionConGoogle();
      mostrarToast('¡Registro con Google exitoso!', 'exito');
      navigate('/objetos');
    } catch (err: unknown) {
      if (err instanceof Error) setErrorGlobal(err.message);
      else setErrorGlobal('No fue posible registrarse con Google.');
    } finally {
      setCargandoGoogle(false);
    }
  };

  return (
    <div className="container-app py-12 flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-md card p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crear una cuenta</h1>
          <p className="text-xs text-slate-500 mt-1">
            Únete a la red institucional para reportar o encontrar pertenencias
          </p>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-fade-up">
            {errorGlobal}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre y Apellidos"
            placeholder="Ej. Carlos Delgado"
            required
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <Input
            type="email"
            label="Correo electrónico"
            placeholder="nombre@encuentralo.test"
            required
            error={errors.correo?.message}
            {...register('correo')}
          />

          <div className="space-y-1 text-left">
            <div className="relative">
              <Input
                type={mostrarClave ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
                required
                error={errors.contrasena?.message}
                {...register('contrasena')}
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 p-1"
                aria-label={mostrarClave ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarClave ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Indicador interactivo de requisitos de contraseña (IHC 7.2) */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mt-2 space-y-1">
              <p className="text-[11px] font-semibold text-slate-600">Requisitos de seguridad:</p>
              <ul className="text-xs space-y-1">
                {REQUISITOS_CONTRASENA.map((req) => {
                  const cumple = req.test(claveActual);
                  return (
                    <li
                      key={req.id}
                      className={`flex items-center gap-1.5 transition-colors ${
                        cumple ? 'text-emerald-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {cumple ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
                      <span>{req.texto}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <Input
            type={mostrarClave ? 'text' : 'password'}
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            required
            error={errors.confirmar?.message}
            {...register('confirmar')}
          />

          <Button type="submit" variant="primary" className="w-full mt-2" cargando={isSubmitting}>
            Registrarme ahora
          </Button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0">
              o regístrate con
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignup}
            cargando={cargandoGoogle}
            className="w-full border-slate-200 hover:bg-slate-50 gap-2.5 text-slate-700 font-semibold"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Registrarme con Google
          </Button>
        </form>

        <p className="text-xs text-center text-slate-600 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/iniciar-sesion" className="text-brand-600 font-semibold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};