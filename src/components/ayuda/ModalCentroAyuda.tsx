import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { useAyuda } from '@/context/AyudaContext';
import {
  PASOS_PERDI,
  PASOS_ENCONTRE,
  PREGUNTAS_FRECUENTES,
  ESTADOS_INFO,
} from '@/lib/ayudaContenido';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  HelpCircle,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const ModalCentroAyuda: React.FC = () => {
  const { modalAbierto, cerrarAyuda, rolInicial } = useAyuda();
  const navigate = useNavigate();

  // Modo de rol seleccionado: null (pantalla inicial con 2 tarjetas) | 'perdi' | 'encontre'
  const [rolSeleccionado, setRolSeleccionado] = useState<'perdi' | 'encontre' | null>(null);

  // Buscador en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // Acordeón abierto
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null);
  const [estadosAbierto, setEstadosAbierto] = useState<boolean>(false);

  // Sincronizar rol inicial si se pasó al abrir
  useEffect(() => {
    if (rolInicial) {
      setRolSeleccionado(rolInicial);
    } else {
      setRolSeleccionado(null);
    }
    setBusqueda('');
    setFaqAbierta(null);
    setEstadosAbierto(false);
  }, [modalAbierto, rolInicial]);

  // Filtrado reactivo en tiempo real de preguntas frecuentes
  const faqsFiltradas = useMemo(() => {
    if (!busqueda.trim()) return PREGUNTAS_FRECUENTES;
    const q = busqueda.toLowerCase().trim();
    return PREGUNTAS_FRECUENTES.filter(
      (f) =>
        f.pregunta.toLowerCase().includes(q) ||
        f.respuesta.toLowerCase().includes(q)
    );
  }, [busqueda]);

  // Pasos filtrados por búsqueda
  const pasosPerdiFiltrados = useMemo(() => {
    if (!busqueda.trim()) return PASOS_PERDI;
    const q = busqueda.toLowerCase().trim();
    return PASOS_PERDI.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.consejo?.toLowerCase().includes(q)
    );
  }, [busqueda]);

  const pasosEncontreFiltrados = useMemo(() => {
    if (!busqueda.trim()) return PASOS_ENCONTRE;
    const q = busqueda.toLowerCase().trim();
    return PASOS_ENCONTRE.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.consejo?.toLowerCase().includes(q)
    );
  }, [busqueda]);

  const toggleFaq = (id: string) => {
    setFaqAbierta((prev) => (prev === id ? null : id));
  };

  const handleIrA = (ruta: string) => {
    cerrarAyuda();
    navigate(ruta);
  };

  return (
    <Modal
      abierto={modalAbierto}
      alCerrar={cerrarAyuda}
      titulo="Centro de Ayuda"
      anchoMax="max-w-2xl"
    >
      <div className="flex flex-col gap-6 text-slate-800">
        {/* Buscador reactivo en tiempo real */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Escribe tu duda (ej: prueba privada, chat, qué no incluir, entrega)..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-white focus:bg-white rounded-2xl text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 shadow-sm transition-all"
            aria-label="Buscar en el centro de ayuda"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
              aria-label="Limpiar campo de búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MODO RESULTADOS DE BÚSQUEDA DIRECTOS */}
        {busqueda ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 border-b border-slate-200 pb-2">
              <span>Coincidencias encontradas ({faqsFiltradas.length + (pasosPerdiFiltrados.length > 0 ? 1 : 0) + (pasosEncontreFiltrados.length > 0 ? 1 : 0)})</span>
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="text-brand-700 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>

            {faqsFiltradas.length === 0 && pasosPerdiFiltrados.length === 0 && pasosEncontreFiltrados.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">No encontramos coincidencias para esa consulta</p>
                <p className="text-sm text-slate-600 mt-1">
                  Intenta con términos más simples como "prueba", "entrega", "celular", "seguridad" o "vigilancia".
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {faqsFiltradas.map((faq) => {
                  const abierta = faqAbierta === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors gap-3"
                      >
                        <span>{faq.pregunta}</span>
                        {abierta ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {abierta && (
                        <div className="px-4 pb-4 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50 whitespace-pre-line">
                          {faq.respuesta}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* MODO PRINCIPAL: ¿QUÉ NECESITAS HACER? */
          <div className="space-y-6">
            {!rolSeleccionado ? (
              /* PASO 0: DOS TARJETAS GRANDES */
              <div className="space-y-4 animate-fade-in">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    ¿Qué necesitas hacer hoy?
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Selecciona una opción para guiarte en pocos pasos:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tarjeta Perdí algo */}
                  <button
                    type="button"
                    onClick={() => setRolSeleccionado('perdi')}
                    className="group flex flex-col items-start p-5 rounded-2xl border-2 border-rose-100 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 transition-all text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-200"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-rose-800 transition-colors">
                      Perdí algo
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Quiero buscar en el catálogo o saber cómo acreditar que un objeto encontrado me pertenece.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700 group-hover:translate-x-1 transition-transform">
                      Ver cómo recuperarlo &rarr;
                    </span>
                  </button>

                  {/* Tarjeta Encontré algo */}
                  <button
                    type="button"
                    onClick={() => setRolSeleccionado('encontre')}
                    className="group flex flex-col items-start p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 transition-all text-left shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-200"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                      Encontré algo
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Hallé un artículo en el campus y deseo publicarlo de forma segura para devolverlo a su dueño.
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                      Ver cómo reportarlo &rarr;
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* PASO GUIADO SELECCIONADO (Perdí o Encontré) */
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <button
                    type="button"
                    onClick={() => setRolSeleccionado(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a elegir opción
                  </button>

                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {rolSeleccionado === 'perdi' ? 'Paso a paso: Si perdiste algo' : 'Paso a paso: Si encontraste algo'}
                  </span>
                </div>

                {/* Lista de pasos unificada */}
                <div className="space-y-3">
                  {(rolSeleccionado === 'perdi' ? PASOS_PERDI : PASOS_ENCONTRE).map((paso) => (
                    <div
                      key={paso.numero}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-start gap-3.5"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-sm ${
                          rolSeleccionado === 'perdi'
                            ? 'bg-rose-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {paso.numero}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {paso.titulo}
                        </h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {paso.descripcion}
                        </p>
                        {paso.consejo && (
                          <p className="text-xs text-slate-500 font-medium pt-0.5">
                            💡 {paso.consejo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ÚNICO CTA PRINCIPAL SEGÚN EL ROL ELEGIDO */}
                <div className="pt-2 flex justify-end">
                  {rolSeleccionado === 'perdi' ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleIrA('/objetos')}
                      className="gap-2 text-sm font-bold shadow-md"
                    >
                      Buscar en el Catálogo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={() => handleIrA('/objetos/nuevo?tipo=encontrado')}
                      className="gap-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    >
                      Publicar objeto encontrado
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN PREGUNTAS FRECUENTES (FAQ & SEGURIDAD) */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Preguntas frecuentes
              </h3>

              <div className="space-y-2.5">
                {PREGUNTAS_FRECUENTES.map((faq) => {
                  const abierta = faqAbierta === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors gap-3"
                      >
                        <span>{faq.pregunta}</span>
                        {abierta ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {abierta && (
                        <div className="px-3.5 pb-3.5 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-2.5 bg-slate-50/50 whitespace-pre-line">
                          {faq.respuesta}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Acordeón especial: ¿Qué significa cada estado? */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => setEstadosAbierto((prev) => !prev)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <span>¿Qué significa cada estado de una publicación?</span>
                    {estadosAbierto ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {estadosAbierto && (
                    <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {ESTADOS_INFO.map((item) => (
                          <div
                            key={item.estado}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">{item.etiqueta}</span>
                              <Badge estado={item.estado} />
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.descripcion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AVISO VISIBLE: SALIDA DE EMERGENCIA CON PERSONAL DE VIGILANCIA */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-amber-950">
                  ¿No encuentras lo que buscabas o necesitas ayuda urgente?
                </h4>
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  Acércate directamente a la <strong>Caseta de Vigilancia Central</strong> (atención 24/7 en la entrada principal del campus). El personal de seguridad custodia objetos de valor y documentos no reclamados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
