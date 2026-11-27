import { useEffect, useRef, useState } from 'react';
import { useAccesibilidad } from '@/context/AccesibilidadContext';
import { Button } from './Button';
export function LectorPaso({ texto }: { texto: string }) {
  const { preferencias } = useAccesibilidad();
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const disponible = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  useEffect(() => {
    setLeyendo(false);
    setError('');
    return () => {
      const utterance = utteranceRef.current;
      if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
    };
  }, [texto, preferencias.voz, preferencias.velocidad]);
  const detener = () => {
    window.speechSynthesis.cancel();
    setLeyendo(false);
  };
  const escuchar = () => {
    if (!disponible || !preferencias.voz) return;
    window.speechSynthesis.cancel();
    const lectura = new SpeechSynthesisUtterance(texto);
    lectura.lang = 'es-PE';
    const voces = window.speechSynthesis.getVoices();
    const voz = voces.find(item => item.lang.toLowerCase() === 'es-pe') || voces.find(item => item.lang.toLowerCase().startsWith('es'));
    if (voz) lectura.voice = voz;
    lectura.rate = preferencias.velocidad;
    lectura.onend = () => setLeyendo(false);
    lectura.onerror = event => {
      setLeyendo(false);
      if (!['canceled', 'interrupted'].includes(event.error)) setError('No se pudo reproducir la voz. Puedes leer el paso en pantalla o volver a intentarlo.');
    };
    utteranceRef.current = lectura;
    setError('');
    setLeyendo(true);
    window.speechSynthesis.speak(lectura);
  };
  return <div className="space-y-2">
    {!disponible ? <p className="text-sm text-slate-700">Este navegador no ofrece lectura por voz. Los pasos están disponibles por escrito.</p>
      : !preferencias.voz ? <p className="text-sm text-slate-700">Puedes habilitar la guía por voz en Accesibilidad.</p>
      : <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={escuchar} disabled={leyendo}>Escuchar paso</Button>
        <Button variant="outline" onClick={detener} disabled={!leyendo}>Detener lectura</Button>
      </div>}
    <p role="status" className="text-sm text-slate-700">{error || (leyendo ? 'Leyendo el paso en voz alta…' : '')}</p>
  </div>;
}
