# Encuéntralo — Sistema web de objetos perdidos y encontrados

> Proyecto académico de **Interacción Humano-Computador (IHC)**.
> Este archivo es la fuente de verdad técnica y de arquitectura para el proyecto. Léelo completo antes de escribir código.
>
> **Regla de precedencia:** Ante cualquier conflicto, prevalecen el estado real del código y `.env`, y luego este archivo (`AGENTS.md`); `CONTEXTO_ENCUENTRALO.md` solo define el trabajo de UI/UX actual. No tocar lógica, base de datos ni autenticación.

---

## 1. Objetivo

Construir **Encuéntralo**, un sistema web para que estudiantes y personal de una institución educativa **registren, busquen y recuperen objetos perdidos o encontrados** mediante una interfaz intuitiva, accesible y fácil de usar.

El valor del proyecto está en **aplicar y demostrar principios de IHC** (sección 9), no solo en que funcione. Cada decisión de UI debe poder justificarse con un principio.

## 2. Estado actual del proyecto: Desplegado en Vercel con Supabase

El sistema ha superado la etapa inicial de beta local y se encuentra **activo y desplegado**:

- **Despliegue en producción:** Vercel ([encuentralo-eta.vercel.app](https://encuentralo-eta.vercel.app/)) con SPA estática de Vite y rewrites a `index.html`.
- **Backend y persistencia:** Conectado a **Supabase** (`VITE_DATA_SOURCE=supabase` configurado en `.env`), gestionando PostgreSQL, Supabase Auth y Supabase Storage. La capa de servicios mantiene arquitectura desacoplada con soporte de `localStorage` (`services/local/`) como fallback.
- **Estados de un objeto (4 estados conservados en la lógica y la UI):**
  1. `perdido`: Objeto reportado como extraviado.
  2. `encontrado`: Objeto hallado y reportado.
  3. `en_proceso`: Objeto con solicitud de recuperación en curso o trámite de verificación (la UI muestra su propia etiqueta "En proceso").
  4. `recuperado`: Objeto devuelto exitosamente a su dueño (caso cerrado).
- **Módulos existentes y funcionales:**
  - Gestión y autenticación de usuarios (roles `usuario` y `admin`, perfiles y avisos de suspensión).
  - Publicación, edición, consulta y baja de objetos con filtros combinados y debounce.
  - Fotografías de objetos y comprobantes/pruebas de pertenencia.
  - Solicitudes de recuperación con acreditación de pertenencia.
  - **Notificaciones internas:** Avisos ante cambios de estado de solicitudes y publicaciones.
  - **Mensajes / Chat:** Módulo de chat de entrega (`ChatEntrega` y `MensajeEntrega`) para coordinar la devolución segura entre las partes tras aprobar una solicitud.
  - Panel administrativo con métricas y estadísticas visuales.

El alcance del trabajo actual se enfoca en **mejoras de Interacción Humano-Computador (IHC), accesibilidad y experiencia de usuario (UI/UX)** descritas en `CONTEXTO_ENCUENTRALO.md`.

## 3. Stack tecnológico

| Capa | Tecnología | Estado |
| --- | --- | --- |
| Framework | React 18 + TypeScript + **Vite** | En producción |
| Rutas | React Router v6 | En producción |
| Estilos | Tailwind CSS | En producción |
| Formularios y validación | React Hook Form + Zod | En producción |
| Estado global | Context API (AuthContext, ChatContext, ToastContext) + hooks propios | En producción |
| Persistencia activa | Supabase (`VITE_DATA_SOURCE=supabase`) detrás de capa de servicios | En producción |
| Persistencia alternativa | `localStorage` (`services/local/`) con seed inicial | Fallback / Demo |
| Base de datos & Auth | Supabase (PostgreSQL + Supabase Auth + RLS + Storage) | En producción |
| Despliegue | Vercel (SPA estática con rewrites a `index.html`) | En producción |
| Iconos | lucide-react | En producción |
| Gráficos (estadísticas) | Recharts | En producción |

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

interface MensajeEntrega {
  id: string;
  solicitudId: string;
  emisorId: string;
  mensaje: string;
  creadoEn: string;
}
```

### Reglas de negocio

1. Un objeto se crea en estado `perdido` o `encontrado` según el `tipo`.
2. Al existir una solicitud `pendiente`, el objeto pasa a `en_proceso` y la UI muestra su etiqueta correspondiente ("En proceso").
3. Al **aprobar** una solicitud el objeto pasa a `recuperado` y las demás solicitudes pendientes del mismo objeto se marcan `rechazada` automáticamente (con notificación).
4. Al **rechazar**, se pide un motivo breve y el objeto vuelve a su estado anterior si no quedan solicitudes pendientes.
5. Un usuario **no puede solicitar** un objeto que él mismo publicó, ni enviar dos solicitudes pendientes sobre el mismo objeto.
6. Solo el autor (o un admin) puede editar o eliminar una publicación. Eliminar exige confirmación.
7. Cada cambio de estado de una solicitud genera una **notificación interna** al solicitante.
8. **Privacidad:** el catálogo y el detalle nunca muestran correo, teléfono ni nombre completo del propietario/publicador. Se muestra, como máximo, "Publicado por un usuario de la institución". La entrega se coordina solo tras aprobar la solicitud mediante el chat interno (`ChatEntrega`), verificando la prueba de pertenencia.
9. Un objeto `recuperado` sigue visible (con insignia clara) pero ya no permite nuevas solicitudes.

### Datos de ejemplo (seed)

El sistema incluye seed para demostración tanto en local (`services/local/seed.ts`) como scripts de seed en Supabase (`supabase/supabase_seed.sql`). En el panel admin se dispone de opciones para supervisar datos.

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
| 9 | Perfil de usuario | `/perfil` | Usuario autenticado |
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

## 8. Funcionalidades por módulo

| Módulo | Funcionalidades | Estado |
| --- | --- | --- |
| Gestión de usuarios | Registro, inicio y cierre de sesión, perfil, control de baneo/suspensión | Implementado |
| Gestión de objetos | Registrar, editar, eliminar y consultar publicaciones | Implementado |
| Búsqueda | Por nombre, categoría, ubicación y estado con debounce | Implementado |
| Fotografías | Adjuntar imagen del objeto y pruebas de pertenencia | Implementado |
| Solicitudes | Solicitar recuperación y consultar su estado | Implementado |
| Notificaciones | Avisos internos al cambiar el estado de una solicitud | Implementado |
| Mensajería / Chat de entrega | Canal privado para coordinar la devolución segura del objeto (`ChatEntrega`) | Implementado |
| Administración | Revisar publicaciones, gestionar solicitudes y supervisar estadísticas | Implementado |
| Estadísticas | Cantidades de objetos perdidos, encontrados y recuperados | Implementado |

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

## 11. Plan de trabajo de construcción inicial (COMPLETADO)

La construcción inicial del sistema (Fases 0 a 8) fue completada exitosamente:

- [x] **Fase 0 — Preparación:** Proyecto Vite + React + TS, dependencias, Tailwind y configuración base.
- [x] **Fase 1 — Base y componentes UI:** Componentes `ui/` accesibles (Button, Input, Select, Textarea, Modal, Badge, Toast, Skeleton, EmptyState) y layout responsive.
- [x] **Fase 2 — Capa de servicios:** Arquitectura desacoplada en `services/types.ts` con implementaciones `local/` y `supabase/`.
- [x] **Fase 3 — Autenticación:** Pantallas de registro e inicio de sesión con validación Zod, cierre de sesión y redirección.
- [x] **Fase 4 — Objetos:** Catálogo con búsqueda y filtros sincronizados en URL, formulario con fotos comprimidas, detalle, edición y eliminación.
- [x] **Fase 5 — Solicitudes, notificaciones y chat:** Acreditación de pertenencia, aprobación/rechazo, avisos internos y canal de chat de entrega (`ChatEntrega`).
- [x] **Fase 6 — Administración y estadísticas:** Panel admin con métricas, gráficos Recharts y gestión integral.
- [x] **Fase 7 — Pulido IHC:** Accesibilidad inicial, responsive mobile-first y navegación con teclado.
- [x] **Fase 8 — Despliegue en producción:** Conexión a Supabase y despliegue en Vercel (`https://encuentralo-eta.vercel.app/`).

> **Nota:** El trabajo en curso corresponde a las fases de refinamiento y mejora de UI/UX documentadas en `CONTEXTO_ENCUENTRALO.md`.

## 12. Despliegue en producción y seguridad (IMPLEMENTADO)

La integración con Supabase y Vercel se encuentra activa y operando en producción:

- **Despliegue frontend:** Vercel ([encuentralo-eta.vercel.app](https://encuentralo-eta.vercel.app/)) con SPA estática de Vite y rewrites configurados en `vercel.json` hacia `index.html`.
- **Base de datos y Storage:** Tablas `perfiles` (ligada a `auth.users`), `objetos`, `solicitudes`, `notificaciones`, `mensajes_entrega` y bucket `objetos` en Supabase Storage.
- **Configuración activa:** `VITE_DATA_SOURCE=supabase` configurado en `.env` (con implementación de fallback en `services/local/` si se alterna la fuente de datos).
- **Seguridad (RLS) — Requisitos obligatorios:**
  - **RLS activo en todas las tablas:** Políticas de seguridad aplicadas a nivel de fila sin excepción.
  - **Protección de roles:** Los usuarios no pueden modificar su propio rol (`rol` en tabla `perfiles`).
  - **Control de visibilidad:** Lectura pública solo para publicaciones de `objetos`; las solicitudes y el chat de entrega (`mensajes_entrega`) son estrictamente visibles solo para el solicitante, el autor del objeto y el administrador.
  - **Notificaciones:** Lectura y marcado permitido únicamente al usuario dueño de la notificación; creación controlada.
  - **Operaciones transaccionales:** Aprobar y rechazar solicitudes se realiza mediante funciones transaccionales de PostgreSQL para asegurar consistencia en los cambios de estado.
  - **Credenciales en el cliente:** Estrictamente prohibido usar la clave `service_role` en el cliente frontend (usar exclusivamente `anon key`).
  - **Integridad:** Prohibido modificar políticas RLS o esquemas de base de datos sin previo aviso y explicación detallada del cambio.

## 13. Qué NO hacer en la etapa actual

- **NO tocar la lógica de negocio, el esquema de base de datos ni la autenticación** (las tareas actuales son estrictamente de UI/UX e IHC).
- No acceder a `localStorage` directamente desde componentes o páginas.
- No mostrar datos personales de propietarios/publicadores en vistas públicas.
- No dejar acciones destructivas sin confirmación modal.
- No usar el color como único medio para comunicar información (las etiquetas de estado deben incluir icono y texto descriptivo).

## 14. Definición de "terminado" del sistema base

- [x] Las 8+ pantallas existen y son navegables con las rutas de la sección 7.
- [x] Flujo completo funcional: registrarse → publicar objeto → buscar → solicitar → aprobar → objeto recuperado → notificación y chat.
- [x] Roles respetados (usuario vs. admin) con rutas protegidas.
- [x] Datos persisten en Supabase (y en `localStorage` si se alterna la fuente).
- [x] Checklist de IHC (sección 9) cumplido y verificable.
- [x] `npm run build` sin errores ni advertencias de TypeScript.
- [x] Despliegue activo en Vercel.
