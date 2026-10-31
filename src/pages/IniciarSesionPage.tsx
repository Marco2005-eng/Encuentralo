import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '@/lib/validaciones';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';

export const IniciarSesionPage: React.FC = () => {
  const { iniciarSesion, iniciarSesionConGoogle } = useAuth();
  const { mostrarToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarClave, setMostrarClave] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);

  // Ruta original a la que quería entrar el usuario antes del guard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/objetos';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (valores: LoginValues) => {
    setErrorGlobal(null);
    try {
      const u = await iniciarSesion(valores.correo, valores.contrasena);
      const estaBaneado = Boolean(u?.baneadoHasta && new Date(u.baneadoHasta) > new Date());
      if (estaBaneado) {
        mostrarToast('Ingresaste en modo restringido. Revisa el aviso de suspensión.', 'info');
      } else {
        mostrarToast('¡Sesión iniciada correctamente!', 'exito');
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) setErrorGlobal(err.message);
      else setErrorGlobal('No fue posible iniciar sesión.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorGlobal(null);
    setCargandoGoogle(true);
    try {
      await iniciarSesionConGoogle();
      mostrarToast('¡Sesión con Google exitosa!', 'exito');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) setErrorGlobal(err.message);
      else setErrorGlobal('No fue posible iniciar sesión con Google.');
    } finally {
      setCargandoGoogle(false);
    }
  };

  return (
    <div className="container-app py-12 flex-1 flex flex-col items-center justify-center">
      <div className="w-full max-w-md card p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ingresa a tu cuenta para reportar o solicitar objetos
          </p>
        </div>

        {errorGlobal && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-fade-up">
            {errorGlobal}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            label="Correo electrónico institucional"
            placeholder="ejemplo@encuentralo.test"
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
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" cargando={isSubmitting}>
            <LogIn className="w-4 h-4 mr-2" />
            Entrar al sistema
          </Button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0">
              o continúa con
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
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
            Continuar con Google
          </Button>
        </form>

        <p className="text-xs text-center text-slate-600 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="text-brand-600 font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};