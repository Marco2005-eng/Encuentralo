import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ChatEntrega } from '@/components/objetos/ChatEntrega';
import { MessageCircle, Minus, X, ShieldCheck } from 'lucide-react';

export interface ChatVentana {
  solicitudId: string;
  nombreObjeto: string;
  minimizada?: boolean;
}

interface ChatContextType {
  chatsAbiertos: ChatVentana[];
  abrirChat: (solicitudId: string, nombreObjeto: string) => void;
  cerrarChat: (solicitudId: string) => void;
  toggleMinimizar: (solicitudId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario } = useAuth();
  const [chatsAbiertos, setChatsAbiertos] = useState<ChatVentana[]>([]);

  const abrirChat = useCallback((solicitudId: string, nombreObjeto: string) => {
    setChatsAbiertos((prev) => {
      const existe = prev.find((c) => c.solicitudId === solicitudId);
      if (existe) {
        // Si ya está abierto, lo des-minimizamos y aseguramos que esté visible
        return prev.map((c) =>
          c.solicitudId === solicitudId ? { ...c, minimizada: false } : c
        );
      }
      // Máximo 2 chats abiertos en pantalla a la vez para no saturar
      const maximoChats = prev.slice(-1);
      return [...maximoChats, { solicitudId, nombreObjeto, minimizada: false }];
    });
  }, []);

  const cerrarChat = useCallback((solicitudId: string) => {
    setChatsAbiertos((prev) => prev.filter((c) => c.solicitudId !== solicitudId));
  }, []);

  const toggleMinimizar = useCallback((solicitudId: string) => {
    setChatsAbiertos((prev) =>
      prev.map((c) =>
        c.solicitudId === solicitudId ? { ...c, minimizada: !c.minimizada } : c
      )
    );
  }, []);

  return (
    <ChatContext.Provider value={{ chatsAbiertos, abrirChat, cerrarChat, toggleMinimizar }}>
      {children}

      {/* Barra flotante estilo Facebook / Messenger en la esquina inferior derecha */}
      {usuario && chatsAbiertos.length > 0 && (
        <aside
          aria-label="Ventanas de chat de coordinación"
          className="fixed bottom-0 right-2 md:right-6 z-50 flex items-end gap-3 pointer-events-none max-w-full overflow-x-auto pb-0"
        >
          {chatsAbiertos.map((chat) => {
            if (chat.minimizada) {
              return (
                <div
                  key={chat.solicitudId}
                  className="pointer-events-auto bg-slate-900 text-white rounded-t-xl shadow-xl flex items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-slate-800 transition-all border border-slate-700/80 max-w-[200px]"
                  onClick={() => toggleMinimizar(chat.solicitudId)}
                  title="Expandir conversación"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-semibold truncate flex-1">{chat.nombreObjeto}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cerrarChat(chat.solicitudId);
                    }}
                    aria-label="Cerrar chat"
                    className="text-slate-400 hover:text-white p-0.5 rounded-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={chat.solicitudId}
                className="pointer-events-auto w-[calc(100vw-20px)] sm:w-[360px] max-w-[360px] h-[75vh] sm:h-[480px] max-h-[550px] bg-white rounded-t-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-all duration-200 animate-slide-up"
              >
                {/* Cabecera estilo Facebook / Messenger */}
                <div className="bg-gradient-to-r from-brand-700 to-brand-800 text-white px-3.5 py-2.5 flex items-center justify-between shadow-sm cursor-pointer select-none">
                  <div
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                    onClick={() => toggleMinimizar(chat.solicitudId)}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-brand-800 rounded-full"></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold truncate leading-tight text-white">
                        {chat.nombreObjeto}
                      </h4>
                      <p className="text-[10px] text-brand-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-300" />
                        Coordinación UCSS
                      </p>
                    </div>
                  </div>

                  {/* Acciones cabecera */}
                  <div className="flex items-center gap-1 text-brand-100">
                    <button
                      type="button"
                      onClick={() => toggleMinimizar(chat.solicitudId)}
                      title="Minimizar"
                      aria-label="Minimizar ventana"
                      className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => cerrarChat(chat.solicitudId)}
                      title="Cerrar chat"
                      aria-label="Cerrar ventana"
                      className="p-1.5 hover:bg-rose-500/80 hover:text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido del Chat con fondo distintivo */}
                <div className="flex-1 flex flex-col min-h-0 bg-[#e8ecf2]">
                  <ChatEntrega
                    solicitudId={chat.solicitudId}
                    nombreObjeto={chat.nombreObjeto}
                    usuarioActualId={usuario.id}
                    sinBordes={true}
                  />
                </div>
              </div>
            );
          })}
        </aside>
      )}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider');
  }
  return context;
};
