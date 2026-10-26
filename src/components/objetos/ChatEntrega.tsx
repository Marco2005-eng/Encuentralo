import React, { useState, useEffect, useRef } from 'react';
import { services } from '@/services';
import type { MensajeEntrega } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { Send, MapPin, Building, ShieldCheck } from 'lucide-react';
import { formatFechaHora } from '@/lib/fechas';

interface ChatEntregaModalProps {
  solicitudId: string;
  nombreObjeto: string;
  usuarioActualId: string;
  sinBordes?: boolean;
}

export const ChatEntrega: React.FC<ChatEntregaModalProps> = ({
  solicitudId,
  nombreObjeto,
  usuarioActualId,
  sinBordes = false,
}) => {
  const [mensajes, setMensajes] = useState<MensajeEntrega[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finChatRef = useRef<HTMLDivElement>(null);

  const cargarMensajes = async () => {
    try {
      const data = await services.solicitudes.listarMensajesEntrega(solicitudId);
      setMensajes(data);
    } catch {
      // Ignorar errores en sondeo
    }
  };

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 4000);
    return () => clearInterval(interval);
  }, [solicitudId]);

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = async (e?: React.FormEvent, textoRapido?: string) => {
    if (e) e.preventDefault();
    const texto = (textoRapido || nuevoMensaje).trim();
    if (!texto) return;

    setEnviando(true);
    try {
      const creado = await services.solicitudes.enviarMensajeEntrega(
        solicitudId,
        texto,
        usuarioActualId
      );
      setMensajes((prev) => [...prev, creado]);
      if (!textoRapido) setNuevoMensaje('');
    } catch {
      // Error al enviar
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className={
        sinBordes
          ? 'flex flex-col h-full bg-[#f1f5f9] overflow-hidden'
          : 'flex flex-col h-[480px] bg-[#f1f5f9] rounded-2xl border border-slate-300 overflow-hidden shadow-sm'
      }
    >
      {/* Cabecera del Chat (solo si no es sinBordes) */}
      {!sinBordes && (
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Coordinación de Entrega
            </span>
            <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs">{nombreObjeto}</h4>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Pertenencia Aprobada
          </div>
        </div>
      )}

      {/* Mensajes rápidos sugeridos acordes a la UCSS */}
      <div className="p-2.5 bg-white/90 backdrop-blur-xs border-b border-slate-200 flex flex-wrap gap-1.5 text-xs">
        <span className="text-[11px] font-bold text-slate-600 self-center mr-1">Mensaje rápido:</span>
        <button
          type="button"
          onClick={() => handleEnviar(undefined, 'Ya lo dejé en la Oficina de Objetos Perdidos de la UCSS.')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-800 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Building className="w-3 h-3 text-brand-600" /> Dejado en Objetos Perdidos UCSS
        </button>
        <button
          type="button"
          onClick={() => handleEnviar(undefined, 'Lo tengo conmigo. Mañana te lo llevo a la UCSS, ¿a qué hora puedes?')}
          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <MapPin className="w-3 h-3 text-emerald-600" /> Lo llevo mañana al campus
        </button>
      </div>

      {/* Lista de Mensajes con textura de fondo de alto contraste figura-fondo (IHC) */}
      <div
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e8ecf2]"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {/* Aviso de Privacidad y Seguridad */}
        <div className="flex justify-center my-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-slate-200 shadow-xs text-[10px] font-medium text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Chat oficial UCSS para acordar entrega segura</span>
          </div>
        </div>

        {mensajes.length === 0 ? (
          <div className="h-4/5 flex flex-col items-center justify-center text-center p-6 bg-white/70 backdrop-blur-xs rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs my-auto">
            <p className="font-bold text-slate-700 mb-1">Inicia la coordinación</p>
            <p className="text-[11px] leading-relaxed max-w-xs">
              Usa los botones rápidos o escribe un mensaje para coordinar la hora y lugar en el campus UCSS.
            </p>
          </div>
        ) : (
          mensajes.map((m) => {
            const esMio = m.emisorId === usuarioActualId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                {/* Etiqueta de identificación del emisor */}
                <span className={`text-[10px] font-bold mb-0.5 px-1 ${esMio ? 'text-brand-800' : 'text-slate-600'}`}>
                  {esMio ? 'Tú' : 'Contraparte'}
                </span>

                {/* Globo de mensaje con contraste destacado y sombra */}
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs shadow-md ${
                    esMio
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-tr-xs font-normal'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed text-[13px]">{m.mensaje}</p>
                </div>

                {/* Marca de tiempo con buen contraste */}
                <span className="text-[10px] font-medium text-slate-500 mt-1 px-1">
                  {formatFechaHora(m.creadoEn)}
                </span>
              </div>
            );
          })
        )}
        <div ref={finChatRef} />
      </div>

      {/* Input de envío destacado */}
      <form onSubmit={(e) => handleEnviar(e)} className="p-3 bg-white border-t border-slate-200 flex gap-2 shadow-sm">
        <input
          type="text"
          placeholder="Escribe un mensaje de coordinación..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/70 focus:bg-white text-slate-900 placeholder:text-slate-400 font-medium"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={enviando || !nuevoMensaje.trim()}
          className="gap-1.5 shadow-sm px-4"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </Button>
      </form>
    </div>
  );
};
