import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { useAyuda } from '@/context/AyudaContext';
import { PASOS_PERDI, PASOS_ENCONTRE, PREGUNTAS_FRECUENTES, ESTADOS_INFO } from '@/lib/ayudaContenido';
import { Search, X, ChevronDown, ArrowRight, ArrowLeft, ShieldCheck, HelpCircle, PackageCheck, SearchX, ListChecks, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LectorPaso } from '@/components/ui/LectorPaso';
import { Button } from '@/components/ui/Button';

type Seccion = 'inicio' | 'perdi' | 'encontre' | 'preguntas' | 'estados';
const TEMAS = [
  { id: 'inicio', label: 'Empezar aquí', icon: HelpCircle },
  { id: 'perdi', label: 'Perdí algo', icon: SearchX },
  { id: 'encontre', label: 'Encontré algo', icon: PackageCheck },
  { id: 'preguntas', label: 'Preguntas frecuentes', icon: BookOpen },
  { id: 'estados', label: 'Estados del objeto', icon: ListChecks },
] as const;
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const ModalCentroAyuda: React.FC = () => {
  const { modalAbierto, cerrarAyuda, rolInicial } = useAyuda();
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState<Seccion>('inicio');
  const [busqueda, setBusqueda] = useState('');
  const [pasoActual, setPasoActual] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const contenidoRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!modalAbierto) return;
    setSeccion(rolInicial || 'inicio');
    setBusqueda('');
    setPasoActual(0);
  }, [modalAbierto, rolInicial]);
  const consulta = normalizar(busqueda);
  const resultados = useMemo(() => {
    const coincide = (texto: string) => normalizar(texto).includes(consulta);
    return {
      preguntas: PREGUNTAS_FRECUENTES.filter(f => coincide(f.pregunta + ' ' + f.respuesta)),
      pasos: [
        ...PASOS_PERDI.map((p, index) => ({ ...p, guia: 'perdi' as const, index, contexto: 'Perdí algo' })),
        ...PASOS_ENCONTRE.map((p, index) => ({ ...p, guia: 'encontre' as const, index, contexto: 'Encontré algo' })),
      ].filter(p => coincide(p.contexto + ' ' + p.titulo + ' ' + p.descripcion + ' ' + (p.consejo || ''))),
      estados: ESTADOS_INFO.filter(e => coincide(e.etiqueta + ' ' + e.descripcion)),
    };
  }, [consulta]);
  const total = resultados.preguntas.length + resultados.pasos.length + resultados.estados.length;
  const irA = (ruta: string) => { cerrarAyuda(); navigate(ruta); };
  const abrirSeccion = (id: Seccion, paso = 0) => {
    setSeccion(id); setBusqueda(''); setPasoActual(paso);
    contenidoRef.current?.focus({ preventScroll: true });
  };
  const esGuia = seccion === 'perdi' || seccion === 'encontre';
  const pasos = seccion === 'encontre' ? PASOS_ENCONTRE : PASOS_PERDI;
  const paso = pasos[pasoActual];
  const rutasGuia = seccion === 'encontre'
    ? ['/objetos/nuevo?tipo=encontrado', '/objetos/nuevo?tipo=encontrado', '/mis-publicaciones']
    : ['/objetos', '/objetos', '/mis-solicitudes'];
  const accionesGuia = seccion === 'encontre'
    ? ['Publicar objeto encontrado', 'Publicar objeto encontrado', 'Ver mis publicaciones']
    : ['Buscar en el catálogo', 'Buscar en el catálogo', 'Ver mis solicitudes'];

  const preguntas = (lista: typeof PREGUNTAS_FRECUENTES) => lista.map(faq => (
    <details key={faq.id} className="help-question rounded-xl border border-slate-200 bg-white">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 p-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50 rounded-xl">
        {faq.pregunta}<ChevronDown className="help-chevron h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-100 px-4 py-4 text-sm leading-7 text-slate-600 whitespace-pre-line">{faq.respuesta}</div>
    </details>
  ));
  const estados = (lista: typeof ESTADOS_INFO) => lista.map(item => (
    <div key={item.estado} className="rounded-xl border border-slate-200 bg-white p-4">
      <Badge estado={item.estado} /><p className="mt-3 text-sm leading-relaxed text-slate-600">{item.descripcion}</p>
    </div>
  ));

  return <Modal abierto={modalAbierto} alCerrar={cerrarAyuda} titulo="Centro de ayuda" anchoMax="max-w-4xl">
    <div className="help-center text-slate-800">
      <div className="sticky -top-4 sm:-top-6 z-10 bg-white pb-4 pt-1">
        <label htmlFor="help-search" className="mb-2 block text-sm font-semibold text-slate-800">¿En qué podemos ayudarte?</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input ref={inputRef} id="help-search" type="search" autoComplete="off" placeholder="Buscar: chat, entrega, privacidad…" value={busqueda} onChange={e => setBusqueda(e.target.value)} className="help-search min-h-[48px] w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white" />
          {busqueda && <button type="button" onClick={() => { setBusqueda(''); inputRef.current?.focus(); }} aria-label="Limpiar búsqueda de ayuda" className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden="true" /></button>}
        </div>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[184px_minmax(0,1fr)] md:gap-8">
        <nav aria-label="Temas del centro de ayuda" className="grid grid-cols-2 gap-2 md:flex md:flex-col">
          {TEMAS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => abrirSeccion(id)} aria-pressed={!consulta && seccion === id} className={'help-topic flex min-h-[48px] items-center gap-2 rounded-xl border px-3 py-3 text-left text-[13px] font-semibold ' + (!consulta && seccion === id ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /><span>{label}</span>
          </button>)}
        </nav>
        <section ref={contenidoRef} tabIndex={-1} aria-label="Contenido de ayuda" className="help-content min-w-0 space-y-6 rounded-xl">
          {consulta ? <>
            <p role="status" aria-live="polite" className="text-sm font-semibold text-slate-600">{total} {total === 1 ? 'resultado' : 'resultados'} para «{busqueda.trim()}»</p>
            {total === 0 ? <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 text-center">
              <SearchX className="mx-auto mb-4 h-10 w-10 text-brand-700" aria-hidden="true" />
              <h3 className="text-base font-bold">No encontramos esa consulta</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Prueba con “chat”, “entrega” o “privacidad”, o elige un tema del menú.</p>
              <Button className="mt-4" variant="outline" onClick={() => {setBusqueda(''); inputRef.current?.focus();}}>Limpiar búsqueda</Button>
            </div> : <>
              {resultados.pasos.length > 0 && <div className="space-y-3"><h3 className="text-base font-bold">Guías paso a paso</h3>{resultados.pasos.map(p => <button type="button" key={p.guia + p.numero} onClick={() => abrirSeccion(p.guia, p.index)} className="flex min-h-[48px] w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left hover:bg-brand-50"><span><span className="block text-[13px] text-slate-500">{p.contexto} · Paso {p.numero}</span><span className="text-sm font-semibold">{p.titulo}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-brand-700" aria-hidden="true" /></button>)}</div>}
              {resultados.preguntas.length > 0 && <div className="space-y-3"><h3 className="text-base font-bold">Preguntas frecuentes</h3>{preguntas(resultados.preguntas)}</div>}
              {resultados.estados.length > 0 && <div className="space-y-3"><h3 className="text-base font-bold">Estados del objeto</h3>{estados(resultados.estados)}</div>}
            </>}
          </> : seccion === 'inicio' ? <>
            <div><h3 className="text-xl font-bold">Elige lo que necesitas hacer</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">Te guiamos desde el reporte hasta la devolución.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" onClick={() => abrirSeccion('perdi')} className="help-choice rounded-2xl border border-rose-200 bg-rose-50 p-5 text-left hover:bg-rose-100"><SearchX className="mb-4 h-8 w-8 text-rose-700" aria-hidden="true" /><span className="block text-base font-bold text-slate-900">Perdí algo</span><span className="mt-2 block text-sm leading-relaxed text-slate-600">Busca tu objeto y aprende a solicitar su recuperación.</span><span className="mt-4 flex items-center gap-2 text-sm font-semibold text-rose-800">Ver guía <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></button>
              <button type="button" onClick={() => abrirSeccion('encontre')} className="help-choice rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left hover:bg-emerald-100"><PackageCheck className="mb-4 h-8 w-8 text-emerald-700" aria-hidden="true" /><span className="block text-base font-bold text-slate-900">Encontré algo</span><span className="mt-2 block text-sm leading-relaxed text-slate-600">Publica el hallazgo y coordina la entrega con su dueño.</span><span className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-800">Ver guía <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></button>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600"><strong className="text-slate-800">¿Ya enviaste una solicitud?</strong><p className="mt-1">Consulta su estado en Mis solicitudes. Si fue aprobada, abre el chat de entrega desde la barra superior.</p><button type="button" onClick={() => irA('/mis-solicitudes')} className="mt-2 inline-flex min-h-[44px] items-center gap-2 font-semibold text-brand-700 hover:underline">Ver mis solicitudes <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>
          </> : esGuia ? <>
            <div><h3 className="text-xl font-bold">{seccion === 'perdi' ? 'Cómo recuperar tu objeto' : 'Cómo devolver un objeto'}</h3><p className="mt-2 text-sm text-slate-600">Elige un paso para consultarlo o avanza con Siguiente.</p></div>
            <LectorPaso key={`${modalAbierto}-${seccion}-${pasoActual}`} texto={`Paso ${paso.numero}. ${paso.titulo}. ${paso.descripcion} ${paso.consejo || ''}`} />
            <div role="group" aria-label="Pasos de la guía" className="grid grid-cols-3 gap-2">{pasos.map((p, index) => <button key={p.numero} type="button" onClick={() => setPasoActual(index)} aria-current={pasoActual === index ? 'step' : undefined} className={'min-h-[44px] rounded-lg border px-3 py-2 text-sm font-semibold ' + (pasoActual === index ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>Paso {p.numero}</button>)}</div>
            <div aria-live="polite" aria-atomic="true" className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <p className="text-[13px] font-semibold text-brand-700">Paso {paso.numero} de {pasos.length}</p><h4 className="mt-2 text-lg font-bold text-slate-900">{paso.titulo}</h4><p className="mt-4 text-sm leading-7 text-slate-700">{paso.descripcion}</p>
              {paso.consejo && <p className="mt-4 border-l-2 border-brand-300 pl-3 text-sm leading-relaxed text-slate-600">{paso.consejo}</p>}
            </div>
            <div className="flex justify-between gap-4"><Button variant="outline" disabled={pasoActual === 0} onClick={() => setPasoActual(p => p - 1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Anterior</Button><Button variant="outline" disabled={pasoActual === pasos.length - 1} onClick={() => setPasoActual(p => p + 1)}>Siguiente <ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></div>
            <Button className="w-full" onClick={() => irA(rutasGuia[pasoActual])}>{accionesGuia[pasoActual]}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button>
          </> : seccion === 'preguntas' ? <>
            <div><h3 className="text-xl font-bold">Preguntas frecuentes</h3><p className="mt-2 text-sm text-slate-600">Pulsa una pregunta para ver la respuesta.</p></div><div className="space-y-3">{preguntas(PREGUNTAS_FRECUENTES)}</div>
          </> : <>
            <div><h3 className="text-xl font-bold">Estados de una publicación</h3><p className="mt-2 text-sm text-slate-600">Consulta qué significa la etiqueta de cada objeto.</p></div><div className="grid gap-4 sm:grid-cols-2">{estados(ESTADOS_INFO)}</div>
          </>}
        </section>
      </div>
      <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex max-w-md items-start gap-2 text-[13px] leading-relaxed text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />Si necesitas apoyo presencial, consulta a vigilancia y confirma la atención de tu sede.</p>
        <button type="button" onClick={() => irA('/privacidad')} className="inline-flex min-h-[44px] shrink-0 items-center text-sm font-semibold text-brand-700 hover:underline">Privacidad y uso de datos</button>
      </div>
    </div>
  </Modal>;
};
