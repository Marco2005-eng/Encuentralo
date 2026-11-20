import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAyuda } from '@/context/AyudaContext';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  MessageCircle,
  EyeOff,
  UserCheck,
} from 'lucide-react';

export const ModalTerminosPrivacidad: React.FC = () => {
  const { terminosAbierto, cerrarTerminos } = useAyuda();
  const [seccionActiva, setSeccionActiva] = useState<'privacidad' | 'terminos' | 'seguridad'>('privacidad');

  return (
    <Modal
      abierto={terminosAbierto}
      alCerrar={cerrarTerminos}
      titulo="Términos del Servicio y Política de Privacidad"
      anchoMax="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Encabezado descriptivo */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-50/70 border border-brand-100 text-brand-950">
          <ShieldCheck className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold tracking-tight">Compromiso Institucional con la Comunidad</h3>
            <p className="text-xs text-brand-800 leading-relaxed">
              Encuéntralo protege la privacidad de estudiantes y personal del campus mediante protocolos de identidad resguardada y verificación de pertenencia segura.
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación Rápida */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setSeccionActiva('privacidad')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              seccionActiva === 'privacidad'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacidad de Datos</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva('terminos')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              seccionActiva === 'terminos'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Normas y Sanciones</span>
          </button>
          <button
            type="button"
            onClick={() => setSeccionActiva('seguridad')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              seccionActiva === 'seguridad'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Puntos de Entrega</span>
          </button>
        </div>

        {/* Contenido según pestaña */}
        {seccionActiva === 'privacidad' && (
          <div className="space-y-4 animate-fade-in text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <EyeOff className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">1. Cero datos personales en catálogos públicos</h4>
                <p className="text-slate-600">
                  A diferencia de redes sociales abiertas, los reportes públicos de objetos nunca muestran tu número de teléfono, correo electrónico ni número de DNI. En el catálogo solo se indica "Publicado por un usuario de la institución".
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">2. Acreditación de pertenencia privada</h4>
                <p className="text-slate-600">
                  La información de comprobación que envías al reclamar un objeto (rayones específicos, stickers, contraseñas de pantalla o fotos de prueba) es confidencial y solo puede ser vista por la persona que custodia el objeto y la administración.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 mb-0.5">3. Chat interno exclusivo</h4>
                <p className="text-slate-600">
                  Una vez aprobada la solicitud, las partes coordinan la entrega mediante el Chat de Entrega integrado de la plataforma, evitando divulgar contactos de mensajería privada.
                </p>
              </div>
            </div>
          </div>
        )}

        {seccionActiva === 'terminos' && (
          <div className="space-y-4 animate-fade-in text-slate-700 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/70 border border-rose-100">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-950 mb-0.5">Prohibición estricta de reclamos fraudulentos</h4>
                <p className="text-rose-900/90 text-xs leading-relaxed">
                  Intentar reclamar pertenencias ajenas o proporcionar descripciones falsas constituye una falta grave contra las normas de ética y convivencia universitaria.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <h4 className="font-bold text-slate-900 text-sm">Régimen de sanciones aplicables:</h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>
                  <strong className="text-slate-800">Primera reincidencia o sospecha fundada:</strong> Suspensión temporal de la cuenta por 7 a 30 días con bloqueo inmediato de solicitudes y publicaciones.
                </li>
                <li>
                  <strong className="text-slate-800">Fraude consumado o apropiación ilícita:</strong> Inhabilitación definitiva del usuario y derivación formal del caso a la Oficina de Bienestar Universitario y Dirección Académica.
                </li>
                <li>
                  <strong className="text-slate-800">Uso responsable de fotos:</strong> Prohibido subir imágenes con contenido ofensivo, sensible o capturas que violen la intimidad de terceros.
                </li>
              </ul>
            </div>
          </div>
        )}

        {seccionActiva === 'seguridad' && (
          <div className="space-y-4 animate-fade-in text-slate-700 text-xs sm:text-sm leading-relaxed">
            <p className="text-xs text-slate-600">
              Para garantizar la integridad y seguridad de ambas partes, las devoluciones presenciales deben coordinarse exclusivamente en los siguientes puntos oficiales:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Caseta de Vigilancia Central (Puerta Principal)</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Punto oficial disponible las 24 horas. Obligatorio para entrega de carnés universitarios, DNI, tarjetas bancarias y dispositivos de alto valor.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Mostrador de Biblioteca Central</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Espacio tranquilo y vigilado, ideal para revisión de mochilas, cuadernos, laptops o calculadoras científicas.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block font-bold">Comedor Universitario (Zona Abierta)</strong>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Zona amplia, iluminada y concurrida para entregas rápidas a plena luz del día entre horas de clase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pie del modal con botón de cierre */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Reglamento de Convivencia y Seguridad del Campus
          </span>
          <Button variant="primary" size="sm" onClick={cerrarTerminos} className="shadow-sm">
            Entendido y conforme
          </Button>
        </div>
      </div>
    </Modal>
  );
};
