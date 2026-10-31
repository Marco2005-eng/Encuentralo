import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatFecha } from '@/lib/fechas';
import { Mail, Shield, Save, CheckCircle2, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { REQUISITOS_CONTRASENA } from '@/lib/validaciones';

export const PerfilPage: React.FC = () => {
  const {
    usuario,
    actualizarPerfil,
    asignarContrasena,
    estaSuspendido,
    motivoSuspension,
    fechaFinSuspension,
    abrirModalSuspension,
  } = useAuth();
  const { mostrarToast } = useToast();

  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [guardando, setGuardando] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  // Estados para asignar contraseña
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmarClave, setConfirmarClave] = useState('');
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [errorClave, setErrorClave] = useState<string | null>(null);

  if (!usuario) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || nombre.trim().length < 3) {
      setErrorNombre('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    setErrorNombre(null);
    setGuardando(true);
    try {
      await actualizarPerfil({ nombre, telefono });
      mostrarToast('Perfil actualizado correctamente.', 'exito');
    } catch (err: unknown) {
      if (err instanceof Error) mostrarToast(err.message, 'error');
      else mostrarToast('No se pudo actualizar el perfil.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleAsignarContrasena = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorClave(null);

    if (nuevaClave.length < 8) {
      setErrorClave('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(nuevaClave)) {
      setErrorClave('Debe contener al menos una letra mayúscula.');
      return;
    }
    if (!/\d/.test(nuevaClave)) {
      setErrorClave('Debe contener al menos un número.');
      return;
    }
    if (nuevaClave !== confirmarClave) {
      setErrorClave('Las contraseñas no coinciden.');
      return;
    }

    setGuardandoClave(true);
    try {
      await asignarContrasena(nuevaClave);
      mostrarToast('¡Contraseña asignada con éxito! Ahora puedes iniciar sesión con correo y contraseña o con Google.', 'exito');
      setNuevaClave('');
      setConfirmarClave('');
    } catch (err: unknown) {
      if (err instanceof Error) setErrorClave(err.message);
      else setErrorClave('No fue posible asignar la contraseña.');
    } finally {
      setGuardandoClave(false);
    }
  };

  return (
    <div className="container-app py-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gestiona tus datos personales y número de contacto para la entrega de pertenencias.
        </p>
      </div>

      <div className="card p-6 sm:p-8 space-y-8">
        {/* Encabezado del Perfil */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {usuario.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{usuario.nombre}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                <Shield className="w-3 h-3" />
                Rol: {usuario.rol === 'admin' ? 'Administrador' : 'Estudiante / Personal'}
              </span>
              <span className="text-xs text-slate-400">
                Miembro desde {formatFecha(usuario.creadoEn)}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de cuenta suspendida si corresponde */}
        {estaSuspendido && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Estado de la cuenta: Suspendida
              </span>
              <p className="text-xs text-rose-900 font-medium">
                Motivo: <strong>{motivoSuspension}</strong>
              </p>
              <p className="text-[11px] text-rose-700">
                Hasta el {fechaFinSuspension ? formatFecha(fechaFinSuspension) : 'próximo aviso'}.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={abrirModalSuspension}
              className="text-rose-700 border-rose-300 hover:bg-rose-100 text-xs shrink-0 self-start sm:self-auto"
            >
              Ver detalles de sanción
            </Button>
          </div>
        )}

        {/* Formulario de Edición */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            error={errorNombre || undefined}
            ayuda="Tu nombre visible en tus reportes y solicitudes aprobadas."
          />

          <div className="space-y-1.5 text-left">
            <label className="text-sm font-semibold text-slate-700">
              Correo electrónico institucional
            </label>
            <div className="relative">
              <input
                type="email"
                value={usuario.correo}
                disabled
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
            <p className="text-xs text-slate-400">El correo está vinculado a tu cuenta de autenticación.</p>
          </div>

          <div className="space-y-1.5 text-left">
            <Input
              label="Número de Teléfono o WhatsApp (Opcional)"
              type="tel"
              placeholder="Ej. +51 987 654 321"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              ayuda="Solo se mostrará a la otra persona cuando una solicitud sea APROBADA para coordinar la entrega física o entrega por WhatsApp."
            />
          </div>

          {/* Aviso IHC de Privacidad */}
          <div className="flex items-start gap-3 p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-emerald-900 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Protección de Privacidad (IHC):</strong> Tu número de teléfono y datos de contacto permanecen privados. Nunca aparecerán públicos en el catálogo ni en las búsquedas. Solo se compartirán bilateralmente cuando tú apruebes una solicitud de pertenencia.
            </p>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" cargando={guardando} className="gap-2">
              <Save className="w-4 h-4" />
              Guardar cambios
            </Button>
          </div>
        </form>

        {/* Sección: Asignar o Cambiar Contraseña (para quienes entraron con Google) */}
        <div className="pt-8 border-t border-slate-200/80">
          <div className="flex items-center gap-2.5 mb-2">
            <KeyRound className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Contraseña de acceso
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Si iniciaste sesión con Google, puedes asignar una contraseña para poder ingresar también escribiendo tu correo y contraseña manualmente.
          </p>

          {errorClave && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {errorClave}
            </div>
          )}

          <form onSubmit={handleAsignarContrasena} className="space-y-4">
            <Input
              type="password"
              label="Nueva contraseña"
              placeholder="••••••••"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              required
            />

            {/* Requisitos interactivos */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-[11px] font-semibold text-slate-600">Requisitos:</p>
              <ul className="text-xs space-y-1">
                {REQUISITOS_CONTRASENA.map((req) => {
                  const cumple = req.test(nuevaClave);
                  return (
                    <li
                      key={req.id}
                      className={`flex items-center gap-1.5 transition-colors ${
                        cumple ? 'text-emerald-700 font-medium' : 'text-slate-400'
                      }`}
                    >
                      <span>{cumple ? '✓' : '•'}</span>
                      <span>{req.texto}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Input
              type="password"
              label="Confirmar nueva contraseña"
              placeholder="••••••••"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              required
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="outline"
                cargando={guardandoClave}
                className="gap-2 text-slate-800 border-slate-300"
              >
                <Lock className="w-4 h-4" />
                Establecer contraseña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};