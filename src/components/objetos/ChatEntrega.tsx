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
}

export const ChatEntrega: React.FC<ChatEntregaModalProps> = ({
  solicitudId,
  nombreObjeto,
  usuarioActualId,
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
    <div className="flex flex-col h-[480px] bg-slate-50/50 rounded-2xl border border-slate-200 overflow-hidden">
      {/* Cabecera del Chat */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Coordinación de Entrega
          </span>
          <h4 className="text-sm font-bold text-slate-900 truncate max-w-xs">{nombreObjeto}</h4>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3" /> Pertenencia Aprobada
        </div>
      </div>

      {/* Mensajes rápidos sugeridos acordes a la UCSS */}
      <div className="p-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap gap-1.5 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 self-center mr-1">Mensaje rápido:</span>
        <button
          type="button"
          onClick={() => handleEnviar(undefined, 'Ya lo dejé en la Oficina de Objetos Perdidos de la UCSS.')}
          className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <Building className="w-3 h-3 text-brand-600" /> Dejado en Objetos Perdidos UCSS
        </button>
        <button
          type="button"
          onClick={() => handleEnviar(undefined, 'Lo tengo conmigo. Mañana te lo llevo a la UCSS, ¿a qué hora puedes?')}
          className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
        >
          <MapPin className="w-3 h-3 text-emerald-600" /> Lo llevo mañana al campus
        </button>
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {mensajes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs p-6">
            <p className="font-semibold text-slate-600 mb-1">Inicia la coordinación</p>
            <p>Acuerden la fecha, hora o lugar del campus donde se realizará la devolución.</p>
          </div>
        ) : (
          mensajes.map((m) => {
            const esMio = m.emisorId === usuarioActualId;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs shadow-xs ${
                    esMio
                      ? 'bg-brand-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.mensaje}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatFechaHora(m.creadoEn)}
                </span>
              </div>
            );
          })
        )}
        <div ref={finChatRef} />
      </div>

      {/* Input de envío */}
      <form onSubmit={(e) => handleEnviar(e)} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="Escribe un mensaje de coordinación..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={enviando || !nuevoMensaje.trim()}
          className="gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar</span>
        </Button>
      </form>
    </div>
  );
};
