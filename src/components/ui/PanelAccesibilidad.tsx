import { useAccesibilidad } from '@/context/AccesibilidadContext';
import { useAyuda } from '@/context/AyudaContext';
import { TAMANOS_TEXTO, type TamanoTexto, type ModoColor } from '@/services/accesibilidadService';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
export function PanelAccesibilidad() {
  const { preferencias, actualizar, restablecer, guardado, panelAbierto, cerrarPanel } = useAccesibilidad();
  const { abrirAyuda } = useAyuda();
  const abrirGuia = (tipo: 'perdi' | 'encontre') => {
    cerrarPanel();
    abrirAyuda(tipo);
  };
  return <>
    <Modal abierto={panelAbierto} alCerrar={() => cerrarPanel()} titulo="Accesibilidad" anchoMax="max-w-xl">
      <div className="space-y-6">
        <p className="text-sm text-slate-700">Adapta la lectura a tus necesidades. Los cambios se aplican de inmediato y se guardan en este navegador.</p>
        <fieldset className="space-y-3">
          <legend className="font-bold">Tamaño de letra</legend>
          <div className="flex flex-wrap gap-2">{TAMANOS_TEXTO.map(tamano => <Button key={tamano} variant={preferencias.tamano === tamano ? 'primary' : 'outline'} aria-pressed={preferencias.tamano === tamano} onClick={() => actualizar({ tamano: tamano as TamanoTexto })}>{tamano}%</Button>)}</div>
          <p className="text-sm text-slate-700">También puedes ampliar con el zoom de tu navegador.</p>
        </fieldset>
        <div className="space-y-2">
          <label htmlFor="accesibilidad-colores" className="block font-bold">Colores y contraste</label>
          <select id="accesibilidad-colores" value={preferencias.colores} onChange={event => actualizar({ colores: event.target.value as ModoColor })} className="min-h-[44px] w-full rounded-xl border border-slate-400 bg-white p-3 text-slate-900">
            <option value="original">Colores originales</option>
            <option value="diferenciado">Colores diferenciados para los estados</option>
            <option value="contraste">Alto contraste</option>
          </select>
          <p className="text-sm text-slate-700">Elige la combinación que te resulte más clara. Los estados incluyen texto e iconos para reconocerlos sin depender del color.</p>
          <div className="flex flex-wrap gap-2" aria-label="Vista previa de estados"><Badge estado="perdido" /><Badge estado="encontrado" /><Badge estado="en_proceso" /><Badge estado="recuperado" /></div>
        </div>
        <fieldset className="space-y-3">
          <legend className="font-bold">Guía por voz</legend>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3"><input type="checkbox" checked={preferencias.voz} onChange={event => actualizar({ voz: event.target.checked })} className="h-5 w-5" /><span>Habilitar lectura de los pasos</span></label>
          <p className="text-sm text-slate-700">En la guía, pulsa “Escuchar paso”. Puedes detener la lectura cuando quieras. Las instrucciones siempre estarán escritas.</p>
          <label htmlFor="accesibilidad-velocidad" className="block text-sm font-semibold">Velocidad de lectura</label>
          <select id="accesibilidad-velocidad" value={preferencias.velocidad} onChange={event => actualizar({ velocidad: Number(event.target.value) })} className="min-h-[44px] w-full rounded-xl border border-slate-400 bg-white p-3 text-slate-900">
            <option value={0.8}>Pausada</option><option value={1}>Normal</option><option value={1.2}>Rápida</option>
          </select>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => abrirGuia('perdi')}>Guía: perdí algo</Button><Button variant="outline" onClick={() => abrirGuia('encontre')}>Guía: encontré algo</Button></div>
        </fieldset>
        <p role="status" className="text-sm text-slate-700">{guardado ? `Tamaño actual: ${preferencias.tamano}%. Preferencias guardadas en este navegador.` : 'Los cambios funcionan en esta visita, pero el navegador no permitió guardarlos.'}</p>
        <div className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-4"><Button variant="outline" onClick={restablecer}>Restablecer ajustes</Button><Button onClick={() => cerrarPanel()}>Listo</Button></div>
      </div>
    </Modal>
  </>;
}
