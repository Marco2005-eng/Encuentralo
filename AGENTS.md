# Encuéntralo — Sistema web de objetos perdidos y encontrados

> Proyecto académico de **Interacción Humano-Computador (IHC)**.
> Este archivo es la fuente de verdad para el agente (opencode). Léelo completo antes de escribir código.

---

## 1. Objetivo

Construir **Encuéntralo**, un sistema web para que estudiantes y personal de una institución educativa **registren, busquen y recuperen objetos perdidos o encontrados** mediante una interfaz intuitiva, accesible y fácil de usar.

El valor del proyecto está en **aplicar y demostrar principios de IHC** (sección 9), no solo en que funcione. Cada decisión de UI debe poder justificarse con un principio.

## 2. Alcance actual: BETA LOCAL

**Reglas estrictas de esta fase:**

- Todo funciona **100 % en local** (`npm run dev`), sin internet y sin backend.
- **NO conectar Supabase todavía.** No instalar `@supabase/supabase-js` aún.
- **NO usar GitHub todavía.** No crear workflows, no configurar remotos, no hacer push.
- **NO configurar Vercel todavía.** No crear `vercel.json` ni scripts de deploy.
- Los datos se guardan en el navegador (`localStorage`) y se precargan con datos de ejemplo (seed).
- El código debe quedar **preparado para migrar a Supabase después sin reescribir la UI** (ver sección 5).

Fuera de alcance en la beta: correo electrónico real, recuperación de contraseña, subida de imágenes a servidor, notificaciones push, chat entre usuarios, multi-institución.

## 3. Stack tecnológico

### Beta local (usar ahora)

| Capa | Tecnología |
| --- | --- |
| Framework | React 18 + TypeScript + **Vite** |
| Rutas | React Router v6 |
| Estilos | Tailwind CSS |
| Formularios y validación | React Hook Form + Zod |
| Estado global | Context API (sesión) + hooks propios; sin Redux |
| Persistencia | `localStorage` detrás de una capa de servicios |
| Iconos | lucide-react |
| Gráficos (estadísticas) | Recharts (o barras simples en CSS si se quiere cero dependencias) |
| Pruebas (opcional) | Vitest + Testing Library |

### Producción futura (NO implementar ahora, solo tenerlo en cuenta)

| Capa | Tecnología |
| --- | --- |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (email + contraseña) |
| Imágenes | Supabase Storage (bucket `objetos`) |
| Seguridad de datos | Row Level Security (RLS) |
| Despliegue | Vercel (SPA estática de Vite, con rewrite a `index.html`) |
| Control de versiones | GitHub (integración con Vercel) |

**Por qué Vite y no Next.js:** la beta es local y sin servidor; una SPA evita problemas de SSR con `localStorage`, y Supabase se consume directo desde el navegador. Vercel sirve una SPA de Vite sin problema.

## 4. Roles

- **Usuario** (estudiante o personal): busca objetos, publica reportes, administra sus publicaciones y solicita recuperaciones.
- **Administrador**: supervisa todas las publicaciones, gestiona solicitudes, actualiza estados y ve estadísticas.

Decisión de diseño: quien publicó un objeto puede **aprobar o rechazar** las solicitudes de recuperación sobre su publicación (verificación por el responsable). El administrador puede hacerlo sobre cualquier solicitud.

### Cuentas de demostración (sembradas en el seed)

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@encuentralo.test` | `Admin123!` |
| Usuario | `ana@encuentralo.test` | `Usuario123!` |
| Usuario | `luis@encuentralo.test` | `Usuario123!` |

> En la beta las contraseñas se guardan en `localStorage` solo por ser una demo local. En producción se delega todo a Supabase Auth. Nunca mostrar contraseñas en la UI.

## 5. Arquitectura: capa de servicios intercambiable

Esta es la regla de arquitectura más importante. **Los componentes de UI nunca leen ni escriben `localStorage` directamente.** Siempre pasan por servicios que cumplen una interfaz. Más adelante se agrega una implementación de Supabase sin tocar la UI.

```
src/
├── main.tsx
├── App.tsx
├── routes/                  # definición de rutas y guards (RequireAuth, RequireAdmin)
├── pages/                   # una carpeta por pantalla (ver sección 7)
├── components/
│   ├── ui/                  # Button, Input, Select, Modal, Badge, Toast, EmptyState, Skeleton...
│   ├── layout/              # Header, Footer, Layout, Nav responsive
│   └── objetos/             # ObjetoCard, ObjetoForm, FiltrosPanel, EstadoBadge...
├── services/
│   ├── types.ts             # interfaces de los servicios (contratos)
│   ├── index.ts             # exporta la implementación activa según VITE_DATA_SOURCE
│   ├── local/               # implementación con localStorage  ← AHORA
│   │   ├── storage.ts       # helpers get/set JSON con try/catch
│   │   ├── authService.ts
│   │   ├── objetosService.ts
│   │   ├── solicitudesService.ts
│   │   ├── notificacionesService.ts
│   │   ├── estadisticasService.ts
│   │   └── seed.ts          # datos iniciales
│   └── supabase/            # implementación futura  ← NO crear todavía (solo carpeta vacía con README opcional)
├── context/                 # AuthContext, ToastContext
├── hooks/                   # useObjetos, useSolicitudes, useDebounce...
├── lib/                     # utilidades: fechas, validaciones Zod, imágenes (compresión)
├── types/                   # modelos de dominio
└── styles/                  # index.css con Tailwind y variables de diseño
```

Variable de entorno (archivo `.env.example`):

```
VITE_DATA_SOURCE=local
```

Todos los métodos de servicio son **asíncronos** (`Promise`) aunque en local sean instantáneos, para que la migración a Supabase no cambie las firmas. Simular una latencia pequeña (100–300 ms) en local ayuda a ver los estados de carga.

## 6. Modelo de datos

```ts
type Rol = 'usuario' | 'admin';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  creadoEn: string;           // ISO
}

type TipoReporte = 'perdido' | 'encontrado';
type EstadoObjeto = 'perdido' | 'encontrado' | 'en_proceso' | 'recuperado';

type Categoria =
  | 'electronicos' | 'documentos' | 'ropa' | 'accesorios'
  | 'utiles' | 'llaves' | 'mochilas' | 'otros';

interface Objeto {
  id: string;
  tipo: TipoReporte;          // lo que reportó el usuario
  estado: EstadoObjeto;       // ciclo de vida de la publicación
  nombre: string;
  descripcion: string;
  categoria: Categoria;
  ubicacion: string;          // texto libre o lista de lugares del campus
  fecha: string;              // fecha en que se perdió/encontró (ISO)
  imagen?: string;            // data URL comprimida en local; URL de Storage en producción
  publicadoPor: string;       // Usuario.id  (NO exponer datos personales en la UI pública)
  creadoEn: string;
  actualizadoEn: string;
}

type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada';

interface Solicitud {
  id: string;
  objetoId: string;
  solicitanteId: string;
  pruebaPertenencia: string;  // detalles que acreditan que el objeto es suyo
  estado: EstadoSolicitud;
  motivoRechazo?: string;
  creadoEn: string;
  resueltaEn?: string;
}

interface Notificacion {
  id: string;
  usuarioId: string;
  mensaje: string;
  leida: boolean;
  enlace?: string;            // ruta interna relacionada
  creadoEn: string;
}
```

### Reglas de negocio

1. Un objeto se crea en estado `perdido` o `encontrado` según el `tipo`.
2. Al existir una solicitud `pendiente`, el objeto puede pasar a `en_proceso`.
3. Al **aprobar** una solicitud el objeto pasa a `recuperado` y las demás solicitudes pendientes del mismo objeto se marcan `rechazada` automáticamente (con notificación).
4. Al **rechazar**, se pide un motivo breve y el objeto vuelve a su estado anterior si no quedan solicitudes pendientes.
5. Un usuario **no puede solicitar** un objeto que él mismo publicó, ni enviar dos solicitudes pendientes sobre el mismo objeto.
6. Solo el autor (o un admin) puede editar o eliminar una publicación. Eliminar exige confirmación.
7. Cada cambio de estado de una solicitud genera una **notificación interna** al solicitante.
8. **Privacidad:** el catálogo y el detalle nunca muestran correo, teléfono ni nombre completo del propietario/publicador. Se muestra, como máximo, "Publicado por un usuario de la institución". La entrega se coordina solo tras aprobar la solicitud, verificando la prueba de pertenencia.
9. Un objeto `recuperado` sigue visible (con insignia clara) pero ya no permite nuevas solicitudes.

### Datos de ejemplo (seed)

Precargar al primer arranque, si `localStorage` está vacío: las 3 cuentas de la sección 4, entre **12 y 15 objetos** variados (mezcla de perdidos, encontrados y recuperados, todas las categorías), **4–6 solicitudes** en distintos estados y algunas notificaciones. Para las imágenes del seed usar SVG/placeholder local generado (no depender de internet). Añadir un botón discreto en el panel admin: **"Restablecer datos de demostración"** (con confirmación).

## 7. Pantallas y rutas

| # | Pantalla | Ruta | Acceso |
| --- | --- | --- | --- |
| 1 | Inicio | `/` | Público |
| 2 | Iniciar sesión | `/iniciar-sesion` | Público |
| 2 | Registro | `/registro` | Público |
| 3 | Catálogo | `/objetos` | Público |
| 4 | Registrar objeto | `/objetos/nuevo` | Usuario autenticado |
| 5 | Detalle del objeto | `/objetos/:id` | Público (solicitar requiere sesión) |
| 6 | Mis publicaciones | `/mis-publicaciones` | Usuario autenticado |
| 6 | Editar publicación | `/mis-publicaciones/:id/editar` | Autor o admin |
| 7 | Mis solicitudes | `/mis-solicitudes` | Usuario autenticado |
| 8 | Panel de administración | `/admin` | Solo admin |
| — | No encontrado | `*` | Público |

Si un usuario no autenticado intenta entrar a una ruta protegida, redirigir a `/iniciar-sesion` y **volver a la ruta original** tras iniciar sesión.

### 7.1 Inicio
- Buscador principal destacado (envía a `/objetos?q=...`).
- Dos botones grandes y claramente diferenciados: **"Perdí algo"** y **"Encontré algo"** (llevan al formulario con el tipo preseleccionado).
- Accesos rápidos por categoría.
- Sección "Publicados recientemente" con las últimas 6–8 tarjetas.
- Breve explicación de cómo funciona (3 pasos).

### 7.2 Inicio de sesión y registro
- Validación en línea con mensajes claros y específicos (no "campo inválido": decir qué falta y cómo corregirlo).
- Registro: nombre, correo, contraseña, confirmar contraseña. Indicador de requisitos de contraseña.
- Botón para mostrar/ocultar contraseña.
- Errores de credenciales sin revelar si el correo existe.

### 7.3 Catálogo
- Tarjetas con foto, nombre, categoría, fecha, ubicación y **insignia de estado**.
- Búsqueda por texto (nombre y descripción) con *debounce*.
- Filtros: categoría, ubicación, estado, tipo (perdido/encontrado), rango de fechas opcional.
- Orden: más recientes primero (opcional: más antiguos).
- Los filtros activos se reflejan en la URL (`?q=&categoria=&estado=`) para poder compartir/volver atrás.
- Chips de filtros activos con botón "Limpiar filtros".
- Estado vacío amigable con sugerencias ("Prueba con otra categoría" o "Publica tu reporte").
- Paginación o "Cargar más".

### 7.4 Registro de objetos
- Selector de tipo (perdido / encontrado), nombre, categoría, descripción, ubicación, fecha (no futura) y fotografía (opcional pero recomendada).
- Vista previa de la imagen, con opción de quitarla. Limitar a JPG/PNG/WebP y **comprimir/redimensionar en el cliente** (máx. ~800 px de lado, calidad ~0.7) para no llenar `localStorage`.
- Aviso de privacidad: "No incluyas datos personales en la descripción".
- Confirmación al cancelar si hay cambios sin guardar.
- Toast de éxito y redirección al detalle.

### 7.5 Detalle del objeto
- Imagen grande, todos los datos, estado visible, fecha de publicación.
- Botón **"Solicitar recuperación"** → modal con campo `pruebaPertenencia` (ej. "describe marcas, rayones, contenido o algo que solo el dueño sabría").
- Si ya existe solicitud del usuario: mostrar su estado en lugar del botón.
- Si el objeto está `recuperado`: ocultar el botón y mostrar mensaje.
- Si el usuario no ha iniciado sesión: el botón lleva a iniciar sesión.

### 7.6 Mis publicaciones
- Lista/tabla de las publicaciones propias con estado, fecha y acciones: **Ver, Editar, Eliminar (con confirmación), Cambiar estado**.
- Por publicación, mostrar las **solicitudes recibidas** y permitir aprobar/rechazar (con motivo).
- Estado vacío con llamada a la acción.

### 7.7 Mis solicitudes
- Lista de solicitudes enviadas con insignia: `pendiente` (ámbar), `aprobada` (verde), `rechazada` (rojo; mostrar motivo).
- Enlace al objeto relacionado. Permitir **cancelar** una solicitud pendiente.
- Campana de notificaciones en el header con contador de no leídas y lista desplegable; marcar como leída al abrir.

### 7.8 Panel de administración
- Tarjetas de estadísticas: total de perdidos, encontrados, recuperados, solicitudes pendientes.
- Gráfico simple de objetos por categoría y/o por estado.
- Tabla de **todas las publicaciones** con filtros, y acciones (ver, editar, eliminar, cambiar estado).
- Tabla de **solicitudes** con acciones aprobar/rechazar.
- Botón "Restablecer datos de demostración".

## 8. Funcionalidades por módulo (checklist de la propuesta)

| Módulo | Funcionalidades |
| --- | --- |
| Gestión de usuarios | Registro, inicio y cierre de sesión |
| Gestión de objetos | Registrar, editar, eliminar y consultar publicaciones |
| Búsqueda | Por nombre, categoría, ubicación y estado |
| Fotografías | Adjuntar una imagen del objeto |
| Solicitudes | Solicitar recuperación y consultar su estado |
| Administración | Revisar publicaciones y gestionar solicitudes |
| Notificaciones | Avisos internos al cambiar el estado de una solicitud |
| Estadísticas | Cantidades de objetos perdidos, encontrados y recuperados |

## 9. Principios de IHC: requisitos concretos de implementación

Estos puntos son **criterios de aceptación**, no sugerencias.

| Principio | Qué debe verse en el código/UI |
| --- | --- |
| **Usabilidad** | Máximo 3 clics para reportar o buscar un objeto. Lenguaje simple, sin tecnicismos. Etiquetas siempre visibles (no solo placeholders). |
| **Consistencia** | Un único set de componentes `ui/` reutilizado en todo el sitio. Mismos colores por estado en todas partes (ver paleta abajo). Mismo orden de botones en formularios: acción principal a la derecha, cancelar a la izquierda. |
| **Visibilidad del estado del sistema** | Toasts de confirmación tras cada acción; *skeletons*/spinners al cargar; insignias de estado en tarjetas, detalle y tablas; el enlace activo del menú resaltado. |
| **Prevención de errores** | Validación con Zod en tiempo real; confirmación modal antes de eliminar o cancelar con cambios; botones deshabilitados mientras se envía; no permitir fechas futuras ni solicitudes duplicadas. |
| **Control y libertad del usuario** | Cancelar en cualquier formulario, editar y eliminar publicaciones, cancelar solicitudes pendientes, "Limpiar filtros", botón de volver. |
| **Accesibilidad** | Contraste mínimo WCAG AA (4.5:1 texto normal); navegación completa por teclado con foco visible; HTML semántico (`header`, `nav`, `main`, `footer`, `button` vs `a`); `label` asociado a cada campo; `alt` descriptivo en imágenes; `aria-live` para toasts y errores; modales con *focus trap* y cierre con `Esc`; el color nunca es el único indicador (las insignias llevan texto e icono); enlace "Saltar al contenido"; respetar `prefers-reduced-motion`. |
| **Diseño responsive** | *Mobile-first*. Probar en 360 px, 768 px y ≥1280 px. Menú hamburguesa accesible en móvil. Objetivos táctiles ≥ 44×44 px. Tablas que se transforman en tarjetas o con scroll horizontal controlado en móvil. |

### Paleta de estados (usar en todo el sitio)

| Estado | Color base | Icono sugerido |
| --- | --- | --- |
| Perdido | Rojo/rosado | `SearchX` / `AlertCircle` |
| Encontrado | Azul | `PackageCheck` |
| En proceso / Pendiente | Ámbar | `Clock` |
| Recuperado / Aprobada | Verde | `CheckCircle2` |
| Rechazada | Rojo | `XCircle` |

Definir los colores como **variables de Tailwind/CSS** en un solo lugar; verificar el contraste de cada par texto/fondo.

## 10. Convenciones de código

- TypeScript estricto (`"strict": true`). Sin `any` salvo justificación comentada.
- Componentes funcionales, un componente por archivo, nombres en `PascalCase`; hooks con prefijo `use`.
- **Idioma:** textos de la interfaz en **español**; nombres de código (variables, funciones, tipos) pueden estar en español o inglés, pero **mantener un solo criterio**. En este proyecto el dominio va en español (`Objeto`, `Solicitud`, `estado`) y lo técnico en inglés (`handleSubmit`, `useDebounce`).
- Todos los textos visibles centralizados o, al menos, sin duplicar (facilita ajustes de redacción).
- Manejo de errores: todo acceso a `localStorage` dentro de `try/catch` (puede fallar por cuota o modo privado); mostrar mensaje comprensible al usuario.
- Fechas con `Intl.DateTimeFormat('es-PE')`; sin librerías pesadas.
- IDs con `crypto.randomUUID()`.
- No dejar `console.log` en el código final.
- Commits: no aplica aún (sin Git en esta fase).

## 11. Plan de trabajo por fases

Trabaja **fase por fase**. Al terminar cada una, verifica que `npm run dev` y `npm run build` funcionan y resume qué se hizo antes de continuar.

**Fase 0 — Preparación**
- Crear proyecto Vite + React + TS, instalar dependencias de la sección 3 (solo las de beta local).
- Configurar Tailwind, tokens de color/tipografía, `.env.example`, estructura de carpetas.

**Fase 1 — Base y componentes UI**
- Componentes `ui/` accesibles (Button, Input, Select, Textarea, Modal, Badge, Toast, Skeleton, EmptyState).
- Layout con header, nav responsive, footer, enlace "Saltar al contenido".

**Fase 2 — Capa de servicios local**
- Interfaces en `services/types.ts`, implementación `local/`, seed, `AuthContext`, guards de ruta.

**Fase 3 — Autenticación**
- Pantallas de registro e inicio de sesión con validación; cierre de sesión; redirección a ruta original.

**Fase 4 — Objetos**
- Catálogo con búsqueda y filtros (URL sincronizada), formulario de registro con imagen comprimida, detalle, editar y eliminar.

**Fase 5 — Solicitudes y notificaciones**
- Solicitar recuperación, Mis solicitudes, aprobar/rechazar desde Mis publicaciones, notificaciones internas con campana.

**Fase 6 — Administración y estadísticas**
- Panel admin con métricas, gráficos, gestión de publicaciones y solicitudes, restablecer demo.

**Fase 7 — Pulido IHC**
- Revisión del checklist de la sección 9, pruebas de teclado, contraste, responsive (360/768/1280), estados vacíos y de error, textos.

**Fase 8 — Entrega de la beta**
- `README.md` con instrucciones de ejecución local, cuentas demo y capturas; revisar que `npm run build` pasa sin errores.

## 12. Preparación futura (referencia, NO implementar ahora)

Cuando el equipo decida pasar a producción, el plan será:

1. Crear proyecto en Supabase; tablas `usuarios` (perfil ligado a `auth.users`), `objetos`, `solicitudes`, `notificaciones`; bucket `objetos` en Storage.
2. Activar **RLS**: lectura pública de `objetos`; escritura solo del autor; solicitudes visibles solo para solicitante, autor del objeto y admin; rol admin mediante columna `rol` en el perfil.
3. Implementar `services/supabase/*` con las mismas interfaces de `services/types.ts` y cambiar `VITE_DATA_SOURCE=supabase`.
4. Subir el código a GitHub y conectar el repositorio a **Vercel** (framework Vite, variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`, rewrite de todas las rutas a `index.html`).

Para dejar esto listo **sin hacerlo todavía**: mantener la UI desacoplada de `localStorage`, usar `string` para IDs y fechas ISO (compatible con `uuid` y `timestamptz`), y no depender de comportamientos exclusivos del almacenamiento local.

## 13. Qué NO hacer

- No conectar Supabase, GitHub ni Vercel en esta fase.
- No acceder a `localStorage` desde componentes o páginas.
- No mostrar datos personales de propietarios/publicadores en vistas públicas.
- No usar imágenes remotas ni CDNs para recursos críticos (debe funcionar sin internet).
- No añadir funcionalidades fuera del alcance sin preguntar.
- No dejar acciones destructivas sin confirmación.
- No usar el color como único medio para comunicar información.

## 14. Definición de "terminado" para la beta

- [ ] Las 8 pantallas existen y son navegables con las rutas de la sección 7.
- [ ] Flujo completo funcional: registrarse → publicar objeto → buscar → solicitar → aprobar → objeto recuperado → notificación visible.
- [ ] Roles respetados (usuario vs. admin) con rutas protegidas.
- [ ] Datos persisten al recargar la página.
- [ ] Checklist de IHC (sección 9) cumplido y verificable.
- [ ] Funciona sin conexión a internet.
- [ ] `npm run build` sin errores ni advertencias de TypeScript.
- [ ] `README.md` con pasos para correr el proyecto y cuentas de demostración.
