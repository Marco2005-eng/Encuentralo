// Fuente única de verdad para la ayuda, pasos y preguntas frecuentes (Heurística de Consistencia)

export interface PasoGuia {
  numero: number;
  titulo: string;
  descripcion: string;
  consejo?: string;
}

export const PASOS_PERDI: PasoGuia[] = [
  {
    numero: 1,
    titulo: 'Busca en el catálogo',
    descripcion:
      'Revisa los objetos reportados usando el buscador por nombre, categoría o el lugar aproximado del campus donde lo extraviaste.',
    consejo: 'Si no lo ves aún, puedes publicar tu propio reporte para que te avisen si lo encuentran.',
  },
  {
    numero: 2,
    titulo: 'Acredita que es tuyo',
    descripcion:
      'Abre la publicación y pulsa "Solicitar recuperación". Describe señas privadas que solo tú conocerías (rayones, stickers, contenido interno o foto de boleta).',
    consejo: 'Esta información solo la ve quien publicó el objeto, jamás el público.',
  },
  {
    numero: 3,
    titulo: 'Entrega confirmada',
    descripcion:
      'Cuando aprueben tu solicitud, se activará el Chat de Entrega para acordar fecha, hora y un punto seguro del campus (ej. caseta de vigilancia).',
    consejo: 'Verifica tu objeto en persona antes de dar por cerrada la entrega.',
  },
];

export const PASOS_ENCONTRE: PasoGuia[] = [
  {
    numero: 1,
    titulo: 'Publica el reporte',
    descripcion:
      'Haz clic en "Publicar objeto" y elige "Encontré algo". Indica qué tipo de artículo es, la categoría, el lugar exacto y la fecha.',
    consejo: 'Adjuntar una foto clara ayuda a que el dueño lo reconozca rápidamente.',
  },
  {
    numero: 2,
    titulo: 'Protege detalles clave',
    descripcion:
      'En la descripción pública menciona solo lo general. Guarda detalles privados (marcas internas, contenido de bolsillos o contraseñas) para verificar al solicitante.',
    consejo: 'Esto previene que personas malintencionadas intenten reclamar lo que no es suyo.',
  },
  {
    numero: 3,
    titulo: 'Verifica y entrega',
    descripcion:
      'Revisa las solicitudes en "Mis publicaciones". Si los datos coinciden, aprueba la solicitud y coordina la devolución por el Chat de Entrega en un punto seguro.',
    consejo: 'Al aprobarse, el objeto pasa automáticamente a estado Recuperado.',
  },
];

export interface FAQItem {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: 'privacidad' | 'proceso' | 'estados' | 'seguridad';
}

export const PREGUNTAS_FRECUENTES: FAQItem[] = [
  {
    id: 'privacidad-datos',
    pregunta: '¿Mis datos personales (teléfono, correo) son visibles?',
    respuesta:
      'No. Por seguridad y privacidad de la comunidad educativa, tu teléfono, correo y nombre completo nunca se muestran en las publicaciones públicas. La comunicación se realiza exclusivamente a través del Chat de Entrega privado cuando una solicitud es aprobada.',
    categoria: 'privacidad',
  },
  {
    id: 'que-poner-prueba',
    pregunta: '¿Qué debo poner en la prueba de pertenencia?',
    respuesta:
      'Describe características particulares que no estén a simple vista en la foto ni en la descripción pública: rasguños, pegatinas, fondo de pantalla, contenido del bolsillo interior o una fotografía de una boleta de compra. Esta prueba solo la verá la persona que tiene el objeto.',
    categoria: 'proceso',
  },
  {
    id: 'que-significa-cada-estado',
    pregunta: '¿Qué significa cada estado de una publicación?',
    respuesta:
      '• Perdido: Objeto reportado por quien lo extravió; sigue buscándose.\n• Encontrado: Objeto hallado por alguien y disponible para ser reclamado.\n• En proceso: Hay solicitudes de pertenencia en evaluación o entrega en curso.\n• Recuperado: Objeto devuelto exitosamente a su dueño; caso cerrado.',
    categoria: 'estados',
  },
  {
    id: 'como-funciona-chat',
    pregunta: '¿Cómo coordino la devolución tras ser aprobada mi solicitud?',
    respuesta:
      'En la barra superior aparecerá el icono de Chat de Entrega con tus conversaciones activas. Desde allí podrás acordar el día y la hora con la otra persona.',
    categoria: 'proceso',
  },
  {
    id: 'donde-entregar',
    pregunta: '¿Dónde se recomienda hacer la entrega en el campus?',
    respuesta:
      'Recomendamos siempre puntos oficiales, iluminados y concurridos: la Caseta de Vigilancia Central (atención 24/7), el mostrador de la Biblioteca Central o el Comedor (zona concurrida y a plena vista). Si encuentras documentos de identidad o carnés, deben entregarse directamente en la Caseta de Vigilancia Central.',
    categoria: 'seguridad',
  },
  {
    id: 'costo-plataforma',
    pregunta: '¿Tiene algún costo usar Encuéntralo?',
    respuesta:
      'Ninguno. Encuéntralo es un servicio gratuito desarrollado por y para la comunidad educativa con fines de apoyo mutuo y responsabilidad comunitaria.',
    categoria: 'seguridad',
  },
];

export const ESTADOS_INFO = [
  {
    estado: 'perdido' as const,
    etiqueta: 'Perdido',
    descripcion: 'Reportado por quien lo extravió. Sigue activo esperando pistas o hallazgos.',
  },
  {
    estado: 'encontrado' as const,
    etiqueta: 'Encontrado',
    descripcion: 'Hallado en el campus. Está bajo custodia esperando la solicitud del dueño.',
  },
  {
    estado: 'en_proceso' as const,
    etiqueta: 'En proceso',
    descripcion: 'Tiene solicitudes de acreditación en trámite o coordinando su entrega.',
  },
  {
    estado: 'recuperado' as const,
    etiqueta: 'Recuperado',
    descripcion: 'Devuelto con éxito a su legítimo dueño. Caso cerrado satisfactoriamente.',
  },
];
